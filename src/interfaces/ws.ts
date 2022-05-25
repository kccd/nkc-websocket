import {Socket} from 'socket.io';

export interface ISocketState {
  address: string;
  os: string;
  uid?: string;
  friendsUid?: string[];
  onlineStatus?: string;
  newMessageCount?: number;
  redEnvelopeStatus?: boolean;
}

export interface ISocket extends Omit<Socket, 'state'> {
  state: ISocketState;
}

export interface AuthInfo {
  uid: string;
  onlineStatus: string;
  friendsUid: string[];
  newMessageCount: number;
  redEnvelopeStatus: boolean;
}
