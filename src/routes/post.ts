import {Namespace, Socket} from 'socket.io';
import {ISocket} from '../interfaces/ws';
import {CheckUserPostPermission} from '../services/user';
import {DisconnectSocket} from '../services/wsClient';
import {GetPostRoomName} from '../services/wsRoom';

export default async function (
  namespace: Namespace,
  socket: Socket,
  data: {postId: string},
) {
  const {uid} = (socket as unknown as ISocket).state;
  const {postId} = data;
  const hasPermission = await CheckUserPostPermission(<string>uid, postId);
  if (!hasPermission) {
    return DisconnectSocket(socket);
  }
  const roomName = GetPostRoomName(postId);
  await socket.join(roomName);
}
