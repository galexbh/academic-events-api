import { Application } from "express";
import { AuthController } from "../controllers/auth.controller";
import { createSessionSchema } from "../schemas/auth.schema";
import { schemaValition } from "../middlewares/schemaValidator.middleware";

export class AuthRoute {
  private authcontroller: AuthController;

  constructor(private app: Application) {
    this.authcontroller = new AuthController();
    this.routes();
  }

  public routes() {
    this.app
      .post("/api/v1/sessions",
        schemaValition(createSessionSchema),
        this.authcontroller.createSessionHandler);
  }
}
