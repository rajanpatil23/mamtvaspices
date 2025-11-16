import express from "express";
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";
import { PrismaClient } from "@prisma/client";
import { combinedSchemas } from "./v1/schema";
import http from "http";

const prisma = new PrismaClient();

export async function configureGraphQL(app: express.Application) {
  // For Apollo Server v5, we'll use a simpler approach that works with compiled JS
  // Create Apollo Server instance
  const apolloServer = new ApolloServer({
    schema: combinedSchemas,
    introspection: process.env.NODE_ENV !== "production",
  });

  await apolloServer.start();

  // Manual middleware setup for Express integration
  app.post("/api/v1/graphql", express.json(), async (req, res) => {
    try {
      const { query, variables, operationName } = req.body;
      
      const result = await apolloServer.executeOperation(
        {
          query,
          variables,
          operationName,
        },
        {
          contextValue: {
            req,
            res,
            prisma,
            user: (req as any).user,
          },
        }
      );

      if (result.body.kind === "single") {
        res.json(result.body.singleResult);
      } else {
        res.status(400).json({ errors: [{ message: "Incremental delivery not supported" }] });
      }
    } catch (error) {
      console.error("GraphQL execution error:", error);
      res.status(500).json({ errors: [{ message: "Internal server error" }] });
    }
  });

  // GraphQL playground/introspection endpoint (GET)
  app.get("/api/v1/graphql", (req, res) => {
    res.json({
      message: "GraphQL endpoint is running. Use POST requests to execute queries.",
      endpoint: "/api/v1/graphql",
    });
  });

  console.log("✅ GraphQL configured at /api/v1/graphql");
}
