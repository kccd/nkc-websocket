import Moleculer from 'moleculer';
import MoleculerError = Moleculer.Errors.MoleculerError;
import {logger} from './logger';

export const HttpErrorCodes = {
  OK: 200,
  MovedPermanently: 301,
  BadRequest: 400,
  UnAuthorized: 401,
  Forbidden: 403,
  NotFound: 404,
  InternalServerError: 500,
  BadGateway: 502,
  ServiceUnavailable: 503,
};

export const HttpErrorTypes = {
  ERR_INVALID_USERNAME: 'ERR_INVALID_USERNAME ',
  ERR_INVALID_UID: 'ERR_INVALID_UID ',
  ERR_USED_USERNAME: 'ERR_USED_USERNAME',
  ERR_INVALID_EMAIL: 'ERR_INVALID_EMAIL',
  ERR_INVALID_MOBILE: 'ERR_INVALID_MOBILE',
  ERR_USED_EMAIL: 'ERR_USED_EMAIL',
  ERR_USED_MOBILE: 'ERR_USED_MOBILE',
  ERR_INVALID_PASSWORD: 'ERR_INVALID_PASSWORD',

  ERR_INVALID_DB_MODEL_NAME: 'ERR_INVALID_DB_MODEL_NAME',

  ERR_CREATE_USER_BY_EMAIL: 'ERR_CREATE_USER_BY_EMAIL',
};

export function ThrowHttpError(
  code: number,
  type: string,
  error: string | Error = '',
): MoleculerError {
  const stackInfo =
    typeof error === 'string'
      ? error
      : error.stack || error.message || error.toString();
  const messageInfo = typeof error === 'string' ? error : error.message || '';

  logger.error(
    `ERR_CODE: ${code}\nERR_TYPE: ${type}\nERR_MESSAGE: ${stackInfo}`,
  );
  throw new MoleculerError(messageInfo, code, type);
}
