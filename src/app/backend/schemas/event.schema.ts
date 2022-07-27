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
    limitParticipants: string({
      required_error: "Limit of participants is required",
    })
      .transform((val: any) => Number(val)),
    startDate: string({
      required_error: "Start date is required",
    }),
    endDate: string({
      required_error: "End date is required",
    }),
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
    })
      .transform((val: any) => Number(val))
      .optional(),
    startDate: string({
      required_error: "Start date is required",
    }).optional(),
    endDate: string({
      required_error: "End date is required",
    }).optional(),
  }),
});

export const idEventSchema = object({
  params: object({
    id: string({
      required_error: "Identifier is required",
    }),
  }),
});

export const updateEventSchema = idEventSchema.merge(upgradeEventSchema);

export type CreateEventInput = TypeOf<typeof createEventSchema>["body"];

export type IdEventInput = TypeOf<typeof idEventSchema>["params"];

export type UpdateEventInput = TypeOf<typeof updateEventSchema>;
