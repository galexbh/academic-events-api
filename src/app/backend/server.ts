import { json, urlencoded } from "body-parser";
import compress from "compression";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import fileUpload from "express-fileupload";
import deserializeUser from "./middlewares/deserializeUser.middleware";
import log from "./shared/logger";
import connect from "./shared/mongoConnection";
import * as http from "http";

import { MainRoute } from "./routes/main.route";
import { AuthRoute } from "./routes/auth.route";
import { UserRoute } from "./routes/user.route";
import { EventRoute } from "./routes/event.route";
import { CategoryRoute } from "./routes/category.route";
import { InstitutionRoute } from "./routes/institution.route";

export class Server {
  private express: express.Express;
  private port: string;
  private httpServer?: http.Server;

  public mainRoute: MainRoute;
  public authRoute: AuthRoute;
  public userRoute: UserRoute;
  public eventRoute: EventRoute;
  public categoryRoute: CategoryRoute;
  public institutionRoute: InstitutionRoute;

  constructor(port: string) {
    this.port = port;
    this.setConfig();
    this.setMongoConfig();

    this.mainRoute = new MainRoute(this.express);
    this.authRoute = new AuthRoute(this.express);
    this.userRoute = new UserRoute(this.express);
    this.eventRoute = new EventRoute(this.express);
    this.categoryRoute = new CategoryRoute(this.express);
    this.institutionRoute = new InstitutionRoute(this.express);
  }

  private setConfig() {
    this.express = express();
    this.express.use(cors());
    this.express.use(json());
    this.express.use(deserializeUser);
    this.express.use(urlencoded({ extended: true }));
    this.express.use(helmet.xssFilter());
    this.express.use(helmet.noSniff());
    this.express.use(helmet.hidePoweredBy());
    this.express.use(helmet.frameguard({ action: "deny" }));
    this.express.use(compress());
    this.express.use(
      fileUpload({
        useTempFiles: true,
        tempFileDir: "./uploads",
      })
    );
  }

  private async setMongoConfig() {
    await connect();
  }

  async listen(): Promise<void> {
    return new Promise((resolve) => {
      this.httpServer = this.express.listen(this.port, () => {
        log.info(
          `Backend App is running at http://localhost:${
            this.port
          } in ${this.express.get("env")} mode`
        );
        log.info("  Press CTRL-C to stop\n");
        resolve();
      });
    });
  }

  getHTTPServer() {
    return this.httpServer;
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.httpServer) {
        this.httpServer.close((error) => {
          if (error) {
            return reject(error);
          }
          return resolve();
        });
      }

      return resolve();
    });
  }
}
