import {Broker} from './modules/communication';
import app from './app';
import {InfoLog} from './modules/logger';

Broker.createService(app);

async function run() {
  InfoLog('Starting service...');
  await Broker.start();
  InfoLog('Service started');
}

run().catch(console.error);
