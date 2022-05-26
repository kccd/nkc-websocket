import {Namespace} from 'socket.io';
import {ErrorLog} from '../modules/logger';
import {
  DisconnectSocket,
  DisconnectSocketById,
  GetRoomClientsId,
} from '../services/wsClient';
import {ISocket} from '../interfaces/ws';
import {GetUserRoomName} from '../services/wsRoom';
import {GetConnectionConfigs} from '../modules/configs';

import Message from './message';

const {maxConnection} = GetConnectionConfigs();

export default function (namespace: Namespace) {
  namespace.on('connection', async socket => {
    socket.on('error', err => {
      ErrorLog(err);
      DisconnectSocket(socket);
    });
    socket.on('disconnect', () => {
      DisconnectSocket(socket);
    });
    try {
      const state = (socket as unknown as ISocket).state;
      const {uid} = state;
      // 不允许游客连接
      if (!uid) {
        return DisconnectSocket(socket);
      }
      const userRoom = GetUserRoomName(uid);
      const clientsId = await GetRoomClientsId(namespace, userRoom);
      for (let i = 0; i < clientsId.length - maxConnection + 1; i++) {
        try {
          await DisconnectSocketById(namespace, clientsId[i]);
        } catch (err) {
          ErrorLog(err as Error);
        }
      }
      await Message(namespace, socket);
    } catch (err) {
      ErrorLog(err as Error);
      DisconnectSocket(socket);
    }
  });
}
