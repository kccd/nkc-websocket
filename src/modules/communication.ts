import {ServiceBroker} from 'moleculer';

export const ServiceActionNames = {
  v1_verification_verify_email_code: 'v1.verification.verifyEmailCode',
  v1_verification_verify_mobile_code: 'v1.verification.verifyMobileCode',
};

export const Broker = new ServiceBroker({
  nodeID: `nkc-account_${process.pid.toString()}`,
  transporter: 'TCP',
  registry: {
    strategy: 'Random',
    discoverer: 'Local',
  },
  logger: {
    type: 'File',
    options: {
      folder: './logs',
      filename: 'moleculer-{date}.log',
      formatter: 'json',
      eol: '\n',
      interval: 2 * 1000,
    },
  },
});

export function BrokerCall(serviceActionName: string, params: unknown) {
  return Broker.call(serviceActionName, params);
}
