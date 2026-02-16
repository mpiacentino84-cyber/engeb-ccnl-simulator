// CCNL Database with salary and cost information
export interface CCNLLevel {
  level: string;
  description: string;
  baseSalaryMonthly: number; // Monthly gross salary in EUR
}

export interface ContributionDetail {
  name: string;
  description: string;
  percentage: number; // as % of gross salary
  amount: number; // fixed amount in EUR if not percentage-based
  isPercentage: boolean; // true if percentage, false if fixed amount
  category: "bilateral" | "welfare" | "health" | "pension" | "other";
}

export interface CCNL {
  id: string;
  name: string;
  sector: string;
  sectorCategory: string; // Main sector category for filtering
  issuer?: string | null;
  validFrom?: string | null;
  validTo?: string | null;
  levels: CCNLLevel[];
  additionalCosts: {
    tfr: number; // TFR (Trattamento Fine Rapporto) as % of gross salary
    socialContributions: number; // Employer social contributions as % of gross salary
    otherBenefits: number; // Other benefits as % of gross salary
  };
  contributions: ContributionDetail[]; // Detailed contribution breakdown
  description: string;
}

// Sector categories for filtering
export const SECTOR_CATEGORIES = [
  { id: "all", name: "Tutti i Settori", icon: "🌐" },
  { id: "turismo", name: "Turismo e Ospitalità", icon: "🏨" },
  { id: "commercio", name: "Commercio e Distribuzione", icon: "🏪" },
  { id: "artigianato", name: "Artigianato", icon: "🔧" },
  { id: "logistica", name: "Logistica e Trasporto", icon: "🚚" },
  { id: "servizi", name: "Servizi Generali", icon: "💼" },
  { id: "multiservizi", name: "Multiservizi e Pulizie", icon: "🧹" },
  { id: "sanita", name: "Sanità e Assistenza", icon: "🏥" },
];

export const ccnlDatabase: CCNL[] = [
  {
    id: "engeb_multisettore",
    name: "ENGEB Multisettore",
    sector: "Multiservizi, Pulizie, Logistica",
    sectorCategory: "multiservizi",
    issuer: "CONFAEL-FAL / CONFIMITALIA / SNALP",
    validFrom: "2022-06-01",
    validTo: "2025-05-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      {
        level: "Livello 1",
        description: "Operaio generico",
        baseSalaryMonthly: 1450,
      },
      {
        level: "Livello 2",
        description: "Operaio specializzato",
        baseSalaryMonthly: 1550,
      },
      {
        level: "Livello 3",
        description: "Capo operaio / Coordinatore",
        baseSalaryMonthly: 1700,
      },
      {
        level: "Livello 4",
        description: "Impiegato amministrativo",
        baseSalaryMonthly: 1850,
      },
    ],
    additionalCosts: {
      tfr: 6.5,
      socialContributions: 24.0,
      otherBenefits: 2.5,
    },
    description:
      "Contratto per il settore multisettore, applicabile a imprese di multiservizi, pulizie e logistica",
  },
  {
    id: "engeb_turismo",
    name: "ENGEB Turismo e Pubblici Esercizi",
    sector: "Turismo, Alberghi, Ristorazione",
    sectorCategory: "turismo",
    issuer: "CONFAEL-FAL / SNALP",
    validFrom: "2023-06-01",
    validTo: "2026-05-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      {
        level: "Livello 1",
        description: "Cameriere, Barista",
        baseSalaryMonthly: 1400,
      },
      {
        level: "Livello 2",
        description: "Capo cameriere, Barista senior",
        baseSalaryMonthly: 1550,
      },
      {
        level: "Livello 3",
        description: "Cuoco, Chef",
        baseSalaryMonthly: 1750,
      },
      {
        level: "Livello 4",
        description: "Direttore di sala, Maître",
        baseSalaryMonthly: 1950,
      },
      {
        level: "Livello 5",
        description: "Responsabile struttura",
        baseSalaryMonthly: 2200,
      },
    ],
    additionalCosts: {
      tfr: 6.5,
      socialContributions: 23.0,
      otherBenefits: 3.0,
    },
    description:
      "Contratto per il settore turismo, alberghi, ristorazione e pubblici esercizi",
  },
  {
    id: "engeb_commercio",
    name: "ENGEB Commercio e Distribuzione",
    sector: "Commercio, Distribuzione, Retail",
    sectorCategory: "commercio",
    issuer: "CONFIMITALIA / CONFAEL",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      {
        level: "Livello 1",
        description: "Addetto vendite",
        baseSalaryMonthly: 1480,
      },
      {
        level: "Livello 2",
        description: "Commesso specializzato",
        baseSalaryMonthly: 1600,
      },
      {
        level: "Livello 3",
        description: "Capo reparto",
        baseSalaryMonthly: 1800,
      },
      {
        level: "Livello 4",
        description: "Responsabile di negozio",
        baseSalaryMonthly: 2000,
      },
      {
        level: "Livello 5",
        description: "Direttore di punto vendita",
        baseSalaryMonthly: 2300,
      },
    ],
    additionalCosts: {
      tfr: 6.5,
      socialContributions: 24.5,
      otherBenefits: 2.0,
    },
    description:
      "Contratto per il settore commercio, distribuzione e servizi correlati",
  },
  {
    id: "ebinter_terziario",
    name: "EBINTER Terziario, Distribuzione e Servizi",
    sector: "Terziario, Distribuzione, Servizi",
    sectorCategory: "servizi",
    issuer: "Confcommercio / FILCAMS CGIL / FISASCAT CISL",
    validFrom: "2023-04-01",
    validTo: "2027-03-31",
    contributions: [
      {
        name: "Contributo EBINTER",
        description: "Contributo per la gestione dell'Ente Bilaterale EBINTER",
        percentage: 0.45,
        amount: 0,
        isPercentage: true,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Cassa per l'Assistenza e Previdenza Complementare",
        percentage: 1.1,
        amount: 0,
        isPercentage: true,
        category: "pension",
      },
      {
        name: "Assistenza Sanitaria",
        description: "Copertura sanitaria integrativa",
        percentage: 0.7,
        amount: 0,
        isPercentage: true,
        category: "health",
      },
      {
        name: "Fondo Previdenziale",
        description: "Contributo al fondo previdenziale",
        percentage: 1.4,
        amount: 0,
        isPercentage: true,
        category: "pension",
      },
    ],
    levels: [
      {
        level: "Livello 1",
        description: "Addetto generico",
        baseSalaryMonthly: 1500,
      },
      {
        level: "Livello 2",
        description: "Addetto specializzato",
        baseSalaryMonthly: 1620,
      },
      {
        level: "Livello 3",
        description: "Capo area",
        baseSalaryMonthly: 1850,
      },
      {
        level: "Livello 4",
        description: "Responsabile di punto",
        baseSalaryMonthly: 2050,
      },
    ],
    additionalCosts: {
      tfr: 6.5,
      socialContributions: 24.5,
      otherBenefits: 2.5,
    },
    description:
      "Contratto EBINTER per il settore terziario, distribuzione e servizi",
  },
  {
    id: "engeb_turismo_ospitalita",
    name: "ENGEB Turismo e Ospitalita",
    sector: "Turismo, Ospitalita, Ristorazione",
    sectorCategory: "turismo",
    issuer: "CONFAEL-FAL / SNALP",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      {
        level: "Livello 1",
        description: "Cameriere, Barista",
        baseSalaryMonthly: 1420,
      },
      {
        level: "Livello 2",
        description: "Capo cameriere",
        baseSalaryMonthly: 1570,
      },
      {
        level: "Livello 3",
        description: "Cuoco",
        baseSalaryMonthly: 1800,
      },
      {
        level: "Livello 4",
        description: "Responsabile di sala",
        baseSalaryMonthly: 2000,
      },
    ],
    additionalCosts: {
      tfr: 6.5,
      socialContributions: 23.5,
      otherBenefits: 3.5,
    },
    description: "Contratto EBNT per il settore turismo",
  },
  {
    id: "ebil_intersettoriale",
    name: "EBIL Intersettoriale",
    sector: "Intersettoriale MPMI",
    sectorCategory: "servizi",
    issuer: "EBIL / CONFIMPRESE ITALIA / FESICA CONFSAL",
    validFrom: "2022-01-01",
    validTo: "2025-12-31",
    contributions: [
      {
        name: "Contributo EBIL",
        description: "Contributo per la gestione dell'Ente Bilaterale EBIL",
        percentage: 0.35,
        amount: 0,
        isPercentage: true,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Cassa per l'Assistenza e Previdenza Complementare",
        percentage: 0.8,
        amount: 0,
        isPercentage: true,
        category: "pension",
      },
      {
        name: "Assistenza Sanitaria",
        description: "Copertura sanitaria integrativa",
        percentage: 0.5,
        amount: 0,
        isPercentage: true,
        category: "health",
      },
      {
        name: "Fondo Previdenziale",
        description: "Contributo al fondo previdenziale",
        percentage: 1.0,
        amount: 0,
        isPercentage: true,
        category: "pension",
      },
    ],
    levels: [
      {
        level: "Livello 1",
        description: "Operaio generico",
        baseSalaryMonthly: 1400,
      },
      {
        level: "Livello 2",
        description: "Operaio specializzato",
        baseSalaryMonthly: 1520,
      },
      {
        level: "Livello 3",
        description: "Capo operaio",
        baseSalaryMonthly: 1680,
      },
      {
        level: "Livello 4",
        description: "Impiegato",
        baseSalaryMonthly: 1800,
      },
      {
        level: "Livello 5",
        description: "Responsabile",
        baseSalaryMonthly: 2100,
      },
    ],
    additionalCosts: {
      tfr: 6.5,
      socialContributions: 23.0,
      otherBenefits: 2.0,
    },
    description: "Contratto EBIL intersettoriale per piccole e medie imprese",
  },
  {
    id: "ccnl_artigianato",
    name: "Artigianato e Piccole Imprese",
    sector: "Artigianato",
    sectorCategory: "artigianato",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Contributo Ente Bilaterale",
        description: "Contributo per la gestione dell'ente bilaterale artigianato",
        percentage: 0.3,
        amount: 0,
        isPercentage: true,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Cassa per l'Assistenza e Previdenza Complementare",
        percentage: 0.7,
        amount: 0,
        isPercentage: true,
        category: "pension",
      },
      {
        name: "Assistenza Sanitaria",
        description: "Copertura sanitaria integrativa",
        percentage: 0.4,
        amount: 0,
        isPercentage: true,
        category: "health",
      },
      {
        name: "Fondo Previdenziale Artigianato",
        description: "Contributo al fondo previdenziale artigianato",
        percentage: 0.9,
        amount: 0,
        isPercentage: true,
        category: "pension",
      },
    ],
    levels: [
      {
        level: "Livello 1",
        description: "Apprendista",
        baseSalaryMonthly: 1100,
      },
      {
        level: "Livello 2",
        description: "Operaio generico",
        baseSalaryMonthly: 1380,
      },
      {
        level: "Livello 3",
        description: "Operaio specializzato",
        baseSalaryMonthly: 1550,
      },
      {
        level: "Livello 4",
        description: "Capo operaio",
        baseSalaryMonthly: 1750,
      },
    ],
    additionalCosts: {
      tfr: 6.5,
      socialContributions: 23.5,
      otherBenefits: 1.5,
    },
    description:
      "Contratto per il settore artigianato e piccole imprese industriali",
  },
  {
    id: "engeb_sanita",
    name: "ENGEB Sanita e Assistenza",
    sector: "Sanita, Assistenza Socio-Sanitaria",
    sectorCategory: "sanita",
    issuer: "CONFAEL-FAL / CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      {
        level: "Livello 1",
        description: "Operatore Socio-Sanitario",
        baseSalaryMonthly: 1450,
      },
      {
        level: "Livello 2",
        description: "Infermiere",
        baseSalaryMonthly: 1650,
      },
      {
        level: "Livello 3",
        description: "Coordinatore",
        baseSalaryMonthly: 1900,
      },
      {
        level: "Livello 4",
        description: "Responsabile",
        baseSalaryMonthly: 2200,
      },
    ],
    additionalCosts: {
      tfr: 6.91,
      socialContributions: 8.5,
      otherBenefits: 2.0,
    },
    description:
      "Contratto per il settore sanita e assistenza socio-sanitaria",
  },
  {
    id: "engeb_agricoli",
    name: "ENGEB Operatori Agricoli e Florovivaisti",
    sector: "Agricoltura, Florovivaismo",
    sectorCategory: "agricoltura",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Operaio Agricolo", baseSalaryMonthly: 1300 },
      { level: "Livello 2", description: "Specializzato", baseSalaryMonthly: 1500 },
      { level: "Livello 3", description: "Caposquadra", baseSalaryMonthly: 1700 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 1.5 },
    description: "Contratto per operatori agricoli e florovivaisti",
  },
  {
    id: "engeb_callcenter",
    name: "ENGEB Call Center e Telemarketing",
    sector: "Telecomunicazioni, Call Center",
    sectorCategory: "telecomunicazioni",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Operatore Call Center", baseSalaryMonthly: 1200 },
      { level: "Livello 2", description: "Supervisore", baseSalaryMonthly: 1450 },
      { level: "Livello 3", description: "Team Leader", baseSalaryMonthly: 1700 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 1.5 },
    description: "Contratto per operatori call center e telemarketing",
  },
  {
    id: "engeb_logistica",
    name: "ENGEB Logistica e Trasporto Merci",
    sector: "Logistica, Trasporto",
    sectorCategory: "logistica",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Magazziniere", baseSalaryMonthly: 1350 },
      { level: "Livello 2", description: "Autista", baseSalaryMonthly: 1550 },
      { level: "Livello 3", description: "Capoturno", baseSalaryMonthly: 1800 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 2.0 },
    description: "Contratto per logistica e trasporto merci",
  },
  {
    id: "engeb_pubblica",
    name: "ENGEB Dipendenti Aziende Enti Pubblici",
    sector: "Pubblica Amministrazione",
    sectorCategory: "pubblica",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Operaio", baseSalaryMonthly: 1400 },
      { level: "Livello 2", description: "Impiegato", baseSalaryMonthly: 1650 },
      { level: "Livello 3", description: "Responsabile", baseSalaryMonthly: 1950 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 2.0 },
    description: "Contratto per dipendenti aziende enti pubblici",
  },
  {
    id: "engeb_doppiaggio",
    name: "ENGEB Settore Doppiaggio",
    sector: "Audiovisivo, Doppiaggio",
    sectorCategory: "audiovisivo",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Tecnico Audio", baseSalaryMonthly: 1500 },
      { level: "Livello 2", description: "Doppiatore", baseSalaryMonthly: 1800 },
      { level: "Livello 3", description: "Direttore di Doppiaggio", baseSalaryMonthly: 2200 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 2.0 },
    description: "Contratto per il settore doppiaggio",
  },
  {
    id: "engeb_edilizia",
    name: "ENGEB Edilizia e Affini",
    sector: "Edilizia, Costruzioni",
    sectorCategory: "edilizia",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Operaio Generico", baseSalaryMonthly: 1400 },
      { level: "Livello 2", description: "Operaio Specializzato", baseSalaryMonthly: 1650 },
      { level: "Livello 3", description: "Caposquadra", baseSalaryMonthly: 1950 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 2.0 },
    description: "Contratto per edilizia e affini",
  },
  {
    id: "engeb_igiene",
    name: "ENGEB Igiene Ambientale",
    sector: "Igiene Ambientale, Pulizie",
    sectorCategory: "igiene",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Operaio Pulizie", baseSalaryMonthly: 1250 },
      { level: "Livello 2", description: "Specializzato", baseSalaryMonthly: 1450 },
      { level: "Livello 3", description: "Responsabile Turno", baseSalaryMonthly: 1700 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 1.5 },
    description: "Contratto per igiene ambientale",
  },
  {
    id: "engeb_mobilita",
    name: "ENGEB Mobilità e Trasporto",
    sector: "Mobilità, Trasporto Pubblico",
    sectorCategory: "mobilita",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Conducente", baseSalaryMonthly: 1500 },
      { level: "Livello 2", description: "Capolinea", baseSalaryMonthly: 1750 },
      { level: "Livello 3", description: "Responsabile Turno", baseSalaryMonthly: 2000 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 2.0 },
    description: "Contratto per mobilità e trasporto",
  },
  {
    id: "engeb_studi_professionali",
    name: "ENGEB Studi Professionali",
    sector: "Servizi Professionali",
    sectorCategory: "servizi",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Impiegato Amministrativo", baseSalaryMonthly: 1400 },
      { level: "Livello 2", description: "Specializzato", baseSalaryMonthly: 1700 },
      { level: "Livello 3", description: "Responsabile", baseSalaryMonthly: 2100 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 2.0 },
    description: "Contratto per studi professionali",
  },
  {
    id: "engeb_pmi",
    name: "ENGEB Piccola Media Industria",
    sector: "Piccola Media Industria",
    sectorCategory: "industria",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Operaio Generico", baseSalaryMonthly: 1350 },
      { level: "Livello 2", description: "Operaio Specializzato", baseSalaryMonthly: 1600 },
      { level: "Livello 3", description: "Caposquadra", baseSalaryMonthly: 1900 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 2.0 },
    description: "Contratto per piccola media industria",
  },
  {
    id: "engeb_vigilanza",
    name: "ENGEB Vigilanza e Servizi Fiduciari",
    sector: "Vigilanza, Sicurezza",
    sectorCategory: "sicurezza",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Vigilante", baseSalaryMonthly: 1400 },
      { level: "Livello 2", description: "Caposquadra", baseSalaryMonthly: 1650 },
      { level: "Livello 3", description: "Responsabile Turno", baseSalaryMonthly: 1950 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 2.0 },
    description: "Contratto per vigilanza e servizi fiduciari",
  },
  {
    id: "engeb_barbieri",
    name: "ENGEB Barbieri e Parrucchieri",
    sector: "Estetica, Barbieri",
    sectorCategory: "estetica",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Apprendista", baseSalaryMonthly: 1100 },
      { level: "Livello 2", description: "Operaio", baseSalaryMonthly: 1400 },
      { level: "Livello 3", description: "Maestro", baseSalaryMonthly: 1700 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 1.5 },
    description: "Contratto per barbieri e parrucchieri",
  },
  {
    id: "engeb_energia",
    name: "ENGEB Aziende Luce e Gas",
    sector: "Energia, Utilities",
    sectorCategory: "energia",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Operaio", baseSalaryMonthly: 1450 },
      { level: "Livello 2", description: "Specializzato", baseSalaryMonthly: 1700 },
      { level: "Livello 3", description: "Caposquadra", baseSalaryMonthly: 2000 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 2.0 },
    description: "Contratto per aziende luce e gas",
  },
  {
    id: "engeb_trasporti",
    name: "ENGEB Trasporto e Spedizione Merci",
    sector: "Trasporto, Spedizione",
    sectorCategory: "logistica",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Autista", baseSalaryMonthly: 1500 },
      { level: "Livello 2", description: "Capoturno", baseSalaryMonthly: 1800 },
      { level: "Livello 3", description: "Responsabile Magazzino", baseSalaryMonthly: 2100 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 2.0 },
    description: "Contratto per trasporto e spedizione merci",
  },
  {
    id: "engeb_lavoro_domestico",
    name: "ENGEB Lavoro Domestico",
    sector: "Lavoro Domestico, Cura Persone",
    sectorCategory: "domestico",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Collaboratore Domestico", baseSalaryMonthly: 1200 },
      { level: "Livello 2", description: "Badante", baseSalaryMonthly: 1450 },
      { level: "Livello 3", description: "Responsabile", baseSalaryMonthly: 1700 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 1.5 },
    description: "Contratto per lavoro domestico",
  },
  {
    id: "engeb_metalmeccanica",
    name: "ENGEB Metalmeccanica Industria",
    sector: "Metalmeccanica, Industria",
    sectorCategory: "industria",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Operaio Generico", baseSalaryMonthly: 1400 },
      { level: "Livello 2", description: "Operaio Specializzato", baseSalaryMonthly: 1700 },
      { level: "Livello 3", description: "Caposquadra", baseSalaryMonthly: 2050 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 2.0 },
    description: "Contratto per metalmeccanica industria",
  },
  {
    id: "engeb_ormeggiatori",
    name: "ENGEB Ormeggiatori e Barcaioli",
    sector: "Porti, Ormeggiatori",
    sectorCategory: "portuale",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Ormeggiatore", baseSalaryMonthly: 1500 },
      { level: "Livello 2", description: "Barcaiolo", baseSalaryMonthly: 1750 },
      { level: "Livello 3", description: "Caposquadra", baseSalaryMonthly: 2050 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 2.0 },
    description: "Contratto per ormeggiatori e barcaioli",
  },
  {
    id: "engeb_personale_artistico",
    name: "ENGEB Personale Artistico",
    sector: "Spettacolo, Arti",
    sectorCategory: "spettacolo",
    issuer: "CONFIMITALIA",
    validFrom: "2023-01-01",
    validTo: "2026-12-31",
    contributions: [
      {
        name: "Ente Bilaterale ENGEB",
        description: "Contributo per la gestione dell'Ente Bilaterale (€10 full-time, €5 part-time)",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "COASCO",
        description: "Contributo COASCO",
        percentage: 0,
        amount: 10,
        isPercentage: false,
        category: "bilateral",
      },
      {
        name: "Assistenza Sanitaria Integrativa",
        description: "Contributo per assistenza sanitaria integrativa",
        percentage: 0,
        amount: 15,
        isPercentage: false,
        category: "health",
      },
    ],
    levels: [
      { level: "Livello 1", description: "Tecnico Spettacolo", baseSalaryMonthly: 1400 },
      { level: "Livello 2", description: "Artista", baseSalaryMonthly: 1800 },
      { level: "Livello 3", description: "Responsabile Produzione", baseSalaryMonthly: 2200 },
    ],
    additionalCosts: { tfr: 6.91, socialContributions: 8.5, otherBenefits: 2.0 },
    description: "Contratto per personale artistico",
  },
];

export function getCCNLById(id: string): CCNL | undefined {
  return ccnlDatabase.find((ccnl) => ccnl.id === id);
}

export function getAllCCNLs(): CCNL[] {
  return ccnlDatabase;
}

export function getCCNLsBySector(sector: string): CCNL[] {
  return ccnlDatabase.filter((ccnl) =>
    ccnl.sector.toLowerCase().includes(sector.toLowerCase())
  );
}

export function getCCNLsByCategory(category: string): CCNL[] {
  if (category === "all") {
    return ccnlDatabase;
  }
  return ccnlDatabase.filter((ccnl) => ccnl.sectorCategory === category);
}

export function getUniqueSectorCategories(): string[] {
  const categories = new Set(ccnlDatabase.map((ccnl) => ccnl.sectorCategory));
  return Array.from(categories);
}

// Separate ENGEB and national CCNL
export const ENGEB_CCNL_IDS = [
  "engeb_multisettore",
  "engeb_turismo",
  "engeb_commercio",
  "engeb_sanita",
  "engeb_agricoli",
  "engeb_callcenter",
  "engeb_logistica",
  "engeb_pubblica",
  "engeb_doppiaggio",
  "engeb_edilizia",
  "engeb_igiene",
  "engeb_mobilita",
  "engeb_studi_professionali",
  "engeb_pmi",
  "engeb_vigilanza",
  "engeb_barbieri",
  "engeb_energia",
  "engeb_trasporti",
  "engeb_lavoro_domestico",
  "engeb_metalmeccanica",
  "engeb_ormeggiatori",
  "engeb_personale_artistico",
];

export const NATIONAL_CCNL_IDS = [
  "ebinter_terziario",
  "ebil_intersettoriale",
  "ccnl_artigianato",
];

export function getENGEBCCNLs(): CCNL[] {
  return ccnlDatabase.filter((ccnl) => ENGEB_CCNL_IDS.includes(ccnl.id));
}

export function getNationalCCNLs(): CCNL[] {
  return ccnlDatabase.filter((ccnl) => NATIONAL_CCNL_IDS.includes(ccnl.id));
}

export function getENGEBCCNLsByCategory(category: string): CCNL[] {
  const engeb = getENGEBCCNLs();
  if (category === "all") {
    return engeb;
  }
  return engeb.filter((ccnl) => ccnl.sectorCategory === category);
}

export interface CostCalculation {
  baseSalary: number;
  tfr: number;
  socialContributions: number;
  otherBenefits: number;
  fixedContributions: number;
  totalMonthlyCost: number;
  totalAnnualCost: number;
  totalCostPercentage: number;
}

export function calculateCost(
  baseSalary: number,
  additionalCosts: CCNL["additionalCosts"],
  ccnl?: CCNL,
  isPartTime: boolean = false
): CostCalculation {
  const tfr = (baseSalary * additionalCosts.tfr) / 100;
  const socialContributions =
    (baseSalary * additionalCosts.socialContributions) / 100;
  const otherBenefits = (baseSalary * additionalCosts.otherBenefits) / 100;

  // Calculate fixed contributions from CCNL contributions array
  let fixedContributions = 0;
  if (ccnl && ccnl.contributions) {
    fixedContributions = ccnl.contributions.reduce((sum, contrib) => {
      if (!contrib.isPercentage) {
        // For Ente Bilaterale ENGEB, apply correct amount based on contract type
        if ((contrib.name === "Contributo ENGEB" || contrib.name === "Ente Bilaterale ENGEB")) {
          return sum + (isPartTime ? 5 : 10); // €5 for part-time, €10 for full-time
        }
        return sum + contrib.amount;
      }
      return sum;
    }, 0);
  }

  const totalMonthlyCost = baseSalary + tfr + socialContributions + otherBenefits + fixedContributions;
  const totalAnnualCost = totalMonthlyCost * 12;
  const totalCostPercentage =
    ((totalMonthlyCost - baseSalary) / baseSalary) * 100;

  return {
    baseSalary,
    tfr,
    socialContributions,
    otherBenefits,
    fixedContributions,
    totalMonthlyCost,
    totalAnnualCost,
    totalCostPercentage,
  };
}
