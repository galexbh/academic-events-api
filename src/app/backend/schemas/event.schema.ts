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

export const upgradeEventSchema = object({
    body: object({
        title: string({
            required_error: "Title is required",
        }).optional(),
        description: string({
            required_error: "Description name is required",
        }).optional(),
        modality: z.enum(modalityValues).optional(),
        type: z.enum(typeValues).optional(),
        category: any({
            required_error: "Category is required",
        }).optional(),
        speaker: string({
            required_error: "Speaker is required",
        }).optional(),
        limitParticipants: number({
            required_error: "Limit of participants is required",
        }).nonnegative().optional(),
        startDate: string().optional(),
        endDate: string().optional(),
    }),
});

export const idEventSchema = object({
    params: object({
        id: string(),
    }),
});

export const updateEventSchema = idEventSchema.merge(upgradeEventSchema);

export type CreateEventInput = TypeOf<typeof createEventSchema>["body"];

export type IdEventInput = TypeOf<typeof idEventSchema>["params"];

export type UpdateEventInput = TypeOf<typeof updateEventSchema>;