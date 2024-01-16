const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

module.exports = winston.createLogger({
  // format của log được kết hợp thông qua format.combine
  format: winston.format.combine(
    winston.format.splat(),
    // Định dạng time cho log
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    // thêm màu sắc
    winston.format.colorize(),
    // thiết lập định dạng của log
    winston.format.printf(
      log => {
        // nếu log là error hiển thị stack trace còn không hiển thị message của log 
        if(log.stack) return `[${log.timestamp}] [${log.level}] ${log.stack}`;
        return  `[${log.timestamp}] [${log.level}] ${log.message}`;
      },
    ),
  ),
  transports: [
    // hiển thị log thông qua console
    new winston.transports.Console(),
    new winston.transports.DailyRotateFile({
      level: 'info',
      filename: path.join(__dirname, '/logs/info','%DATE%.log'),
      datePattern: 'YYYYMMDD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    }),
    new winston.transports.DailyRotateFile({
      level: 'error',
      filename: path.join(__dirname, '/logs/errors','%DATE%.log'),
      datePattern: 'YYYYMMDD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d'
    })
  ],
})
