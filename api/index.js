// Vercel Serverless Function entry point for /api/*
const app = require('../apps/api/index.js');

module.exports = app;
module.exports.default = app;
module.exports.app = app;
