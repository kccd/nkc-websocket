export interface Configs {
  // websocket 服务监听地址
  host: string;
  port: number;
  // websocket 是否经过代理
  proxy: boolean;
  // 经过代理时允许的最大IP数
  // 如果前面仅有一个代理则此字段应设置为2
  maxIpsCount: number;
  redis: {
    host: string;
    port: number;
    passwd: string;
    db: number;
  };
  socketIO: {
    serveClient: boolean;
    transports: string[];
    pingInterval: number;
  };
}
