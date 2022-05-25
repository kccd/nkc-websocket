export function GetUserRoomName(uid: string) {
  return `USER:${uid}`;
}

export function GetForumRoomName(fid: string) {
  return `FORUM:${fid}`;
}

export function GetThreadRoomName(tid: string) {
  return `THREAD:${tid}`;
}

export function GetPostRoomName(pid: string) {
  return `POST:${pid}`;
}

export function GetConsoleRoomName() {
  return `CONSOLE`;
}
