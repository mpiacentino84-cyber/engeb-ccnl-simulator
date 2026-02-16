import { z } from "zod";
import { and, asc, desc, eq, like, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  consultantProcedure,
  protectedProcedure,
  publicProcedure,
  router,
} from "../_core/trpc";
import { getDb } from "../db";
import {
  files,
  serviceDocuments,
  serviceRequestEvents,
  serviceRequestFiles,
  serviceRequests,
  services,
} from "../../drizzle/schema";

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

const statusEnum = z.enum(["draft", "published", "archived"]);
const requestStatusEnum = z.enum([
  "draft",
  "submitted",
  "in_review",
  "needs_info",
  "approved",
  "rejected",
  "closed",
]);

export const servicesRouter = router({
  list: publicProcedure
    .input(
      z
        .object({
          search: z.string().trim().min(1).optional(),
          category: z.string().trim().min(1).optional(),
          status: statusEnum.optional(),
          limit: z.number().min(1).max(100).default(50),
        })
        .default({ limit: 50 })
    )
    .query(async ({ input, ctx }) => {
      const db = await ensureDb();
      const status = ctx.user?.role === "admin" ? input.status : "published";

      const conditions: any[] = [];
      if (status) conditions.push(eq(services.status, status));
      if (input.category) conditions.push(eq(services.category, input.category));
      if (input.search) {
        const q = `%${input.search}%`;
        conditions.push(or(like(services.name, q), like(services.description, q), like(services.procedure, q)));
      }

      return db
        .select()
        .from(services)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(services.updatedAt))
        .limit(input.limit);
    }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await ensureDb();
      const [s] = await db.select().from(services).where(eq(services.id, input.id)).limit(1);
      if (!s) throw new TRPCError({ code: "NOT_FOUND", message: "Servizio non trovato" });
      if (s.status !== "published" && ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Contenuto non pubblicato" });
      }

      const docs = await db
        .select({
          id: serviceDocuments.id,
          title: serviceDocuments.title,
          fileId: serviceDocuments.fileId,
          isRequired: serviceDocuments.isRequired,
          createdAt: serviceDocuments.createdAt,
          fileName: files.originalName,
          mimeType: files.mimeType,
        })
        .from(serviceDocuments)
        .innerJoin(files, eq(files.id, serviceDocuments.fileId))
        .where(eq(serviceDocuments.serviceId, input.id))
        .orderBy(asc(serviceDocuments.id));

      return { ...s, documents: docs };
    }),

  // ADMIN/CONSULTANT
  upsert: consultantProcedure
    .input(
      z.object({
        id: z.number().optional(),
        name: z.string().trim().min(3).max(300),
        category: z.string().trim().min(2).max(120),
        description: z.string().trim().max(10_000).optional().nullable(),
        eligibility: z.string().trim().max(30_000).optional().nullable(),
        procedure: z.string().trim().max(50_000).optional().nullable(),
        slaDays: z.number().min(0).max(3650).optional().nullable(),
        status: statusEnum.optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      const status = input.status ?? "draft";
      let id = input.id;
      if (!id) {
        const res = await db.insert(services).values({
          name: input.name,
          category: input.category,
          description: input.description ?? null,
          eligibility: input.eligibility ?? null,
          procedure: input.procedure ?? null,
          slaDays: input.slaDays ?? null,
          status,
          createdBy: ctx.user.id,
        });
        id = (res as any)[0]?.insertId ?? (res as any).insertId;
      } else {
        await db
          .update(services)
          .set({
            name: input.name,
            category: input.category,
            description: input.description ?? null,
            eligibility: input.eligibility ?? null,
            procedure: input.procedure ?? null,
            slaDays: input.slaDays ?? null,
            status,
            updatedAt: new Date(),
          })
          .where(eq(services.id, id));
      }
      return { id };
    }),

  addDocument: consultantProcedure
    .input(
      z.object({
        serviceId: z.number(),
        title: z.string().trim().min(2).max(300),
        fileId: z.number(),
        isRequired: z.boolean().default(false),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDb();
      await db.insert(serviceDocuments).values({
        serviceId: input.serviceId,
        title: input.title,
        fileId: input.fileId,
        isRequired: input.isRequired ? 1 : 0,
      });
      return { success: true };
    }),

  // REQUEST FLOW (USER)
  requestCreateDraft: protectedProcedure
    .input(
      z.object({
        serviceId: z.number(),
        subject: z.string().trim().min(3).max(300),
        notes: z.string().trim().max(20_000).optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();

      const [s] = await db.select().from(services).where(eq(services.id, input.serviceId)).limit(1);
      if (!s) throw new TRPCError({ code: "NOT_FOUND", message: "Servizio non trovato" });
      if (s.status !== "published") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Servizio non disponibile" });
      }

      const res = await db.insert(serviceRequests).values({
        serviceId: input.serviceId,
        requesterUserId: ctx.user.id,
        subject: input.subject,
        notes: input.notes ?? null,
        status: "draft",
      });
      const id = (res as any)[0]?.insertId ?? (res as any).insertId;
      await db.insert(serviceRequestEvents).values({
        requestId: id,
        fromStatus: null,
        toStatus: "draft",
        note: "Bozza creata",
        createdBy: ctx.user.id,
      });
      return { id };
    }),

  requestAddFile: protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
        fileId: z.number(),
        label: z.string().trim().max(300).optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();

      const [req] = await db
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.id, input.requestId))
        .limit(1);

      if (!req) throw new TRPCError({ code: "NOT_FOUND", message: "Richiesta non trovata" });
      if (req.requesterUserId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Non autorizzato" });
      }
      if (req.status === "approved" || req.status === "rejected" || req.status === "closed") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Richiesta chiusa" });
      }

      await db.insert(serviceRequestFiles).values({
        requestId: input.requestId,
        fileId: input.fileId,
        label: input.label ?? null,
      });

      return { success: true };
    }),

  requestSubmit: protectedProcedure
    .input(z.object({ requestId: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      const [req] = await db
        .select()
        .from(serviceRequests)
        .where(eq(serviceRequests.id, input.requestId))
        .limit(1);
      if (!req) throw new TRPCError({ code: "NOT_FOUND", message: "Richiesta non trovata" });
      if (req.requesterUserId !== ctx.user.id) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Non autorizzato" });
      }
      if (req.status !== "draft" && req.status !== "needs_info") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Stato non valido" });
      }

      const from = req.status;
      await db
        .update(serviceRequests)
        .set({ status: "submitted", updatedAt: new Date() })
        .where(eq(serviceRequests.id, input.requestId));
      await db.insert(serviceRequestEvents).values({
        requestId: input.requestId,
        fromStatus: from,
        toStatus: "submitted",
        note: "Richiesta inviata",
        createdBy: ctx.user.id,
      });
      return { success: true };
    }),

  myRequests: protectedProcedure
    .input(
      z
        .object({
          status: requestStatusEnum.optional(),
          limit: z.number().min(1).max(100).default(50),
        })
        .default({ limit: 50 })
    )
    .query(async ({ input, ctx }) => {
      const db = await ensureDb();
      const conditions: any[] = [eq(serviceRequests.requesterUserId, ctx.user.id)];
      if (input.status) conditions.push(eq(serviceRequests.status, input.status));
      return db
        .select({
          id: serviceRequests.id,
          status: serviceRequests.status,
          subject: serviceRequests.subject,
          createdAt: serviceRequests.createdAt,
          updatedAt: serviceRequests.updatedAt,
          serviceName: services.name,
          serviceCategory: services.category,
        })
        .from(serviceRequests)
        .innerJoin(services, eq(services.id, serviceRequests.serviceId))
        .where(and(...conditions))
        .orderBy(desc(serviceRequests.updatedAt))
        .limit(input.limit);
    }),

  requestGet: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await ensureDb();
      const [req] = await db
        .select({
          id: serviceRequests.id,
          serviceId: serviceRequests.serviceId,
          requesterUserId: serviceRequests.requesterUserId,
          subject: serviceRequests.subject,
          notes: serviceRequests.notes,
          status: serviceRequests.status,
          createdAt: serviceRequests.createdAt,
          updatedAt: serviceRequests.updatedAt,
          serviceName: services.name,
          serviceCategory: services.category,
        })
        .from(serviceRequests)
        .innerJoin(services, eq(services.id, serviceRequests.serviceId))
        .where(eq(serviceRequests.id, input.id))
        .limit(1);

      if (!req) throw new TRPCError({ code: "NOT_FOUND", message: "Richiesta non trovata" });
      const isOwner = req.requesterUserId === ctx.user.id;
      const isStaff = ctx.user.role === "consultant" || ctx.user.role === "admin";
      if (!isOwner && !isStaff) throw new TRPCError({ code: "FORBIDDEN", message: "Non autorizzato" });

      const reqFiles = await db
        .select({
          id: serviceRequestFiles.id,
          fileId: serviceRequestFiles.fileId,
          label: serviceRequestFiles.label,
          createdAt: serviceRequestFiles.createdAt,
          fileName: files.originalName,
          mimeType: files.mimeType,
          sizeBytes: files.sizeBytes,
        })
        .from(serviceRequestFiles)
        .innerJoin(files, eq(files.id, serviceRequestFiles.fileId))
        .where(eq(serviceRequestFiles.requestId, input.id))
        .orderBy(desc(serviceRequestFiles.createdAt));

      const events = await db
        .select({
          id: serviceRequestEvents.id,
          fromStatus: serviceRequestEvents.fromStatus,
          toStatus: serviceRequestEvents.toStatus,
          note: serviceRequestEvents.note,
          createdAt: serviceRequestEvents.createdAt,
        })
        .from(serviceRequestEvents)
        .where(eq(serviceRequestEvents.requestId, input.id))
        .orderBy(desc(serviceRequestEvents.createdAt));

      return { ...req, files: reqFiles, events };
    }),

  // STAFF
  adminRequests: consultantProcedure
    .input(
      z
        .object({
          status: requestStatusEnum.optional(),
          search: z.string().trim().min(1).optional(),
          limit: z.number().min(1).max(200).default(100),
          offset: z.number().min(0).max(10_000).default(0),
        })
        .default({ limit: 100, offset: 0 })
    )
    .query(async ({ input }) => {
      const db = await ensureDb();
      const conditions: any[] = [];
      if (input.status) conditions.push(eq(serviceRequests.status, input.status));
      if (input.search) {
        const q = `%${input.search}%`;
        conditions.push(or(like(serviceRequests.subject, q), like(services.name, q)));
      }
      const whereClause = conditions.length ? and(...conditions) : undefined;

      const rows = await db
        .select({
          id: serviceRequests.id,
          status: serviceRequests.status,
          subject: serviceRequests.subject,
          createdAt: serviceRequests.createdAt,
          updatedAt: serviceRequests.updatedAt,
          serviceName: services.name,
          serviceCategory: services.category,
          requesterUserId: serviceRequests.requesterUserId,
        })
        .from(serviceRequests)
        .innerJoin(services, eq(services.id, serviceRequests.serviceId))
        .where(whereClause)
        .orderBy(desc(serviceRequests.updatedAt))
        .limit(input.limit)
        .offset(input.offset);

      const totalRows = await db
        .select({ count: sql<number>`count(*)` })
        .from(serviceRequests)
        .innerJoin(services, eq(services.id, serviceRequests.serviceId))
        .where(whereClause);

      return { items: rows, total: totalRows?.[0]?.count ?? 0 };
    }),

  updateRequestStatus: consultantProcedure
    .input(
      z.object({
        requestId: z.number(),
        toStatus: requestStatusEnum,
        note: z.string().trim().max(10_000).optional().nullable(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      const [req] = await db
        .select({ status: serviceRequests.status })
        .from(serviceRequests)
        .where(eq(serviceRequests.id, input.requestId))
        .limit(1);
      if (!req) throw new TRPCError({ code: "NOT_FOUND", message: "Richiesta non trovata" });

      const from = req.status;
      await db
        .update(serviceRequests)
        .set({ status: input.toStatus, updatedAt: new Date() })
        .where(eq(serviceRequests.id, input.requestId));
      await db.insert(serviceRequestEvents).values({
        requestId: input.requestId,
        fromStatus: from,
        toStatus: input.toStatus,
        note: input.note ?? null,
        createdBy: ctx.user.id,
      });
      return { success: true };
    }),
});
