import {Context} from 'moleculer';
import {CommonSpace} from '../websocket';

/**
 * @api {POST} /websocket/sendMessageToRoom 发送信息到 websocket 房间
 * @apiGroup SendMessage
 * @apiBody {String} room 房间名称
 * @apiBody {String} event 事件名
 * @apiBody {Any} data 数据
 */
export default {
  params: {
    room: {
      type: 'string',
      min: 1,
    },
    event: {
      type: 'string',
      min: 1,
    },
    data: 'any',
  },
  handler(ctx: Context) {
    const {room, data, event} = ctx.params as {
      room: string;
      data: unknown;
      event: string;
    };
    CommonSpace.to(room).emit(event, data);
  },
};
