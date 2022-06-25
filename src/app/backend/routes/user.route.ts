import { Application } from "express";
import { UserController } from "../controllers/user.controller";
import { schemaValition } from "../middlewares/schemaValidator.middleware";
import { verifyUserSchema, createUserSchema } from "../schemas/user.schema";

export class UserRoute {
  private userController: UserController;

  constructor(private app: Application) {
    this.userController = new UserController();
    this.routes();
  }

  public routes() {
    this.app
      .post("/api/v1/users/register", schemaValition(createUserSchema), this.userController.createUserHandler);

    this.app
      .post(
        "/api/v1/users/verify/:id/:verificationCode", schemaValition(verifyUserSchema), this.userController.verifyUserHandler);
  }

}