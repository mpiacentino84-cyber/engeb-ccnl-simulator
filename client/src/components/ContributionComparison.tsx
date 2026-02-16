import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip as UITooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ContributionDetail } from "@/lib/ccnlData";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Info } from "lucide-react";

interface ContributionComparisonProps {
  ccnl1Name: string;
  ccnl1Contributions: ContributionDetail[];
  ccnl1BaseSalary: number;
  ccnl2Name: string;
  ccnl2Contributions: ContributionDetail[];
  ccnl2BaseSalary: number;
}

export function ContributionComparison({
  ccnl1Name,
  ccnl1Contributions,
  ccnl1BaseSalary,
  ccnl2Name,
  ccnl2Contributions,
  ccnl2BaseSalary,
}: ContributionComparisonProps) {
  // Calculate total contribution amounts
  const calculateTotalContribution = (contributions: ContributionDetail[], baseSalary: number) => {
    return contributions.reduce((total, contrib) => {
      if (contrib.isPercentage) {
        return total + (baseSalary * contrib.percentage) / 100;
      }
      return total + contrib.amount;
    }, 0);
  };

  const ccnl1Total = calculateTotalContribution(ccnl1Contributions, ccnl1BaseSalary);
  const ccnl2Total = calculateTotalContribution(ccnl2Contributions, ccnl2BaseSalary);

  // Prepare data for chart
  const chartData = ccnl1Contributions.map((contrib, idx) => {
    const ccnl1Amount = contrib.isPercentage ? (ccnl1BaseSalary * contrib.percentage) / 100 : contrib.amount;
    const ccnl2Contrib = ccnl2Contributions[idx];
    const ccnl2Amount = ccnl2Contrib
      ? ccnl2Contrib.isPercentage
        ? (ccnl2BaseSalary * ccnl2Contrib.percentage) / 100
        : ccnl2Contrib.amount
      : 0;

    return {
      name: contrib.name,
      [ccnl1Name]: parseFloat(ccnl1Amount.toFixed(2)),
      [ccnl2Name]: parseFloat(ccnl2Amount.toFixed(2)),
    };
  });

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "bilateral":
        return "bg-blue-100 text-blue-800";
      case "health":
        return "bg-green-100 text-green-800";
      case "pension":
        return "bg-purple-100 text-purple-800";
      case "welfare":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case "bilateral":
        return "Ente Bilaterale";
      case "health":
        return "Sanitaria";
      case "pension":
        return "Previdenziale";
      case "welfare":
        return "Welfare";
      default:
        return "Altro";
    }
  };

  return (
    <div className="space-y-6">
      {/* Contribution Chart */}
      <Card className="shadow-lg">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle>Confronto Contributi Mensili</CardTitle>
          <CardDescription>
            Analisi comparativa dei contributi specifici per ogni CCNL
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
              <YAxis />
              <Tooltip formatter={(value: any) => `€${typeof value === 'number' ? value.toFixed(2) : value}`} />
              <Legend />
              <Bar dataKey={ccnl1Name} fill="#3b82f6" />
              <Bar dataKey={ccnl2Name} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detailed Contribution Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CCNL 1 Contributions */}
        <Card className="shadow-md">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle className="text-lg">{ccnl1Name}</CardTitle>
            <CardDescription>Dettaglio contributi mensili</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {ccnl1Contributions.map((contrib, idx) => {
                const amount = contrib.isPercentage
                  ? (ccnl1BaseSalary * contrib.percentage) / 100
                  : contrib.amount;
                return (
                  <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <p className="font-semibold text-sm text-gray-800">{contrib.name}</p>
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="font-semibold mb-1">{contrib.name}</p>
                                <p className="text-xs">{contrib.description}</p>
                                <p className="text-xs mt-2 font-medium">
                                  Categoria: {getCategoryLabel(contrib.category)}
                                </p>
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{contrib.description}</p>
                      </div>
                      <Badge className={`ml-2 ${getCategoryColor(contrib.category)}`}>
                        {getCategoryLabel(contrib.category)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t">
                      <span className="text-xs text-gray-600">
                        {contrib.isPercentage ? `${contrib.percentage}%` : "Fisso"}
                      </span>
                      <span className="font-bold text-blue-600">€{amount.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
              <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Totale Contributi</span>
                  <span className="text-2xl font-bold text-blue-600">€{ccnl1Total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {((ccnl1Total / ccnl1BaseSalary) * 100).toFixed(2)}% dello stipendio base
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* CCNL 2 Contributions */}
        <Card className="shadow-md">
          <CardHeader className="bg-green-50 border-b">
            <CardTitle className="text-lg">{ccnl2Name}</CardTitle>
            <CardDescription>Dettaglio contributi mensili</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {ccnl2Contributions.map((contrib, idx) => {
                const amount = contrib.isPercentage
                  ? (ccnl2BaseSalary * contrib.percentage) / 100
                  : contrib.amount;
                return (
                  <div key={idx} className="border rounded-lg p-3 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-1">
                          <p className="font-semibold text-sm text-gray-800">{contrib.name}</p>
                          <TooltipProvider>
                            <UITooltip>
                              <TooltipTrigger asChild>
                                <Info className="h-3.5 w-3.5 text-gray-400 hover:text-gray-600 cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p className="font-semibold mb-1">{contrib.name}</p>
                                <p className="text-xs">{contrib.description}</p>
                                <p className="text-xs mt-2 font-medium">
                                  Categoria: {getCategoryLabel(contrib.category)}
                                </p>
                              </TooltipContent>
                            </UITooltip>
                          </TooltipProvider>
                        </div>
                        <p className="text-xs text-gray-600 mt-1">{contrib.description}</p>
                      </div>
                      <Badge className={`ml-2 ${getCategoryColor(contrib.category)}`}>
                        {getCategoryLabel(contrib.category)}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t">
                      <span className="text-xs text-gray-600">
                        {contrib.isPercentage ? `${contrib.percentage}%` : "Fisso"}
                      </span>
                      <span className="font-bold text-green-600">€{amount.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
              <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200 mt-4">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-gray-800">Totale Contributi</span>
                  <span className="text-2xl font-bold text-green-600">€{ccnl2Total.toFixed(2)}</span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {((ccnl2Total / ccnl2BaseSalary) * 100).toFixed(2)}% dello stipendio base
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Summary Comparison */}
      <Card className="shadow-lg bg-gradient-to-r from-blue-50 to-green-50">
        <CardHeader className="border-b">
          <CardTitle>Riepilogo Confronto Contributi</CardTitle>
          <CardDescription>
            Analisi comparativa del costo totale dei contributi
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm border border-blue-200">
              <p className="text-sm font-semibold text-gray-600 mb-2">{ccnl1Name}</p>
              <p className="text-3xl font-bold text-blue-600">€{ccnl1Total.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">
                {((ccnl1Total / ccnl1BaseSalary) * 100).toFixed(2)}% dello stipendio
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-green-200">
              <p className="text-sm font-semibold text-gray-600 mb-2">{ccnl2Name}</p>
              <p className="text-3xl font-bold text-green-600">€{ccnl2Total.toFixed(2)}</p>
              <p className="text-xs text-gray-500 mt-2">
                {((ccnl2Total / ccnl2BaseSalary) * 100).toFixed(2)}% dello stipendio
              </p>
            </div>

            <div className="bg-white rounded-lg p-4 shadow-sm border border-amber-200">
              <p className="text-sm font-semibold text-gray-600 mb-2">Differenza</p>
              <p
                className={`text-3xl font-bold ${
                  ccnl1Total > ccnl2Total ? "text-green-600" : "text-red-600"
                }`}
              >
                €{Math.abs(ccnl1Total - ccnl2Total).toFixed(2)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                {ccnl1Total > ccnl2Total ? "Vantaggio ENGEB" : "Vantaggio Competitor"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
