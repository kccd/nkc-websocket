import {Broker} from './broker';
import {BroadcastOperator, Socket} from 'socket.io';
import {DefaultEventsMap} from 'socket.io/dist/typed-events';

export const ServiceActionNames = {
  v1_nkc_websocket_auth: 'v1.nkc.websocketAuth',
  v1_nkc_set_user_online_status: 'v1.nkc.setUserOnlineStatus',
  v1_nkc_get_user_friends_uid: 'v1.nkc.getUserFriendsUid',
};

export const SocketEventNames = {
  newMessageCountAndRedEnvelopeStatus: 'newMessageCountAndRedEnvelopeStatus',
  updateUserOnlineStatus: 'updateUserOnlineStatus',
};

export function BrokerCall<T>(
  serviceActionName: string,
  params: unknown,
): Promise<T> {
  return Broker.call(serviceActionName, params);
}

export function SocketEmit(socket: Socket, eventName: string, params: unknown) {
  socket.emit(eventName, params);
}

export function SocketRoomEmit(
  room: BroadcastOperator<DefaultEventsMap>,
  eventName: string,
  params: unknown,
) {
  room.emit(eventName, params);
}
