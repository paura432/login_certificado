import { fork } from 'child_process';

const BASE_PORT = 4430;
const INSTANCES = 3;

for (let i = 0; i < INSTANCES; i++) {
  const port = BASE_PORT + i;
  fork('dist/server.js', [], {
    env: { ...process.env, PORT: port.toString() },
  });
}
