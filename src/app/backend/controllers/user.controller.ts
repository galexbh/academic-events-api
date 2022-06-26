import { Request, Response } from 'express';
import { CreateUserInput, ForgotPasswordInput, ResetPasswordInput, VerifyUserInput } from '../schemas/user.schema';
import { createUser, findUserByEmail, findUserById } from '../services/user.services';
import { CREATED, CONFLICT, INTERNAL_SERVER_ERROR, ACCEPTED, NOT_FOUND, BAD_REQUEST, REQUEST_TIMEOUT } from 'http-status';
import { nanoid } from 'nanoid';
import sendEmail from '../shared/mailer';
import log from '../shared/logger';

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

            return res.status(CREATED).json({ message: "User successfully created" });
        } catch (e: any) {
            if (e.code === 11000) {
                return res.status(CONFLICT).json({ message: "Account already exists" });
            }

            return res.status(INTERNAL_SERVER_ERROR).json({ message: "The server encountered an unexpected condition that prevented it from fulfilling the request" })
        }
    }

    public async verifyUserHandler(
        req: Request<VerifyUserInput>, res: Response) {

        const { id, verificationCode } = req.params

        const user = await findUserById(id);

        if (!user) {
            return res.status(NOT_FOUND).json({ message: "User not found" });
        }

        if (user.verified) {
            return res.status(BAD_REQUEST).json({ message: "User is already verified" });
        }

        if (user.verificationCode === verificationCode) {
            user.verified = true;

            try {

                await user.save();
    
                return res.status(ACCEPTED).json({ message: "Successfully updated password" });
    
            } catch (e: any) {
    
                return res.status(REQUEST_TIMEOUT).json({ message: "The server did not receive a complete request message within the time that it was prepared to wait" });
            }
        }

        return res.status(CONFLICT).json({ message: "Could not verify user" });
    }

    public async forgotPasswordHandler(
        req: Request<{}, {}, ForgotPasswordInput>, res: Response) {
        const message =
            "If a user with that email is registered you will receive a password reset email";

        const { email } = req.body;

        const user = await findUserByEmail(email);

        if (!user) {
            log.debug(`User with email ${email} does not exists`);
            return res.status(NOT_FOUND).json({ message: message });
        }

        if (!user.verified) {
            return res.status(BAD_REQUEST).json({ message: "User is not verified" });
        }

        const passwordResetCode = nanoid();

        user.passwordResetCode = passwordResetCode;

        await user.save();

        await sendEmail({
            to: user.email,
            from: "test@example.com",
            subject: "Reset your password",
            text: `Password reset code: ${passwordResetCode}. Id ${user._id}`,
        });

        log.debug(`Password reset email sent to ${email}`);

        return res.status(ACCEPTED).json({ message: message });
    }

    public async resetPasswordHandler(
        req: Request<ResetPasswordInput["params"], {}, ResetPasswordInput["body"]>,
        res: Response
    ) {
        const { id, passwordResetCode } = req.params;

        const { password } = req.body;

        const user = await findUserById(id);

        if (
            !user ||
            !user.passwordResetCode ||
            user.passwordResetCode !== passwordResetCode
        ) {
            return res.status(BAD_REQUEST).json({ message: "Could not reset user password" });
        }

        user.passwordResetCode = null;

        user.password = password;

        try {

            await user.save();

            return res.status(ACCEPTED).json({ message: "Successfully updated password" });

        } catch (e: any) {

            return res.status(REQUEST_TIMEOUT).json({ message: "The server did not receive a complete request message within the time that it was prepared to wait" });
        }

    }

    public getCurrentUserHandler(_req: Request, res: Response) {
        return res.json(res.locals.user);
    }
}
