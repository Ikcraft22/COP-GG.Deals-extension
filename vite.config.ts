import { defineConfig } from 'vite';
import { crx } from '@crxjs/vite-plugin';
import { resolve } from 'path';
import { readFileSync } from 'fs';
import checker from 'vite-plugin-checker'

const PREACT_MODULE_PATH_PATTERN = /\/node_modules\/preact\/dist\/preact\.(?:module\.js|mjs)$/;
const PREACT_SET_INNER_HTML_PATTERN = /\b([\w$]+)\.innerHTML=([\w$]+)\.__html/g;
const PREACT_CLEAR_INNER_HTML_PATTERN = /\b([\w$]+)\.innerHTML=""/g;

declare global {
    namespace NodeJS {
        interface ProcessEnv {
            MANIFEST_PATH?: string;
            BUILD_OUT_DIR?: string;
            VITE_BOTTOM_BAR_DEBUG?: string;
        }
    }
}

function firefoxLintSafePreactRenderer() {
    return {
        name: 'firefox-lint-safe-preact-renderer',
        enforce: 'pre' as const,
        transform(source: string, id: string) {
            const normalizedId = id.split('?')[0].replaceAll('\\', '/');
            if (!PREACT_MODULE_PATH_PATTERN.test(normalizedId)) {
                return null;
            }

            let setHtmlReplacementCount = 0;
            let clearHtmlReplacementCount = 0;
            const transformed = source
                .replace(PREACT_SET_INNER_HTML_PATTERN, (_match, elementName: string, htmlValueName: string) => {
                    setHtmlReplacementCount += 1;
                    return `rejectPreactInnerHtml(${elementName},${htmlValueName}.__html)`;
                })
                .replace(PREACT_CLEAR_INNER_HTML_PATTERN, (_match, elementName: string) => {
                    clearHtmlReplacementCount += 1;
                    return `${elementName}.replaceChildren()`;
                });

            if (setHtmlReplacementCount !== 1 || clearHtmlReplacementCount !== 1) {
                throw new Error(
                    'Unexpected Preact renderer output: could not replace both innerHTML assignments safely.'
                );
            }

            const replacementHelper = `
function rejectPreactInnerHtml() {
    throw new Error('dangerouslySetInnerHTML is disabled in this extension');
}
`;

            return {
                code: replacementHelper + transformed,
                map: null,
            };
        },
    };
}

const TREE_SHAKING_ANNOTATION_PATTERN = /\/\* @__(?:PURE|NO_SIDE_EFFECTS)__ \*\/ ?/g;

// esbuild marks JSX calls and known pure constructors as side effect free so
// that bundlers can drop the unused ones. Nothing downstream of us reads the
// annotations, and unminified sources are what store reviewers read, so they
// are only noise in the output. This has to run in `generateBundle`: Vite
// transpiles chunks to the build target in a `renderChunk` hook of its own that
// comes after every plugin hook, and that pass puts the annotations back.
function annotationFreeOutput() {
    // noinspection JSUnusedGlobalSymbols
    return {
        name: 'annotation-free-output',
        enforce: 'post' as const,
        generateBundle(_options: unknown, bundle: Record<string, { type: string; code?: string }>) {
            for (const emittedFile of Object.values(bundle)) {
                if (emittedFile.type !== 'chunk' || !emittedFile.code?.includes('@__')) {
                    continue;
                }

                emittedFile.code = emittedFile.code.replace(TREE_SHAKING_ANNOTATION_PATTERN, '');
            }
        },
    };
}

const VENDOR_MODULE_PATH_PATTERN = /\/node_modules\/((?:@[^/]+\/)?[^/]+)\/(.+)$/;
const VENDOR_MODULE_SUFFIX_PATTERN = /\.(?:module\.)?[cm]?js$/;
// Part of the extension plumbing rather than libraries our code imports, so
// they have to stay inside the chunks that need them.
const INLINED_VENDOR_SCOPES = new Set(['@crxjs', 'vite']);

// Without a chunk of its own, a library is copied into every entrypoint that
// imports it. Giving each third-party module its own chunk keeps our bundles
// free of vendored sources - which matters for store review - and ships a
// single copy of a library that several entrypoints share.
function vendorChunkName(moduleId: string): string | undefined {
    // Helper modules Rollup synthesizes for a source file (CommonJS interop,
    // for one) carry a null byte prefix and a query; they belong in the chunk
    // of the file they wrap, so strip both before matching.
    const normalizedId = moduleId.replaceAll('\\', '/').replace(/^\0/, '').split('?')[0];
    const vendorModuleMatch = VENDOR_MODULE_PATH_PATTERN.exec(normalizedId);
    if (!vendorModuleMatch) {
        return undefined;
    }

    const [, packageName, packagePath] = vendorModuleMatch;
    if (INLINED_VENDOR_SCOPES.has(packageName.split('/')[0])) {
        return undefined;
    }

    // Distribution file names repeat the package name and its module format
    // (`preact/dist/preact.module.js`); neither says anything here.
    const moduleName = packagePath.split('/').pop()!.replace(VENDOR_MODULE_SUFFIX_PATTERN, '');

    return `vendor/${packageName.replace('/', '-')}/${moduleName}`;
}

const manifestPath = process.env.MANIFEST_PATH ?? './src/manifest.json';
const outputDir = process.env.BUILD_OUT_DIR ?? 'dist';
const debugEnabled = process.env.VITE_BOTTOM_BAR_DEBUG === 'true';
const manifest = JSON.parse(readFileSync(resolve(__dirname, manifestPath), 'utf-8'));

function stableJavaScriptFileName(chunkName: string): string {
    const stableName = chunkName.replace(/\.[cm]?[jt]s(?=-loader$|$)/, '');
    return `${stableName}.js`;
}

// noinspection JSUnusedGlobalSymbols
export default defineConfig({
    esbuild: {
        drop: debugEnabled ? [] : ['console'],
    },
    plugins: [
        firefoxLintSafePreactRenderer(),
        checker({ typescript: true }),
        crx({ manifest }),
        annotationFreeOutput()
    ],
    build: {
        outDir: outputDir,
        minify: false,
        cssMinify: false,
        modulePreload: false,
        rollupOptions: {
            input: {
                'index': resolve(__dirname, 'index.html')
            },
            output: {
                manualChunks: (id) => vendorChunkName(id),
                entryFileNames: (chunkInfo) => stableJavaScriptFileName(chunkInfo.name),
                chunkFileNames: (chunkInfo) => `assets/${stableJavaScriptFileName(chunkInfo.name)}`,
                assetFileNames: 'assets/[name][extname]'
            }
        }
    },
    server: {
        port: 5173,
        strictPort: true,
        hmr: {
            clientPort: 5173,
        },
        cors: true,
    },
});
