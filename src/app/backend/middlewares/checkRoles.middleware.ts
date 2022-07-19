import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const roleAdministrator: string[] = ["admin", "contentCreator", "user"];
const roleContentCreator: string[] = ["contentCreator", "user"];

export const checkIsAdmin = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = res.locals.user;

  if (user.roles) {
    for (let i = 0; i < user.roles.length; i++) {
      if (!roleAdministrator.includes(user.roles[i]["name"])) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `Role ${user.roles[i]["name"]} does not exist`,
        });
      }
    }
  }
  return next();
};

export const checkIsContentCreator = (
  _req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = res.locals.user;

  if (user.roles) {
    for (let i = 0; i < user.roles.length; i++) {
      if (!roleContentCreator.includes(user.roles[i]["name"])) {
        return res.status(StatusCodes.BAD_REQUEST).json({
          message: `Role ${user.roles[i]["name"]} does not exist`,
        });
      }
    }
  }
  return next();
};
