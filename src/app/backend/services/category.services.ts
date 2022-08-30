import { Category, CategoryModel } from "../models/category.model";

export class CategoryServices {
  public createCategory(input: Partial<Category>) {
    return CategoryModel.create(input);
  }

  public findAllCategories() {
    return CategoryModel.find();
  }
}
