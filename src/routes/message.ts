import {Namespace, Socket} from 'socket.io';
import {ISocket} from '../interfaces/ws';
import {GetUserRoomName} from '../services/wsRoom';
import {SocketEmit, SocketEventNames, SocketRoomEmit} from '../modules/comm';
import {GetRoomClientsId} from '../services/wsClient';
import {GetUserFriendsUid, SetUserOnlineStatus} from '../services/user';

export default async function (namespace: Namespace, socket: Socket) {
  const {
    uid = '',
    onlineStatus = '',
    friendsUid = [],
    newMessageCount,
    redEnvelopeStatus,
  } = (socket as unknown as ISocket).state;
  const userRoom = GetUserRoomName(uid);
  await socket.join(userRoom);
  SocketEmit(socket, SocketEventNames.newMessageCountAndRedEnvelopeStatus, {
    newMessageCount,
    redEnvelopeStatus,
  });
  // 发送上线通知
  for (const friendUid of friendsUid) {
    const roomName = GetUserRoomName(friendUid);
    SocketRoomEmit(
      namespace.in(roomName),
      SocketEventNames.updateUserOnlineStatus,
      {
        uid,
        status: onlineStatus,
      },
    );
  }
  // 发送离线通知
  socket.on('disconnect', async () => {
    const clients = await GetRoomClientsId(namespace, userRoom);
    if (clients.length === 0) {
      const onlineStatus = await SetUserOnlineStatus(uid, '');
      const friendsUid = await GetUserFriendsUid(uid);
      for (const friendUid of friendsUid) {
        const roomName = GetUserRoomName(friendUid);
        SocketRoomEmit(
          namespace.in(roomName),
          SocketEventNames.updateUserOnlineStatus,
          {
            uid,
            status: onlineStatus,
          },
        );
      }
    }
  });
}
