import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CreateCategoryInput } from "../schemas/category.schema";
import {
  createInstitution,
  findInstitutions,
} from "../services/institution.services";

export class InstitutionController {
  public async createInstitutionHandler(
    req: Request<{}, {}, CreateCategoryInput>,
    res: Response
  ) {
    const payload = req.body;

    try {
      await createInstitution(payload);

      return res
        .status(StatusCodes.CREATED)
        .json({ message: "Category successfully created" });
    } catch (e: any) {
      return res
        .status(StatusCodes.BAD_REQUEST)
        .json({ message: "Conflicts when creating the category" });
    }
  }

  public async getAllInstitutionHandler(_req: Request, res: Response) {
    try {
      const Institutions = await findInstitutions();

      return res
        .status(StatusCodes.OK)
        .json({ message: "Institutions found", Institutions });
    } catch (e: any) {
      return res
        .status(StatusCodes.NOT_FOUND)
        .json({ message: "No institutions found" });
    }
  }
}
