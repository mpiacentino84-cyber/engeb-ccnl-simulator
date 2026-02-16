/**
 * Transform CCNL data from database format to simulator format
 * Database uses strings for numeric values, simulator expects numbers
 */

import type { CCNL, CCNLLevel, ContributionDetail } from "./ccnlData";

// Database types (from tRPC)
type DBCCNLLevel = {
  id: number;
  ccnlId: number;
  level: string;
  description: string;
  baseSalaryMonthly: string;
  createdAt: Date;
  updatedAt: Date;
};

type DBAdditionalCosts = {
  id: number;
  ccnlId: number;
  tfr: string;
  socialContributions: string;
  otherBenefits: string;
  createdAt: Date;
  updatedAt: Date;
};

type DBContribution = {
  id: number;
  ccnlId: number;
  name: string;
  description: string | null;
  percentage: string;
  amount: string;
  isPercentage: number;
  category: "bilateral" | "health" | "pension" | "other";
  createdAt: Date;
  updatedAt: Date;
};

type DBCompleteCCNL = {
  id: number;
  externalId: string;
  name: string;
  sector: string;
  sectorCategory: string;
  issuer: string | null;
  validFrom: string | null;
  validTo: string | null;
  description: string | null;
  isENGEB: number;
  codiceCnel: string | null;
  macroSettoreCnel: string | null;
  contraentiDatoriali: string | null;
  contraentiSindacali: string | null;
  numeroLavoratori: number | null;
  numeroAziende: number | null;
  fonteDati: string | null;
  createdBy: number | null;
  createdAt: Date;
  updatedAt: Date;
  levels: DBCCNLLevel[];
  additionalCosts: DBAdditionalCosts | null;
  contributions: DBContribution[];
};

/**
 * Transform database CCNL to simulator format
 */
export function transformDBCCNLToSimulator(dbCCNL: DBCompleteCCNL): CCNL {
  // Transform levels
  const levels: CCNLLevel[] = dbCCNL.levels.map((level) => ({
    level: level.level,
    description: level.description,
    baseSalaryMonthly: parseFloat(level.baseSalaryMonthly),
  }));

  // Transform additional costs
  const additionalCosts = dbCCNL.additionalCosts
    ? {
        tfr: parseFloat(dbCCNL.additionalCosts.tfr),
        socialContributions: parseFloat(dbCCNL.additionalCosts.socialContributions),
        otherBenefits: parseFloat(dbCCNL.additionalCosts.otherBenefits),
      }
    : {
        tfr: 8.33,
        socialContributions: 30,
        otherBenefits: 2,
      };

  // Transform contributions
  const contributions: ContributionDetail[] = dbCCNL.contributions.map((contrib) => ({
    name: contrib.name,
    description: contrib.description || "",
    percentage: parseFloat(contrib.percentage),
    amount: parseFloat(contrib.amount),
    isPercentage: contrib.isPercentage === 1,
    category: contrib.category,
  }));

  return {
    id: dbCCNL.externalId, // Use externalId as string ID for compatibility
    name: dbCCNL.name,
    sector: dbCCNL.sector,
    sectorCategory: dbCCNL.sectorCategory,
    issuer: dbCCNL.issuer || "N/D",
    validFrom: dbCCNL.validFrom || "N/D",
    validTo: dbCCNL.validTo || "N/D",
    description: dbCCNL.description || "",
    levels,
    additionalCosts,
    contributions,
  };
}

/**
 * Transform array of database CCNLs to simulator format
 */
export function transformDBCCNLsToSimulator(dbCCNLs: DBCompleteCCNL[]): CCNL[] {
  return dbCCNLs.map(transformDBCCNLToSimulator);
}
