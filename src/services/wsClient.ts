import {GetProxyConfigs, GetRedisConfigs} from '../modules/configs';
import {Namespace, Socket} from 'socket.io';
const {proxy, maxIpsCount} = GetProxyConfigs();

export function GetRealIp(remoteIp: string, xForwardedFor: string) {
  if (proxy) {
    let xForwardedForArr: string[];
    if (xForwardedFor) {
      xForwardedForArr = xForwardedFor.split(',');
    } else {
      xForwardedForArr = [];
    }
    xForwardedForArr.push(remoteIp);
    xForwardedForArr.reverse();
    const _ip = xForwardedForArr[maxIpsCount - 1];
    remoteIp = _ip || remoteIp;
  }
  return remoteIp.replace(/^::ffff:/, '');
}

export function DisconnectSocket(socket: Socket) {
  if (socket && !socket.disconnected && socket.disconnect) {
    socket.disconnect(true);
  }
}

export async function GetRoomClientCount(
  namespace: Namespace,
  roomName: string,
): Promise<number> {
  const sockets = await GetRoomClientsId(namespace, roomName);
  return sockets.length;
}

export async function GetRoomClientsId(
  namespace: Namespace,
  roomName: string,
): Promise<string[]> {
  const sockets = await namespace.in(roomName).allSockets();
  return [...sockets];
}

export async function DisconnectSocketById(
  namespace: Namespace,
  socketId: string,
) {
  return await (
    namespace.adapter as unknown as {
      remoteDisconnect: (v1: string, v2: boolean) => Promise<void>;
    }
  ).remoteDisconnect(socketId, true);
}
