import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { files } from "../../drizzle/schema";
import { storageGet, storagePut } from "../storage";
import { ENV } from "../_core/env";
import { eq } from "drizzle-orm";
import fs from "fs";
import path from "path";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB

const allowedMime = new Set<string>([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/plain",
]);

async function ensureDb() {
  const db = await getDb();
  if (!db) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Database not available",
    });
  }
  return db;
}

export const filesRouter = router({
  uploadBase64: protectedProcedure
    .input(
      z.object({
        fileName: z.string().trim().min(1).max(255),
        mimeType: z.string().trim().min(3).max(120),
        base64: z.string().trim().min(16),
        purpose: z.enum(["service_request", "service_doc", "generic"]).default("generic"),
        visibility: z.enum(["private", "org", "public"]).default("private"),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (!allowedMime.has(input.mimeType)) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Tipo file non consentito",
        });
      }

      const buf = Buffer.from(input.base64, "base64");
      if (buf.byteLength > MAX_UPLOAD_BYTES) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: `File troppo grande (max ${Math.round(MAX_UPLOAD_BYTES / 1024 / 1024)}MB)`
        });
      }

      const db = await ensureDb();
      const safeName = sanitizeFileName(input.fileName);
      const key = `uploads/${ctx.user.id}/${Date.now()}_${safeName}`;

      let provider: "local" | "forge" = "local";
      let storageKey = key;

      // Prefer Forge storage if configured.
      if (ENV.forgeApiKey && ENV.forgeApiUrl) {
        provider = "forge";
        const put = await storagePut(key, buf, input.mimeType);
        storageKey = put.key;
      } else {
        provider = "local";
        const uploadsDir = path.resolve(process.cwd(), "uploads", String(ctx.user.id));
        fs.mkdirSync(uploadsDir, { recursive: true });
        const outPath = path.resolve(uploadsDir, `${Date.now()}_${safeName}`);
        fs.writeFileSync(outPath, buf);
        storageKey = outPath;
      }

      const res = await db.insert(files).values({
        ownerUserId: ctx.user.id,
        originalName: safeName,
        mimeType: input.mimeType,
        sizeBytes: buf.byteLength,
        provider,
        storageKey,
        purpose: input.purpose,
        visibility: input.visibility,
      });
      const id = (res as any)[0]?.insertId ?? (res as any).insertId;
      return { id };
    }),

  // Returns a URL for forge provider; for local returns a server download route.
  getDownloadUrl: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      const db = await ensureDb();
      const [f] = await db.select().from(files).where(eq(files.id, input.id)).limit(1);
      if (!f) throw new TRPCError({ code: "NOT_FOUND", message: "File non trovato" });

      if (f.provider === "forge") {
        const { url } = await storageGet(f.storageKey);
        return { url, fileName: f.originalName, mimeType: f.mimeType };
      }

      // Local provider
      return {
        url: `/api/files/download/${f.id}`,
        fileName: f.originalName,
        mimeType: f.mimeType,
      };
    }),
});

function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9._ -]/g, "_")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 120);
}
