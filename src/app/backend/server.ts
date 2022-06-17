import { json, urlencoded } from 'body-parser';
import compress from 'compression';
import express, { Response } from 'express';
import helmet from 'helmet';
import log from './shared/logger';
import cors from 'cors';
import connect from './shared/mongoConnection';
import * as http from 'http';
import { INTERNAL_SERVER_ERROR } from 'http-status'

import { MainController } from "./controllers/main.controller";
import { UserController } from "./controllers/user.controller";

export class Server {
    private express: express.Express;
    private port: number;
    private httpServer?: http.Server;

    public mainController: MainController;
    public userController: UserController;

    constructor(port: number) {
        this.port = port;
        this.setConfig();
        this.setMongoConfig();

        this.mainController = new MainController(this.express);
        this.userController = new UserController(this.express);

        this.express.use((err, res: Response) => {
            log.error(err);
            res.status(INTERNAL_SERVER_ERROR).send('Something broke!');
        });

    }

    private setConfig() {
        this.express = express();
        this.express.use(cors());
        this.express.use(json());
        this.express.use(urlencoded({ extended: true }));
        this.express.use(helmet.xssFilter());
        this.express.use(helmet.noSniff());
        this.express.use(helmet.hidePoweredBy());
        this.express.use(helmet.frameguard({ action: 'deny' }));
        this.express.use(compress());
    }

    private async setMongoConfig() {
        connect();
    }

    async listen(): Promise<void> {
        return new Promise(resolve => {
            this.httpServer = this.express.listen(this.port, () => {
                log.info(
                    `Backend App is running at http://localhost:${this.port} in ${this.express.get('env')} mode`
                );
                log.info('  Press CTRL-C to stop\n');
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
                this.httpServer.close(error => {
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