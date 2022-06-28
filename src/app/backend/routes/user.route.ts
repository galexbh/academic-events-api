import { Application } from "express";
import { UserController } from "../controllers/user.controller";
import verifyUser from "../middlewares/verifyUser.middleware";
import { schemaValition } from "../middlewares/schemaValidator.middleware";
import {
  verifyUserSchema,
  createUserSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../schemas/user.schema";

export class UserRoute {
  private userController: UserController;

  constructor(private app: Application) {
    this.userController = new UserController();
    this.routes();
  }

  public routes() {
    this.app.post(
      "/api/v1/users/register",
      schemaValition(createUserSchema),
      this.userController.createUserHandler
    );

    this.app.get(
      "/api/v1/users/verify/:id/:verificationCode",
      schemaValition(verifyUserSchema),
      this.userController.verifyUserHandler
    );

    this.app.post(
      "/api/v1/users/forgotpassword",
      schemaValition(forgotPasswordSchema),
      this.userController.forgotPasswordHandler
    );

    this.app.post(
      "/api/v1/users/resetpassword/:id/:passwordResetCode",
      schemaValition(resetPasswordSchema),
      this.userController.resetPasswordHandler
    );

    this.app.get(
      "/api/v1/users/me",
      verifyUser,
      this.userController.getCurrentUserHandler
    );
  }
}
