import {Namespace, Socket} from 'socket.io';
import {ISocket} from '../interfaces/ws';
import {CheckUserForumPermission} from '../services/user';
import {DisconnectSocket} from '../services/wsClient';
import {GetForumRoomName} from '../services/wsRoom';

export default async function (
  namespace: Namespace,
  socket: Socket,
  data: {forumId: string},
) {
  const {uid} = (socket as unknown as ISocket).state;
  const {forumId} = data;
  const {hasPermission} = await CheckUserForumPermission(
    uid as string,
    forumId,
  );
  if (!hasPermission) {
    return DisconnectSocket(socket);
  }
  const roomName = GetForumRoomName(forumId);
  await socket.join(roomName);
}
