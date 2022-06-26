import { BackendApp } from './backendApp';
import { createRoles } from './libs/initialSetup';
import log from './shared/logger';

try {
  new BackendApp().start();
  createRoles();
} catch (e) {
  log.error(e);
  process.exit(1);
}

process.on('uncaughtException', err => {
  log.error('uncaughtException', err);
  process.exit(1);
});
