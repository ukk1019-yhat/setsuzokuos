import { createApp } from './app';
import { ENV } from './config/env';

const app = createApp();

app.listen(ENV.PORT, () => {
  console.log(`🚀 [SETSUZOKU OS API] Server listening on port ${ENV.PORT}`);
  console.log(`🔗 REST Base: http://localhost:${ENV.PORT}/api/v1`);
  console.log(`💚 Health Check: http://localhost:${ENV.PORT}/health`);
});

