import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { User } from "./user.model";

export class Event {
    @prop()
    public title: string;
  
    @prop()
    public description: string;
  
    @prop({ enum: ["virtual", "presencial"] })
    public modality: string;
  
    @prop({ required: true, ref: () => User })
    public owner: Ref<User>;
  
    @prop({ default: false })
    public published: boolean;
  }
  
  export const EventModel = getModelForClass(Event, {
    schemaOptions: {
      timestamps: true,
    },
  });