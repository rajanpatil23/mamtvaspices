import { PrismaClient } from "@prisma/client";

export type GraphQLContext = {
  prisma: PrismaClient;
  req: Request;
  res: Response;
  user?: any;
};
