const fs = require('fs');
const http = require('http');
const https = require('https');
const { Logger } = require('@dojot/microservice-sdk');
const { app: appCfg, server: serverCfg } = require('./app/Config');

Logger.setTransport('console', {
  level: appCfg.log.log_console_level,
});
if (appCfg.log.log_file) {
  Logger.setTransport('file', {
    level: appCfg.log.log_file_level,
    filename: appCfg.log.log_file_filename,
  });
}
Logger.setVerbose(appCfg.log.log_verbose);

const application = require('./app/App');
const websocketTarball = require('./app/WebsocketTarball');
const terminus = require('./app/Terminus');

const logger = new Logger();

let server = null;

if (serverCfg.tls) {
  logger.info('Initializing the HTTP server (Using TLS Protocol)...');
  const options = {
    cert: fs.readFileSync(serverCfg.tls_cert_file),
    key: fs.readFileSync(serverCfg.tls_key_file),
    ca: [fs.readFileSync(serverCfg.tls_ca_file)],
    rejectUnauthorized: true,
    requestCert: true,
  };
  server = https.createServer(options, application.expressApp);
} else {
  logger.info('Initializing the HTTP server...');
  server = http.createServer(application.expressApp);
}

/* Configures the application's HTTP and WS routes */
application.configure(server);

server.listen(serverCfg.port, serverCfg.host, async () => {
  logger.info('HTTP server is ready to accept connections!');
  logger.info(server.address());

  // Initializes the sticky tarball
  await websocketTarball.init();
});

/* adds health checks and graceful shutdown to the application */
terminus.setup(server);

const unhandledRejections = new Map();

// the unhandledRejections Map will grow and shrink over time,
// reflecting rejections that start unhandled and then become handled.
process.on('unhandledRejection', (reason, promise) => {
  // The 'unhandledRejection' event is emitted whenever a Promise is rejected and
  // no error handler is attached to the promise within a turn of the event loop.
  logger.error(`Unhandled Rejection at: ${reason.stack || reason}.`);

  unhandledRejections.set(promise, reason);

  logger.debug(`unhandledRejection: List of Unhandled Rejection size ${unhandledRejections.size}`);
});

process.on('rejectionHandled', (promise) => {
  // The 'rejectionHandled' event is emitted whenever a Promise has
  // been rejected and an error handler was attached to it
  // later than one turn of the Node.js event loop.
  logger.debug('rejectionHandled: A event');

  unhandledRejections.delete(promise);

  logger.debug(`rejectionHandled: List of Unhandled Rejection size ${unhandledRejections.size}`);
});

process.on('uncaughtException', async (ex) => {
  // The 'uncaughtException' event is emitted when an uncaught JavaScript
  // exception bubbles all the way back to the event loop.
  logger.error(`uncaughtException: Unhandled Exception at: ${ex.stack || ex}. Bailing out!!`);

  // TODO: stop server (connection redis, kafka consumer, etc.)
  process.exit(1);
});
