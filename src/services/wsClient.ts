import {GetProxyConfigs} from '../modules/configs';
import {Socket} from 'socket.io';
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
