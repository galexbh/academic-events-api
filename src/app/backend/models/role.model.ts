import { getModelForClass, prop } from "@typegoose/typegoose";

export class Role {
    @prop()
    public name: string;
}

const RolModel = getModelForClass(Role);
export default RolModel;
