import {createServer} from 'http';
import {createClient} from 'redis';
import {createAdapter} from '@socket.io/redis-adapter';
import {GetServerConfigs, GetRedisConfigs} from './modules/configs';
import {logger} from '@/modules/logger';
import {SocketioInit} from '@/modules/socket';
import {WSSInit} from './modules/wss';

export async function StartWebsocketServer() {
  const {host, port} = GetServerConfigs();
  const {url} = GetRedisConfigs();
  const httpServer = createServer();

  const pubClient = createClient({url});
  const subClient = pubClient.duplicate();

  const socket = SocketioInit(httpServer);

  WSSInit(httpServer);

  return Promise.resolve()
    .then(() => {
      return Promise.all([pubClient.connect(), subClient.connect()]);
    })
    .then(() => {
      (socket.adapter as (v: unknown) => undefined)(
        createAdapter(pubClient, subClient),
      );
      httpServer.listen(port, host, () => {
        logger.info(
          `[HttpServer] Websocket server is running at ${host}:${port}`,
        );
      });
    });
}
