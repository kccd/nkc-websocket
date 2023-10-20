import { Namespace, Socket } from 'socket.io';
import { ISocket } from '../interfaces/ws';
import { DisconnectSocket } from '../services/wsClient';
import { GetZoneHomeRoomName } from '../services/wsRoom';

export default async function (
  namespace: Namespace,
  socket: Socket,
  // data: {avatars: object<>},
) {
  const {uid} = (socket as unknown as ISocket).state;
  if (!uid) {
    return DisconnectSocket(socket);
  }
  const roomName = GetZoneHomeRoomName();
  await socket.join(roomName);
}
