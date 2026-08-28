(() => {
  const REQUEST_TYPE = 'GGDEALS_CSRF_POST_JSON_REQUEST';
  const RESULT_TYPE = 'GGDEALS_CSRF_POST_JSON_RESULT';

  window.addEventListener('message', async (event) => {
    if (event.source !== window) {
      return;
    }

    const message = event.data;
    if (!message || message.type !== REQUEST_TYPE || typeof message.requestId !== 'string') {
      return;
    }

    try {
      const csrf = globalThis.Helpers?.Csrf;
      if (!csrf || typeof csrf.postJson !== 'function') {
        throw new Error('Helpers.Csrf.postJson is not available on the page');
      }

      if (typeof message.url !== 'string' || !message.payload || typeof message.payload !== 'object') {
        throw new Error('Invalid CSRF POST request');
      }

      const targetUrl = new URL(message.url, window.location.origin);
      if (targetUrl.origin !== window.location.origin) {
        throw new Error('Cross-origin CSRF POST requests are not allowed');
      }

      const response = await csrf.postJson(message.url, message.payload);
      const body = await response.text();

      window.postMessage({
        type: RESULT_TYPE,
        requestId: message.requestId,
        ok: true,
        responseOk: response.ok,
        status: response.status,
        headers: {
          'retry-after': response.headers.get('Retry-After'),
          'x-ratelimit-reset': response.headers.get('X-RateLimit-Reset')
        },
        body
      }, '*');
    } catch (error) {
      window.postMessage({
        type: RESULT_TYPE,
        requestId: message.requestId,
        ok: false,
        error: error instanceof Error ? error.message : String(error)
      }, '*');
    }
  });
})();
