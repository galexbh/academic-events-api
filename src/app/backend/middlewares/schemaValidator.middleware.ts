import { NextFunction, Response, Request } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { StatusCodes } from 'http-status-codes';

export const schemaValition =
  (schema: AnyZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
          body: req.body,
          params: req.params,
          query: req.query
        });
      return next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res
          .status(StatusCodes.BAD_REQUEST)
          .json(err.issues.map((issues) => ({ message: issues.message })));
      }
      return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "internal server error" });
    }
  };