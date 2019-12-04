import { ApolloServer, Config } from "apollo-server-express";
import { typeDefs, resolvers } from "./graphQL/";
import express from "express"
import https from "https"
import http from "http"
import fs from "fs"

const serverConfigurations: { [key: string]: { ssl: boolean, port: number, hostname: string } } = {
  // Note: You may need sudo to run on port 443
  production: { ssl: true, port: 443, hostname: "localhost" },
  development: { ssl: false, port: 3000, hostname: "localhost" }
};

const apolloServerConfig: Config = {
  typeDefs,
  resolvers,
  playground: {
    settings: {
      "editor.theme": "dark"
    },
  }
};

const environment = process.env.NODE_ENV || "development";
const config = serverConfigurations[environment];

const apollo = new ApolloServer(apolloServerConfig);
const app = express();

apollo.applyMiddleware({ app });

// Create the HTTPS or HTTP server, per configuration
var server;
if (config.ssl) {
  server = https.createServer({
    key: fs.readFileSync("./ssl/server.key"),
    cert: fs.readFileSync("./ssl/server.crt")
  },
    app
  );
} else {
  server = http.createServer(app);
}

server.listen({ port: config.port }, () =>
  console.log(
    "🚀 Server ready at",
    `http${config.ssl ? "s" : ""}://${config.hostname}:${config.port}${apollo.graphqlPath}`
  )
);