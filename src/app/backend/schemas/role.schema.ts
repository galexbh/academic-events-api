import { object, string, TypeOf } from "zod";

export const roleSchema = object({
  body: object({
    roles: string({
      required_error: "Roles is required",
    }),
  }),
});

export type CreateRoleInput = TypeOf<typeof roleSchema>["body"];
