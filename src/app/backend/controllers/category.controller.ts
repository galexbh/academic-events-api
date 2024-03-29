import config from "config";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CreateCategoryInput } from "../schemas/category.schema";
import { CategoryServices } from "../services/category.services";

const unexpectedRequest = config.get<string>("unexpected");

export class CategoryController {
  private readonly categoryServices: CategoryServices;

  public async createCategoryHandler(
    req: Request<{}, {}, CreateCategoryInput>,
    res: Response
  ) {
    const payload = req.body;

    try {
      await this.categoryServices.createCategory(payload);

      return res
        .status(StatusCodes.CREATED)
        .json({ message: "Category successfully created" });
    } catch (e: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: unexpectedRequest });
    }
  }

  public async getAllCategoryHandler(_req: Request, res: Response) {
    try {
      const categories = await this.categoryServices.findAllCategories();

      if (!categories) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({ message: "The categories could not be obtained" });
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: "categories found", categories });
    } catch (e: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: unexpectedRequest });
    }
  }
}
