import {Server as HttpServer} from 'http';
import {Namespace, Server as SocketioServer} from 'socket.io';
import {GetSocketIOConfigs} from './configs';
import {logger} from './logger';
import {SocketioAuth} from '@/middlewares/auth';
import Routes from '@/routes';
import {SocketioCtx} from '@/middlewares/ctx';

let instance: SocketioServer | null = null;
let CommonSpace: Namespace | null = null;

export function SocketioInit(httpServer: HttpServer) {
  const {serveClient, transports, pingInterval} = GetSocketIOConfigs();

  instance = new SocketioServer(httpServer, {
    serveClient,
    transports,
    pingInterval,
  });

  instance.on('error', (err: Error) => {
    logger.error(err.message);
  });

  CommonSpace = instance.of('/common');
  CommonSpace.use(SocketioCtx);
  CommonSpace.use(SocketioAuth);
  Routes(CommonSpace);

  return instance;
}

export {instance as SocketioInstance, CommonSpace};
