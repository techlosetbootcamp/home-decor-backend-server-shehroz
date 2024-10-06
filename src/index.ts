import "reflect-metadata";
import { createYoga } from "graphql-yoga";
import { schema } from "./graphql/schema/schema";
import prisma from "./config/prisma";
import express from "express";
import { createServer } from "http";
import path from "path";
import fs from "fs";

const app = express();

app.get("/", (req, res) => {
  const filePath = path.join(__dirname, "./views/index.html");
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.status(500).send("Error loading the page.");
      return;
    }
    res.setHeader("Content-Type", "text/html");
    res.send(data);
  });
});

const yoga = createYoga({
  schema,
  context: () => ({
    prisma,
  }),
  landingPage: false,
});

app.use("/graphql", yoga);

const PORT = process.env.PORT || 4000;
const server = createServer(app);

server.listen(PORT);
