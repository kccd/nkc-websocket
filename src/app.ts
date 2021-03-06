import {ServiceSchema} from 'moleculer';
import ApiService from 'moleculer-web';
import {GetMoleculerConfigs} from './modules/configs';
const moleculerConfigs = GetMoleculerConfigs();
const mixins = moleculerConfigs.web.enabled ? [ApiService] : [];

import sendMessageToRooms from './actions/sendMessageToRooms';
import sendMessageToRoom from './actions/sendMessageToRoom';

export default <ServiceSchema>{
  name: 'websocket',
  version: 1,
  mixins,
  settings: {
    port: moleculerConfigs.web.port,
    host: moleculerConfigs.web.host,
  },
  actions: {
    sendMessageToRooms,
    sendMessageToRoom,
  },
};

export function ConsoleApiServiceInfo() {
  if (mixins.length) {
    console.log(
      `ApiService is running at ${moleculerConfigs.web.host}:${moleculerConfigs.web.port}`,
    );
  }
}
