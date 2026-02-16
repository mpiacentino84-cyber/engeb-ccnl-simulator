import { describe, it, expect } from "vitest";
import * as ccnlDb from "./ccnlDb";

describe("CCNL Pagination", () => {
  it("should return paginated results with correct page size", async () => {
    const result = await ccnlDb.getAllCCNLsPaginated({
      page: 1,
      pageSize: 50,
    });

    expect(result.ccnls).toBeDefined();
    expect(result.ccnls.length).toBeLessThanOrEqual(50);
    expect(result.totalCount).toBeGreaterThan(0);
    expect(result.totalPages).toBeGreaterThan(0);
    expect(result.currentPage).toBe(1);
    expect(result.pageSize).toBe(50);
  });

  it("should return correct total count and pages", async () => {
    const result = await ccnlDb.getAllCCNLsPaginated({
      page: 1,
      pageSize: 50,
    });

    const expectedPages = Math.ceil(result.totalCount / 50);
    expect(result.totalPages).toBe(expectedPages);
  });

  it("should filter by macro-sector correctly", async () => {
    const result = await ccnlDb.getAllCCNLsPaginated({
      page: 1,
      pageSize: 50,
      macroSector: "Agricoltura",
    });

    expect(result.ccnls).toBeDefined();
    // All returned CCNLs should have macroSettoreCnel = "Agricoltura" (case-insensitive check)
    result.ccnls.forEach((ccnl) => {
      expect(ccnl.macroSettoreCnel?.toLowerCase()).toBe("agricoltura");
    });
  });

  it("should filter by search term correctly", async () => {
    const searchTerm = "ENGEB";
    const result = await ccnlDb.getAllCCNLsPaginated({
      page: 1,
      pageSize: 50,
      searchTerm,
    });

    expect(result.ccnls).toBeDefined();
    // All returned CCNLs should contain "ENGEB" in name or other fields
    result.ccnls.forEach((ccnl) => {
      const matchesSearch =
        ccnl.name.includes(searchTerm) ||
        (ccnl.codiceCnel && ccnl.codiceCnel.includes(searchTerm)) ||
        (ccnl.contraentiDatoriali && ccnl.contraentiDatoriali.includes(searchTerm)) ||
        (ccnl.contraentiSindacali && ccnl.contraentiSindacali.includes(searchTerm));
      expect(matchesSearch).toBe(true);
    });
  });

  it("should return different results for different pages", async () => {
    const page1 = await ccnlDb.getAllCCNLsPaginated({
      page: 1,
      pageSize: 10,
    });

    const page2 = await ccnlDb.getAllCCNLsPaginated({
      page: 2,
      pageSize: 10,
    });

    // Pages should have different CCNLs (unless there are less than 10 total)
    if (page1.totalCount > 10) {
      expect(page1.ccnls[0].id).not.toBe(page2.ccnls[0].id);
    }
  });

  it("should handle empty results gracefully", async () => {
    const result = await ccnlDb.getAllCCNLsPaginated({
      page: 1,
      pageSize: 50,
      searchTerm: "NONEXISTENT_CCNL_12345",
    });

    expect(result.ccnls).toBeDefined();
    expect(result.ccnls.length).toBe(0);
    expect(result.totalCount).toBe(0);
    expect(result.totalPages).toBe(0);
  });

  it("should respect page size limit", async () => {
    const result = await ccnlDb.getAllCCNLsPaginated({
      page: 1,
      pageSize: 25,
    });

    expect(result.ccnls.length).toBeLessThanOrEqual(25);
    expect(result.pageSize).toBe(25);
  });

  it("should filter by issuer correctly", async () => {
    const result = await ccnlDb.getAllCCNLsPaginated({
      page: 1,
      pageSize: 50,
      issuer: "CONFIMITALIA",
    });

    expect(result.ccnls).toBeDefined();
    // All returned CCNLs should have issuer containing "CONFIMITALIA"
    result.ccnls.forEach((ccnl) => {
      expect(ccnl.issuer).toContain("CONFIMITALIA");
    });
  });

  it("should combine multiple filters correctly", async () => {
    const result = await ccnlDb.getAllCCNLsPaginated({
      page: 1,
      pageSize: 50,
      macroSector: "Agricoltura",
      searchTerm: "operai",
    });

    expect(result.ccnls).toBeDefined();
    // All returned CCNLs should match both filters (case-insensitive)
    result.ccnls.forEach((ccnl) => {
      expect(ccnl.macroSettoreCnel?.toLowerCase()).toBe("agricoltura");
      const matchesSearch =
        ccnl.name.toLowerCase().includes("operai") ||
        (ccnl.contraentiDatoriali && ccnl.contraentiDatoriali.toLowerCase().includes("operai")) ||
        (ccnl.contraentiSindacali && ccnl.contraentiSindacali.toLowerCase().includes("operai"));
      expect(matchesSearch).toBe(true);
    });
  });
});
