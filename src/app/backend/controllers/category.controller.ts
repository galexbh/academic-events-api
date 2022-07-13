import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { CreateCategoryInput } from '../schemas/category.schema';
import { createCategory, findAllCategories } from '../services/category.services';

export class CategoryController {

    public async createCategoryHandler(req: Request<{}, {}, CreateCategoryInput>, res: Response) {
        const payload = req.body;

        try {
            await createCategory(payload);

            return res.status(StatusCodes.CREATED).json({ message: "Category successfully created" });
        } catch (e: any) {
            return res.status(StatusCodes.BAD_REQUEST).json({ message: "Conflicts when creating the category" });
        }
    }

    public async getAllCategoryHandler(_req: Request, res: Response) {
        try {
            const categories = await findAllCategories();

            return res.status(StatusCodes.OK).json({ message: "categories found", categories });
        } catch (e: any) {
            return res.status(StatusCodes.NOT_FOUND).json({ message: "No categories found" });
        }
    }
}