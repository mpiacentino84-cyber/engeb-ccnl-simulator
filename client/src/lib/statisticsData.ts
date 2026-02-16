// Statistics and growth data for ENGEB by sector

export interface SectorStats {
  sectorId: string;
  sectorName: string;
  icon: string;
  currentCompanies: number;
  currentEmployees: number;
  growthTrend: GrowthData[];
}

export interface GrowthData {
  year: number;
  companies: number;
  employees: number;
  revenue: number; // in thousands of EUR
}

export interface OverallStats {
  totalCompanies: number;
  totalEmployees: number;
  totalRevenue: number;
  growthRate: number; // percentage
}

// Historical growth data for ENGEB (2021-2026 projection)
export const sectorStatistics: SectorStats[] = [
  {
    sectorId: "turismo",
    sectorName: "Turismo e Ospitalità",
    icon: "🏨",
    currentCompanies: 280,
    currentEmployees: 3500,
    growthTrend: [
      { year: 2021, companies: 120, employees: 1200, revenue: 180 },
      { year: 2022, companies: 160, employees: 1800, revenue: 270 },
      { year: 2023, companies: 200, employees: 2400, revenue: 360 },
      { year: 2024, companies: 240, employees: 3000, revenue: 450 },
      { year: 2025, companies: 260, employees: 3250, revenue: 487 },
      { year: 2026, companies: 280, employees: 3500, revenue: 525 },
    ],
  },
  {
    sectorId: "commercio",
    sectorName: "Commercio e Distribuzione",
    icon: "🏪",
    currentCompanies: 320,
    currentEmployees: 4200,
    growthTrend: [
      { year: 2021, companies: 140, employees: 1400, revenue: 210 },
      { year: 2022, companies: 180, employees: 2100, revenue: 315 },
      { year: 2023, companies: 220, employees: 2800, revenue: 420 },
      { year: 2024, companies: 270, employees: 3500, revenue: 525 },
      { year: 2025, companies: 295, employees: 3850, revenue: 577 },
      { year: 2026, companies: 320, employees: 4200, revenue: 630 },
    ],
  },
  {
    sectorId: "artigianato",
    sectorName: "Artigianato",
    icon: "🔧",
    currentCompanies: 180,
    currentEmployees: 1800,
    growthTrend: [
      { year: 2021, companies: 80, employees: 600, revenue: 90 },
      { year: 2022, companies: 100, employees: 900, revenue: 135 },
      { year: 2023, companies: 125, employees: 1200, revenue: 180 },
      { year: 2024, companies: 150, employees: 1500, revenue: 225 },
      { year: 2025, companies: 165, employees: 1650, revenue: 247 },
      { year: 2026, companies: 180, employees: 1800, revenue: 270 },
    ],
  },
  {
    sectorId: "logistica",
    sectorName: "Logistica e Trasporto",
    icon: "🚚",
    currentCompanies: 150,
    currentEmployees: 2100,
    growthTrend: [
      { year: 2021, companies: 60, employees: 700, revenue: 105 },
      { year: 2022, companies: 80, employees: 1000, revenue: 150 },
      { year: 2023, companies: 100, employees: 1300, revenue: 195 },
      { year: 2024, companies: 120, employees: 1600, revenue: 240 },
      { year: 2025, companies: 135, employees: 1850, revenue: 277 },
      { year: 2026, companies: 150, employees: 2100, revenue: 315 },
    ],
  },
  {
    sectorId: "servizi",
    sectorName: "Servizi Generali",
    icon: "💼",
    currentCompanies: 220,
    currentEmployees: 2800,
    growthTrend: [
      { year: 2021, companies: 100, employees: 1000, revenue: 150 },
      { year: 2022, companies: 130, employees: 1400, revenue: 210 },
      { year: 2023, companies: 160, employees: 1800, revenue: 270 },
      { year: 2024, companies: 190, employees: 2300, revenue: 345 },
      { year: 2025, companies: 205, employees: 2550, revenue: 382 },
      { year: 2026, companies: 220, employees: 2800, revenue: 420 },
    ],
  },
  {
    sectorId: "multiservizi",
    sectorName: "Multiservizi e Pulizie",
    icon: "🧹",
    currentCompanies: 250,
    currentEmployees: 3200,
    growthTrend: [
      { year: 2021, companies: 110, employees: 1100, revenue: 165 },
      { year: 2022, companies: 140, employees: 1500, revenue: 225 },
      { year: 2023, companies: 170, employees: 2000, revenue: 300 },
      { year: 2024, companies: 205, employees: 2600, revenue: 390 },
      { year: 2025, companies: 227, employees: 2900, revenue: 435 },
      { year: 2026, companies: 250, employees: 3200, revenue: 480 },
    ],
  },
];

export function getOverallStats(): OverallStats {
  const totalCompanies = sectorStatistics.reduce(
    (sum, sector) => sum + sector.currentCompanies,
    0
  );
  const totalEmployees = sectorStatistics.reduce(
    (sum, sector) => sum + sector.currentEmployees,
    0
  );
  const totalRevenue = sectorStatistics.reduce(
    (sum, sector) => sum + sector.growthTrend[sector.growthTrend.length - 1].revenue,
    0
  );

  // Calculate growth rate from 2021 to 2026
  const companies2021 = sectorStatistics.reduce(
    (sum, sector) => sum + sector.growthTrend[0].companies,
    0
  );
  const growthRate = ((totalCompanies - companies2021) / companies2021) * 100;

  return {
    totalCompanies,
    totalEmployees,
    totalRevenue,
    growthRate,
  };
}

export function getSectorStats(sectorId: string): SectorStats | undefined {
  return sectorStatistics.find((sector) => sector.sectorId === sectorId);
}

export function getGrowthTrendData() {
  // Combine all sectors' growth data by year
  const yearMap = new Map<number, any>();

  sectorStatistics.forEach((sector) => {
    sector.growthTrend.forEach((data) => {
      if (!yearMap.has(data.year)) {
        yearMap.set(data.year, {
          year: data.year,
          companies: 0,
          employees: 0,
          revenue: 0,
        });
      }
      const yearData = yearMap.get(data.year)!;
      yearData.companies += data.companies;
      yearData.employees += data.employees;
      yearData.revenue += data.revenue;
    });
  });

  return Array.from(yearMap.values()).sort((a, b) => a.year - b.year);
}

export function getSectorGrowthComparison() {
  // Get latest year data for each sector
  return sectorStatistics.map((sector) => {
    const latestData = sector.growthTrend[sector.growthTrend.length - 1];
    const firstData = sector.growthTrend[0];
    const companyGrowth =
      ((latestData.companies - firstData.companies) / firstData.companies) * 100;

    return {
      name: sector.sectorName,
      companies: latestData.companies,
      employees: latestData.employees,
      revenue: latestData.revenue,
      growth: companyGrowth,
    };
  });
}
