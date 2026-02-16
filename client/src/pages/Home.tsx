import { useState, useMemo, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
  SelectLabel,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ccnlDatabase,
  calculateCost,
  getCCNLById,
  getENGEBCCNLsByCategory,
  getNationalCCNLs,
  CostCalculation,
  CCNL,
} from "@/lib/ccnlData";
import { transformDBCCNLsToSimulator } from "@/lib/ccnlTransform";
import { Download, TrendingUp, Share2, Check, Copy, FileSpreadsheet } from "lucide-react";
import { SectorFilter } from "@/components/SectorFilter";
import { StatisticsSection } from "@/components/StatisticsSection";
import { LevelComparisonCard, LevelComparisonTable } from "@/components/LevelComparisonCard";
import { ContributionComparison } from "@/components/ContributionComparison";
import { AnnualCostBreakdown } from "@/components/AnnualCostBreakdown";
import { CCNLSearchCombobox } from "@/components/CCNLSearchCombobox";
import { trpc } from "@/lib/trpc";
import { generateExcelReport } from "@/lib/excelExport";
import { toast } from "sonner";

interface ComparisonData {
  ccnlId: string;
  ccnlName: string;
  levelName: string;
  calculation: CostCalculation;
}

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error, isAuthenticated, logout } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCCNL1, setSelectedCCNL1] = useState<string>(
    "engeb_multisettore"
  );
  const [selectedLevel1, setSelectedLevel1] = useState<number>(0);
  const [selectedCCNL2, setSelectedCCNL2] = useState<string>(
    "ebinter_terziario"
  );
  const [selectedLevel2, setSelectedLevel2] = useState<number>(0);
  const [numEmployees, setNumEmployees] = useState<number>(10);
  const [monthsPerYear, setMonthsPerYear] = useState<number>(12);
  const [isPartTime, setIsPartTime] = useState<boolean>(false);
  const [isCustomCCNL2, setIsCustomCCNL2] = useState<boolean>(false);

  // Load custom CCNLs if user is authenticated
  const { data: customCCNLs } = trpc.ccnl.getMyCustom.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Load ENGEB CCNLs from database
  const { data: engebCCNLsData, isLoading: isLoadingENGEB } = trpc.ccnl.getENGEBCCNLs.useQuery({
    sectorCategory: selectedCategory === 'all' ? undefined : selectedCategory,
  }, {
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  // Load national CCNLs from database
  const { data: nationalCCNLsData, isLoading: isLoadingNational } = trpc.ccnl.getNationalCCNLs.useQuery(undefined, {
    // Keep data fresh for 5 minutes
    staleTime: 5 * 60 * 1000,
  });

  // Prefetch all ENGEB CCNLs on mount for instant category switching
  const utils = trpc.useUtils();
  useEffect(() => {
    // Prefetch all categories
    const categories = ['all', 'turismo', 'commercio', 'artigianato', 'logistica', 'servizi', 'multiservizi', 'sanita'];
    categories.forEach(category => {
      utils.ccnl.getENGEBCCNLs.prefetch({
        sectorCategory: category === 'all' ? undefined : category,
      });
    });
  }, [utils]);

  // Get filtered ENGEB CCNL list based on selected category
  const filteredENGEBCCNLs = useMemo(() => {
    if (!engebCCNLsData) return [];
    return transformDBCCNLsToSimulator(engebCCNLsData);
  }, [engebCCNLsData]);

  // Get all national CCNL for comparison
  const nationalCCNLs = useMemo(() => {
    if (!nationalCCNLsData) return [];
    return transformDBCCNLsToSimulator(nationalCCNLsData);
  }, [nationalCCNLsData]);

  // CCNL 1: ENGEB CCNL - Reset if not in filtered list
  const ccnl1 = useMemo(() => {
    const selected = filteredENGEBCCNLs.find((c) => c.id === selectedCCNL1);
    if (!selected) {
      if (filteredENGEBCCNLs.length > 0) {
        setSelectedCCNL1(filteredENGEBCCNLs[0].id);
        setSelectedLevel1(0);
        return filteredENGEBCCNLs[0];
      }
      return null;
    }
    if (selected && selectedLevel1 >= selected.levels.length) {
      setSelectedLevel1(0);
    }
    return selected;
  }, [selectedCCNL1, filteredENGEBCCNLs, selectedLevel1]);

  // CCNL 2: National CCNL or Custom CCNL
  const ccnl2 = useMemo(() => {
    // Check if it's a custom CCNL (starts with 'custom_')
    if (selectedCCNL2.startsWith('custom_') && customCCNLs) {
      const customId = parseInt(selectedCCNL2.replace('custom_', ''));
      const customCCNL = customCCNLs.find(c => c.id === customId);
      if (customCCNL) {
        // Convert custom CCNL to format compatible with calculateCost
        return {
          id: customCCNL.externalId,
          name: customCCNL.name,
          sector: customCCNL.sector,
          sectorCategory: customCCNL.sectorCategory,
          issuer: customCCNL.issuer,
          validFrom: customCCNL.validFrom,
          validTo: customCCNL.validTo,
          description: `CCNL Personalizzato - ${customCCNL.name}`,
          levels: customCCNL.levels.map((l: any) => ({
            level: l.level,
            description: l.description,
            baseSalaryMonthly: l.baseSalaryMonthly,
          })),
          additionalCosts: customCCNL.additionalCosts ? {
            tfr: Number(customCCNL.additionalCosts.tfr) || 0,
            socialContributions: Number(customCCNL.additionalCosts.socialContributions) || 0,
            otherBenefits: Number(customCCNL.additionalCosts.otherBenefits) || 0,
          } : {
            tfr: 0,
            socialContributions: 0,
            otherBenefits: 0,
          },
          contributions: customCCNL.contributions.map((c: any) => ({
            name: c.name,
            amount: c.amount,
            description: c.description || '',
            category: c.category,
            percentage: 0,
            isPercentage: false,
          })),
        };
      }
    }
    
    // Otherwise, get from national CCNLs loaded from database
    const selected = nationalCCNLs.find((c) => c.id === selectedCCNL2);
    if (selected && selectedLevel2 >= selected.levels.length) {
      setSelectedLevel2(0);
    }
    return selected;
  }, [selectedCCNL2, selectedLevel2, customCCNLs, nationalCCNLs]);

  const calculation1 = useMemo(() => {
    if (!ccnl1) return null;
    return calculateCost(
      ccnl1.levels[selectedLevel1].baseSalaryMonthly,
      ccnl1.additionalCosts,
      ccnl1,
      isPartTime
    );
  }, [ccnl1, selectedLevel1, isPartTime]);

  const calculation2 = useMemo(() => {
    if (!ccnl2) return null;
    return calculateCost(
      ccnl2.levels[selectedLevel2].baseSalaryMonthly,
      ccnl2.additionalCosts,
      ccnl2,
      isPartTime
    );
  }, [ccnl2, selectedLevel2, isPartTime]);

  const comparisonData = useMemo(() => {
    if (!calculation1 || !calculation2) return [];
    return [
      {
        name: ccnl1?.name || "CCNL 1",
        "Stipendio Base": calculation1.baseSalary,
        "Costi Aggiuntivi":
          calculation1.totalMonthlyCost - calculation1.baseSalary,
        "Costo Totale": calculation1.totalMonthlyCost,
      },
      {
        name: ccnl2?.name || "CCNL 2",
        "Stipendio Base": calculation2.baseSalary,
        "Costi Aggiuntivi":
          calculation2.totalMonthlyCost - calculation2.baseSalary,
        "Costo Totale": calculation2.totalMonthlyCost,
      },
    ];
  }, [calculation1, calculation2, ccnl1?.name, ccnl2?.name]);

  const costBreakdownData = useMemo(() => {
    if (!calculation1) return [];
    return [
      { name: "Stipendio Base", value: calculation1.baseSalary },
      { name: "TFR", value: calculation1.tfr },
      { name: "Contributi Sociali", value: calculation1.socialContributions },
      { name: "Altri Benefici", value: calculation1.otherBenefits },
    ];
  }, [calculation1]);

  const totalAnnualCost1 = useMemo(() => {
    if (!calculation1) return 0;
    return calculation1.totalAnnualCost * numEmployees * (monthsPerYear / 12);
  }, [calculation1, numEmployees, monthsPerYear]);

  const totalAnnualCost2 = useMemo(() => {
    if (!calculation2) return 0;
    return calculation2.totalAnnualCost * numEmployees * (monthsPerYear / 12);
  }, [calculation2, numEmployees, monthsPerYear]);

  const savings = totalAnnualCost1 - totalAnnualCost2;
  const savingsPercentage =
    totalAnnualCost1 > 0 ? (savings / totalAnnualCost1) * 100 : 0;

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];
  const [shareLink, setShareLink] = useState<string>("");
  const [showShareDialog, setShowShareDialog] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const handleShare = () => {
    // Create share data object
    const shareData = {
      ccnl1Id: selectedCCNL1,
      level1: selectedLevel1,
      ccnl2Id: selectedCCNL2,
      level2: selectedLevel2,
      numEmployees,
      monthsPerYear,
      isPartTime,
    };

    // Encode data to Base64
    const encoded = btoa(JSON.stringify(shareData));
    
    // Generate share link
    const link = `${window.location.origin}/share?data=${encoded}`;
    setShareLink(link);
    setShowShareDialog(true);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy link:", error);
    }
  };

  const handleExportExcel = async () => {
    if (!ccnl1 || !ccnl2 || !calculation1 || !calculation2) {
      toast.error("Impossibile esportare: dati mancanti");
      return;
    }

    try {
      toast.info("Generazione file Excel in corso...");
      await generateExcelReport({
        ccnl1,
        ccnl2,
        selectedLevel1,
        selectedLevel2,
        calculation1,
        calculation2,
        numEmployees,
        monthsPerYear,
        isPartTime,
      });
      toast.success("File Excel scaricato con successo!");
    } catch (error) {
      console.error("Errore durante l'export Excel:", error);
      toast.error("Errore durante la generazione del file Excel");
    }
  };

  const handleDownloadPDF = () => {
    // Simple PDF generation using browser print
    const printWindow = window.open("", "", "width=800,height=600");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Confronto Costi CCNL</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              h1 { color: #1e40af; }
              table { width: 100%; border-collapse: collapse; margin: 20px 0; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
              th { background-color: #3b82f6; color: white; }
              .summary { background-color: #f0f9ff; padding: 15px; border-radius: 5px; margin: 20px 0; }
              .positive { color: #10b981; font-weight: bold; }
              .negative { color: #ef4444; font-weight: bold; }
            </style>
          </head>
          <body>
            <h1>Analisi Comparativa Costi CCNL</h1>
            <p>Data: ${new Date().toLocaleDateString("it-IT")}</p>
            
            <h2>Parametri di Confronto</h2>
            <ul>
              <li>CCNL 1: ${ccnl1?.name}</li>
              <li>Livello: ${ccnl1?.levels[selectedLevel1].description}</li>
              <li>CCNL 2: ${ccnl2?.name}</li>
              <li>Livello: ${ccnl2?.levels[selectedLevel2].description}</li>
              <li>Numero Dipendenti: ${numEmployees}</li>
              <li>Mesi per Anno: ${monthsPerYear}</li>
            </ul>

            <h2>Costo Mensile per Dipendente</h2>
            <table>
              <tr>
                <th>Voce</th>
                <th>${ccnl1?.name}</th>
                <th>${ccnl2?.name}</th>
              </tr>
              <tr>
                <td>Stipendio Base</td>
                <td>€${calculation1?.baseSalary.toFixed(2)}</td>
                <td>€${calculation2?.baseSalary.toFixed(2)}</td>
              </tr>
              <tr>
                <td>TFR</td>
                <td>€${calculation1?.tfr.toFixed(2)}</td>
                <td>€${calculation2?.tfr.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Contributi Sociali</td>
                <td>€${calculation1?.socialContributions.toFixed(2)}</td>
                <td>€${calculation2?.socialContributions.toFixed(2)}</td>
              </tr>
              <tr>
                <td>Costo Totale Mensile</td>
                <td><strong>€${calculation1?.totalMonthlyCost.toFixed(2)}</strong></td>
                <td><strong>€${calculation2?.totalMonthlyCost.toFixed(2)}</strong></td>
              </tr>
            </table>

            <h2>Costo Annuale Totale</h2>
            <div class="summary">
              <p>CCNL 1 (${ccnl1?.name}): <strong>€${totalAnnualCost1.toFixed(2)}</strong></p>
              <p>CCNL 2 (${ccnl2?.name}): <strong>€${totalAnnualCost2.toFixed(2)}</strong></p>
              <p class="${savings > 0 ? "positive" : "negative"}">
                Differenza: ${savings > 0 ? "Risparmio" : "Maggior Costo"} di €${Math.abs(savings).toFixed(2)} (${Math.abs(savingsPercentage).toFixed(2)}%)
              </p>
            </div>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-3">
            Simulatore Costi CCNL
          </h1>
          <p className="text-lg text-blue-700">
            Confronta il costo del lavoro tra i diversi Contratti Collettivi
            Nazionali
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Configuration Panel */}
          <Card className="lg:col-span-1 shadow-lg">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="text-blue-900">Configurazione</CardTitle>
              <CardDescription>
                Seleziona i CCNL e i parametri da confrontare
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              {/* Sector Filter */}
              <SectorFilter
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
              />
              <div className="border-t pt-4" />
              {filteredENGEBCCNLs.length === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 text-sm text-yellow-800">
                  Nessun CCNL ENGEB disponibile per il settore selezionato.
                </div>
              )}
              {/* CCNL 1 Selection - ENGEB */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  CCNL 1 - ENGEB
                  <span className="text-xs font-normal text-blue-600 ml-2">
                    (Contratti ENGEB)
                  </span>
                </Label>
                
                {/* Quick Search */}
                <CCNLSearchCombobox
                  value={selectedCCNL1}
                  onSelect={(ccnl) => {
                    if (ccnl) {
                      setSelectedCCNL1(ccnl.externalId);
                      setSelectedLevel1(0);
                    }
                  }}
                  placeholder="🔍 Ricerca rapida CCNL..."
                />
                
                <div className="text-xs text-center text-gray-500">oppure</div>
                
                <Select value={selectedCCNL1} onValueChange={setSelectedCCNL1}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredENGEBCCNLs.map((ccnl) => (
                      <SelectItem key={ccnl.id} value={ccnl.id}>
                        {ccnl.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {ccnl1 && (
                  <>
                    <Select
                      value={selectedLevel1.toString()}
                      onValueChange={(val) => setSelectedLevel1(parseInt(val))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ccnl1.levels.map((level, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            {level.level} - {level.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {ccnl1.sector}
                    </p>
                    
                    {/* Use as Base button */}
                    {isAuthenticated && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          const templateData = {
                            name: ccnl1.name,
                            sector: ccnl1.sector,
                            sectorCategory: ccnl1.sectorCategory,
                            issuer: ccnl1.issuer,
                            validFrom: ccnl1.validFrom,
                            validTo: ccnl1.validTo,
                            description: ccnl1.description,
                            levels: ccnl1.levels,
                            additionalCosts: ccnl1.additionalCosts,
                            contributions: ccnl1.contributions,
                          };
                          const encoded = btoa(JSON.stringify(templateData));
                          window.location.href = `/my-ccnl?template=${encoded}`;
                        }}
                      >
                        📋 Usa come Base per CCNL Personalizzato
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* CCNL 2 Selection - National CCNL or Custom */}
              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  CCNL 2 - Confronto
                  <span className="text-xs font-normal text-green-600 ml-2">
                    (CCNL Competitor o Personalizzato)
                  </span>
                </Label>
                
                {/* Quick Search */}
                <CCNLSearchCombobox
                  value={selectedCCNL2}
                  onSelect={(ccnl) => {
                    if (ccnl) {
                      setSelectedCCNL2(ccnl.externalId);
                      setSelectedLevel2(0);
                    }
                  }}
                  placeholder="🔍 Ricerca rapida CCNL..."
                />
                
                <div className="text-xs text-center text-gray-500">oppure</div>
                
                <Select value={selectedCCNL2} onValueChange={setSelectedCCNL2}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* National CCNLs */}
                    <SelectGroup>
                      <SelectLabel>CCNL Nazionali</SelectLabel>
                      {nationalCCNLs.map((ccnl) => (
                        <SelectItem key={ccnl.id} value={ccnl.id}>
                          {ccnl.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                    
                    {/* Custom CCNLs */}
                    {isAuthenticated && customCCNLs && customCCNLs.length > 0 && (
                      <SelectGroup>
                        <SelectLabel>I Miei CCNL Personalizzati</SelectLabel>
                        {customCCNLs.map((ccnl) => (
                          <SelectItem key={`custom_${ccnl.id}`} value={`custom_${ccnl.id}`}>
                            {ccnl.name} (Personalizzato)
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    )}
                  </SelectContent>
                </Select>

                {ccnl2 && (
                  <>
                    <Select
                      value={selectedLevel2.toString()}
                      onValueChange={(val) => setSelectedLevel2(parseInt(val))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ccnl2.levels.map((level, idx) => (
                          <SelectItem key={idx} value={idx.toString()}>
                            {level.level} - {level.description}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {ccnl2.sector}
                    </p>
                    
                    {/* Use as Base button */}
                    {isAuthenticated && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-2"
                        onClick={() => {
                          const templateData = {
                            name: ccnl2.name,
                            sector: ccnl2.sector,
                            sectorCategory: ccnl2.sectorCategory,
                            issuer: ccnl2.issuer,
                            validFrom: ccnl2.validFrom,
                            validTo: ccnl2.validTo,
                            description: ccnl2.description,
                            levels: ccnl2.levels,
                            additionalCosts: ccnl2.additionalCosts,
                            contributions: ccnl2.contributions,
                          };
                          const encoded = btoa(JSON.stringify(templateData));
                          window.location.href = `/my-ccnl?template=${encoded}`;
                        }}
                      >
                        📋 Usa come Base per CCNL Personalizzato
                      </Button>
                    )}
                  </>
                )}
              </div>

              {/* Parameters */}
              <div className="space-y-3 pt-4 border-t">
                <Label className="text-sm font-semibold text-gray-700">
                  Numero Dipendenti
                </Label>
                <Input
                  type="number"
                  min="1"
                  value={numEmployees}
                  onChange={(e) => setNumEmployees(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-gray-700">
                  Mesi per Anno
                </Label>
                <Input
                  type="number"
                  min="1"
                  max="12"
                  value={monthsPerYear}
                  onChange={(e) => setMonthsPerYear(parseInt(e.target.value))}
                  className="w-full"
                />
              </div>

              {/* Part-Time Toggle */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-sm font-semibold text-gray-700">
                      Contratto Part-Time
                    </Label>
                    <p className="text-xs text-gray-500">
                      Ente Bilaterale ENGEB: €5 per part-time, €10 per full-time
                    </p>
                  </div>
                  <Switch
                    checked={isPartTime}
                    onCheckedChange={setIsPartTime}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleShare}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Condividi Confronto
                </Button>
                <Button
                  onClick={handleExportExcel}
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  <FileSpreadsheet className="mr-2 h-4 w-4" />
                  Esporta Excel
                </Button>
                <Button
                  onClick={handleDownloadPDF}
                  variant="outline"
                  className="w-full"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Scarica Rapporto PDF
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-600">
                    {ccnl1?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    €{calculation1?.totalMonthlyCost.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Costo mensile</p>
                  <div className="text-lg font-semibold text-gray-800 mt-3">
                    €{totalAnnualCost1.toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-500">Costo annuale totale</p>
                </CardContent>
              </Card>

              <Card className="shadow-md">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-gray-600">
                    {ccnl2?.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    €{calculation2?.totalMonthlyCost.toFixed(2)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Costo mensile</p>
                  <div className="text-lg font-semibold text-gray-800 mt-3">
                    €{totalAnnualCost2.toFixed(0)}
                  </div>
                  <p className="text-xs text-gray-500">Costo annuale totale</p>
                </CardContent>
              </Card>
            </div>

            {/* Savings Card */}
            <Card
              className={`shadow-md border-2 ${savings < 0 ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp
                    className={`h-5 w-5 ${savings < 0 ? "text-green-600" : "text-red-600"}`}
                  />
                  <span
                    className={
                      savings < 0 ? "text-green-700" : "text-red-700"
                    }
                  >
                    {savings < 0 ? "Risparmio ENGEB" : "Costo Aggiuntivo ENGEB"}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className={`text-3xl font-bold ${savings < 0 ? "text-green-600" : "text-red-600"}`}
                >
                  €{Math.abs(savings).toFixed(0)}
                </div>
                <p
                  className={`text-sm mt-2 ${savings < 0 ? "text-green-700" : "text-red-700"}`}
                >
                  {savings < 0 ? "Risparmio scegliendo ENGEB" : "Costo aggiuntivo con ENGEB"}
                </p>
                <p
                  className={`text-sm font-semibold ${savings < 0 ? "text-green-700" : "text-red-700"}`}
                >
                  {Math.abs(savingsPercentage).toFixed(2)}% all'anno
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
        {/* Level Comparison Section */}
        {ccnl1 && ccnl2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            <LevelComparisonCard
              ccnlName={ccnl1.name}
              ccnlIssuer={ccnl1.issuer || "N/D"}
              level={ccnl1.levels[selectedLevel1]}
              isENGEB={true}
            />
            <LevelComparisonCard
              ccnlName={ccnl2.name}
              ccnlIssuer={ccnl2.issuer || "N/D"}
              level={ccnl2.levels[selectedLevel2]}
              isENGEB={false}
            />
          </div>
        )}

        {/* Level Comparison Table */}
        {ccnl1 && ccnl2 && (
          <div className="mt-8">
            <LevelComparisonTable
              ccnl1Name={ccnl1.name}
              ccnl1Level={ccnl1.levels[selectedLevel1]}
              ccnl2Name={ccnl2.name}
              ccnl2Level={ccnl2.levels[selectedLevel2]}
            />
          </div>
        )}

        {/* Contribution Comparison */}
        {ccnl1 && ccnl2 && (
          <div className="mt-8">
            <ContributionComparison
              ccnl1Name={ccnl1.name}
              ccnl1Contributions={ccnl1.contributions}
              ccnl1BaseSalary={ccnl1.levels[selectedLevel1].baseSalaryMonthly}
              ccnl2Name={ccnl2.name}
              ccnl2Contributions={ccnl2.contributions}
              ccnl2BaseSalary={ccnl2.levels[selectedLevel2].baseSalaryMonthly}
            />
          </div>
        )}

        {/* Annual Cost Breakdown */}
        {ccnl1 && ccnl2 && calculation1 && calculation2 && (
          <div className="mt-8">
            <AnnualCostBreakdown
              ccnl1Name={ccnl1.name}
              ccnl1Calculation={calculation1}
              ccnl2Name={ccnl2.name}
              ccnl2Calculation={calculation2}
              numEmployees={numEmployees}
              monthsPerYear={monthsPerYear}
            />
          </div>
        )}

        {/* Results Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
          {/* Comparison Chart */}
          <Card className="shadow-lg">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle>Confronto Costi Mensili</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(value: any) => `€${typeof value === 'number' ? value.toFixed(2) : value}`} />
                  <Legend />
                  <Bar dataKey="Stipendio Base" fill="#3b82f6" />
                  <Bar dataKey="Costi Aggiuntivi" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Cost Breakdown Chart */}
          {calculation1 && (
            <Card className="shadow-lg">
              <CardHeader className="bg-blue-50 border-b">
                <CardTitle>Composizione Costo - {ccnl1?.name}</CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={costBreakdownData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) =>
                        `${name}: €${value.toFixed(0)}`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => `€${typeof value === 'number' ? value.toFixed(2) : value}`} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Detailed Comparison Table */}
        <Card className="mt-8 shadow-lg">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle>Analisi Dettagliata</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-blue-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-700">
                      Voce
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      {ccnl1?.name}
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      {ccnl2?.name}
                    </th>
                    <th className="text-right py-3 px-4 font-semibold text-gray-700">
                      Differenza
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">Stipendio Base Mensile</td>
                    <td className="text-right py-3 px-4">
                      €{calculation1?.baseSalary.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-4">
                      €{calculation2?.baseSalary.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      €
                      {(
                        (calculation2?.baseSalary || 0) -
                        (calculation1?.baseSalary || 0)
                      ).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">TFR (% su stipendio)</td>
                    <td className="text-right py-3 px-4">
                      €{calculation1?.tfr.toFixed(2)} (
                      {ccnl1?.additionalCosts.tfr}%)
                    </td>
                    <td className="text-right py-3 px-4">
                      €{calculation2?.tfr.toFixed(2)} (
                      {ccnl2?.additionalCosts.tfr}%)
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      €
                      {(
                        (calculation2?.tfr || 0) - (calculation1?.tfr || 0)
                      ).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4">
                      Contributi Sociali (% su stipendio)
                    </td>
                    <td className="text-right py-3 px-4">
                      €{calculation1?.socialContributions.toFixed(2)} (
                      {ccnl1?.additionalCosts.socialContributions}%)
                    </td>
                    <td className="text-right py-3 px-4">
                      €{calculation2?.socialContributions.toFixed(2)} (
                      {ccnl2?.additionalCosts.socialContributions}%)
                    </td>
                    <td className="text-right py-3 px-4 font-semibold">
                      €
                      {(
                        (calculation2?.socialContributions || 0) -
                        (calculation1?.socialContributions || 0)
                      ).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bg-blue-50 border-b-2 border-blue-200">
                    <td className="py-3 px-4 font-semibold">Costo Totale Mensile</td>
                    <td className="text-right py-3 px-4 font-bold text-blue-600">
                      €{calculation1?.totalMonthlyCost.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-4 font-bold text-blue-600">
                      €{calculation2?.totalMonthlyCost.toFixed(2)}
                    </td>
                    <td className="text-right py-3 px-4 font-bold text-green-600">
                      €
                      {(
                        (calculation2?.totalMonthlyCost || 0) -
                        (calculation1?.totalMonthlyCost || 0)
                      ).toFixed(2)}
                    </td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="py-3 px-4 font-semibold">
                      Costo Annuale Totale ({numEmployees} dipendenti)
                    </td>
                    <td className="text-right py-3 px-4 font-bold text-blue-600">
                      €{totalAnnualCost1.toFixed(0)}
                    </td>
                    <td className="text-right py-3 px-4 font-bold text-blue-600">
                      €{totalAnnualCost2.toFixed(0)}
                    </td>
                    <td className="text-right py-3 px-4 font-bold text-green-600">
                      €{(totalAnnualCost2 - totalAnnualCost1).toFixed(0)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Statistics Section */}
        <div className="mt-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-blue-900 mb-2">
              Statistiche e Crescita ENGEB
            </h2>
            <p className="text-gray-600">
              Scopri i numeri della crescita di ENGEB e la distribuzione delle
              aziende aderenti per settore merceologico
            </p>
          </div>
          <StatisticsSection />
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-gray-600">
          <p>
            © 2026 ENGEB - Ente Nazionale Generale Bilaterale | Simulatore di
            Confronto Costi CCNL
          </p>
          <p className="mt-2">
            I dati sono forniti a scopo informativo. Per informazioni ufficiali
            contattare direttamente ENGEB.
          </p>
        </div>
      </div>

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Condividi Confronto CCNL</DialogTitle>
            <DialogDescription>
              Copia questo link per condividere il confronto con altri. Il link è pubblico e non richiede login.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <Input
                id="link"
                value={shareLink}
                readOnly
                className="h-9"
              />
            </div>
            <Button
              type="button"
              size="sm"
              className="px-3"
              onClick={handleCopyLink}
            >
              <span className="sr-only">Copia</span>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <div className="flex flex-col gap-2 pt-2">
            <p className="text-sm text-gray-600">
              <strong>Parametri inclusi:</strong>
            </p>
            <ul className="text-xs text-gray-500 space-y-1">
              <li>• CCNL 1: {ccnl1?.name} - {ccnl1?.levels[selectedLevel1].description}</li>
              <li>• CCNL 2: {ccnl2?.name} - {ccnl2?.levels[selectedLevel2].description}</li>
              <li>• Numero Dipendenti: {numEmployees}</li>
              <li>• Mesi per Anno: {monthsPerYear}</li>
              <li>• Modalità: {isPartTime ? "Part-Time" : "Full-Time"}</li>
            </ul>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
