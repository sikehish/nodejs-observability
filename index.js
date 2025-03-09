const express = require('express');
const client = require('prom-client');
const logger = require('./logging');
require('./tracing'); // Ensure tracing is initialized

const app = express();
const collectDefaultMetrics = client.collectDefaultMetrics;

collectDefaultMetrics({ timeout: 5000 });

//custom metric (HTTP request duration)
const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
});

app.use((req, res, next) => {
  const end = httpRequestDuration.startTimer();
  res.on('finish', () => {
    end({ method: req.method, route: req.path, status_code: res.statusCode });
    logger.info(`Request ${req.method} ${req.path} responded with ${res.statusCode}`);
  });
  next();
});

//test endpoint to generate logs/metrics/traces
app.get('/test', (req, res) => {
  logger.info('Test endpoint hit');
  res.json({ message: 'Test successful!' });
});

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});


app.listen(PORT, () => logger.info('Server running on port 3000'));
