import { Application } from "express";
import { MainController } from "../controllers/main.controller";

export class MainRoute {
  private maincontroller: MainController;

  constructor(private app: Application) {
    this.maincontroller = new MainController();
    this.routes();
  }

  public routes() {
    this.app.get("/", this.maincontroller.welcome);
  }
}
