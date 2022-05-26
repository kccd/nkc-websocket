import {Context} from 'moleculer';
import {CommonSpace} from '../websocket';

export default {
  params: {
    rooms: {
      type: 'array',
      items: 'string',
      min: 1,
    },
    event: 'string',
    data: 'any',
  },
  handler(ctx: Context) {
    const {rooms, data, event} = ctx.params as {
      rooms: [string];
      data: unknown;
      event: string;
    };
    console.log({
      rooms,
      data,
      event,
    });
    let namespace = CommonSpace.to(rooms[0]);
    for (let i = 1; i < rooms.length; i++) {
      const room = rooms[i];
      namespace = namespace.to(room);
    }
    namespace.emit(event, data);
  },
};
