type Transport = 'polling' | 'websocket';
export interface Configs {
  // websocket 服务监听地址
  host: string;
  port: number;
  // websocket 是否经过代理
  proxy: boolean;
  // 经过代理时允许的最大IP数
  // 如果前面仅有一个代理则此字段应设置为2
  maxIpsCount: number;
  maxConnection: number;
  moleculer: {
    namespace: string;
    nodeID: string;
    transporter: string;
    registry: {
      strategy: string;
      discoverer: string;
    };
    web: {
      enabled: boolean;
      port: number;
      host: string;
    };
  };
  redis: {
    host: string;
    port: number;
    username: string;
    passwd: string;
    dbNumber: number;
  };
  socketIO: {
    serveClient: boolean;
    transports: Transport[];
    pingInterval: number;
  };
}
