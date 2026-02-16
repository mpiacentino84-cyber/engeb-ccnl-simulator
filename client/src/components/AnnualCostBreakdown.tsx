import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CostCalculation } from "@/lib/ccnlData";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingDown, TrendingUp } from "lucide-react";

interface AnnualCostBreakdownProps {
  ccnl1Name: string;
  ccnl1Calculation: CostCalculation;
  ccnl2Name: string;
  ccnl2Calculation: CostCalculation;
  numEmployees: number;
  monthsPerYear: number;
}

export function AnnualCostBreakdown({
  ccnl1Name,
  ccnl1Calculation,
  ccnl2Name,
  ccnl2Calculation,
  numEmployees,
  monthsPerYear,
}: AnnualCostBreakdownProps) {
  // Calculate monthly cumulative costs
  const monthlyData = Array.from({ length: monthsPerYear }, (_, i) => {
    const month = i + 1;
    const ccnl1Cumulative = ccnl1Calculation.totalMonthlyCost * month * numEmployees;
    const ccnl2Cumulative = ccnl2Calculation.totalMonthlyCost * month * numEmployees;
    
    return {
      month: `Mese ${month}`,
      [ccnl1Name]: parseFloat(ccnl1Cumulative.toFixed(2)),
      [ccnl2Name]: parseFloat(ccnl2Cumulative.toFixed(2)),
      risparmio: parseFloat((ccnl2Cumulative - ccnl1Cumulative).toFixed(2)),
    };
  });

  const totalAnnualCost1 = ccnl1Calculation.totalMonthlyCost * monthsPerYear * numEmployees;
  const totalAnnualCost2 = ccnl2Calculation.totalMonthlyCost * monthsPerYear * numEmployees;
  const totalSavings = totalAnnualCost2 - totalAnnualCost1;
  const savingsPercentage = totalAnnualCost2 > 0 ? (totalSavings / totalAnnualCost2) * 100 : 0;

  // Breakdown per employee annual cost
  const breakdownData = [
    {
      name: "Stipendio Base",
      [ccnl1Name]: ccnl1Calculation.baseSalary * monthsPerYear,
      [ccnl2Name]: ccnl2Calculation.baseSalary * monthsPerYear,
    },
    {
      name: "TFR",
      [ccnl1Name]: ccnl1Calculation.tfr * monthsPerYear,
      [ccnl2Name]: ccnl2Calculation.tfr * monthsPerYear,
    },
    {
      name: "Contributi Sociali",
      [ccnl1Name]: ccnl1Calculation.socialContributions * monthsPerYear,
      [ccnl2Name]: ccnl2Calculation.socialContributions * monthsPerYear,
    },
    {
      name: "Contributi Fissi",
      [ccnl1Name]: ccnl1Calculation.fixedContributions * monthsPerYear,
      [ccnl2Name]: ccnl2Calculation.fixedContributions * monthsPerYear,
    },
    {
      name: "Altri Benefici",
      [ccnl1Name]: ccnl1Calculation.otherBenefits * monthsPerYear,
      [ccnl2Name]: ccnl2Calculation.otherBenefits * monthsPerYear,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Annual Savings Highlight */}
      <Card className={`shadow-lg ${totalSavings > 0 ? "bg-gradient-to-r from-green-50 to-emerald-50" : "bg-gradient-to-r from-red-50 to-orange-50"}`}>
        <CardHeader className="border-b">
          <CardTitle className="flex items-center gap-2">
            {totalSavings > 0 ? (
              <>
                <TrendingDown className="h-6 w-6 text-green-600" />
                <span>Risparmio Annuale ENGEB</span>
              </>
            ) : (
              <>
                <TrendingUp className="h-6 w-6 text-red-600" />
                <span>Maggior Costo Annuale</span>
              </>
            )}
          </CardTitle>
          <CardDescription>
            Confronto costo totale annuale per {numEmployees} dipendent{numEmployees > 1 ? "i" : "e"} ({monthsPerYear} mes{monthsPerYear > 1 ? "i" : "e"})
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-blue-200">
              <p className="text-sm font-semibold text-gray-600 mb-2">{ccnl1Name}</p>
              <p className="text-4xl font-bold text-blue-600">€{totalAnnualCost1.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-500 mt-3">
                €{ccnl1Calculation.totalMonthlyCost.toFixed(2)}/mese per dipendente
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm border-2 border-green-200">
              <p className="text-sm font-semibold text-gray-600 mb-2">{ccnl2Name}</p>
              <p className="text-4xl font-bold text-green-600">€{totalAnnualCost2.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              <p className="text-xs text-gray-500 mt-3">
                €{ccnl2Calculation.totalMonthlyCost.toFixed(2)}/mese per dipendente
              </p>
            </div>

            <div className={`bg-white rounded-lg p-6 shadow-sm border-2 ${totalSavings > 0 ? "border-emerald-200" : "border-red-200"}`}>
              <p className="text-sm font-semibold text-gray-600 mb-2">
                {totalSavings > 0 ? "Risparmio Totale" : "Maggior Costo"}
              </p>
              <p className={`text-4xl font-bold ${totalSavings > 0 ? "text-emerald-600" : "text-red-600"}`}>
                €{Math.abs(totalSavings).toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
              <p className="text-xs text-gray-500 mt-3">
                {Math.abs(savingsPercentage).toFixed(2)}% {totalSavings > 0 ? "in meno" : "in più"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cumulative Cost Chart */}
      <Card className="shadow-lg">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle>Andamento Cumulativo Annuale</CardTitle>
          <CardDescription>
            Visualizzazione mese per mese del costo totale cumulativo
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: any) => `€${typeof value === 'number' ? value.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}`}
              />
              <Legend />
              <Line type="monotone" dataKey={ccnl1Name} stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey={ccnl2Name} stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="risparmio" stroke="#f59e0b" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Annual Breakdown per Employee */}
      <Card className="shadow-lg">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle>Breakdown Costo Annuale per Dipendente</CardTitle>
          <CardDescription>
            Dettaglio componenti di costo su base annuale
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={breakdownData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-15} textAnchor="end" height={80} />
              <YAxis tickFormatter={(value) => `€${(value / 1000).toFixed(0)}k`} />
              <Tooltip 
                formatter={(value: any) => `€${typeof value === 'number' ? value.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : value}`}
              />
              <Legend />
              <Bar dataKey={ccnl1Name} fill="#3b82f6" />
              <Bar dataKey={ccnl2Name} fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Monthly Savings Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-green-50 border-b">
          <CardTitle>Tabella Risparmio Mensile</CardTitle>
          <CardDescription>
            Dettaglio risparmio cumulativo mese per mese
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Mese</th>
                  <th className="text-right py-3 px-4 font-semibold text-blue-700">{ccnl1Name}</th>
                  <th className="text-right py-3 px-4 font-semibold text-green-700">{ccnl2Name}</th>
                  <th className="text-right py-3 px-4 font-semibold text-emerald-700">Risparmio Cumulativo</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium text-gray-700">{row.month}</td>
                    <td className="text-right py-3 px-4 text-blue-600">
                      €{row[ccnl1Name].toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="text-right py-3 px-4 text-green-600">
                      €{row[ccnl2Name].toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className={`text-right py-3 px-4 font-semibold ${row.risparmio > 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {row.risparmio > 0 ? "+" : ""}€{row.risparmio.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-300 bg-gray-50">
                  <td className="py-4 px-4 font-bold text-gray-800">Totale Annuale</td>
                  <td className="text-right py-4 px-4 font-bold text-blue-700">
                    €{totalAnnualCost1.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="text-right py-4 px-4 font-bold text-green-700">
                    €{totalAnnualCost2.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className={`text-right py-4 px-4 font-bold ${totalSavings > 0 ? "text-emerald-700" : "text-red-700"}`}>
                    {totalSavings > 0 ? "+" : ""}€{totalSavings.toLocaleString("it-IT", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
