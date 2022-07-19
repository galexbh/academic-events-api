import { Request, Response, NextFunction } from "express";
import { StatusCodes } from "http-status-codes";

const verifyUser = (_req: Request, res: Response, next: NextFunction) => {
  const user = res.locals.user;

  if (!user) {
    return res
      .sendStatus(StatusCodes.FORBIDDEN)
      .json({ message: "restricted" });
  }

  return next();
};

export default verifyUser;
