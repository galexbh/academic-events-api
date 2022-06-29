import { CategoryModel } from "../models/category.model";
import RolModel from "../models/role.model";
import log from "../shared/logger";

export const createRoles = async () => {

    try {
        const count = await RolModel.estimatedDocumentCount();

        if (count > 0) return;

        const result = await RolModel.insertMany([
            { name: "admin" },
            { name: "contentCreator" },
            { name: "user" },
        ]);

        log.info(result);
    } catch (e: any) {
        log.error(e);
    }
}

export const createCategories = async () => {

    try {
        const count = await CategoryModel.estimatedDocumentCount();

        if (count > 0) return;

        const result = await CategoryModel.insertMany([
            { name: "taller" },
            { name: "conferencia" },
            { name: "seminario" },
            { name: "curso" },
            { name: "diplomado" },
            { name: "clinica" },
        ]);

        log.info(result);
    } catch (e: any) {
        log.error(e);
    }
}
