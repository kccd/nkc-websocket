import {Command} from 'commander';
const program = new Command();
program.option('-h, --host [type]', '').option('-p, --port [type]', '');
program.parse(process.argv);
const {port, host} = program.opts<{
  port: string | boolean | undefined;
  host: string | boolean | undefined;
}>();

export function GetArgs(): {
  port: undefined | number;
  host: undefined | string;
} {
  let _port = undefined;
  let _host = undefined;
  if (port && typeof port !== 'boolean') {
    _port = Number(port);
  }
  if (host && typeof host !== 'boolean') {
    _host = host;
  }

  return {
    port: _port,
    host: _host,
  };
}
