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
