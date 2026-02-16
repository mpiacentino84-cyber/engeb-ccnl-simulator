import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
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
  getOverallStats,
  getGrowthTrendData,
  getSectorGrowthComparison,
  sectorStatistics,
} from "@/lib/statisticsData";
import { TrendingUp, Users, Building2, DollarSign } from "lucide-react";

export function StatisticsSection() {
  const overallStats = getOverallStats();
  const growthTrendData = getGrowthTrendData();
  const sectorComparison = getSectorGrowthComparison();

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

  const sectorPieData = sectorStatistics.map((sector) => ({
    name: sector.sectorName,
    value: sector.currentCompanies,
  }));

  return (
    <div className="space-y-6">
      {/* Overall Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              Aziende Aderenti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {overallStats.totalCompanies.toLocaleString("it-IT")}
            </div>
            <p className="text-xs text-gray-500 mt-1">Totale nazionale</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              Lavoratori Coinvolti
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {overallStats.totalEmployees.toLocaleString("it-IT")}
            </div>
            <p className="text-xs text-gray-500 mt-1">Occupati diretti</p>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-600" />
              Fatturato Annuale
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-600">
              €{(overallStats.totalRevenue / 1000).toFixed(1)}M
            </div>
            <p className="text-xs text-gray-500 mt-1">Gestito da ENGEB</p>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-600" />
              Crescita 2021-2026
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              +{overallStats.growthRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1">Tasso di crescita</p>
          </CardContent>
        </Card>
      </div>

      {/* Growth Trend Chart */}
      <Card className="shadow-lg">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle>Trend di Crescita ENGEB (2021-2026)</CardTitle>
          <CardDescription>
            Evoluzione del numero di aziende aderenti e lavoratori coinvolti
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={growthTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="companies"
                stroke="#3b82f6"
                name="Aziende"
                strokeWidth={2}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="employees"
                stroke="#10b981"
                name="Lavoratori"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sector Distribution */}
        <Card className="shadow-lg">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle>Distribuzione per Settore</CardTitle>
            <CardDescription>
              Numero di aziende aderenti per settore merceologico
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sectorPieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {COLORS.map((color, index) => (
                    <Cell key={`cell-${index}`} fill={color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value} aziende`} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Sector Comparison */}
        <Card className="shadow-lg">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle>Confronto per Settore (2026)</CardTitle>
            <CardDescription>
              Numero di aziende e lavoratori per settore
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="companies" fill="#3b82f6" name="Aziende" />
                <Bar dataKey="employees" fill="#10b981" name="Lavoratori (÷10)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Sector Details Table */}
      <Card className="shadow-lg">
        <CardHeader className="bg-blue-50 border-b">
          <CardTitle>Dettagli per Settore</CardTitle>
          <CardDescription>
            Statistiche complete di aziende, lavoratori e fatturato per settore
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-blue-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">
                    Settore
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Aziende
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Lavoratori
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Fatturato (€K)
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">
                    Crescita 2021-26
                  </th>
                </tr>
              </thead>
              <tbody>
                {sectorComparison.map((sector, idx) => (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{sector.name}</td>
                    <td className="text-right py-3 px-4">
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">
                        {sector.companies}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-semibold">
                        {sector.employees.toLocaleString("it-IT")}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded text-xs font-semibold">
                        €{sector.revenue}
                      </span>
                    </td>
                    <td className="text-right py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          sector.growth > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {sector.growth > 0 ? "+" : ""}
                        {sector.growth.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
