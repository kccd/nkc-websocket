import {ServiceSchema} from 'moleculer';
import ApiService from 'moleculer-web';

export default <ServiceSchema>{
  name: 'account',
  version: 1,
  mixins: [ApiService],
  actions: {},
};
