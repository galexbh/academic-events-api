import { object, string, TypeOf } from "zod";

export const createInstitutionSchema = object({
    body: object({
        name: string({
            required_error: "Name is required",
        }),
        domain: string({
            required_error: "Name is required",
        }).array(),
    }),
});

export type CreateInstitutionInput = TypeOf<typeof createInstitutionSchema>["body"];