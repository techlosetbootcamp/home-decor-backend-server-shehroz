import { MiddlewareFn } from "type-graphql";
import { MyContext, userPayload } from "../types/types";
import jwt from "jsonwebtoken";
import { GraphQLError } from "graphql";

export const isAuthenticated: MiddlewareFn<MyContext> = async (
  { context },
  next
) => {
  const token = context.req.headers?.authorization?.split(" ")[1];

  if (!token) {
    throw new GraphQLError("Authentication token is missing", {
      extensions: { code: "TOKEN_MISSING" },
    });
  }

  try {
    const decoded = jwt.verify(token, process.env?.JWT_SECRET as string) as userPayload;
    context.user = decoded;
  } catch (err) {
    throw new GraphQLError("Token verification error", {
      extensions: { code: "INVALID_TOKEN" },
    });
  }

  return next();
};
