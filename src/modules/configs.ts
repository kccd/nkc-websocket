import {readFileSync} from 'fs';
import {resolve} from 'path';
import {Configs} from '../interfaces/configs';
import {yamlToJson} from './yaml';

const configFilePath = resolve(__dirname, '../../configs.yaml');
const yamlContent = readFileSync(configFilePath).toString();

const configs = <Configs>yamlToJson(yamlContent);

export function GetServerConfigs() {
  return {
    host: configs.host,
    port: configs.port,
  };
}

export function GetRedisConfigs() {
  const {port, host, username, passwd, dbNumber} = configs.redis;
  let account = '';
  if (passwd) {
    account = `${username}:${passwd}@`;
  }
  return {
    port,
    host,
    username,
    passwd,
    dbNumber,
    url: `redis://${account}${host}:${port}/${dbNumber}`,
  };
}

export function GetProxyConfigs() {
  return {
    proxy: configs.proxy,
    maxIpsCount: configs.maxIpsCount,
  };
}

export function GetSocketIOConfigs() {
  return configs.socketIO;
}

export function GetConnectionConfigs() {
  return {
    maxConnection: configs.maxConnection,
  };
}

export function GetMoleculerConfigs() {
  return configs.moleculer;
}
