import {ServiceSchema} from 'moleculer';
import ApiService from 'moleculer-web';
import {GetMoleculerConfigs} from './modules/configs';
const moleculerConfigs = GetMoleculerConfigs();
const mixins = moleculerConfigs.web.enabled ? [ApiService] : [];

import sendRoomMessage from './actions/sendRoomMessage';

export default <ServiceSchema>{
  name: 'websocket',
  version: 1,
  mixins,
  settings: {
    port: moleculerConfigs.web.port,
    host: moleculerConfigs.web.host,
  },
  actions: {
    sendRoomMessage,
  },
};
