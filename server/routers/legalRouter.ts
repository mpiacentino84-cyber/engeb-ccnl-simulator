import { z } from "zod";
import { and, desc, eq, like, or, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { adminProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  legalSourceTags,
  legalSourceVersions,
  legalSources,
  legalTags,
} from "../../drizzle/schema";

const typeEnum = z.enum([
  "law",
  "decree",
  "legislative_decree",
  "circular",
  "practice",
  "jurisprudence",
  "contract",
  "other",
]);

const statusEnum = z.enum(["draft", "published", "archived"]);

const listInput = z
  .object({
    search: z.string().trim().min(1).optional(),
    type: typeEnum.optional(),
    status: statusEnum.optional(),
    tag: z.string().trim().min(1).optional(),
    year: z.string().trim().min(4).max(4).optional(),
    issuingBody: z.string().trim().min(2).optional(),
    limit: z.number().min(1).max(100).default(50),
    offset: z.number().min(0).max(10_000).default(0),
  })
  .default({ limit: 50, offset: 0 });

const upsertInput = z.object({
  id: z.number().optional(),
  type: typeEnum,
  title: z.string().trim().min(3).max(600),
  issuingBody: z.string().trim().max(255).optional().nullable(),
  officialUrl: z.string().trim().max(1200).optional().nullable(),
  publishedAt: z.string().trim().max(32).optional().nullable(),
  effectiveFrom: z.string().trim().max(32).optional().nullable(),
  effectiveTo: z.string().trim().max(32).optional().nullable(),
  status: statusEnum.optional(),
  summary: z.string().trim().max(10_000).optional().nullable(),
  body: z.string().trim().max(200_000).optional().nullable(),
  tags: z.array(z.string().trim().min(1).max(80)).max(20).default([]),
  versionNote: z.string().trim().max(10_000).optional().nullable(),
});

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

export const legalRouter = router({
  list: publicProcedure.input(listInput).query(async ({ input, ctx }) => {
    const db = await ensureDb();

    // Public users see only published.
    const effectiveStatus = ctx.user?.role === "admin" ? input.status : "published";

    const conditions: any[] = [];
    if (effectiveStatus) conditions.push(eq(legalSources.status, effectiveStatus));
    if (input.type) conditions.push(eq(legalSources.type, input.type));
    if (input.issuingBody) conditions.push(like(legalSources.issuingBody, `%${input.issuingBody}%`));
    if (input.year) conditions.push(like(legalSources.publishedAt, `${input.year}%`));

    if (input.search) {
      const q = `%${input.search}%`;
      conditions.push(
        or(
          like(legalSources.title, q),
          like(legalSources.summary, q),
          like(legalSources.body, q),
          like(legalSources.issuingBody, q)
        )
      );
    }

    // tag filter via subquery
    if (input.tag) {
      const tagName = input.tag;
      conditions.push(
        sql`EXISTS (
          SELECT 1 FROM ${legalSourceTags}
          JOIN ${legalTags} ON ${legalTags.id} = ${legalSourceTags.tagId}
          WHERE ${legalSourceTags.sourceId} = ${legalSources.id}
            AND ${legalTags.name} = ${tagName}
        )`
      );
    }

    const whereClause = conditions.length ? and(...conditions) : undefined;

    const items = await db
      .select({
        id: legalSources.id,
        type: legalSources.type,
        title: legalSources.title,
        issuingBody: legalSources.issuingBody,
        officialUrl: legalSources.officialUrl,
        publishedAt: legalSources.publishedAt,
        effectiveFrom: legalSources.effectiveFrom,
        effectiveTo: legalSources.effectiveTo,
        status: legalSources.status,
        summary: legalSources.summary,
        updatedAt: legalSources.updatedAt,
        lastReviewedAt: legalSources.lastReviewedAt,
      })
      .from(legalSources)
      .where(whereClause)
      .orderBy(desc(legalSources.updatedAt))
      .limit(input.limit)
      .offset(input.offset);

    return items;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await ensureDb();

      const [src] = await db
        .select()
        .from(legalSources)
        .where(eq(legalSources.id, input.id))
        .limit(1);

      if (!src) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Fonte non trovata" });
      }

      if (src.status !== "published" && ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Contenuto non pubblicato" });
      }

      const tags = await db
        .select({ name: legalTags.name })
        .from(legalSourceTags)
        .innerJoin(legalTags, eq(legalTags.id, legalSourceTags.tagId))
        .where(eq(legalSourceTags.sourceId, input.id));

      const versions = await db
        .select({
          id: legalSourceVersions.id,
          version: legalSourceVersions.version,
          changeNote: legalSourceVersions.changeNote,
          createdAt: legalSourceVersions.createdAt,
        })
        .from(legalSourceVersions)
        .where(eq(legalSourceVersions.sourceId, input.id))
        .orderBy(desc(legalSourceVersions.createdAt));

      return {
        ...src,
        tags: tags.map(t => t.name),
        versions,
      };
    }),

  // Admin
  upsert: adminProcedure.input(upsertInput).mutation(async ({ input, ctx }) => {
    const db = await ensureDb();

    const normalizedStatus = input.status ?? "draft";

    let id = input.id;
    if (!id) {
      const result = await db
        .insert(legalSources)
        .values({
          type: input.type,
          title: input.title,
          issuingBody: input.issuingBody ?? null,
          officialUrl: input.officialUrl ?? null,
          publishedAt: input.publishedAt ?? null,
          effectiveFrom: input.effectiveFrom ?? null,
          effectiveTo: input.effectiveTo ?? null,
          status: normalizedStatus,
          summary: input.summary ?? null,
          body: input.body ?? null,
          createdBy: ctx.user.id,
          lastReviewedAt: normalizedStatus === "published" ? new Date() : null,
        });
      // drizzle/mysql2 returns insertId
      id = (result as any)[0]?.insertId ?? (result as any).insertId;
    } else {
      await db
        .update(legalSources)
        .set({
          type: input.type,
          title: input.title,
          issuingBody: input.issuingBody ?? null,
          officialUrl: input.officialUrl ?? null,
          publishedAt: input.publishedAt ?? null,
          effectiveFrom: input.effectiveFrom ?? null,
          effectiveTo: input.effectiveTo ?? null,
          status: normalizedStatus,
          summary: input.summary ?? null,
          body: input.body ?? null,
          lastReviewedAt: normalizedStatus === "published" ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(eq(legalSources.id, id));
    }

    // Upsert tags (simple): ensure tags exist; delete existing links then insert.
    await db.delete(legalSourceTags).where(eq(legalSourceTags.sourceId, id));
    const tagIds: number[] = [];
    for (const name of input.tags) {
      const normalized = name.trim();
      if (!normalized) continue;
      const existing = await db
        .select({ id: legalTags.id })
        .from(legalTags)
        .where(eq(legalTags.name, normalized))
        .limit(1);
      let tagId = existing[0]?.id;
      if (!tagId) {
        const res = await db.insert(legalTags).values({ name: normalized });
        tagId = (res as any)[0]?.insertId ?? (res as any).insertId;
      }
      tagIds.push(tagId);
    }
    if (tagIds.length) {
      await db.insert(legalSourceTags).values(tagIds.map(tagId => ({ sourceId: id!, tagId })));
    }

    // Versioning note
    if (input.versionNote && input.versionNote.trim().length > 0) {
      // Compute a simple next version: count existing + 1
      const countRows = await db
        .select({ count: sql<number>`count(*)` })
        .from(legalSourceVersions)
        .where(eq(legalSourceVersions.sourceId, id!));
      const next = (countRows?.[0]?.count ?? 0) + 1;
      await db.insert(legalSourceVersions).values({
        sourceId: id!,
        version: `v${next}`,
        changeNote: input.versionNote,
        createdBy: ctx.user.id,
      });
    }

    return { id };
  }),
});
