import { z, object, string, TypeOf, any, number } from "zod";

const modalityValues = ["virtual", "presencial"] as const;
const typeValues = ["publico", "privado"] as const;

export const createEventSchema = object({
    body: object({
        title: string({
            required_error: "Title is required",
        }),
        description: string({
            required_error: "Description name is required",
        }),
        modality: z.enum(modalityValues),
        type: z.enum(typeValues),
        category: any({
            required_error: "Category is required",
        }),
        speaker: string({
            required_error: "Speaker is required",
        }),
        limitParticipants: number({
            required_error: "Limit of participants is required",
        }).nonnegative(),
        startDate: string(),
        endDate: string(),
    }),
});

export const idEventSchema = object({
    params: object({
        id: string(),
    }),
});

export const updateEventSchema = idEventSchema.merge(createEventSchema);

export type CreateEventInput = TypeOf<typeof createEventSchema>["body"];

export type IdEventInput = TypeOf<typeof idEventSchema>["params"];

export type UpdateEventInput = TypeOf<typeof updateEventSchema>;