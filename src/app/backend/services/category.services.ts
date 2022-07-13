import { Category, CategoryModel } from "../models/category.model";

export function createCategory(input: Partial<Category>) {
    return CategoryModel.create(input);
}

export function findAllCategories() {
    return CategoryModel.find();
}