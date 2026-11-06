import { createApp } from './app';
import { ENV } from './config/env';

const app = createApp();

// Only listen on port when running directly (not required as a module by tests or Vercel serverless)
if (typeof require !== 'undefined' && typeof module !== 'undefined' && require.main === module) {
  app.listen(ENV.PORT, () => {
    console.log(`🚀 [SETSUZOKU OS API] Server listening on port ${ENV.PORT}`);
    console.log(`🔗 REST Base: http://localhost:${ENV.PORT}/api/v1`);
    console.log(`💚 Health Check: http://localhost:${ENV.PORT}/health`);
  });
}

export default app;
export { app };
