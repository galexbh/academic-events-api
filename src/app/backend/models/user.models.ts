import {prop, getModelForClass} from '@typegoose/typegoose';

export class User {

    @prop({required: true})
    firstname: string;

    @prop({required: true})
    lastname: string;

    @prop({required: true, trim: true, lowercase: true, unique: true})
    email: string;

    @prop({required: true, minlength: 8})
    password: string;
}

const UserModel = getModelForClass(User);
export default UserModel;