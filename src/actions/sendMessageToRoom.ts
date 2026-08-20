import {Context} from 'moleculer';
import {CommonSpace} from '@/modules/socket';
import {logger} from '@/modules/logger';
import {WSSToRoom} from '@/modules/wss';

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

    if (CommonSpace == null) {
      logger.error('WebSocket server is not initialized');
      return;
    }

    CommonSpace.to(room).emit(event, data);
    WSSToRoom(room, event, data);

    logger.info(
      `Sent message to room ${room}: event=${event}, data=${JSON.stringify(data)}`,
    );
  },
};
