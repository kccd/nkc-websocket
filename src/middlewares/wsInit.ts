import {GetRealIp} from '../services/wsClient';
import {ISocket} from '../interfaces/ws';
import {Socket} from 'socket.io';

export default function (socket: Socket, next: () => void) {
  const ip = GetRealIp(
    socket.handshake.address,
    socket.handshake.headers['x-forwarded-for'] as string,
  );
  (socket as unknown as ISocket).state = {
    address: ip,
    os: socket.handshake.query.os === 'app' ? 'app' : 'web',
  };
  next();
}
