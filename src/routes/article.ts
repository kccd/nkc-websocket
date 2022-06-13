import {Namespace, Socket} from 'socket.io';
import {ISocket} from '../interfaces/ws';
import {CheckUserPostPermission} from '../services/user';
import {DisconnectSocket} from '../services/wsClient';
import {GetArticleRoomName} from '../services/wsRoom';

export default async function (
  namespace: Namespace,
  socket: Socket,
  data: {articleId: string},
) {
  const {uid} = (socket as unknown as ISocket).state;
  const {articleId} = data;
  const hasPermission = await CheckUserPostPermission(<string>uid, articleId);
  if (!hasPermission) {
    return DisconnectSocket(socket);
  }
  const roomName = GetArticleRoomName(articleId);
  await socket.join(roomName);
}
