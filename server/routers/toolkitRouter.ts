import { z } from "zod";
import { and, asc, desc, eq, like, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { consultantProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import {
  checklistItems,
  checklists,
  templateFields,
  templates,
} from "../../drizzle/schema";
import { extractPlaceholders, renderTemplate } from "@shared/templateRender";

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

export const toolkitRouter = router({
  // CHECKLISTS
  checklistList: publicProcedure
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
      if (status) conditions.push(eq(checklists.status, status));
      if (input.category) conditions.push(eq(checklists.category, input.category));
      if (input.search) {
        const q = `%${input.search}%`;
        conditions.push(or(like(checklists.title, q), like(checklists.description, q)));
      }

      return db
        .select()
        .from(checklists)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(checklists.updatedAt))
        .limit(input.limit);
    }),

  checklistGet: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await ensureDb();
      const [cl] = await db
        .select()
        .from(checklists)
        .where(eq(checklists.id, input.id))
        .limit(1);
      if (!cl) throw new TRPCError({ code: "NOT_FOUND", message: "Checklist non trovata" });
      if (cl.status !== "published" && ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Contenuto non pubblicato" });
      }
      const items = await db
        .select()
        .from(checklistItems)
        .where(eq(checklistItems.checklistId, input.id))
        .orderBy(asc(checklistItems.position));
      return { ...cl, items };
    }),

  checklistUpsert: consultantProcedure
    .input(
      z.object({
        id: z.number().optional(),
        title: z.string().trim().min(3).max(300),
        category: z.string().trim().min(2).max(120),
        description: z.string().trim().max(10_000).optional().nullable(),
        status: statusEnum.optional(),
        items: z
          .array(
            z.object({
              position: z.number().min(1).max(10_000),
              text: z.string().trim().min(3).max(800),
              notes: z.string().trim().max(10_000).optional().nullable(),
              isRequired: z.boolean().default(true),
              referenceSourceId: z.number().optional().nullable(),
            })
          )
          .max(500)
          .default([]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      const status = input.status ?? "draft";
      let id = input.id;

      if (!id) {
        const res = await db.insert(checklists).values({
          title: input.title,
          category: input.category,
          description: input.description ?? null,
          status,
          createdBy: ctx.user.id,
          lastReviewedAt: status === "published" ? new Date() : null,
        });
        id = (res as any)[0]?.insertId ?? (res as any).insertId;
      } else {
        await db
          .update(checklists)
          .set({
            title: input.title,
            category: input.category,
            description: input.description ?? null,
            status,
            lastReviewedAt: status === "published" ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(eq(checklists.id, id));

        await db.delete(checklistItems).where(eq(checklistItems.checklistId, id));
      }

      if (input.items.length) {
        await db.insert(checklistItems).values(
          input.items.map(it => ({
            checklistId: id!,
            position: it.position,
            text: it.text,
            notes: it.notes ?? null,
            isRequired: it.isRequired ? 1 : 0,
            referenceSourceId: it.referenceSourceId ?? null,
          }))
        );
      }

      return { id };
    }),

  checklistDelete: consultantProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await ensureDb();
      await db.delete(checklistItems).where(eq(checklistItems.checklistId, input.id));
      await db.delete(checklists).where(eq(checklists.id, input.id));
      return { success: true };
    }),

  // TEMPLATES
  templateList: publicProcedure
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
      if (status) conditions.push(eq(templates.status, status));
      if (input.category) conditions.push(eq(templates.category, input.category));
      if (input.search) {
        const q = `%${input.search}%`;
        conditions.push(or(like(templates.title, q), like(templates.description, q), like(templates.content, q)));
      }
      return db
        .select({
          id: templates.id,
          title: templates.title,
          category: templates.category,
          description: templates.description,
          format: templates.format,
          status: templates.status,
          updatedAt: templates.updatedAt,
        })
        .from(templates)
        .where(conditions.length ? and(...conditions) : undefined)
        .orderBy(desc(templates.updatedAt))
        .limit(input.limit);
    }),

  templateGet: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input, ctx }) => {
      const db = await ensureDb();
      const [t] = await db
        .select()
        .from(templates)
        .where(eq(templates.id, input.id))
        .limit(1);
      if (!t) throw new TRPCError({ code: "NOT_FOUND", message: "Template non trovato" });
      if (t.status !== "published" && ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Contenuto non pubblicato" });
      }
      const fields = await db
        .select()
        .from(templateFields)
        .where(eq(templateFields.templateId, input.id))
        .orderBy(asc(templateFields.position));
      return { ...t, fields, placeholders: extractPlaceholders(t.content) };
    }),

  templateUpsert: consultantProcedure
    .input(
      z.object({
        id: z.number().optional(),
        title: z.string().trim().min(3).max(300),
        category: z.string().trim().min(2).max(120),
        description: z.string().trim().max(10_000).optional().nullable(),
        format: z.enum(["plaintext", "markdown"]).default("markdown"),
        content: z.string().trim().min(10).max(200_000),
        status: statusEnum.optional(),
        fields: z
          .array(
            z.object({
              name: z.string().trim().min(1).max(80),
              label: z.string().trim().min(1).max(200),
              fieldType: z.enum(["text", "date", "number", "email"]).default("text"),
              required: z.boolean().default(true),
              defaultValue: z.string().trim().max(400).optional().nullable(),
              helpText: z.string().trim().max(600).optional().nullable(),
              position: z.number().min(0).max(10_000).default(0),
            })
          )
          .max(200)
          .default([]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await ensureDb();
      const status = input.status ?? "draft";
      let id = input.id;
      if (!id) {
        const res = await db.insert(templates).values({
          title: input.title,
          category: input.category,
          description: input.description ?? null,
          format: input.format,
          content: input.content,
          status,
          createdBy: ctx.user.id,
          lastReviewedAt: status === "published" ? new Date() : null,
        });
        id = (res as any)[0]?.insertId ?? (res as any).insertId;
      } else {
        await db
          .update(templates)
          .set({
            title: input.title,
            category: input.category,
            description: input.description ?? null,
            format: input.format,
            content: input.content,
            status,
            lastReviewedAt: status === "published" ? new Date() : null,
            updatedAt: new Date(),
          })
          .where(eq(templates.id, id));
        await db.delete(templateFields).where(eq(templateFields.templateId, id));
      }

      if (input.fields.length) {
        await db.insert(templateFields).values(
          input.fields.map(f => ({
            templateId: id!,
            name: f.name,
            label: f.label,
            fieldType: f.fieldType,
            required: f.required ? 1 : 0,
            defaultValue: f.defaultValue ?? null,
            helpText: f.helpText ?? null,
            position: f.position,
          }))
        );
      }

      return { id };
    }),

  templateDelete: consultantProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await ensureDb();
      await db.delete(templateFields).where(eq(templateFields.templateId, input.id));
      await db.delete(templates).where(eq(templates.id, input.id));
      return { success: true };
    }),

  // Render preview and export-as-doc (Word can open HTML .doc)
  templateRender: publicProcedure
    .input(
      z.object({
        templateId: z.number(),
        data: z.record(z.string(), z.any()).default({}),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await ensureDb();
      const [t] = await db
        .select()
        .from(templates)
        .where(eq(templates.id, input.templateId))
        .limit(1);
      if (!t) throw new TRPCError({ code: "NOT_FOUND", message: "Template non trovato" });
      if (t.status !== "published" && ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Contenuto non pubblicato" });
      }
      return renderTemplate(t.content, input.data);
    }),

  templateExportDoc: publicProcedure
    .input(
      z.object({
        templateId: z.number(),
        data: z.record(z.string(), z.any()).default({}),
      })
    )
    .query(async ({ input, ctx }) => {
      const db = await ensureDb();
      const [t] = await db
        .select()
        .from(templates)
        .where(eq(templates.id, input.templateId))
        .limit(1);
      if (!t) throw new TRPCError({ code: "NOT_FOUND", message: "Template non trovato" });
      if (t.status !== "published" && ctx.user?.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Contenuto non pubblicato" });
      }

      const { output, missingKeys } = renderTemplate(t.content, input.data);

      // Minimal HTML doc wrapper.
      const html = `<!doctype html><html><head><meta charset="utf-8" />
<title>${escapeHtml(t.title)}</title>
<style>body{font-family:Arial,Helvetica,sans-serif;line-height:1.4;padding:24px} pre{white-space:pre-wrap}</style>
</head><body>
<h2>${escapeHtml(t.title)}</h2>
<p style="color:#444;font-size:12px">Documento generato automaticamente. Verifica i contenuti prima dell'uso.</p>
<hr/>
<pre>${escapeHtml(output)}</pre>
${missingKeys.length ? `<hr/><p style="color:#b00;font-size:12px">Campi mancanti: ${missingKeys.map(escapeHtml).join(", ")}</p>` : ""}
</body></html>`;

      return {
        filename: `${slugify(t.title)}.doc`,
        mimeType: "application/msword",
        contentBase64: Buffer.from(html, "utf-8").toString("base64"),
      };
    }),
});

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80) || "documento";
}
