import {Broker} from '@/modules/broker';
import app, {ConsoleApiServiceInfo} from './app';
import {logger} from '@/modules/logger';
import {StartWebsocketServer} from './websocket';
import {env} from '@/modules/env';

Broker.createService(app);

async function run() {
  await Broker.start();
  logger.info(
    'Service started, Env: %s, Version: %s',
    env,
    process.env.npm_package_version,
  );
  ConsoleApiServiceInfo();
  await StartWebsocketServer();
}

run().catch(console.error);
