const pino = require('pino');
const pinoLogLevel = 'info';
const transport = pino.transport({
  targets: [
    {
    level: pinoLogLevel,
    target: "pino/file",
    options: { destination: "logs/server-log", colorize: true},
    // stream: process.stdout
  },
  {
    level: pinoLogLevel,
    target: "pino-pretty",
    options: { colorize: true}
    // stream: pino.destination({dest: "logs/server-log"})
  }
],

});
const logger = pino({level : pinoLogLevel}, transport);

module.exports = logger;