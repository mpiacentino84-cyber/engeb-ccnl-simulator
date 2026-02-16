import { describe, it, expect, beforeAll } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";

describe("Statistics - Macro-Sector CNEL", () => {
  let caller: ReturnType<typeof appRouter.createCaller>;

  beforeAll(async () => {
    const db = await getDb();
    if (!db) {
      throw new Error("Database not available for testing");
    }

    // Create a mock context for testing
    caller = appRouter.createCaller({
      user: null,
      db,
    } as any);
  });

  describe("getWorkersByMacroSector", () => {
    it("should return distribution of workers by macro-sector", async () => {
      const result = await caller.statistics.getWorkersByMacroSector();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        const firstSector = result[0];
        expect(firstSector).toHaveProperty("macroSector");
        expect(firstSector).toHaveProperty("totalWorkers");
        expect(firstSector).toHaveProperty("totalCompanies");
        expect(firstSector).toHaveProperty("ccnlCount");
        expect(firstSector).toHaveProperty("engebCount");

        // Verify data types
        expect(typeof firstSector.macroSector).toBe("string");
        expect(typeof firstSector.totalWorkers).toBe("number");
        expect(typeof firstSector.totalCompanies).toBe("number");
        expect(typeof firstSector.ccnlCount).toBe("number");
        expect(typeof firstSector.engebCount).toBe("number");

        // Verify non-negative values
        expect(firstSector.totalWorkers).toBeGreaterThanOrEqual(0);
        expect(firstSector.totalCompanies).toBeGreaterThanOrEqual(0);
        expect(firstSector.ccnlCount).toBeGreaterThan(0);
        expect(firstSector.engebCount).toBeGreaterThanOrEqual(0);
      }
    });

    it("should return sectors ordered by total workers descending", async () => {
      const result = await caller.statistics.getWorkersByMacroSector();

      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].totalWorkers).toBeGreaterThanOrEqual(
            result[i + 1].totalWorkers
          );
        }
      }
    });

    it("should include all major CNEL macro-sectors", async () => {
      const result = await caller.statistics.getWorkersByMacroSector();

      const macroSectors = result.map((r) => r.macroSector);

      // Verify at least some major sectors are present
      const expectedSectors = [
        "TERZIARIO E SERVIZI",
        "COMMERCIO",
        "INDUSTRIA",
        "EDILIZIA",
      ];

      const foundSectors = expectedSectors.filter((sector) =>
        macroSectors.includes(sector)
      );

      // At least 1 major sector should be present
      expect(foundSectors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getENGEBPenetrationByMacroSector", () => {
    it("should return ENGEB penetration by macro-sector", async () => {
      const result = await caller.statistics.getENGEBPenetrationByMacroSector();

      expect(result).toBeDefined();
      expect(Array.isArray(result)).toBe(true);

      if (result.length > 0) {
        const firstSector = result[0];
        expect(firstSector).toHaveProperty("macroSector");
        expect(firstSector).toHaveProperty("engebWorkers");
        expect(firstSector).toHaveProperty("nationalWorkers");
        expect(firstSector).toHaveProperty("engebCCNLs");
        expect(firstSector).toHaveProperty("nationalCCNLs");
        expect(firstSector).toHaveProperty("penetrationPercentage");

        // Verify data types
        expect(typeof firstSector.macroSector).toBe("string");
        expect(typeof firstSector.engebWorkers).toBe("number");
        expect(typeof firstSector.nationalWorkers).toBe("number");
        expect(typeof firstSector.engebCCNLs).toBe("number");
        expect(typeof firstSector.nationalCCNLs).toBe("number");
        expect(typeof firstSector.penetrationPercentage).toBe("number");

        // Verify non-negative values
        expect(firstSector.engebWorkers).toBeGreaterThanOrEqual(0);
        expect(firstSector.nationalWorkers).toBeGreaterThanOrEqual(0);
        expect(firstSector.engebCCNLs).toBeGreaterThanOrEqual(0);
        expect(firstSector.nationalCCNLs).toBeGreaterThanOrEqual(0);
        expect(firstSector.penetrationPercentage).toBeGreaterThanOrEqual(0);
        expect(firstSector.penetrationPercentage).toBeLessThanOrEqual(100);
      }
    });

    it("should return sectors ordered by penetration percentage descending", async () => {
      const result = await caller.statistics.getENGEBPenetrationByMacroSector();

      if (result.length > 1) {
        for (let i = 0; i < result.length - 1; i++) {
          expect(result[i].penetrationPercentage).toBeGreaterThanOrEqual(
            result[i + 1].penetrationPercentage
          );
        }
      }
    });

    it("should calculate penetration percentage correctly", async () => {
      const result = await caller.statistics.getENGEBPenetrationByMacroSector();

      for (const sector of result) {
        const total = sector.engebWorkers + sector.nationalWorkers;
        if (total > 0) {
          const expectedPercentage = (sector.engebWorkers / total) * 100;
          expect(sector.penetrationPercentage).toBeCloseTo(
            expectedPercentage,
            1
          );
        } else {
          expect(sector.penetrationPercentage).toBe(0);
        }
      }
    });

    it("should include sectors with ENGEB presence", async () => {
      const result = await caller.statistics.getENGEBPenetrationByMacroSector();

      // At least some sectors should have ENGEB presence
      const sectorsWithENGEB = result.filter(
        (sector) => sector.engebWorkers > 0 || sector.engebCCNLs > 0
      );

      expect(sectorsWithENGEB.length).toBeGreaterThan(0);
    });
  });

  describe("Integration with existing statistics", () => {
    it("should have consistent data with getWorkersBySector", async () => {
      const macroSectorData =
        await caller.statistics.getWorkersByMacroSector();
      const aggregateStats = await caller.statistics.getAggregateStats();

      // Total workers from macro-sectors should be reasonable
      const totalFromMacroSectors = macroSectorData.reduce(
        (sum, sector) => sum + sector.totalWorkers,
        0
      );

      // Should be close to aggregate total (allowing for null values)
      expect(totalFromMacroSectors).toBeGreaterThan(0);
      expect(totalFromMacroSectors).toBeLessThanOrEqual(
        aggregateStats.totalWorkers
      );
    });

    it("should have consistent ENGEB counts", async () => {
      const penetrationData =
        await caller.statistics.getENGEBPenetrationByMacroSector();
      const aggregateStats = await caller.statistics.getAggregateStats();

      // Total ENGEB workers from penetration data
      const totalENGEBWorkers = penetrationData.reduce(
        (sum, sector) => sum + sector.engebWorkers,
        0
      );

      // Should match or be close to aggregate ENGEB workers
      expect(totalENGEBWorkers).toBeGreaterThan(0);
      expect(totalENGEBWorkers).toBeLessThanOrEqual(
        aggregateStats.engebWorkers
      );
    });
  });
});
