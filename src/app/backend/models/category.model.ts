import { getModelForClass, prop } from "@typegoose/typegoose";

export class Category {
    @prop()
    public name: string;
}

export const CategoryModel = getModelForClass(Category);