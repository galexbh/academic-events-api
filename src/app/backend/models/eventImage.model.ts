import { modelOptions, prop } from "@typegoose/typegoose";

@modelOptions({
  schemaOptions: {
    timestamps: true,
    _id: false,
  },
})
export class EventImage {
  @prop()
  publicId: string;

  @prop()
  secureUrl: string;
}
