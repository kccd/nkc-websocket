import pino, {type LoggerOptions} from 'pino';
import path from 'path';
import fsSync from 'fs';
import {isDev} from './env';

const logDirPath = path.resolve(__dirname, '../../logs');
const logFilePath = path.resolve(logDirPath, 'nkc-websocket.log');

fsSync.mkdirSync(logDirPath, {recursive: true});

const level = isDev ? 'debug' : 'info';

const loggerOptions: LoggerOptions = {
  level: level,
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'yyyy-mm-dd HH:MM:ss',
        },
        level: level,
      },
      {
        target: 'pino/file',
        options: {
          destination: logFilePath,
          mkdir: true,
        },
        level: level,
      },
    ],
  },
};

export const logger = pino(loggerOptions);
