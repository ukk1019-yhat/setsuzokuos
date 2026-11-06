// Vercel Serverless / Express Framework Entrypoint
const { createApp } = require('./dist/app');
const { ENV } = require('./dist/config/env');

const app = createApp();

if (require.main === module) {
  const port = (ENV && ENV.PORT) || process.env.PORT || 4000;
  app.listen(port, () => {
    console.log(`🚀 [SETSUZOKU OS API] Server listening on port ${port}`);
  });
}

module.exports = app;
module.exports.default = app;
module.exports.app = app;
