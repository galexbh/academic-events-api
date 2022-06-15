import {prop, getModelForClass} from '@typegoose/typegoose';

export class User {

    @prop({required: true})
    public firstname: string;

    @prop({required: true})
    public lastname: string;

    @prop({required: true, trim: true, lowercase: true, unique: true})
    public email: string;

    @prop({required: true, minlength: 8})
    public password: string;
}

export const UserModel = getModelForClass(User);
