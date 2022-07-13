import { Application } from "express";
import { schemaValition } from "../middlewares/schemaValidator.middleware";
import verifyUser from "../middlewares/verifyUser.middleware";
import { createInstitutionSchema } from '../schemas/institution.schema';
import { InstitutionController } from '../controllers/institution.controller';

export class InstitutionRoute {
    private institutioncontroller: InstitutionController;

    constructor(private app: Application) {
        this.institutioncontroller = new InstitutionController();
        this.routes();
    }

    public routes() {
        this.app
            .post("/api/v1/institutions",
                [verifyUser, schemaValition(createInstitutionSchema)],
                this.institutioncontroller.createInstitutionHandler);

        this.app
            .get("/api/v1/institutions",
                [verifyUser],
                this.institutioncontroller.getAllInstitutionHandler);
    }
}