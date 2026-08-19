import {Socket} from 'socket.io';
import {AuthInfo, ISocket} from '@/interfaces/ws';
import {BrokerCall, ServiceActionNames} from '@/modules/comm';
import {logger} from '@/modules/logger';

export async function SocketioAuth(socket: Socket, next: () => void) {
  try {
    const {handshake, state} = socket as unknown as ISocket;
    const {_operationId, secret} = handshake.query;
    const cookie = handshake.headers.cookie || secret;
    const {os} = state;
    // 从 nkc 服务获取认证信息
    const authInfo = await BrokerCall(
      ServiceActionNames.v1_nkc_websocket_auth,
      {
        cookie,
        // operationId,
        os,
      },
    );
    const {uid, onlineStatus, friendsUid, newMessageCount, redEnvelopeStatus} =
      <AuthInfo>authInfo;
    state.uid = uid;
    state.onlineStatus = onlineStatus;
    state.friendsUid = friendsUid;
    state.newMessageCount = newMessageCount;
    state.redEnvelopeStatus = redEnvelopeStatus;
    await (next as () => Promise<void>)();
  } catch (err) {
    logger.error((err as Error).message);
    await (next as unknown as (v: unknown) => Promise<void>)(err);
  }
}
