import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { publicProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { getDb } from "../db";
import { legalSources, templates, checklists } from "../../drizzle/schema";
import { desc, like, or } from "drizzle-orm";

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

/**
 * AI Q&A (prudente):
 * - recupera fonti dal DB (normativa + toolkit)
 * - passa contesto con citazioni
 * - se Forge API key non è configurata, ritorna un messaggio di fallback.
 */
export const aiRouter = router({
  ask: publicProcedure
    .input(
      z.object({
        question: z.string().trim().min(3).max(4000),
        scope: z.enum(["legal", "toolkit", "all"]).default("all"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await ensureDb();
      const q = `%${input.question.slice(0, 300)}%`;

      const sources: Array<{ id: string; title: string; url?: string; excerpt?: string }>
        = [];

      if (input.scope === "legal" || input.scope === "all") {
        const legal = await db
          .select({
            id: legalSources.id,
            title: legalSources.title,
            url: legalSources.officialUrl,
            summary: legalSources.summary,
          })
          .from(legalSources)
          .where(
            or(
              like(legalSources.title, q),
              like(legalSources.summary, q),
              like(legalSources.body, q)
            )
          )
          .orderBy(desc(legalSources.updatedAt))
          .limit(6);
        for (const s of legal) {
          sources.push({
            id: `LEGAL-${s.id}`,
            title: s.title,
            url: s.url ?? undefined,
            excerpt: (s.summary ?? "").slice(0, 500) || undefined,
          });
        }
      }

      if (input.scope === "toolkit" || input.scope === "all") {
        const tpls = await db
          .select({ id: templates.id, title: templates.title, description: templates.description })
          .from(templates)
          .where(or(like(templates.title, q), like(templates.description, q), like(templates.content, q)))
          .orderBy(desc(templates.updatedAt))
          .limit(4);
        for (const t of tpls) {
          sources.push({ id: `TPL-${t.id}`, title: t.title, excerpt: (t.description ?? "").slice(0, 500) || undefined });
        }

        const cls = await db
          .select({ id: checklists.id, title: checklists.title, description: checklists.description })
          .from(checklists)
          .where(or(like(checklists.title, q), like(checklists.description, q)))
          .orderBy(desc(checklists.updatedAt))
          .limit(4);
        for (const c of cls) {
          sources.push({ id: `CHK-${c.id}`, title: c.title, excerpt: (c.description ?? "").slice(0, 500) || undefined });
        }
      }

      const citationsBlock = sources.length
        ? sources
            .map((s, i) => {
              const ref = `[S${i + 1}] ${s.id} — ${s.title}${s.url ? ` — ${s.url}` : ""}`;
              const excerpt = s.excerpt ? `\nEstratto: ${s.excerpt}` : "";
              return `${ref}${excerpt}`;
            })
            .join("\n\n")
        : "(Nessuna fonte pertinente trovata nel database. Suggerire link ufficiali da verificare.)";

      const system = `Sei un assistente prudente in materia di diritto del lavoro (Italia).
Regole:
- Usa SOLO le fonti fornite nel blocco "FONTI".
- Se le fonti non sono sufficienti, dichiaralo esplicitamente e proponi cosa verificare e dove (es. siti istituzionali), senza inventare.
- Rispondi in italiano, con punti elenco.
- Inserisci sempre un disclaimer: "Informazioni generali, non parere legale".

Formato richiesto:
1) Risposta sintetica
2) Passi operativi / checklist
3) Fonti citate (usa [S1], [S2]...)
4) Disclaimer
`;

      const user = `DOMANDA:\n${input.question}\n\nFONTI:\n${citationsBlock}`;

      try {
        const result = await invokeLLM({
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
        });

        const text = result.output_text || result.output?.[0]?.content?.[0]?.text || "";
        return { answer: text, sources };
      } catch (e: any) {
        // Fallback when Forge API key isn't configured.
        return {
          answer:
            "AI non configurata su questo ambiente.\n\n" +
            "Puoi comunque usare la ricerca (Normativa/Toolkit) e consultare le fonti collegate.\n\n" +
            "Disclaimer: informazioni generali, non parere legale.",
          sources,
          error: String(e?.message ?? e),
        };
      }
    }),
});
