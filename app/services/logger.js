const winston = require('winston')
const customFormat = winston.format.printf(({ level, message}) => {
    
    if (message.includes("undefined")) {
      message = message.replace("undefined", "N/A");
    }
    return `[${level}]: ${message}`;
  });

const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    format: winston.format.combine(
        customFormat
      ),
    transports: [
        new winston.transports.Console({
            filename: "./logs/app.log",
            level: "debug",
            colorize: true
        })
    ],
  });

  module.exports = logger