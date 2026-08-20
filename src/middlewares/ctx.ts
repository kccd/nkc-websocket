import {GetRealIp} from '@/services/wsClient';
import {ISocket} from '@/interfaces/ws';
import {Socket} from 'socket.io';
import {logger} from '@/modules/logger';

export function SocketioCtx(socket: Socket, next: () => void) {
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
    logger.error((err as Error).message);
    (next as (v: unknown) => void)(err);
  }
}
