import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle } from "lucide-react";

interface LevelInfo {
  level: string;
  description: string;
  baseSalaryMonthly: number;
}

interface LevelComparisonCardProps {
  ccnlName: string;
  ccnlIssuer: string;
  level: LevelInfo;
  isENGEB: boolean;
}

export function LevelComparisonCard({
  ccnlName,
  ccnlIssuer,
  level,
  isENGEB,
}: LevelComparisonCardProps) {
  return (
    <Card className="shadow-md">
      <CardHeader className={`pb-3 ${isENGEB ? "bg-blue-50" : "bg-green-50"}`}>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-sm font-semibold text-gray-700">
              {ccnlName}
            </CardTitle>
            <CardDescription className="text-xs mt-1">{ccnlIssuer}</CardDescription>
          </div>
          {isENGEB && (
            <Badge className="bg-blue-600 hover:bg-blue-700">ENGEB</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Livello</p>
          <p className="text-sm font-bold text-gray-800">{level.level}</p>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1">Mansione</p>
          <p className="text-sm text-gray-700">{level.description}</p>
        </div>

        <div className="bg-gray-50 rounded-md p-3">
          <p className="text-xs font-semibold text-gray-600 mb-2">Stipendio Mensile</p>
          <p className="text-2xl font-bold text-blue-600">
            €{level.baseSalaryMonthly.toLocaleString("it-IT", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-gray-500 mt-1">Lordo mensile</p>
        </div>

        <div className="bg-blue-50 rounded-md p-3 border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2">Stipendio Annuale</p>
          <p className="text-xl font-bold text-blue-700">
            €{(level.baseSalaryMonthly * 12).toLocaleString("it-IT", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-xs text-blue-700 mt-1">Base annuale</p>
        </div>
      </CardContent>
    </Card>
  );
}

interface LevelComparisonTableProps {
  ccnl1Name: string;
  ccnl1Level: LevelInfo;
  ccnl2Name: string;
  ccnl2Level: LevelInfo;
}

export function LevelComparisonTable({
  ccnl1Name,
  ccnl1Level,
  ccnl2Name,
  ccnl2Level,
}: LevelComparisonTableProps) {
  const difference = ccnl1Level.baseSalaryMonthly - ccnl2Level.baseSalaryMonthly;
  const percentageDiff = (difference / ccnl2Level.baseSalaryMonthly) * 100;
  const isBetter = difference > 0;

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-blue-50 border-b">
        <CardTitle>Confronto Livelli di Inquadramento</CardTitle>
        <CardDescription>
          Analisi comparativa degli stipendi mensili e delle mansioni
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-blue-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">
                  Parametro
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  {ccnl1Name}
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  {ccnl2Name}
                </th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">
                  Differenza
                </th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">Livello</td>
                <td className="text-center py-3 px-4">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                    {ccnl1Level.level}
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                    {ccnl2Level.level}
                  </span>
                </td>
                <td className="text-center py-3 px-4">-</td>
              </tr>
              <tr className="border-b hover:bg-gray-50">
                <td className="py-3 px-4 font-medium text-gray-700">Mansione</td>
                <td className="text-center py-3 px-4 text-xs">{ccnl1Level.description}</td>
                <td className="text-center py-3 px-4 text-xs">{ccnl2Level.description}</td>
                <td className="text-center py-3 px-4">-</td>
              </tr>
              <tr className="border-b hover:bg-gray-50 bg-blue-50">
                <td className="py-3 px-4 font-semibold text-gray-700">
                  Stipendio Mensile
                </td>
                <td className="text-center py-3 px-4">
                  <span className="font-bold text-blue-600">
                    €{ccnl1Level.baseSalaryMonthly.toLocaleString("it-IT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="font-bold text-green-600">
                    €{ccnl2Level.baseSalaryMonthly.toLocaleString("it-IT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  <span
                    className={`font-bold flex items-center justify-center gap-1 ${
                      isBetter ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isBetter ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    €{Math.abs(difference).toLocaleString("it-IT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-gray-50">
                <td className="py-3 px-4 font-semibold text-gray-700">
                  Stipendio Annuale
                </td>
                <td className="text-center py-3 px-4">
                  <span className="font-bold text-blue-600">
                    €{(ccnl1Level.baseSalaryMonthly * 12).toLocaleString("it-IT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  <span className="font-bold text-green-600">
                    €{(ccnl2Level.baseSalaryMonthly * 12).toLocaleString("it-IT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
                <td className="text-center py-3 px-4">
                  <span
                    className={`font-bold flex items-center justify-center gap-1 ${
                      isBetter ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isBetter ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <AlertCircle className="h-4 w-4" />
                    )}
                    €{Math.abs(difference * 12).toLocaleString("it-IT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </td>
              </tr>
              <tr className="bg-green-50 font-semibold">
                <td className="py-3 px-4 text-gray-700">Vantaggio ENGEB</td>
                <td colSpan={3} className="text-center py-3 px-4">
                  <span
                    className={`text-lg ${
                      isBetter ? "text-green-600" : "text-orange-600"
                    }`}
                  >
                    {isBetter ? "+" : ""}{percentageDiff.toFixed(2)}% (€
                    {Math.abs(difference).toLocaleString("it-IT", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}/mese)
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
