import { useMemo } from "react";
import { useLocation } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { getCCNLById, calculateCost } from "@/lib/ccnlData";
import { LevelComparisonTable } from "@/components/LevelComparisonCard";
import { ContributionComparison } from "@/components/ContributionComparison";
import { AnnualCostBreakdown } from "@/components/AnnualCostBreakdown";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface SharedComparisonParams {
  ccnl1Id: string;
  level1: number;
  ccnl2Id: string;
  level2: number;
  numEmployees: number;
  monthsPerYear: number;
  isPartTime: boolean;
}

export default function SharedComparison() {
  const [, setLocation] = useLocation();

  // Parse URL parameters
  const params = useMemo(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const encoded = urlParams.get("data");
    
    if (!encoded) {
      return null;
    }

    try {
      const decoded = atob(encoded);
      const parsed: SharedComparisonParams = JSON.parse(decoded);
      return parsed;
    } catch (error) {
      console.error("Error parsing shared comparison data:", error);
      return null;
    }
  }, []);

  const ccnl1 = useMemo(() => {
    if (!params) return null;
    return getCCNLById(params.ccnl1Id);
  }, [params]);

  const ccnl2 = useMemo(() => {
    if (!params) return null;
    return getCCNLById(params.ccnl2Id);
  }, [params]);

  const calculation1 = useMemo(() => {
    if (!ccnl1 || !params) return null;
    return calculateCost(
      ccnl1.levels[params.level1].baseSalaryMonthly,
      ccnl1.additionalCosts,
      ccnl1,
      params.isPartTime
    );
  }, [ccnl1, params]);

  const calculation2 = useMemo(() => {
    if (!ccnl2 || !params) return null;
    return calculateCost(
      ccnl2.levels[params.level2].baseSalaryMonthly,
      ccnl2.additionalCosts,
      ccnl2,
      false // CCNL 2 always full-time for comparison
    );
  }, [ccnl2, params]);

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
    if (!calculation1 || !params) return 0;
    return calculation1.totalAnnualCost * params.numEmployees * (params.monthsPerYear / 12);
  }, [calculation1, params]);

  const totalAnnualCost2 = useMemo(() => {
    if (!calculation2 || !params) return 0;
    return calculation2.totalAnnualCost * params.numEmployees * (params.monthsPerYear / 12);
  }, [calculation2, params]);

  const savings = totalAnnualCost1 - totalAnnualCost2;
  const savingsPercentage =
    totalAnnualCost1 > 0 ? (savings / totalAnnualCost1) * 100 : 0;

  const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#f59e0b"];

  if (!params || !ccnl1 || !ccnl2) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Errore</CardTitle>
            <CardDescription>
              Link di condivisione non valido o scaduto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setLocation("/")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-12">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Torna alla Home
          </Button>
          <h1 className="text-4xl font-bold text-blue-900 mb-3">
            Confronto Costi CCNL Condiviso
          </h1>
          <p className="text-lg text-blue-700">
            Confronto tra {ccnl1.name} e {ccnl2.name}
          </p>
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Parametri Confronto:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• CCNL 1: {ccnl1.name} - {ccnl1.levels[params.level1].description}</li>
              <li>• CCNL 2: {ccnl2.name} - {ccnl2.levels[params.level2].description}</li>
              <li>• Numero Dipendenti: {params.numEmployees}</li>
              <li>• Mesi per Anno: {params.monthsPerYear}</li>
              <li>• Modalità: {params.isPartTime ? "Part-Time" : "Full-Time"}</li>
            </ul>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader className="bg-blue-50 border-b">
              <CardTitle className="text-blue-900">{ccnl1.name}</CardTitle>
              <CardDescription>
                {ccnl1.levels[params.level1].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-blue-600">
                €{calculation1?.totalMonthlyCost.toFixed(2)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Costo mensile per dipendente</p>
              <div className="text-xl font-semibold text-gray-800 mt-4">
                €{totalAnnualCost1.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-500">Costo annuale totale</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="bg-green-50 border-b">
              <CardTitle className="text-green-900">{ccnl2.name}</CardTitle>
              <CardDescription>
                {ccnl2.levels[params.level2].description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-3xl font-bold text-green-600">
                €{calculation2?.totalMonthlyCost.toFixed(2)}
              </div>
              <p className="text-sm text-gray-500 mt-1">Costo mensile per dipendente</p>
              <div className="text-xl font-semibold text-gray-800 mt-4">
                €{totalAnnualCost2.toLocaleString("it-IT", { minimumFractionDigits: 2 })}
              </div>
              <p className="text-sm text-gray-500">Costo annuale totale</p>
            </CardContent>
          </Card>
        </div>

        {/* Savings Card */}
        <Card className={`mb-8 shadow-lg ${savings > 0 ? "bg-green-50" : "bg-red-50"}`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {savings > 0 ? "Risparmio Annuale" : "Maggior Costo Annuale"}
                </p>
                <div className={`text-4xl font-bold ${savings > 0 ? "text-green-600" : "text-red-600"}`}>
                  €{Math.abs(savings).toLocaleString("it-IT", { minimumFractionDigits: 2 })}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.abs(savingsPercentage).toFixed(2)}% {savings > 0 ? "in meno" : "in più"}
                </p>
              </div>
              {savings > 0 && (
                <div className="text-6xl">💰</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Confronto Costi Mensili</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="Stipendio Base" fill="#3b82f6" />
                  <Bar dataKey="Costi Aggiuntivi" fill="#ef4444" />
                  <Bar dataKey="Costo Totale" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Breakdown Costi {ccnl1.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={costBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {costBreakdownData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Level Comparison */}
        <LevelComparisonTable
          ccnl1Name={ccnl1.name}
          ccnl1Level={ccnl1.levels[params.level1]}
          ccnl2Name={ccnl2.name}
          ccnl2Level={ccnl2.levels[params.level2]}
        />

        {/* Contribution Comparison */}
        <ContributionComparison
          ccnl1Name={ccnl1.name}
          ccnl1Contributions={ccnl1.contributions}
          ccnl1BaseSalary={ccnl1.levels[params.level1].baseSalaryMonthly}
          ccnl2Name={ccnl2.name}
          ccnl2Contributions={ccnl2.contributions}
          ccnl2BaseSalary={ccnl2.levels[params.level2].baseSalaryMonthly}
        />

        {/* Annual Cost Breakdown */}
        {calculation1 && calculation2 && (
          <AnnualCostBreakdown
            ccnl1Name={ccnl1.name}
            ccnl1Calculation={calculation1}
            ccnl2Name={ccnl2.name}
            ccnl2Calculation={calculation2}
            numEmployees={params.numEmployees}
            monthsPerYear={params.monthsPerYear}
          />
        )}

        {/* CTA */}
        <Card className="mt-8 bg-blue-50 border-blue-200">
          <CardContent className="pt-6 text-center">
            <h3 className="text-xl font-bold text-blue-900 mb-2">
              Vuoi creare il tuo confronto personalizzato?
            </h3>
            <p className="text-blue-700 mb-4">
              Prova il simulatore ENGEB per confrontare qualsiasi CCNL
            </p>
            <Button
              onClick={() => setLocation("/")}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Inizia il Confronto Gratuito →
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
