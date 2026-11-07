const fs = require('fs');
const path = require('path');

// Resolve esbuild from monorepo dependencies
let esbuild;
try {
  esbuild = require('esbuild');
} catch (e) {
  try {
    esbuild = require('../../node_modules/vite/node_modules/esbuild');
  } catch (e2) {
    esbuild = require('../web/node_modules/esbuild');
  }
}

console.log('[SETSUZOKU BUILD] Bundling Express API into standalone index.js...');

const appsApiOutfile = path.join(__dirname, 'index.js');
const rootApiDir = path.join(__dirname, '../../api');
const rootApiOutfile = path.join(rootApiDir, 'index.js');

esbuild.buildSync({
  entryPoints: [path.join(__dirname, 'src/index.ts')],
  bundle: true,
  platform: 'node',
  target: 'node18',
  format: 'cjs',
  outfile: appsApiOutfile,
  footer: {
    js: `
if (typeof module !== 'undefined' && module.exports) {
  const rawApp = module.exports.default || module.exports.app || module.exports;
  const serverlessHandler = (req, res) => {
    return rawApp(req, res);
  };
  Object.assign(serverlessHandler, rawApp);
  module.exports = serverlessHandler;
  module.exports.default = serverlessHandler;
  module.exports.app = rawApp;
}
`,
  },
  sourcemap: false,
  minify: false,
});

if (!fs.existsSync(rootApiDir)) {
  fs.mkdirSync(rootApiDir, { recursive: true });
}
fs.copyFileSync(appsApiOutfile, rootApiOutfile);

// Generate catch-all serverless function api/[...all].js for native Vercel routing
const rootCatchAllFile = path.join(rootApiDir, '[...all].js');
fs.writeFileSync(rootCatchAllFile, "module.exports = require('./index.js');\n");

console.log('[SETSUZOKU BUILD] Successfully bundled apps/api/index.js, api/index.js, and api/[...all].js!');
