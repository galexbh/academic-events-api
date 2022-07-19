import "dotenv/config";
import { Server } from "./server";
import config from "config";

const port = config.get<string>("port");

export class BackendApp {
  server?: Server;

  async start() {
    this.server = new Server(port);
    return this.server.listen();
  }

  get httpServer() {
    return this.server?.getHTTPServer();
  }

  async stop() {
    return this.server?.stop();
  }
}
