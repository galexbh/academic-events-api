import { Request, Response } from "express";
import { CreateUserInput, VerifyUserInput } from "../schemas/user.schema";
import { createUser, findUserById } from "../services/user.services";
import { CREATED, CONFLICT, INTERNAL_SERVER_ERROR, ACCEPTED, NOT_FOUND, BAD_REQUEST } from 'http-status';
import sendEmail from "../shared/mailer";

export class UserController {
    public async createUserHandler(req: Request<{}, {}, CreateUserInput>, res: Response) {

        const body = req.body;

        try {
            const user = await createUser(body);

            await sendEmail({
                to: user.email,
                from: "test@example.com",
                subject: "Verify your email",
                html: `
                <form id="form" target="_self" method="POST" action="http://localhost:3000/api/v1/users/verify/${user._id}/${user.verificationCode}">
                <button> Verificar </button>
                </form>`,
            });

            return res.status(CREATED).send({ message: "User successfully created" });
        } catch (e: any) {
            if (e.code === 11000) {
                return res.status(CONFLICT).send({ message: "Account already exists" });
            }

            return res.status(INTERNAL_SERVER_ERROR).send({ message: e })
        }
    }

    public async verifyUserHandler(
        req: Request<VerifyUserInput>, res: Response) {

        const { id, verificationCode } = req.params

        const user = await findUserById(id);

        if (!user) {
            return res.status(NOT_FOUND).send({ message: "User not found" });
        }

        if (user.verified) {
            return res.status(BAD_REQUEST).send({ message: "User is already verified" });
        }

        if (user.verificationCode === verificationCode) {
            user.verified = true;

            await user.save();

            return res.status(ACCEPTED).send({ message: "User successfully verified" });
        }

        return res.status(CONFLICT).send({ message: "Could not verify user" });
    }
}