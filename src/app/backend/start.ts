import { BackendApp } from './backendApp';
import log from './shared/logger';

try {
  new BackendApp().start();
} catch (e) {
  log.error(e);
  process.exit(1);
}

process.on('uncaughtException', err => {
  log.error('uncaughtException', err);
  process.exit(1);
});
