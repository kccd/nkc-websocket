import {BrokerCall, ServiceActionNames} from '../modules/comm';

export function SetUserOnlineStatus(uid: string, online: string) {
  return BrokerCall(ServiceActionNames.v1_nkc_set_user_online_status, {
    uid,
    online,
  });
}

export function GetUserFriendsUid(uid: string): Promise<string[]> {
  return BrokerCall(ServiceActionNames.v1_nkc_get_user_friends_uid, {
    uid,
  });
}
