import { createApp } from "./app";
import config from "./config";
import prisma from "./db/prisma";

/**
 * Start the Express server
 */
async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log("Database connected successfully");

    // Create Express app
    const app = createApp();

    // Start server
    const server = app.listen(config.server.port, () => {
      console.log("Motion Backend Server Started");
      console.log("=================================");
      console.log(`Environment: ${config.server.nodeEnv}`);
      console.log(`Port: ${config.server.port}`);
      console.log(`Health: http://localhost:${config.server.port}/health`);
      console.log("=================================");
    });

    const keepAliveUrl = config.keepAlive.url;
    if (keepAliveUrl) {
      const ping = async () => {
        try {
          const response = await fetch(keepAliveUrl, { method: "GET" });
          if (!response.ok) {
            console.warn(
              `Keep-alive ping failed: ${response.status} ${response.statusText}`,
            );
          }
        } catch (error) {
          console.warn("Keep-alive ping error:", error);
        }
      };

      ping();
      setInterval(ping, config.keepAlive.intervalMs);
    }

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Starting graceful shutdown...`);

      server.close(async () => {
        console.log("HTTP server closed");

        // Disconnect from database
        await prisma.$disconnect();
        console.log("Database disconnected");

        console.log("Graceful shutdown complete");
        process.exit(0);
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        console.error("Forceful shutdown after timeout");
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));

    // Handle uncaught errors
    process.on("uncaughtException", (error) => {
      console.error("Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

// Start the server
startServer();
