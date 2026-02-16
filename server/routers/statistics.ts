import { router, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { ccnls } from "../../drizzle/schema";
import { sql, eq, and, isNull, isNotNull } from "drizzle-orm";

export const statisticsRouter = router({
  /**
   * Get aggregate statistics for all CCNLs
   */
  getAggregateStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    // Total CCNLs count
    const totalCCNLs = await db
      .select({ count: sql<number>`count(*)` })
      .from(ccnls)
      .where(eq(ccnls.isCustom, 0));

    // ENGEB vs National count
    const engebCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(ccnls)
      .where(and(eq(ccnls.isENGEB, 1), eq(ccnls.isCustom, 0)));

    const nationalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(ccnls)
      .where(and(eq(ccnls.isENGEB, 0), eq(ccnls.isCustom, 0)));

    // Total workers and companies (only non-null values)
    const workerStats = await db
      .select({
        totalWorkers: sql<number>`COALESCE(SUM(${ccnls.numeroLavoratori}), 0)`,
        totalCompanies: sql<number>`COALESCE(SUM(${ccnls.numeroAziende}), 0)`,
      })
      .from(ccnls)
      .where(and(eq(ccnls.isCustom, 0), isNotNull(ccnls.numeroLavoratori)));

    // ENGEB workers and companies
    const engebWorkerStats = await db
      .select({
        totalWorkers: sql<number>`COALESCE(SUM(${ccnls.numeroLavoratori}), 0)`,
        totalCompanies: sql<number>`COALESCE(SUM(${ccnls.numeroAziende}), 0)`,
      })
      .from(ccnls)
      .where(
        and(
          eq(ccnls.isENGEB, 1),
          eq(ccnls.isCustom, 0),
          isNotNull(ccnls.numeroLavoratori)
        )
      );

    // National workers and companies
    const nationalWorkerStats = await db
      .select({
        totalWorkers: sql<number>`COALESCE(SUM(${ccnls.numeroLavoratori}), 0)`,
        totalCompanies: sql<number>`COALESCE(SUM(${ccnls.numeroAziende}), 0)`,
      })
      .from(ccnls)
      .where(
        and(
          eq(ccnls.isENGEB, 0),
          eq(ccnls.isCustom, 0),
          isNotNull(ccnls.numeroLavoratori)
        )
      );

    return {
      totalCCNLs: Number(totalCCNLs[0]?.count || 0),
      engebCCNLs: Number(engebCount[0]?.count || 0),
      nationalCCNLs: Number(nationalCount[0]?.count || 0),
      totalWorkers: Number(workerStats[0]?.totalWorkers || 0),
      totalCompanies: Number(workerStats[0]?.totalCompanies || 0),
      engebWorkers: Number(engebWorkerStats[0]?.totalWorkers || 0),
      engebCompanies: Number(engebWorkerStats[0]?.totalCompanies || 0),
      nationalWorkers: Number(nationalWorkerStats[0]?.totalWorkers || 0),
      nationalCompanies: Number(nationalWorkerStats[0]?.totalCompanies || 0),
    };
  }),

  /**
   * Get distribution of workers by sector
   */
  getWorkersBySector: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const results = await db
      .select({
        sector: ccnls.sector,
        totalWorkers: sql<number>`COALESCE(SUM(${ccnls.numeroLavoratori}), 0)`,
        totalCompanies: sql<number>`COALESCE(SUM(${ccnls.numeroAziende}), 0)`,
        ccnlCount: sql<number>`COUNT(*)`,
      })
      .from(ccnls)
      .where(and(eq(ccnls.isCustom, 0), isNotNull(ccnls.numeroLavoratori)))
      .groupBy(ccnls.sector)
      .orderBy(sql`SUM(${ccnls.numeroLavoratori}) DESC`);

    return results.map((r) => ({
      sector: r.sector,
      totalWorkers: Number(r.totalWorkers),
      totalCompanies: Number(r.totalCompanies),
      ccnlCount: Number(r.ccnlCount),
    }));
  }),

  /**
   * Get ENGEB vs National comparison by sector
   */
  getENGEBvsNationalBySector: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const results = await db
      .select({
        sector: ccnls.sector,
        isENGEB: ccnls.isENGEB,
        totalWorkers: sql<number>`COALESCE(SUM(${ccnls.numeroLavoratori}), 0)`,
        totalCompanies: sql<number>`COALESCE(SUM(${ccnls.numeroAziende}), 0)`,
        ccnlCount: sql<number>`COUNT(*)`,
      })
      .from(ccnls)
      .where(and(eq(ccnls.isCustom, 0), isNotNull(ccnls.numeroLavoratori)))
      .groupBy(ccnls.sector, ccnls.isENGEB)
      .orderBy(ccnls.sector);

    // Transform to grouped by sector
    const sectorMap = new Map<
      string,
      {
        sector: string;
        engebWorkers: number;
        nationalWorkers: number;
        engebCompanies: number;
        nationalCompanies: number;
        engebCCNLs: number;
        nationalCCNLs: number;
      }
    >();

    results.forEach((r: typeof results[0]) => {
      if (!sectorMap.has(r.sector)) {
        sectorMap.set(r.sector, {
          sector: r.sector,
          engebWorkers: 0,
          nationalWorkers: 0,
          engebCompanies: 0,
          nationalCompanies: 0,
          engebCCNLs: 0,
          nationalCCNLs: 0,
        });
      }

      const entry = sectorMap.get(r.sector)!;
      if (r.isENGEB === 1) {
        entry.engebWorkers = Number(r.totalWorkers);
        entry.engebCompanies = Number(r.totalCompanies);
        entry.engebCCNLs = Number(r.ccnlCount);
      } else {
        entry.nationalWorkers = Number(r.totalWorkers);
        entry.nationalCompanies = Number(r.totalCompanies);
        entry.nationalCCNLs = Number(r.ccnlCount);
      }
    });

    return Array.from(sectorMap.values());
  }),

  /**
   * Get top CCNLs by worker count
   */
  getTopCCNLsByWorkers: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const results = await db
      .select({
        id: ccnls.id,
        externalId: ccnls.externalId,
        name: ccnls.name,
        sector: ccnls.sector,
        issuer: ccnls.issuer,
        isENGEB: ccnls.isENGEB,
        numeroLavoratori: ccnls.numeroLavoratori,
        numeroAziende: ccnls.numeroAziende,
      })
      .from(ccnls)
      .where(and(eq(ccnls.isCustom, 0), isNotNull(ccnls.numeroLavoratori)))
      .orderBy(sql`${ccnls.numeroLavoratori} DESC`)
      .limit(10);

    return results;
  }),

  /**
   * Get distribution by macro-sector CNEL
   */
  getWorkersByMacroSector: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const results = await db
      .select({
        macroSector: ccnls.macroSettoreCnel,
        totalWorkers: sql<number>`COALESCE(SUM(${ccnls.numeroLavoratori}), 0)`,
        totalCompanies: sql<number>`COALESCE(SUM(${ccnls.numeroAziende}), 0)`,
        ccnlCount: sql<number>`COUNT(*)`,
        engebCount: sql<number>`SUM(CASE WHEN ${ccnls.isENGEB} = 1 THEN 1 ELSE 0 END)`,
      })
      .from(ccnls)
      .where(and(eq(ccnls.isCustom, 0), isNotNull(ccnls.macroSettoreCnel)))
      .groupBy(ccnls.macroSettoreCnel)
      .orderBy(sql`SUM(${ccnls.numeroLavoratori}) DESC`);

    return results.map((r) => ({
      macroSector: r.macroSector || "N/D",
      totalWorkers: Number(r.totalWorkers),
      totalCompanies: Number(r.totalCompanies),
      ccnlCount: Number(r.ccnlCount),
      engebCount: Number(r.engebCount),
    }));
  }),

  /**
   * Get ENGEB penetration by macro-sector
   */
  getENGEBPenetrationByMacroSector: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const results = await db
      .select({
        macroSector: ccnls.macroSettoreCnel,
        isENGEB: ccnls.isENGEB,
        totalWorkers: sql<number>`COALESCE(SUM(${ccnls.numeroLavoratori}), 0)`,
        ccnlCount: sql<number>`COUNT(*)`,
      })
      .from(ccnls)
      .where(and(eq(ccnls.isCustom, 0), isNotNull(ccnls.macroSettoreCnel), isNotNull(ccnls.numeroLavoratori)))
      .groupBy(ccnls.macroSettoreCnel, ccnls.isENGEB)
      .orderBy(ccnls.macroSettoreCnel);

    // Transform to grouped by macro-sector
    const sectorMap = new Map<
      string,
      {
        macroSector: string;
        engebWorkers: number;
        nationalWorkers: number;
        engebCCNLs: number;
        nationalCCNLs: number;
        penetrationPercentage: number;
      }
    >();

    results.forEach((r: typeof results[0]) => {
      const sector = r.macroSector || "N/D";
      if (!sectorMap.has(sector)) {
        sectorMap.set(sector, {
          macroSector: sector,
          engebWorkers: 0,
          nationalWorkers: 0,
          engebCCNLs: 0,
          nationalCCNLs: 0,
          penetrationPercentage: 0,
        });
      }

      const entry = sectorMap.get(sector)!;
      if (r.isENGEB === 1) {
        entry.engebWorkers = Number(r.totalWorkers);
        entry.engebCCNLs = Number(r.ccnlCount);
      } else {
        entry.nationalWorkers = Number(r.totalWorkers);
        entry.nationalCCNLs = Number(r.ccnlCount);
      }
    });

    // Calculate penetration percentage
    const result = Array.from(sectorMap.values()).map((entry) => {
      const total = entry.engebWorkers + entry.nationalWorkers;
      entry.penetrationPercentage = total > 0 ? (entry.engebWorkers / total) * 100 : 0;
      return entry;
    });

    // Sort by penetration percentage descending
    return result.sort((a, b) => b.penetrationPercentage - a.penetrationPercentage);
  }),

  /**
   * Get monthly trend data for the last 12 months
   */
  getMonthlyTrend: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("Database not available");

    const { ccnlMonthlyStats } = await import("../../drizzle/schema");

    // Get last 12 months of data, aggregated by ENGEB vs National
    const results = await db
      .select({
        referenceMonth: ccnlMonthlyStats.referenceMonth,
        isENGEB: ccnls.isENGEB,
        totalWorkers: sql<number>`COALESCE(SUM(${ccnlMonthlyStats.numWorkers}), 0)`,
        totalCompanies: sql<number>`COALESCE(SUM(${ccnlMonthlyStats.numCompanies}), 0)`,
      })
      .from(ccnlMonthlyStats)
      .innerJoin(ccnls, eq(ccnlMonthlyStats.ccnlId, ccnls.id))
      .where(eq(ccnls.isCustom, 0))
      .groupBy(ccnlMonthlyStats.referenceMonth, ccnls.isENGEB)
      .orderBy(ccnlMonthlyStats.referenceMonth);

    // Transform to time series format
    const monthMap = new Map<
      string,
      {
        month: string;
        engebWorkers: number;
        nationalWorkers: number;
        engebCompanies: number;
        nationalCompanies: number;
      }
    >();

    results.forEach((r: typeof results[0]) => {
      if (!monthMap.has(r.referenceMonth)) {
        monthMap.set(r.referenceMonth, {
          month: r.referenceMonth,
          engebWorkers: 0,
          nationalWorkers: 0,
          engebCompanies: 0,
          nationalCompanies: 0,
        });
      }

      const entry = monthMap.get(r.referenceMonth)!;
      if (r.isENGEB === 1) {
        entry.engebWorkers = Number(r.totalWorkers);
        entry.engebCompanies = Number(r.totalCompanies);
      } else {
        entry.nationalWorkers = Number(r.totalWorkers);
        entry.nationalCompanies = Number(r.totalCompanies);
      }
    });

    return Array.from(monthMap.values()).slice(-12); // Last 12 months
  }),
});
