import {readFileSync} from 'fs';
import {resolve} from 'path';
import {Config} from '../interfaces/config';
import {yamlToJson} from './yaml';

const configFilePath = resolve(__dirname, '../../configs.yaml');
const yamlContent = readFileSync(configFilePath).toString();

const configs = <Config>yamlToJson(yamlContent);

export function GetUsernameLengthLimit(): {
  maxLength: number;
  minLength: number;
} {
  return {
    maxLength: configs.user.name.maxLength,
    minLength: configs.user.name.minLength,
  };
}

export function GetUserPasswdLengthLimit(): {
  maxLength: number;
  minLength: number;
} {
  return {
    maxLength: configs.user.passwd.maxLength,
    minLength: configs.user.passwd.minLength,
  };
}

export function GetTokenSecret(): string {
  return configs.token.secret;
}

export function GetTokenExpiresIn(): string {
  return configs.token.expiresIn;
}
