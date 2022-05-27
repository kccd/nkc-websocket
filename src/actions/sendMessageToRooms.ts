import {Context} from 'moleculer';
import {CommonSpace} from '../websocket';

/**
 * @api {POST} /websocket/sendMessageToRooms 发送信息到 websocket 房间
 * @apiGroup SendMessage
 * @apiBody {[String]} rooms 房间名称数组
 * @apiBody {String} event 事件名
 * @apiBody {Any} data 数据
 */
export default {
  params: {
    rooms: {
      type: 'array',
      min: 1,
      items: {
        type: 'string',
        min: 1,
      },
    },
    event: {
      type: 'string',
      min: 1,
    },
    data: 'any',
  },
  handler(ctx: Context) {
    const {rooms, data, event} = ctx.params as {
      rooms: [string];
      data: unknown;
      event: string;
    };
    let namespace = CommonSpace.to(rooms[0]);
    for (let i = 1; i < rooms.length; i++) {
      const room = rooms[i];
      namespace = namespace.to(room);
    }
    namespace.emit(event, data);
  },
};
