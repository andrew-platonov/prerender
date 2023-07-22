const prerender = require('prerender');
const server = prerender({
    pageLoadTimeout: 120 * 1000,
    chromeFlags: ['--no-sandbox', '--headless', '--disable-gpu', '--remote-debugging-port=9222', '--hide-scrollbars']
  });

server.use(require('./prerender-memory-cache'))

server.start();