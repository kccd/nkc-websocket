import {createServer} from 'http';
import {createClient} from 'redis';
import {createAdapter} from '@socket.io/redis-adapter';
import {Server} from 'socket.io';
import {
  GetSocketIOConfigs,
  GetServerConfigs,
  GetRedisConfigs,
} from './modules/configs';
import {ErrorLog} from './modules/logger';

import WsInit from './middlewares/wsInit';
import WsAuth from './middlewares/wsAuth';
import Routes from './routes';

const {serveClient, transports, pingInterval} = GetSocketIOConfigs();
const {host, port} = GetServerConfigs();
const {url} = GetRedisConfigs();
const httpServer = createServer();

const pubClient = createClient({url});
const subClient = pubClient.duplicate();

const io = new Server(httpServer, {
  serveClient,
  transports,
  pingInterval,
});

io.on('error', err => {
  ErrorLog(err as Error);
});

const CommonSpace = io.of('/common');
CommonSpace.use(WsInit);
CommonSpace.use(WsAuth);
Routes(CommonSpace);

export function StartWebsocketServer() {
  return Promise.resolve()
    .then(() => {
      return Promise.all([pubClient.connect(), subClient.connect()]);
    })
    .then(() => {
      (io.adapter as (v: unknown) => undefined)(
        createAdapter(pubClient, subClient),
      );
      httpServer.listen(port, host, () => {
        console.log(`Websocket server is running at ${host}:${port}`);
      });
    });
}

export {io, CommonSpace};
