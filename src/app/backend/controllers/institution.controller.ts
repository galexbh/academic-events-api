import config from "config";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CreateCategoryInput } from "../schemas/category.schema";
import { InstitutionServices } from "../services/institution.services";

const unexpectedRequest = config.get<string>("unexpected");

export class InstitutionController {
  private readonly institutionServices: InstitutionServices;

  public async createInstitutionHandler(
    req: Request<{}, {}, CreateCategoryInput>,
    res: Response
  ) {
    const payload = req.body;

    try {
      await this.institutionServices.createInstitution(payload);

      return res
        .status(StatusCodes.CREATED)
        .json({ message: "Category successfully created" });
    } catch (e: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: unexpectedRequest });
    }
  }

  public async getAllInstitutionHandler(_req: Request, res: Response) {
    try {
      const institutions = await this.institutionServices.findInstitutions();

      if (!institutions) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json({
            message: "It has not been possible to obtain the institutions",
          });
      }

      return res
        .status(StatusCodes.OK)
        .json({ message: "Institutions found", institutions });
    } catch (e: any) {
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json({ message: unexpectedRequest });
    }
  }
}
