import { spawnSync } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import process from 'node:process';

const ROOT_DIR = process.cwd();
const SRC_MANIFEST_PATH = join(ROOT_DIR, 'src/manifest.json');
const SRC_BAR_CSS_PATH = join(ROOT_DIR, 'src/bar/styles/bar.css');
const SRC_BAR_ASSETS_FONTS_DIR = join(ROOT_DIR, 'src/assets/fonts');
const SRC_BAR_TEMPLATE_PATH = join(ROOT_DIR, 'src/bar/index.html');
const SRC_ASSETS_DIR = join(ROOT_DIR, 'src/assets');
const DIST_DIR = join(ROOT_DIR, 'dist');
const BUILD_TARGETS = ['chrome', 'firefox'];
const TMP_DIR = join(ROOT_DIR, '.build-temp');
const TMP_MANIFEST_PATH = join(TMP_DIR, 'manifest.json');

const ICON_ASSET_FILES = [
  'gg-ext-icon-16.png',
  'gg-ext-icon-48.png',
  'gg-ext-icon-128.png',
  'gg-ext-icon-16_gray.png',
  'gg-ext-icon-48_gray.png',
  'gg-ext-icon-128_gray.png',
];

const DEFAULT_MANIFEST_DOMAIN = 'gg.deals';
const DEBUG_ONLY_BLOCK_PATTERN = /\s*<!-- DEBUG_ONLY_START -->[\s\S]*?<!-- DEBUG_ONLY_END -->/g;
const FIREFOX_REQUIRED_DATA_COLLECTION_PERMISSIONS = [
  'authenticationInfo', // GG.deals API keys and Epic OAuth tokens
  'personallyIdentifyingInfo', // Account usernames and identifiers
  'browsingActivity', // Product page URLs sent to the GG.deals API
  'websiteContent', // Page titles and game libraries/wishlists
  'locationInfo', // Region used to localize deals and prices
];

function parseArgs(argv) {
  let manifestDomain;
  let constantsDomain;
  let debug;
  let target = 'firefox';

  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg.startsWith('--manifest-domain=')) {
      manifestDomain = arg.slice('--manifest-domain='.length);
      continue;
    }

    if (arg.startsWith('--manifest=')) {
      manifestDomain = arg.slice('--manifest='.length);
      continue;
    }

    if (arg.startsWith('--global=')) {
      manifestDomain = arg.slice('--global='.length);
      continue;
    }

    if (arg.startsWith('--constants-domain=')) {
      constantsDomain = arg.slice('--constants-domain='.length);
      continue;
    }

    if (arg.startsWith('--constants=')) {
      constantsDomain = arg.slice('--constants='.length);
      continue;
    }

    if (arg.startsWith('--debug=')) {
      debug = arg.slice('--debug='.length);
      continue;
    }

    if (arg.startsWith('--target=')) {
      target = arg.slice('--target='.length).toLowerCase();
      continue;
    }

    if (arg === '--debug') {
      const nextArg = argv[index + 1];
      if (nextArg && !nextArg.startsWith('--')) {
        debug = nextArg;
        index += 1;
      } else {
        debug = 'true';
      }
      continue;
    }

    if (arg === '--debug-true') {
      debug = 'true';
      continue;
    }

    if (arg === '--debug-false') {
      debug = 'false';
      continue;
    }

    if (!arg.startsWith('--')) {
      positional.push(arg);
    }
  }

  if (!debug && typeof process.env.npm_config_debug === 'string' && process.env.npm_config_debug.trim().length > 0) {
    debug = process.env.npm_config_debug;
  }

  if (!manifestDomain && positional.length > 0) {
    manifestDomain = positional[0];
  }

  if (!constantsDomain && positional.length > 1) {
    constantsDomain = positional[1];
  }

  return {
    manifestDomain: manifestDomain?.trim() || undefined,
    constantsDomain: constantsDomain?.trim() || undefined,
    debug: debug?.trim() || undefined,
    target: [...BUILD_TARGETS, 'all'].includes(target) ? target : 'firefox',
  };
}

function normalizeDebugFlag(rawDebug) {
  if (!rawDebug) {
    return 'false';
  }

  return ['1', 'true', 'yes', 'on'].includes(rawDebug.toLowerCase()) ? 'true' : 'false';
}

function resolveBuildName(manifestDomain, constantsDomain) {
  const rawDomain = manifestDomain ?? constantsDomain;

  if (!rawDomain) {
    return 'default';
  }

  let hostname = rawDomain;

  try {
    hostname = new URL(rawDomain.includes('://') ? rawDomain : `https://${rawDomain}`).hostname;
  } catch {
    // Fall back to sanitizing the raw value below.
  }

  const firstDomainPart = hostname.split('.')[0].toLowerCase();
  return firstDomainPart.replace(/[^a-z0-9_-]+/g, '-') || 'default';
}

function resolveOutputDirs(targets, debugEnabled, manifestDomain, constantsDomain) {
  const baseOutDir = debugEnabled
    ? join(DIST_DIR, 'dev', `dev_${resolveBuildName(manifestDomain, constantsDomain)}`)
    : join(DIST_DIR, 'prod');

  return Object.fromEntries(
    targets.map((buildTarget) => [
      buildTarget,
      join(baseOutDir, buildTarget),
    ]),
  );
}

function runCommand(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: ROOT_DIR,
    stdio: 'inherit',
    shell: false,
    env: {
      ...process.env,
      ...env,
    },
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function ensureParentDir(filePath) {
  mkdirSync(dirname(filePath), { recursive: true });
}

function copyToDist(outDir, debugEnabled) {
  const cssDest = join(outDir, 'src/bar/styles/bar.css');
  const templateDest = join(outDir, 'src/bar/index.html');
  const assetsDestDir = join(outDir, 'assets');
  const barAssetFontsDestDir = join(assetsDestDir, 'fonts');

  ensureParentDir(cssDest);
  ensureParentDir(templateDest);
  mkdirSync(assetsDestDir, { recursive: true });
  mkdirSync(barAssetFontsDestDir, { recursive: true });

  cpSync(SRC_BAR_CSS_PATH, cssDest);
  cpSync(SRC_BAR_ASSETS_FONTS_DIR, barAssetFontsDestDir, {
    recursive: true,
  });

  const template = readFileSync(SRC_BAR_TEMPLATE_PATH, 'utf-8');
  const outputTemplate = debugEnabled
    ? template.replaceAll('<!-- DEBUG_ONLY_START -->', '').replaceAll('<!-- DEBUG_ONLY_END -->', '')
    : template.replace(DEBUG_ONLY_BLOCK_PATTERN, '');
  writeFileSync(templateDest, outputTemplate, 'utf-8');

  for (const iconFile of ICON_ASSET_FILES) {
    const srcPath = join(SRC_ASSETS_DIR, iconFile);
    const destPath = join(assetsDestDir, iconFile);

    if (!existsSync(srcPath)) {
      continue;
    }

    cpSync(srcPath, destPath);
  }

  // CRXJS copies manifest assets using their source paths. They are duplicated
  // above into the single public assets directory used by the final bundle.
  rmSync(join(outDir, 'src/assets'), { recursive: true, force: true });
}

function normalizeOutputAssetPaths(outputDir) {
  const targetExtensions = new Set(['.js', '.html', '.css', '.json']);

  for (const filePath of walkFiles(outputDir)) {
    if (![...targetExtensions].some((ext) => filePath.endsWith(ext))) {
      continue;
    }

    const content = readFileSync(filePath, 'utf-8');
    const updatedContent = content.replaceAll('src/assets/', 'assets/');

    if (updatedContent !== content) {
      writeFileSync(filePath, updatedContent, 'utf-8');
    }
  }
}

function normalizeGeneratedFileNames(outputDir) {
  const renamedFiles = [];

  for (const filePath of walkFiles(outputDir)) {
    const normalizedPath = filePath.replace(/\.(?:[cm]?[jt]s)-loader\.js$/, '-loader.js');

    if (normalizedPath === filePath) {
      continue;
    }

    renameSync(filePath, normalizedPath);
    renamedFiles.push([
      relative(outputDir, filePath).replaceAll('\\', '/'),
      relative(outputDir, normalizedPath).replaceAll('\\', '/'),
    ]);
  }

  if (renamedFiles.length === 0) {
    return;
  }

  for (const filePath of walkFiles(outputDir)) {
    if (!['.js', '.html', '.json'].some((ext) => filePath.endsWith(ext))) {
      continue;
    }

    const content = readFileSync(filePath, 'utf-8');
    let updatedContent = content;

    for (const [oldName, newName] of renamedFiles) {
      updatedContent = updatedContent.replaceAll(oldName, newName);
    }

    if (updatedContent !== content) {
      writeFileSync(filePath, updatedContent, 'utf-8');
    }
  }
}

function replaceManifestDomain(manifestDomain, outputDir) {
  const manifestOutputPath = join(outputDir, 'manifest.json');
  const manifestOutput = readFileSync(manifestOutputPath, 'utf-8');
  const updated = manifestOutput.replace(/\bgg\.deals\b/g, manifestDomain);
  writeFileSync(manifestOutputPath, updated, 'utf-8');
}

function replaceDomainInHttpUrls(content, fromDomain, toDomain) {
  const escapedFrom = fromDomain.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern = new RegExp(`(https?:\\/\\/[^"'\\s]*?)${escapedFrom}`, 'g');
  return content.replace(pattern, `$1${toDomain}`);
}

function extractConstantsDomains() {
  const barConstantsPath = join(ROOT_DIR, 'src/bar/js/constants.ts');
  const settingsConstantsPath = join(ROOT_DIR, 'src/settings/constants.ts');
  const sourceFiles = [barConstantsPath, settingsConstantsPath];

  // Matches any exported string constant whose value is an http(s) URL.
  const urlConstantPattern = /export\s+const\s+\w+\s*:\s*string\s*=\s*['"](https?:\/\/[^'"]+)['"]/g;
  const domains = new Set();

  for (const filePath of sourceFiles) {
    const source = readFileSync(filePath, 'utf-8');
    let match;
    while ((match = urlConstantPattern.exec(source)) !== null) {
      try {
        const parsedUrl = new URL(match[1]);
        domains.add(parsedUrl.hostname);
      } catch {
        // Ignore malformed URLs and keep processing remaining constants.
      }
    }
  }

  return Array.from(domains);
}

function walkFiles(dirPath) {
  if (!existsSync(dirPath)) {
    return [];
  }

  const entries = readdirSync(dirPath);
  const files = [];

  for (const entry of entries) {
    const fullPath = join(dirPath, entry);
    const stats = statSync(fullPath);

    if (stats.isDirectory()) {
      files.push(...walkFiles(fullPath));
      continue;
    }

    files.push(fullPath);
  }

  return files;
}

function replaceConstantsDomain(constantsDomain, outputDir, sourceDomains) {
  const targetExtensions = new Set(['.js', '.html', '.css', '.json']);
  const files = walkFiles(outputDir);

  for (const filePath of files) {
    if (![...targetExtensions].some((ext) => filePath.endsWith(ext))) {
      continue;
    }

    const content = readFileSync(filePath, 'utf-8');
    let updatedContent = content;

    for (const sourceDomain of sourceDomains) {
      updatedContent = replaceDomainInHttpUrls(updatedContent, sourceDomain, constantsDomain);
    }

    updatedContent = replaceDomainInHttpUrls(updatedContent, DEFAULT_MANIFEST_DOMAIN, constantsDomain);

    if (updatedContent !== content) {
      writeFileSync(filePath, updatedContent, 'utf-8');
    }
  }
}

function prepareCustomManifest(manifestDomain) {
  rmSync(TMP_DIR, { recursive: true, force: true });
  mkdirSync(TMP_DIR, { recursive: true });

  const manifestContent = readFileSync(SRC_MANIFEST_PATH, 'utf-8');
  const updatedManifest = manifestContent.replace(/\bgg\.deals\b/g, manifestDomain);

  writeFileSync(TMP_MANIFEST_PATH, updatedManifest, 'utf-8');

  return TMP_MANIFEST_PATH;
}

function removeDevelopmentCsp(manifest) {
  const extensionPagesCsp = manifest.content_security_policy?.extension_pages;
  if (typeof extensionPagesCsp !== 'string') {
    return false;
  }

  const productionCsp = extensionPagesCsp.replace(
    /\s+https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?(?=\s|;|$)/g,
    '',
  );

  if (productionCsp === extensionPagesCsp) {
    return false;
  }

  manifest.content_security_policy.extension_pages = productionCsp;
  return true;
}

function patchManifestForChrome(manifestPath) {
  const content = readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(content);
  let didPatch = removeDevelopmentCsp(manifest);

  if (manifest.browser_specific_settings?.gecko) {
    delete manifest.browser_specific_settings.gecko;
    didPatch = true;

    if (Object.keys(manifest.browser_specific_settings).length === 0) {
      delete manifest.browser_specific_settings;
    }
  }

  // crxjs already rewrote "scripts": ["src/background.ts"] to the bundled output path
  // Extract it and convert to "service_worker" for Chrome compatibility:
  const scripts = manifest.background?.scripts;
  if (Array.isArray(scripts) && scripts.length > 0) {
    manifest.background.service_worker = scripts[0];
    delete manifest.background.scripts;
    didPatch = true;
  }

  if (didPatch) {
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  }
}

function patchManifestForFirefox(manifestPath) {
  const content = readFileSync(manifestPath, 'utf-8');
  const manifest = JSON.parse(content);
  let didPatch = removeDevelopmentCsp(manifest);

  const geckoSettings = manifest.browser_specific_settings?.gecko;
  if (geckoSettings) {
    const currentRequiredPermissions = geckoSettings.data_collection_permissions?.required;
    const requiredPermissionsChanged = JSON.stringify(currentRequiredPermissions)
      !== JSON.stringify(FIREFOX_REQUIRED_DATA_COLLECTION_PERMISSIONS);

    if (requiredPermissionsChanged) {
      geckoSettings.data_collection_permissions = {
        ...geckoSettings.data_collection_permissions,
        required: [...FIREFOX_REQUIRED_DATA_COLLECTION_PERMISSIONS],
      };
      didPatch = true;
    }
  }

  for (const resource of manifest.web_accessible_resources ?? []) {
    if (Object.hasOwn(resource, 'use_dynamic_url')) {
      delete resource.use_dynamic_url;
      didPatch = true;
    }
  }

  if (didPatch) {
    writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n', 'utf-8');
  }
}

function patchExtensionUrlsForFirefox(outputDir) {
  for (const filePath of walkFiles(outputDir)) {
    if (!filePath.endsWith('.css')) {
      continue;
    }

    const content = readFileSync(filePath, 'utf-8');
    const updatedContent = content.replaceAll('chrome-extension://', 'moz-extension://');

    if (updatedContent !== content) {
      writeFileSync(filePath, updatedContent, 'utf-8');
    }
  }
}

function main() {
  const { manifestDomain, constantsDomain, debug, target } = parseArgs(process.argv.slice(2));
  const hasOverrides = Boolean(manifestDomain || constantsDomain);
  const sourceConstantsDomains = extractConstantsDomains();
  const targets = target === 'all' ? BUILD_TARGETS : [target];
  const debugEnabled = normalizeDebugFlag(debug) === 'true';
  const outputDirs = resolveOutputDirs(
    targets,
    debugEnabled,
    manifestDomain,
    constantsDomain,
  );
  const buildOutDir = outputDirs[targets[0]];

  for (const outDir of Object.values(outputDirs)) {
    rmSync(outDir, { recursive: true, force: true });
  }

  runCommand('npm', ['run', 'build:bar-css']);
  runCommand('npm', ['run', 'build:settings-css']);
  runCommand('npx', ['tsc']);

  const viteEnv = {
    BUILD_OUT_DIR: buildOutDir,
    VITE_BOTTOM_BAR_DEBUG: String(debugEnabled),
  };

  if (manifestDomain) {
    const customManifestPath = prepareCustomManifest(manifestDomain);
    viteEnv.MANIFEST_PATH = customManifestPath;
  }

  runCommand('npx', ['vite', 'build'], viteEnv);

  copyToDist(buildOutDir, debugEnabled);
  normalizeOutputAssetPaths(buildOutDir);
  normalizeGeneratedFileNames(buildOutDir);

  if (hasOverrides && manifestDomain) {
    replaceManifestDomain(manifestDomain, buildOutDir);
  }

  if (hasOverrides && constantsDomain) {
    replaceConstantsDomain(constantsDomain, buildOutDir, sourceConstantsDomains);
  }

  for (const buildTarget of targets.slice(1)) {
    cpSync(buildOutDir, outputDirs[buildTarget], { recursive: true });
  }

  for (const buildTarget of targets) {
    const manifestOutputPath = join(outputDirs[buildTarget], 'manifest.json');
    if (buildTarget === 'chrome') {
      patchManifestForChrome(manifestOutputPath);
    } else {
      patchManifestForFirefox(manifestOutputPath);
      patchExtensionUrlsForFirefox(outputDirs[buildTarget]);
    }
  }

  rmSync(TMP_DIR, { recursive: true, force: true });
}

main();
