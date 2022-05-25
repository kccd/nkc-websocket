import {ServiceBroker} from 'moleculer';

export const ServiceActionNames = {
  v1_nkc_websocket_auth: 'v1.nkc.websocketAuth',
};

export const Broker = new ServiceBroker({
  nodeID: `nkc-websocket_${process.pid.toString()}`,
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
