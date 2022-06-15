import { Application } from "express";
import { UserServices } from "../services/user.services";

export class UserController {
  private userServices: UserServices;

  constructor(private app: Application) {
    this.userServices = new UserServices();
    this.routes();
  }

  public routes() {
    this.app
    .post("/login", this.userServices.loginUser);

    this.app
    .post("/register", this.userServices.createUser);
  }
}