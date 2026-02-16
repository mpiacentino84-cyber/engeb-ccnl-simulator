import { eq, and, or, like, sql } from "drizzle-orm";
import { getDb } from "./db";
import {
  ccnls,
  ccnlLevels,
  ccnlAdditionalCosts,
  ccnlContributions,
  InsertCCNL,
  InsertCCNLLevel,
  InsertCCNLAdditionalCosts,
  InsertCCNLContribution,
} from "../drizzle/schema";

// CCNL CRUD operations
export async function getAllCCNLs() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(ccnls);
}

export async function getAllCCNLsPaginated({
  page = 1,
  pageSize = 50,
  searchTerm = "",
  sector = "",
  issuer = "",
  macroSector = "",
}: {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  sector?: string;
  issuer?: string;
  macroSector?: string;
}) {
  const db = await getDb();
  if (!db) return { ccnls: [], totalCount: 0, totalPages: 0 };

  // Build WHERE conditions
  const conditions = [];
  
  if (searchTerm) {
    conditions.push(
      or(
        like(ccnls.name, `%${searchTerm}%`),
        like(ccnls.codiceCnel, `%${searchTerm}%`),
        like(ccnls.contraentiDatoriali, `%${searchTerm}%`),
        like(ccnls.contraentiSindacali, `%${searchTerm}%`)
      )
    );
  }
  
  if (sector && sector !== "all") {
    conditions.push(eq(ccnls.sector, sector));
  }
  
  if (issuer && issuer !== "all") {
    conditions.push(like(ccnls.issuer, `%${issuer}%`));
  }
  
  if (macroSector && macroSector !== "all") {
    conditions.push(eq(ccnls.macroSettoreCnel, macroSector));
  }

  // Get total count
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(ccnls)
    .where(whereClause);
  const totalCount = Number(countResult[0]?.count || 0);
  const totalPages = Math.ceil(totalCount / pageSize);

  // Get paginated results
  const offset = (page - 1) * pageSize;
  let query = db.select().from(ccnls);
  
  if (whereClause) {
    query = query.where(whereClause) as any;
  }
  
  const results = await query.limit(pageSize).offset(offset);

  return {
    ccnls: results,
    totalCount,
    totalPages,
    currentPage: page,
    pageSize,
  };
}

export async function getCCNLById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(ccnls).where(eq(ccnls.id, id)).limit(1);
  return result[0] || null;
}

export async function getCCNLByExternalId(externalId: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(ccnls).where(eq(ccnls.externalId, externalId)).limit(1);
  return result[0] || null;
}

// Get CCNL by externalId with complete data (levels, costs, contributions)
export async function getCompleteCCNLByExternalId(externalId: string) {
  const db = await getDb();
  if (!db) return null;
  
  const ccnlList = await db.select().from(ccnls).where(eq(ccnls.externalId, externalId));
  if (ccnlList.length === 0) return null;
  
  const ccnl = ccnlList[0];
  const levels = await getLevelsByCCNLId(ccnl.id);
  const additionalCosts = await getAdditionalCostsByCCNLId(ccnl.id);
  const contributions = await getContributionsByCCNLId(ccnl.id);
  
  return {
    ...ccnl,
    levels,
    additionalCosts,
    contributions,
  };
}

export async function createCCNL(data: InsertCCNL) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ccnls).values(data) as any;
  return Number(result.insertId);
}

export async function updateCCNL(id: number, data: Partial<InsertCCNL>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ccnls).set(data).where(eq(ccnls.id, id));
}

export async function deleteCCNL(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  // Delete related data first
  await db.delete(ccnlLevels).where(eq(ccnlLevels.ccnlId, id));
  await db.delete(ccnlAdditionalCosts).where(eq(ccnlAdditionalCosts.ccnlId, id));
  await db.delete(ccnlContributions).where(eq(ccnlContributions.ccnlId, id));
  // Delete CCNL
  await db.delete(ccnls).where(eq(ccnls.id, id));
}

// CCNL Levels CRUD operations
export async function getLevelsByCCNLId(ccnlId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(ccnlLevels).where(eq(ccnlLevels.ccnlId, ccnlId));
}

export async function createCCNLLevel(data: InsertCCNLLevel) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ccnlLevels).values(data) as any;
  return Number(result.insertId);
}

export async function updateCCNLLevel(id: number, data: Partial<InsertCCNLLevel>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ccnlLevels).set(data).where(eq(ccnlLevels.id, id));
}

export async function deleteCCNLLevel(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(ccnlLevels).where(eq(ccnlLevels.id, id));
}

// CCNL Additional Costs CRUD operations
export async function getAdditionalCostsByCCNLId(ccnlId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(ccnlAdditionalCosts).where(eq(ccnlAdditionalCosts.ccnlId, ccnlId)).limit(1);
  return result[0] || null;
}

export async function upsertAdditionalCosts(data: InsertCCNLAdditionalCosts) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getAdditionalCostsByCCNLId(data.ccnlId);
  if (existing) {
    await db.update(ccnlAdditionalCosts).set(data).where(eq(ccnlAdditionalCosts.ccnlId, data.ccnlId));
  } else {
    await db.insert(ccnlAdditionalCosts).values(data);
  }
}

// CCNL Contributions CRUD operations
export async function getContributionsByCCNLId(ccnlId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(ccnlContributions).where(eq(ccnlContributions.ccnlId, ccnlId));
}

export async function createCCNLContribution(data: InsertCCNLContribution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(ccnlContributions).values(data) as any;
  return Number(result.insertId);
}

export async function updateCCNLContribution(id: number, data: Partial<InsertCCNLContribution>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(ccnlContributions).set(data).where(eq(ccnlContributions.id, id));
}

export async function deleteCCNLContribution(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(ccnlContributions).where(eq(ccnlContributions.id, id));
}

// Get complete CCNL with all related data
// Get all ENGEB CCNLs with complete data (for simulator)
export async function getENGEBCCNLs(sectorCategory?: string) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(ccnls.isENGEB, 1)];
  if (sectorCategory && sectorCategory !== 'all') {
    conditions.push(eq(ccnls.sectorCategory, sectorCategory));
  }
  
  const engebCCNLs = await db.select().from(ccnls).where(and(...conditions));
  
  // Load related data for each CCNL
  const completeCCNLs = await Promise.all(
    engebCCNLs.map(async (ccnl) => {
      const levels = await getLevelsByCCNLId(ccnl.id);
      const additionalCosts = await getAdditionalCostsByCCNLId(ccnl.id);
      const contributions = await getContributionsByCCNLId(ccnl.id);
      
      return {
        ...ccnl,
        levels,
        additionalCosts,
        contributions,
      };
    })
  );
  
  return completeCCNLs;
}

// Search CCNLs by text query (name, sector, codeCNEL, externalId)
export async function searchCCNLs(query: string, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  const searchPattern = `%${query}%`;
  
  const results = await db
    .select()
    .from(ccnls)
    .where(
      or(
        like(ccnls.name, searchPattern),
        like(ccnls.sector, searchPattern),
        like(ccnls.codiceCnel, searchPattern),
        like(ccnls.externalId, searchPattern),
        like(ccnls.macroSettoreCnel, searchPattern)
      )
    )
    .limit(limit)
    .orderBy(ccnls.name);

  // Load levels and contributions for each CCNL
  const ccnlsWithDetails = await Promise.all(
    results.map(async (ccnl) => {
      const levels = await getLevelsByCCNLId(ccnl.id);
      const additionalCosts = await getAdditionalCostsByCCNLId(ccnl.id);
      const contributions = await getContributionsByCCNLId(ccnl.id);

      return {
        ...ccnl,
        levels,
        additionalCosts,
        contributions,
      };
    })
  );

  return ccnlsWithDetails;
}

// Get all national (non-ENGEB) CCNLs with complete data (for simulator)
export async function getNationalCCNLs() {
  const db = await getDb();
  if (!db) return [];
  
  const nationalCCNLs = await db.select().from(ccnls).where(eq(ccnls.isENGEB, 0));
  
  // Load related data for each CCNL
  const completeCCNLs = await Promise.all(
    nationalCCNLs.map(async (ccnl) => {
      const levels = await getLevelsByCCNLId(ccnl.id);
      const additionalCosts = await getAdditionalCostsByCCNLId(ccnl.id);
      const contributions = await getContributionsByCCNLId(ccnl.id);
      
      return {
        ...ccnl,
        levels,
        additionalCosts,
        contributions,
      };
    })
  );
  
  return completeCCNLs;
}



export async function getCompleteCCNL(id: number) {
  const ccnl = await getCCNLById(id);
  if (!ccnl) return null;

  const levels = await getLevelsByCCNLId(id);
  const additionalCosts = await getAdditionalCostsByCCNLId(id);
  const contributions = await getContributionsByCCNLId(id);

  return {
    ...ccnl,
    levels,
    additionalCosts,
    contributions,
  };
}

// Get custom CCNLs created by a specific user with all related data
export async function getCustomCCNLsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const customCCNLs = await db.select().from(ccnls).where(eq(ccnls.createdBy, userId));
  
  // Load related data for each CCNL
  const completeCCNLs = await Promise.all(
    customCCNLs.map(async (ccnl) => {
      const levels = await getLevelsByCCNLId(ccnl.id);
      const additionalCosts = await getAdditionalCostsByCCNLId(ccnl.id);
      const contributions = await getContributionsByCCNLId(ccnl.id);
      
      return {
        ...ccnl,
        levels,
        additionalCosts,
        contributions,
      };
    })
  );
  
  return completeCCNLs;
}
