import {IncomingMessage, Server} from 'http';
import {WebSocketServer, WebSocket} from 'ws';
import {logger} from './logger';
import {AuthInfo, ISocketState} from '@/interfaces/ws';
import {GetConnectionConfigs} from '@/modules/configs';
import {BrokerCall, ServiceActionNames} from '@/modules/comm';
import {GetRealIp} from '@/services/wsClient';
import {
  CheckUserForumPermission,
  CheckUserPostPermission,
} from '@/services/user';
import {
  GetUserRoomName,
  GetForumRoomName,
  GetThreadRoomName,
  GetPostRoomName,
  GetArticleRoomName,
  GetConsoleRoomName,
  GetZoneHomeRoomName,
} from '@/services/wsRoom';

const rooms = new Map<string, Set<WebSocket>>();
const socketRooms = new WeakMap<WebSocket, Set<string>>();
const socketStates = new WeakMap<WebSocket, ISocketState>();

const instance = new WebSocketServer({noServer: true});

const {maxConnection} = GetConnectionConfigs();

// WSS 载荷数据结构
export type WSSPayload = {
  event: string;
  data?: unknown;
};

// 向客户端发送消息
function send(ws: WebSocket, msg: WSSPayload) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(msg));
  }
}

// 加入房间
function join(ws: WebSocket, room: string) {
  if (!rooms.has(room)) {
    rooms.set(room, new Set());
  }
  rooms.get(room)!.add(ws);

  if (!socketRooms.has(ws)) {
    socketRooms.set(ws, new Set());
  }
  socketRooms.get(ws)!.add(room);

  logger.info(
    '[WSS] 用户 %s 加入房间 %s, 当前房间人数: %d',
    socketStates.get(ws)?.uid || 'unknown',
    room,
    to(room).size(),
  );
}

// 离开指定房间
function leave(ws: WebSocket, room: string) {
  const roomSet = rooms.get(room);
  if (roomSet) {
    roomSet.delete(ws);
    if (roomSet.size === 0) {
      rooms.delete(room);
    }
  }

  const myRooms = socketRooms.get(ws);
  if (myRooms) {
    myRooms.delete(room);
  }
}

// 离开当前加入的所有房间
function leaveAll(ws: WebSocket) {
  const myRooms = socketRooms.get(ws);
  if (!myRooms) return;

  for (const room of myRooms) {
    const roomSet = rooms.get(room);
    if (roomSet) {
      roomSet.delete(ws);
      if (roomSet.size === 0) {
        rooms.delete(room);
      }
    }
  }
  socketRooms.delete(ws);
}

// 获取房间操作对象
function to(room: string) {
  return {
    // 向房间内的所有客户端发送消息, 可排除指定客户端
    send(data: string | Buffer, exclude?: WebSocket) {
      const roomSet = rooms.get(room);
      if (!roomSet) return;

      for (const client of roomSet) {
        if (client !== exclude && client.readyState === 1) {
          client.send(data);
        }
      }
    },
    // 获取房间当前人数
    size() {
      return rooms.get(room)?.size ?? 0;
    },
  };
}

// 解析客户端传入的房间名
function resolveRoomName(roomType?: string, id?: string): string | undefined {
  if (roomType && id) {
    switch (roomType) {
      case 'user':
        return GetUserRoomName(id);
      case 'forum':
        return GetForumRoomName(id);
      case 'thread':
        return GetThreadRoomName(id);
      case 'post':
        return GetPostRoomName(id);
      case 'article':
        return GetArticleRoomName(id);
      case 'console':
        return GetConsoleRoomName();
      case 'zonehome':
        return GetZoneHomeRoomName();
    }
  }
  return undefined;
}

// 校验加入论坛 帖子 文章房间的权限
async function checkJoinPermission(
  uid: string,
  roomType: string,
  id: string,
): Promise<boolean> {
  switch (roomType) {
    case 'forum': {
      const {hasPermission} = await CheckUserForumPermission(uid, id);
      return hasPermission;
    }
    case 'post':
    case 'article': {
      const hasPermission = await CheckUserPostPermission(uid, id);
      return !!hasPermission;
    }
    default:
      return true;
  }
}

// 连接认证 解析上下文并调用 nkc 认证服务
async function auth(
  socket: WebSocket,
  request: IncomingMessage,
): Promise<boolean> {
  try {
    const url = new URL(request.url!, `http://${request.headers.host}`);
    const secret = url.searchParams.get('secret') || undefined;
    const cookie = request.headers.cookie || secret;
    const os = url.searchParams.get('os') === 'app' ? 'app' : 'web';
    const address = GetRealIp(
      request.socket.remoteAddress || '',
      request.headers['x-forwarded-for'] as string,
    );
    const authInfo = await BrokerCall(
      ServiceActionNames.v1_nkc_websocket_auth,
      {
        cookie,
        os,
      },
    );
    const {uid, onlineStatus, friendsUid, newMessageCount, redEnvelopeStatus} =
      <AuthInfo>authInfo;
    socketStates.set(socket, {
      address,
      os,
      uid,
      onlineStatus,
      friendsUid,
      newMessageCount,
      redEnvelopeStatus,
    });
    return true;
  } catch (err) {
    logger.error('[WSS] 连接认证失败: %s', (err as Error).message);
    return false;
  }
}

// 向单个 wss 房间广播
export function WSSToRoom(room: string, event: string, data: unknown) {
  to(room).send(
    JSON.stringify({
      event,
      data,
    } satisfies WSSPayload),
  );
}

// 向多个 wss 房间广播
export function WSSToRooms(rooms: string[], event: string, data: unknown) {
  for (const room of rooms) {
    WSSToRoom(room, event, data);
  }
}

export function WSSInit(httpServer: Server) {
  instance.on('connection', (socket, request) => {
    socket.on('close', () => {
      logger.info('[WSS] 原生 WS 客户端断开');
      leaveAll(socket);
      socketStates.delete(socket);
    });

    socket.on('error', (err: Error) => {
      logger.error('[WSS] 原生 WS 客户端错误: %s', err.message);
    });

    auth(socket, request)
      .then(ok => {
        if (!ok) {
          send(socket, {event: 'error', data: 'Unauthorized'});
          socket.close(4001, 'Unauthorized');
          return;
        }

        const {uid} = socketStates.get(socket)!;

        logger.info(
          '[WSS] 原生 WS 客户端连接成功, uid: %s ip: %s',
          uid,
          socketStates.get(socket)?.address,
        );

        // 认证通过后自动加入用户房间
        if (uid) {
          const userRoom = GetUserRoomName(uid);
          const userConnections = rooms.get(userRoom);
          if (userConnections) {
            // 连接数限制 断开最早的超限连接
            const clients = [...userConnections];
            const excess = clients.length - maxConnection + 1;
            for (let i = 0; i < excess; i++) {
              clients[i].close(4002, 'Connection limit exceeded');
            }
          }
          join(socket, userRoom);
        }

        // 收到客户端消息
        socket.on('message', (data: Buffer) => {
          let msg: WSSPayload;

          try {
            msg = JSON.parse(data.toString()) as WSSPayload;
          } catch {
            send(socket, {event: 'error', data: 'Invalid JSON'});
            return;
          }

          // 处理客户端消息
          switch (msg.event) {
            // 加入房间
            case 'join': {
              const {roomType, id} = msg.data as {
                roomType?: string;
                id?: string;
              };

              if (!roomType || !id) {
                send(socket, {event: 'error', data: 'Missing join params'});
                break;
              }

              // 解析房间名
              const roomName = resolveRoomName(roomType, id);
              if (!roomName) {
                send(socket, {event: 'error', data: 'Invalid join params'});
                break;
              }

              // 加入房间
              const doJoin = () => {
                join(socket, roomName);
              };

              // 房间权限检查
              if (['forum', 'post', 'article'].includes(roomType)) {
                const {uid} = socketStates.get(socket)!;
                checkJoinPermission(uid!, roomType, id)
                  .then(hasPermission => {
                    if (!hasPermission) {
                      send(socket, {
                        event: 'error',
                        data: 'Permission denied',
                      });
                      return;
                    }
                    doJoin();
                  })
                  .catch(err => {
                    logger.error(
                      '[WSS] 检查加入房间权限失败: %s',
                      (err as Error).message,
                    );
                    send(socket, {event: 'error', data: 'Join failed'});
                  });
                break;
              }

              doJoin();
              break;
            }

            // 离开房间
            case 'leave': {
              const {roomType, id} = msg.data as {
                roomType?: string;
                id?: string;
              };

              if (!roomType || !id) {
                send(socket, {event: 'error', data: 'Missing join params'});
                break;
              }

              const roomName = resolveRoomName(roomType, id);
              if (!roomName) {
                send(socket, {event: 'error', data: 'Invalid leave params'});
                break;
              }
              leave(socket, roomName);
              send(socket, {event: 'left', data: {room: roomName}});
              break;
            }

            // 向房间内的所有客户端发送消息
            case 'to': {
              const {roomType, id} = msg.data as {
                roomType?: string;
                id?: string;
                data?: unknown;
              };

              // 解析房间名
              const roomName = resolveRoomName(roomType, id);
              if (!roomName) {
                send(socket, {event: 'error', data: 'Invalid join params'});
                break;
              }

              // 向房间内的所有客户端发送消息
              to(roomName).send(
                JSON.stringify({
                  event: msg.event ?? '',
                  data: msg.data,
                } satisfies WSSPayload),
                socket,
              );
              break;
            }

            // 心跳
            case 'ping': {
              send(socket, {event: 'pong'});
              break;
            }

            default: {
              console.warn('Unknown message type:', msg.event);
              break;
            }
          }
        });
      })
      .catch(err => {
        logger.error((err as Error).message);
      });
  });

  // 由于 Socket.IO 会自动挂一个 upgrade 监听器, 因此需要在 Socket.IO 的监听器之前处理 ws 路由分发
  httpServer.prependListener('upgrade', (request, socket, head) => {
    const url = new URL(request.url!, `http://${request.headers.host}`);

    if (url.pathname !== '/wss') {
      return;
    }

    instance.handleUpgrade(request, socket, head, ws => {
      instance.emit('connection', ws, request);
    });
  });
}
