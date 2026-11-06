"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const app_1 = require("./app");
const env_1 = require("./config/env");
const app = (0, app_1.createApp)();
exports.app = app;
// Only listen on port when running directly (not required as a module by tests or Vercel serverless)
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
    app.listen(env_1.ENV.PORT, () => {
        console.log(`🚀 [SETSUZOKU OS API] Server listening on port ${env_1.ENV.PORT}`);
        console.log(`🔗 REST Base: http://localhost:${env_1.ENV.PORT}/api/v1`);
        console.log(`💚 Health Check: http://localhost:${env_1.ENV.PORT}/health`);
    });
}
exports.default = app;
