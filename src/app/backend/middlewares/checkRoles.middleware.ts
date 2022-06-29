import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const roleAdministrator: string[] = ["admin"];
const roleContentCreator: string[] = ["contentCreator"];

export const checkIsAdmin = (_req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (user.roles) {
        for (let i = 0; i < user.roles.length; i++) {
            if (!roleAdministrator.includes(user.roles[i])) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Role ${user.roles[i]} does not exist`,
                });
            }
        }
    }
    return next();
};

export const checkIsContentCreator = (_req: Request, res: Response, next: NextFunction) => {
    const user = res.locals.user;

    if (user.roles) {
        for (let i = 0; i < user.roles.length; i++) {
            if (!roleContentCreator.includes(user.roles[i])) {
                return res.status(StatusCodes.BAD_REQUEST).json({
                    message: `Role ${user.roles[i]} does not exist`,
                });
            }
        }
    }
    return next();
};

