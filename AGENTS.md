# AGENTS.md

NKC 实时推送服务。浏览器 / App 与 `nkc` 之间的消息通道，同一个端口上并存两套协议：Socket.IO（`/common` 命名空间）与裸 WebSocket（`/wss`，自定义 JSON 协议）。

## 技术栈

- TypeScript（`strict`，CommonJS），`tsc` 编译到 `dist`，**无打包器**
- Socket.IO 4 + `@socket.io/redis-adapter`（多实例横向扩展靠 Redis）
- `ws` 8：裸 WebSocket 通道
- moleculer：服务发现与 `nkc` → 本服务的 action 调用（transporter 为 Redis）
- pino 日志；jest（已配置但仓库当前**没有任何测试文件**）

## 目录结构

```
src/
├── server.ts              # 入口：Broker.createService → start → StartWebsocketServer
├── app.ts                 # moleculer 服务定义（name: websocket, version: 1, actions）
├── websocket.ts           # 建 http server、装 Redis adapter、listen
├── modules/
│   ├── socket.ts          # Socket.IO 初始化：/common 命名空间 + 中间件 + 路由
│   ├── wss.ts             # 裸 ws：房间表、join/leave/to、心跳（自行维护房间）
│   ├── comm.ts            # ServiceActionNames / SocketEventNames 常量 + BrokerCall
│   ├── broker.ts          # ServiceBroker（namespace 与 nodeID 拼 host+pid）
│   ├── configs.ts         # 读 configs.yaml 并做默认值
│   ├── logger.ts          # pino
│   ├── args.ts / env.ts / error.ts / yaml.ts
├── middlewares/
│   ├── ctx.ts             # 初始化 socket.state（id / address / os）
│   └── auth.ts            # 调 nkc 的 v1.nkc.websocketAuth 换 uid、在线状态、好友列表
├── routes/                # Socket.IO 事件处理
│   ├── index.ts           # connection 入口 + joinRoom 分发（forum/post/article/zoneHome）
│   ├── message.ts         # 加入 USER 房间、好友上下线通知、未读数
│   ├── forum.ts / post.ts / article.ts / zoneHome.ts
├── actions/               # nkc → 本服务的 moleculer action
│   ├── sendMessageToRoom.ts
│   └── sendMessageToRooms.ts
├── services/
│   ├── wsRoom.ts          # 房间名生成（唯一来源）
│   ├── wsClient.ts        # 真实 IP、房间成员、踢人
│   └── user.ts            # 在线状态、好友、权限校验（走 BrokerCall）
├── interfaces/            # configs.ts / ws.ts 类型
└── bin/replace_alias.ts   # 构建后把 @/ 改写成相对路径
```

## 两套协议并存（改动前必读）

同一个 `http.Server` 上挂两个服务端，**任何涉及 upgrade 的改动都要同时考虑两者**：

1. **Socket.IO** —— `modules/socket.ts` 的 `SocketioInit`，命名空间 `/common`，Web 端与 App 主用。
2. **裸 WebSocket** —— `modules/wss.ts` 的 `WSSInit`，路径 `/wss`，协议为 `{event, data}` JSON。

`wss.ts` 里用 `httpServer.prependListener('upgrade', ...)` 抢在 Socket.IO 之前分发 `/wss`。**这个 prepend 不能改成 `on`**，否则 Socket.IO 先接管 upgrade，裸 ws 通道会静默失效。

## 房间与事件（跨仓库契约）

房间名只在 `src/services/wsRoom.ts` 生成，格式 `TYPE:id`：

`USER:<uid>`、`FORUM:<fid>`、`THREAD:<tid>`、`POST:<pid>`、`ARTICLE:<aid>`、`CONSOLE`、`ZONEHOME`

- 连接成功后自动加入 `USER:<uid>`；同一用户连接数超过 `maxConnection` 时踢掉最旧的。
- **游客（无 uid）连接会被立即断开**，不要在客户端做"未登录也保持连接"的假设。
- 事件名集中在 `src/modules/comm.ts` 的 `SocketEventNames`，新增事件**先加常量再用**，不要在业务文件里散落字符串。

### 与 `nkc` 的调用方向

| 方向 | 通道 | 说明 |
| --- | --- | --- |
| `nkc` → 本服务 | moleculer `v1.websocket.sendMessageToRoom` / `sendMessageToRooms` | 推送消息到房间 |
| 本服务 → `nkc` | moleculer `v1.nkc.websocketAuth` / `setUserOnlineStatus` / `getUserFriendsUid` / 权限校验 | 认证与状态 |

`actions/sendMessageToRoom.ts` 在一次调用里**同时**做 `CommonSpace.to(room).emit()`（Socket.IO）和 `WSSToRoom()`（裸 ws）。改推送逻辑时两条路径必须同步，只改一个会让另一套协议的客户端收不到消息——这类 bug 在只测 Web 时不会暴露。

## 构建与运行

```bash
yarn dev      # tsx watch src/server.ts
yarn build    # rimraf dist → tsc → node dist/bin/replace_alias.js
yarn start    # node . （即 dist/server.js）
```

- **不要跳过 `replace-alias`**：`tsc` 不会重写 `@/` 别名，少了这一步启动即报模块找不到。
- 新增路径别名只改 `tsconfig.json` 的 `paths`，不要另建别名机制。
- `yarn test` 是 `build && jest`，`jest.testMatch` 只匹配 `**/dist/**/*.test.js`。**当前仓库没有任何测试文件，直接跑会以 "No tests found" 失败**——不要把它当作可用回归手段，也不要因为"测试通过"就认为没问题。要写测试就放 `src/**/*.test.ts`，编译后落到 `dist`。
- 代码检查：`npx eslint .`（没有 `lint` 脚本；flat config，prettier 由 eslint 插件执行）。

## 配置

`configs.yaml`（**被 .gitignore 忽略，不要提交、不要把内容贴进对话**），模板见 `configs.template.yaml`：

| 配置 | 作用 |
| --- | --- |
| `host` / `port` | 主监听地址与端口（默认 22800） |
| `proxy` / `maxIpsCount` | 是否在反代后取真实 IP，以及取 `X-Forwarded-For` 的第几段 |
| `maxConnection` | 单用户最大连接数，超出踢最旧 |
| `moleculer.namespace` / `transporter` / `web` | 服务发现命名空间、Redis transporter、moleculer-web 端口（20395） |
| `redis` | Socket.IO adapter 用的 Redis |
| `socketIO` | `serveClient` / `transports` / `pingInterval` |

`moleculer.namespace` 必须与 `nkc`、`nkc-media` 保持一致（默认 `NKC_MESH_PRODUCTION`），否则互相发现不到服务。

## 规范

- 新增事件或 action：常量（`comm.ts`）→ 实现 → 在 `app.ts` / `routes/index.ts` 注册，三步齐全。
- 日志用 `modules/logger`（pino）。`wss.ts` 里有少量历史 `console.warn`/`console.error`，新增代码不要跟随。
- 参数校验用 moleculer 的 `params` schema（见 `actions/*.ts`），不要手写 if 判断。
- 异常不要静默吞掉，至少 `logger.error`；连接类错误按现有写法断开连接。
- 中文注释；提交信息用 Conventional Commits 前缀 + 中文描述。
