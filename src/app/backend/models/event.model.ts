import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { Category } from "./category.model";
import { User } from "./user.model";

export class Event {
  @prop({ required: true })
  public title: string;

  @prop({ required: true })
  public description: string;

  @prop({ enum: ["virtual", "presencial"] })
  public modality: string;

  @prop({ enum: ["publico", "privado"] })
  public type: string;

  @prop({ required: true, autopopulate: true, ref: () => Category })
  public category: Ref<Category>;

  //@prop({ required: true })
  //public category: string;

  @prop({ required: true, ref: () => User })
  public owner: Ref<User>;

  @prop({ ref: () => User })
  public subscribers: Ref<User>[];

  @prop({ required: true })
  public speaker: string;

  @prop({ default: 0 })
  public limitParticipants: number;

  @prop({ required: true })
  public startDate: string;

  @prop({ required: true })
  public endDate: string;
}

export const EventModel = getModelForClass(Event, {
  schemaOptions: {
    timestamps: true,
  },
});
