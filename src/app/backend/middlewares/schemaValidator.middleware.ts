import { NextFunction, Response, Request } from 'express';
import { AnyZodObject, ZodError } from 'zod';
import { BAD_REQUEST, INTERNAL_SERVER_ERROR } from 'http-status';

export const schemaValition =
  (schema: AnyZodObject) =>
  // @ts-ignore
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
          body: req.body,
          params: req.params,
          query: req.query
        });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res
          .status(BAD_REQUEST)
          .json(err.issues.map((issues) => ({ message: issues.message })));
      }
      return res.status(INTERNAL_SERVER_ERROR).json({ message: "internal server error" });
    }
  };