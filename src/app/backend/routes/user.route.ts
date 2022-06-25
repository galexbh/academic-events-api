import { Application } from "express";
import { UserController } from "../controllers/user.controller";

export class UserRoute {
  private userController: UserController;

  constructor(private app: Application) {
    this.userController = new UserController();
    this.routes();
  }

  public routes() {
    this.app
    .post("/api/register/v1", this.userController.createUserHandler);
  }
}