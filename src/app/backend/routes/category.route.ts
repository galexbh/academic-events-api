import { Application } from "express";
import { CategoryController } from "../controllers/category.controller";
import { schemaValition } from "../middlewares/schemaValidator.middleware";
import verifyUser from "../middlewares/verifyUser.middleware";
import { createCategorySchema } from "../schemas/category.schema";

export class CategoryRoute {
  private categorycontroller: CategoryController;

  constructor(private app: Application) {
    this.categorycontroller = new CategoryController();
    this.routes();
  }

  public routes() {
    this.app.post(
      "/api/v1/categories",
      [verifyUser, schemaValition(createCategorySchema)],
      this.categorycontroller.createCategoryHandler
    );

    this.app.get(
      "/api/v1/categories",
      [verifyUser],
      this.categorycontroller.getAllCategoryHandler
    );
  }
}
