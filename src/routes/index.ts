import {Namespace} from 'socket.io';
import {logger} from '@/modules/logger';
import {
  DisconnectSocket,
  DisconnectSocketById,
  GetRoomClientsId,
} from '@/services/wsClient';
import {ISocket} from '../interfaces/ws';
import {GetUserRoomName} from '@/services/wsRoom';
import {GetConnectionConfigs} from '@/modules/configs';

import Message from './message';
import Forum from './forum';
import Post from './post';
import Article from './article';
import zoneHome from './zoneHome';

const {maxConnection} = GetConnectionConfigs();

export default function (namespace: Namespace) {
  namespace.on('connection', async socket => {
    try {
      socket.on('error', (err: Error) => {
        logger.error(err.message);
        DisconnectSocket(socket);
      });
      socket.on('disconnect', () => {
        DisconnectSocket(socket);
      });

      socket.on('joinRoom', async req => {
        try {
          const {type, data} = <{type: string; data: unknown}>req;
          if (type === 'forum') {
            const {forumId} = <{forumId: string}>data;
            await Forum(namespace, socket, {
              forumId,
            });
          } else if (type === 'post') {
            const {postId} = <{postId: string}>data;
            await Post(namespace, socket, {
              postId,
            });
          } else if (type === 'article') {
            const {articleId} = <{articleId: string}>data;
            await Article(namespace, socket, {
              articleId,
            });
          } else if (type === 'zoneHome') {
            await zoneHome(namespace, socket);
          }
        } catch (err) {
          logger.error((err as Error).message);
          DisconnectSocket(socket);
        }
      });

      const state = (socket as unknown as ISocket).state;
      const {uid} = state;

      // 不允许游客连接
      if (!uid) {
        return DisconnectSocket(socket);
      }

      logger.debug(
        '[SocketIO] UID: %s 客户端 [%s] IP [%s] 已连接',
        uid,
        socket.id,
        socket.handshake.address,
      );

      const userRoom = GetUserRoomName(uid);
      const clientsId = await GetRoomClientsId(namespace, userRoom);
      for (let i = 0; i < clientsId.length - maxConnection + 1; i++) {
        try {
          await DisconnectSocketById(namespace, clientsId[i]);
        } catch (err) {
          logger.error((err as Error).message);
        }
      }
      await Message(namespace, socket);
    } catch (err) {
      logger.error((err as Error).message);
      DisconnectSocket(socket);
    }
  });
}
