import { prop, getModelForClass, DocumentType, pre, modelOptions, Severity, index, Ref } from '@typegoose/typegoose';
import { Role } from './role.model';
import { nanoid } from 'nanoid';
import argon2 from 'argon2';
import log from '../shared/logger';

export const privateFields = [
    "password",
    "__v",
    "verificationCode",
    "passwordResetCode",
    "verified",
  ];

@pre<User>("save", async function () {
    if (!this.isModified("password")) return;

    const hash = await argon2.hash(this.password);

    this.password = hash;

    return;
})

@index({ email: 1 })

@modelOptions({
    schemaOptions: {
        timestamps: true,
    },
    options: {
        allowMixed: Severity.ALLOW,
    },
})

export class User {

    @prop({ required: true, trim: true, lowercase: true, unique: true })
    public email: string;

    @prop({ required: true })
    public firstName: string;

    @prop({ required: true })
    public lastName: string;

    @prop({ required: true, minlength: 6 })
    public password: string;

    @prop({ ref: () => Role })
    public roles: Ref<Role>[];

    @prop({ required: true, default: () => nanoid() })
    verificationCode: string;

    @prop()
    passwordResetCode: string | null;

    @prop({ default: false })
    verified: boolean;

    async validatePassword(this: DocumentType<User>, candidatePassword: string) {
        try {
            return await argon2.verify(this.password, candidatePassword);
        } catch (e: any) {
            log.error(e, "Could not validate password");
            return false;
        }
    }
}

const UserModel = getModelForClass(User);

export default UserModel;
