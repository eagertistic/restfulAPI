import Fastify from "fastify";
import JWT_Auth from "./plugins/JWT_Auth.js";
import PostOwner_Auth from "./plugins/PostOwner_Auth.js";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import dotenv from "dotenv";
import Helmet from "@fastify/helmet";
import userRoutes from "./routes/user.routes.js";
import blogRoutes from "./routes/blogpost.routes.js";
import mongoose from "mongoose";

dotenv.config();

const envToLogger = {
  development: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
  production: true,
  test: false,
};

const fastify = Fastify({
  logger: envToLogger["development"],
});
fastify.register(cors, {
  origin: "http://localhost:5000",
  methods: ["GET", "POST", "PUT", "DELETE"],
});
await fastify.register(Helmet, {
  contentSecurityPolicy: {
    directives: {
      defaultSrc: [`'self'`, "unpkg.com"],
      styleSrc: [
        `'self'`,
        `'unsafe-inline'`,
        "cdn.jsdelivr.net",
        "fonts.googleapis.com",
        "unpkg.com",
      ],
      fontSrc: [`'self'`, "fonts.gstatic.com", "data:"],
      imgSrc: [`'self'`, "data:", "cdn.jsdelivr.net"],
      scriptSrc: [
        `'self'`,
        `https: 'unsafe-inline'`,
        `cdn.jsdelivr.net`,
        `'unsafe-eval'`,
      ],
    },
  },
});
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: "1 minute",
});
fastify.register(JWT_Auth);
fastify.register(PostOwner_Auth);
fastify.register(userRoutes, { prefix: "api/v1/users" });
fastify.register(blogRoutes, { prefix: "api/v1/blogs" });
/**
 * Run the server with Fastify after establishing Mongoose connection!
 */

// Graceful shutdown listeners
const shutdownListeners = ["SIGINT", "SIGTERM"];
shutdownListeners.forEach((signal) => {
  process.on(signal, async () => {
    try {
      fastify.log.info(`Received ${signal}. Closing server...`);
      await fastify.close(); // Close Fastify server
      await mongoose.connection.close(); // Close MongoDB connection
      fastify.log.info("Server and database connections closed successfully");
      process.exit(0);
    } catch (error) {
      fastify.log.error(`Error during shutdown: ${error.message}`);
      process.exit(1); // Exit with failure
    }
  });
});

fastify.get("/api/v1", async (request, reply) => {
  return { message: "Welcome to the homepage!" };
});

const start = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL);
    fastify.log.info("Mongoose connected to MongoDB");

    await fastify.listen({ port: 5000 });
    fastify.log.info(
      `Server is now listening on ${fastify.server.address().port}`
    );
  } catch (error) {
    fastify.log.error(error);
    process.exit(1);
  }
};

start();
