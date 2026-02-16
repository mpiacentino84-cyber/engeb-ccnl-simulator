import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { getDb } from "../db";
import { files } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";
import { sdk } from "./sdk";
import { storageGet } from "../storage";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);

  // --- Basic security headers (dependency-free) ---
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("Referrer-Policy", "no-referrer");
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    // NOTE: CSP can be too strict for Vite dev; keep minimal.
    next();
  });

  // --- Simple in-memory rate limiter (per IP) ---
  const windowMs = 15 * 60 * 1000;
  const maxReq = 600;
  const buckets = new Map<string, { count: number; resetAt: number }>();
  app.use((req, res, next) => {
    const ip = (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() || req.socket.remoteAddress || "unknown";
    const now = Date.now();
    const bucket = buckets.get(ip);
    if (!bucket || bucket.resetAt < now) {
      buckets.set(ip, { count: 1, resetAt: now + windowMs });
      return next();
    }
    bucket.count += 1;
    if (bucket.count > maxReq) {
      res.status(429).json({ error: "Too many requests" });
      return;
    }
    return next();
  });
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);

  // Local/Forge file download route
  app.get("/api/files/download/:id", async (req, res) => {
    try {
      const id = Number(req.params.id);
      if (!Number.isFinite(id)) {
        res.status(400).json({ error: "Invalid id" });
        return;
      }

      const db = await getDb();
      if (!db) {
        res.status(500).json({ error: "Database not available" });
        return;
      }

      const [f] = await db.select().from(files).where(eq(files.id, id)).limit(1);
      if (!f) {
        res.status(404).json({ error: "File not found" });
        return;
      }

      // auth if needed
      let user: any = null;
      try {
        user = await sdk.authenticateRequest(req as any);
      } catch {
        user = null;
      }

      const isPublic = f.visibility === "public";
      const isStaff = user && (user.role === "admin" || user.role === "consultant");
      const isOwner = user && f.ownerUserId && user.id === f.ownerUserId;

      if (!isPublic && !isOwner && !isStaff) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }

      if (f.provider === "forge") {
        const { url } = await storageGet(f.storageKey);
        res.redirect(url);
        return;
      }

      const filePath = path.resolve(f.storageKey);
      if (!fs.existsSync(filePath)) {
        res.status(404).json({ error: "File missing on disk" });
        return;
      }
      res.setHeader("Content-Type", f.mimeType);
      res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(f.originalName)}"`);
      res.sendFile(filePath);
    } catch (e: any) {
      res.status(500).json({ error: e?.message ?? String(e) });
    }
  });
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
