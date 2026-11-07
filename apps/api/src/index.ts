/**
 * Copyright (c) 2026 Setsuzoku Media Labs. All rights reserved.
 */
import { createApp } from './app';
import { ENV } from './config/env';

const app = createApp();

// Start HTTP listener when running as standalone process or Vercel Service
if (typeof require !== 'undefined' && typeof module !== 'undefined') {
  const isMain = require.main === module;
  const isService = Boolean(process.env.PORT && process.env.PORT !== '0');
  // Avoid listening during vitest automated tests
  const isTesting = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);

  if (!isTesting && (isMain || isService)) {
    const port = process.env.PORT ? parseInt(process.env.PORT, 10) : ENV.PORT;
    const server = app.listen(port, () => {
      console.log(`🚀 [SETSUZOKU OS API] Server listening on port ${port}`);
      console.log(`🔗 REST Base: http://localhost:${port}/api/v1`);
      console.log(`💚 Health Check: http://localhost:${port}/health`);
    });

    server.on('error', (err: any) => {
      if (err.code !== 'EADDRINUSE') {
        console.error('[SETSUZOKU API Server Error]', err);
      }
    });
  }
}

export default app;
export { app };
