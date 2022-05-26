import {GetRealIp} from '../services/wsClient';
import {ISocket} from '../interfaces/ws';
import {Socket} from 'socket.io';
import {ErrorLog} from '../modules/logger';

export default function (socket: Socket, next: () => void) {
  try {
    const ip = GetRealIp(
      socket.handshake.address,
      socket.handshake.headers['x-forwarded-for'] as string,
    );
    (socket as unknown as ISocket).state = {
      address: ip,
      os: socket.handshake.query.os === 'app' ? 'app' : 'web',
    };
    next();
  } catch (err) {
    ErrorLog(err as Error);
    (next as (v: unknown) => void)(err);
  }
}
