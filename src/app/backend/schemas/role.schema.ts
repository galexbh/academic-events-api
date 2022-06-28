import { object, string, TypeOf } from "zod";

export const roleSchema = object({
    body: object({
        roles: string(),
    })
})

export type CreateRoleInput = TypeOf<typeof roleSchema>["body"];