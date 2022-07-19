import { object, string, TypeOf } from "zod";

export const createCategorySchema = object({
  body: object({
    name: string({
      required_error: "Name is required",
    }),
  }),
});

export type CreateCategoryInput = TypeOf<typeof createCategorySchema>["body"];
