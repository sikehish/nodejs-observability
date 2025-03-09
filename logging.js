const winston = require('winston');
const LokiTransport = require('winston-loki');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new LokiTransport({
      host: 'http://localhost:3100',
      labels: { app: 'my-node-app', environment: 'development' },
      json: true,
    }),
  ],
});

logger.info('Loki logging initialized');

module.exports = logger;
