import {Namespace} from 'socket.io';
import {ErrorLog} from '../modules/logger';
import {DisconnectSocket} from '../services/wsClient';
import {ISocket} from '../interfaces/ws';
// import {GetUserRoomName} from '../services/wsRoom';

export default function (io: Namespace) {
  io.on('connection', socket => {
    socket.on('error', err => {
      ErrorLog(err);
      DisconnectSocket(socket);
    });
    socket.on('disconnect', () => {
      DisconnectSocket(socket);
    });
    const state = (socket as unknown as ISocket).state;
    const {uid} = state;
    // 不允许游客连接
    if (!uid) {
      return DisconnectSocket(socket);
    }
    // const userRoom = GetUserRoomName(uid);
  });
}
