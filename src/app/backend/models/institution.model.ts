import { getModelForClass, prop } from "@typegoose/typegoose";

export class Institution {
  @prop()
  public name: string;

  @prop({ type: () => [String] })
  public domain: string[];
}

export const InstitutionModel = getModelForClass(Institution);
