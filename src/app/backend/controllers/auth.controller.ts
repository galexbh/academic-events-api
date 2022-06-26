import { Request, Response } from "express";
import { get } from "lodash";
import { CreateSessionInput } from "../schemas/auth.schema";
import {
    findSessionById,
    signAccessToken,
    signRefreshToken,
} from "../services/auth.services";
import { findUserByEmail, findUserById } from "../services/user.services";
import { verifyJwt } from "../shared/jwt";
import { BAD_REQUEST, UNAUTHORIZED, OK } from 'http-status';

export class AuthController {
    public async createSessionHandler(
        req: Request<{}, {}, CreateSessionInput>,
        res: Response
    ) {
        const { email, password } = req.body;
        const message = "Invalid email or password";

        const user = await findUserByEmail(email);

        if (!user) {
            return res.status(BAD_REQUEST).json({ message: message });
        }

        if (!user.verified) {
            return res.status(UNAUTHORIZED).json({ message: "Please verify your email" });
        }

        const isValid = await user.validatePassword(password);

        if (!isValid) {
            return res.status(BAD_REQUEST).json({ message: message });
        }

        const accessToken = signAccessToken(user);

        const refreshToken = await signRefreshToken({ userId: user._id });

        return res.status(OK).json({
            accessToken,
            refreshToken,
        });
    }

    public async refreshAccessTokenHandler(req: Request, res: Response) {
        const refreshToken = get(req, "headers.x-refresh");

        const message = "Could not refresh access token";

        const decoded = verifyJwt<{ session: string }>(
            refreshToken,
            "refreshTokenPublicKey"
        );

        if (!decoded) {
            return res.status(UNAUTHORIZED).json({ message: message });
        }

        const session = await findSessionById(decoded.session);

        if (!session || !session.valid) {
            return res.status(UNAUTHORIZED).json({ message: message });
        }

        const user = await findUserById(String(session.user));

        if (!user) {
            return res.status(UNAUTHORIZED).json({ message: message });
        }

        const accessToken = signAccessToken(user);

        return res.status(OK).json({ accessToken });
    }
}

