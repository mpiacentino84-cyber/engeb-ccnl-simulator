import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { ccnls, ccnlMonthlyStats } from "../../drizzle/schema";
import { sql, eq, and, isNull, isNotNull } from "drizzle-orm";
import * as XLSX from "xlsx";

export const exportRouter = router({
  /**
   * Export statistics to Excel file
   */
  exportStatisticsExcel: publicProcedure.mutation(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Sheet 1: Top 10 CCNL
    const topCCNLs = await db
      .select({
        nome: ccnls.name,
        settore: ccnls.sector,
        emittente: ccnls.issuer,
        tipo: sql<string>`CASE WHEN ${ccnls.isENGEB} = 1 THEN 'ENGEB' ELSE 'Nazionale' END`,
        lavoratori: ccnls.numeroLavoratori,
        aziende: ccnls.numeroAziende,
      })
      .from(ccnls)
      .where(and(eq(ccnls.isCustom, 0), isNotNull(ccnls.numeroLavoratori)))
      .orderBy(sql`${ccnls.numeroLavoratori} DESC`)
      .limit(10);

    const ws1 = XLSX.utils.json_to_sheet(topCCNLs);
    
    // Set column widths
    ws1['!cols'] = [
      { wch: 40 }, // Nome
      { wch: 30 }, // Settore
      { wch: 40 }, // Emittente
      { wch: 12 }, // Tipo
      { wch: 15 }, // Lavoratori
      { wch: 15 }, // Aziende
    ];

    XLSX.utils.book_append_sheet(workbook, ws1, "Top 10 CCNL");

    // Sheet 2: Dettaglio per Settore
    const sectorDetails = await db
      .select({
        settore: ccnls.sector,
        lavoratori: sql<number>`COALESCE(SUM(${ccnls.numeroLavoratori}), 0)`,
        aziende: sql<number>`COALESCE(SUM(${ccnls.numeroAziende}), 0)`,
        numeroCCNL: sql<number>`COUNT(*)`,
      })
      .from(ccnls)
      .where(and(eq(ccnls.isCustom, 0), isNotNull(ccnls.numeroLavoratori)))
      .groupBy(ccnls.sector)
      .orderBy(sql`SUM(${ccnls.numeroLavoratori}) DESC`);

    const ws2 = XLSX.utils.json_to_sheet(
      sectorDetails.map((s) => ({
        Settore: s.settore,
        Lavoratori: Number(s.lavoratori),
        Aziende: Number(s.aziende),
        "N° CCNL": Number(s.numeroCCNL),
      }))
    );

    ws2['!cols'] = [
      { wch: 40 }, // Settore
      { wch: 15 }, // Lavoratori
      { wch: 15 }, // Aziende
      { wch: 12 }, // N° CCNL
    ];

    XLSX.utils.book_append_sheet(workbook, ws2, "Dettaglio Settoriale");

    // Sheet 3: Trend Mensili
    const monthlyTrend = await db
      .select({
        mese: ccnlMonthlyStats.referenceMonth,
        isENGEB: ccnls.isENGEB,
        lavoratori: sql<number>`COALESCE(SUM(${ccnlMonthlyStats.numWorkers}), 0)`,
        aziende: sql<number>`COALESCE(SUM(${ccnlMonthlyStats.numCompanies}), 0)`,
      })
      .from(ccnlMonthlyStats)
      .innerJoin(ccnls, eq(ccnlMonthlyStats.ccnlId, ccnls.id))
      .where(eq(ccnls.isCustom, 0))
      .groupBy(ccnlMonthlyStats.referenceMonth, ccnls.isENGEB)
      .orderBy(ccnlMonthlyStats.referenceMonth);

    // Transform to wide format
    const monthMap = new Map<string, any>();
    monthlyTrend.forEach((r) => {
      if (!monthMap.has(r.mese)) {
        monthMap.set(r.mese, {
          Mese: r.mese,
          "Lavoratori ENGEB": 0,
          "Lavoratori Nazionali": 0,
          "Aziende ENGEB": 0,
          "Aziende Nazionali": 0,
        });
      }
      const entry = monthMap.get(r.mese)!;
      if (r.isENGEB === 1) {
        entry["Lavoratori ENGEB"] = Number(r.lavoratori);
        entry["Aziende ENGEB"] = Number(r.aziende);
      } else {
        entry["Lavoratori Nazionali"] = Number(r.lavoratori);
        entry["Aziende Nazionali"] = Number(r.aziende);
      }
    });

    const ws3 = XLSX.utils.json_to_sheet(Array.from(monthMap.values()).slice(-12));
    
    ws3['!cols'] = [
      { wch: 12 }, // Mese
      { wch: 18 }, // Lavoratori ENGEB
      { wch: 20 }, // Lavoratori Nazionali
      { wch: 15 }, // Aziende ENGEB
      { wch: 18 }, // Aziende Nazionali
    ];

    XLSX.utils.book_append_sheet(workbook, ws3, "Trend Mensili");

    // Generate Excel file as base64
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    const base64 = excelBuffer.toString("base64");

    return {
      filename: `statistiche_ccnl_${new Date().toISOString().split("T")[0]}.xlsx`,
      data: base64,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
  }),
});
