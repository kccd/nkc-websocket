import {Broker} from './modules/broker';
import app from './app';
import {InfoLog} from './modules/logger';
import {StartWebsocketServer} from './websocket';

Broker.createService(app);

async function run() {
  await Broker.start();
  InfoLog('Service started');
  await StartWebsocketServer();
}

run().catch(console.error);
