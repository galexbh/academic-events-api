import { Request, Response } from "express";
import { CreateUserInput, VerifyUserInput } from "../schemas/user.schema";
import { createUser, findUserById } from "../services/user.services";
import { OK, CREATED, CONFLICT, INTERNAL_SERVER_ERROR, ACCEPTED, NOT_FOUND } from 'http-status';
import sendEmail from "../shared/mailer";

export class UserController {
    public async createUserHandler(req: Request<{}, {}, CreateUserInput>, res: Response) {

        try {
            const user = await createUser(...req.body);

            await sendEmail({
                to: user.email,
                from: "test@example.com",
                subject: "Verify your email",
                text: `verification code: ${user.verificationCode}. Id: ${user._id}`,
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
            return res.status(ACCEPTED).send({ message: "User is already verified" });
        }

        if (user.verificationCode === verificationCode) {
            user.verified = true;

            await user.save();

            return res.status(ACCEPTED).send({ message: "User successfully verified" });
        }

        return res.status(CONFLICT).send({ message: "Could not verify user" });
    }
}