import { Request, Response, NextFunction } from "express";
import { FORBIDDEN } from "http-status";

const requireUser = (_req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (!user) {
        return res.sendStatus(FORBIDDEN).json({ message: "restricted" });
    }

    return next();
};

export default requireUser;