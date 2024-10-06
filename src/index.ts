import "reflect-metadata";
import { createYoga } from "graphql-yoga";
import { schema } from "./graphql/schema/schema";
import prisma from "./config/prisma";
import { createServer } from "http";

const yoga = createYoga({
  schema,
  context: () => ({
    prisma,
  }),
});

const server = createServer(yoga);

const PORT = process.env.PORT;

server.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
});
