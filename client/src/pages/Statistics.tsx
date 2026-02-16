import { trpc } from "@/lib/trpc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, Users, Building2, FileText, Loader2, Download, AlertTriangle, RefreshCw } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChartSkeleton } from "@/components/ChartSkeleton";
import { toast } from "sonner";

const COLORS = [
  "#3b82f6", // blue-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#06b6d4", // cyan-500
  "#f97316", // orange-500
];

export default function Statistics() {
  const aggregateQuery = trpc.statistics.getAggregateStats.useQuery();
  const workersBySectorQuery = trpc.statistics.getWorkersBySector.useQuery();
  const engebVsNationalQuery = trpc.statistics.getENGEBvsNationalBySector.useQuery();
  const topCCNLsQuery = trpc.statistics.getTopCCNLsByWorkers.useQuery();
  const monthlyTrendQuery = trpc.statistics.getMonthlyTrend.useQuery();
  const workersByMacroSectorQuery = trpc.statistics.getWorkersByMacroSector.useQuery();
  const penetrationByMacroSectorQuery = trpc.statistics.getENGEBPenetrationByMacroSector.useQuery();
  
  const exportMutation = trpc.export.exportStatisticsExcel.useMutation();

  const aggregateStats = aggregateQuery.data;
  const workersBySector = workersBySectorQuery.data;
  const engebVsNational = engebVsNationalQuery.data;
  const topCCNLs = topCCNLsQuery.data;
  const monthlyTrend = monthlyTrendQuery.data;
  const workersByMacroSector = workersByMacroSectorQuery.data;
  const penetrationByMacroSector = penetrationByMacroSectorQuery.data;

  const anyError =
    aggregateQuery.error ||
    workersBySectorQuery.error ||
    engebVsNationalQuery.error ||
    topCCNLsQuery.error ||
    monthlyTrendQuery.error ||
    workersByMacroSectorQuery.error ||
    penetrationByMacroSectorQuery.error;

  const handleRetryAll = async () => {
    toast.message("Ricarico i dati…");
    await Promise.all([
      aggregateQuery.refetch(),
      workersBySectorQuery.refetch(),
      engebVsNationalQuery.refetch(),
      topCCNLsQuery.refetch(),
      monthlyTrendQuery.refetch(),
      workersByMacroSectorQuery.refetch(),
      penetrationByMacroSectorQuery.refetch(),
    ]);
  };

  const downloadBase64 = (base64: string, filename: string, mimeType: string) => {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: mimeType });

    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    // rilascio un attimo dopo per evitare race su alcuni browser
    window.setTimeout(() => window.URL.revokeObjectURL(url), 1500);
  };

  const handleExportExcel = async () => {
    const toastId = toast.loading("Generazione Excel…");
    try {
      const result = await exportMutation.mutateAsync();
      if (!result?.data) throw new Error("Nessun dato ricevuto dal server");
      downloadBase64(
        result.data,
        result.filename || "statistiche_ccnl.xlsx",
        result.mimeType ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      );
      toast.success(
        "Download avviato. Se non parte, verifica i permessi download del browser.",
        { id: toastId }
      );
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Errore durante l'esportazione Excel", { id: toastId });
    }
  };

  // Prepare data for pie chart
  const pieData = workersBySector?.map((item) => ({
    name: item.sector,
    value: item.totalWorkers,
  }));

  // Prepare data for bar chart (ENGEB vs National by sector)
  const barData = engebVsNational?.map((item) => ({
    sector: item.sector,
    ENGEB: item.engebWorkers,
    Nazionali: item.nationalWorkers,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-12">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-blue-900 mb-3">
            Statistiche CCNL
          </h1>
          <p className="text-lg text-blue-700">
            Analisi distribuzione lavoratori e aziende per settore e contratto
          </p>
          <div className="mt-4 flex flex-col items-center gap-3">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-md px-4 py-2 text-sm text-blue-800">
              <TrendingUp className="h-4 w-4" />
              Dati stimati basati su statistiche ISTAT settore privato 2024 • Codici CNEL ufficiali INPS
            </div>

            {anyError ? (
              <div className="w-full max-w-3xl bg-amber-50 border border-amber-200 rounded-lg p-4 text-left">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-700 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-amber-900">Alcuni dati non sono disponibili</p>
                    <p className="text-sm text-amber-800 mt-1">
                      Verifica la connessione al database (DATABASE_URL) e che le migrazioni/seed siano stati eseguiti.
                    </p>
                    <details className="mt-2">
                      <summary className="cursor-pointer text-sm text-amber-900 underline">Dettagli tecnici</summary>
                      <pre className="mt-2 text-xs bg-white/60 p-2 rounded border border-amber-200 overflow-auto">
{String((anyError as any)?.message ?? anyError)}
                      </pre>
                    </details>
                  </div>
                  <Button
                    variant="outline"
                    className="border-amber-300 text-amber-900 hover:bg-amber-100"
                    onClick={handleRetryAll}
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Riprova
                  </Button>
                </div>
              </div>
            ) : null}

            <Button 
              onClick={handleExportExcel}
              disabled={exportMutation.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {exportMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generazione Excel...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Esporta Excel
                </>
              )}
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        {aggregateQuery.isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i} className="shadow-lg">
                <CardHeader className="pb-3">
                  <div className="h-4 w-40 bg-gray-200 rounded animate-pulse" />
                </CardHeader>
                <CardContent>
                  <div className="h-9 w-24 bg-gray-200 rounded animate-pulse" />
                  <div className="h-3 w-56 bg-gray-200 rounded animate-pulse mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : aggregateQuery.error ? (
          <Card className="shadow-lg mb-8 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-5 w-5" />
                KPI non disponibili
              </CardTitle>
              <CardDescription>
                Non riesco a caricare i dati aggregati. Verifica DB e riprova.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => aggregateQuery.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Riprova
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Totale CCNL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {aggregateStats?.totalCCNLs || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {aggregateStats?.engebCCNLs || 0} ENGEB +{" "}
                {aggregateStats?.nationalCCNLs || 0} Nazionali
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4" />
                Lavoratori Totali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">
                {(aggregateStats?.totalWorkers || 0).toLocaleString("it-IT")}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ENGEB:{" "}
                {(aggregateStats?.engebWorkers || 0).toLocaleString("it-IT")} |
                Nazionali:{" "}
                {(aggregateStats?.nationalWorkers || 0).toLocaleString("it-IT")}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Aziende Totali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600">
                {(aggregateStats?.totalCompanies || 0).toLocaleString("it-IT")}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                ENGEB:{" "}
                {(aggregateStats?.engebCompanies || 0).toLocaleString("it-IT")}{" "}
                | Nazionali:{" "}
                {(aggregateStats?.nationalCompanies || 0).toLocaleString(
                  "it-IT"
                )}
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Penetrazione ENGEB
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-violet-600">
                {aggregateStats?.totalWorkers
                  ? (
                      ((aggregateStats.engebWorkers || 0) /
                        aggregateStats.totalWorkers) *
                      100
                    ).toFixed(1)
                  : 0}
                %
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Quota lavoratori ENGEB sul totale
              </p>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Pie Chart - Distribution by Sector */}
          {workersBySectorQuery.isLoading ? (
            <ChartSkeleton
              title="Distribuzione Lavoratori per Settore"
              description="Percentuale di lavoratori applicanti CCNL per settore merceologico"
              height={350}
            />
          ) : workersBySectorQuery.error ? (
            <Card className="shadow-lg border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="h-5 w-5" />
                  Distribuzione per settore non disponibile
                </CardTitle>
                <CardDescription>Errore nel caricamento dei dati.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => workersBySectorQuery.refetch()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Riprova
                </Button>
              </CardContent>
            </Card>
          ) : !pieData?.length ? (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Distribuzione Lavoratori per Settore</CardTitle>
                <CardDescription>Nessun dato disponibile.</CardDescription>
              </CardHeader>
              <CardContent className="text-sm text-gray-600">
                Se è la prima installazione, importa/seed i dati e riprova.
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Distribuzione Lavoratori per Settore</CardTitle>
                <CardDescription>
                  Percentuale di lavoratori applicanti CCNL per settore
                  merceologico
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) =>
                        `${entry.name}: ${((entry.value / (aggregateStats?.totalWorkers || 1)) * 100).toFixed(1)}%`
                      }
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData?.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number) =>
                        value.toLocaleString("it-IT") + " lavoratori"
                      }
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Bar Chart - ENGEB vs National */}
          {engebVsNationalQuery.isLoading ? (
            <ChartSkeleton
              title="Confronto ENGEB vs Nazionali per Settore"
              description="Numero di lavoratori per tipologia di CCNL in ciascun settore"
              height={350}
            />
          ) : engebVsNationalQuery.error ? (
            <Card className="shadow-lg border-amber-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-amber-900">
                  <AlertTriangle className="h-5 w-5" />
                  Confronto non disponibile
                </CardTitle>
                <CardDescription>Errore nel caricamento dei dati.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" onClick={() => engebVsNationalQuery.refetch()}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Riprova
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle>Confronto ENGEB vs Nazionali per Settore</CardTitle>
                <CardDescription>
                  Numero di lavoratori per tipologia di CCNL in ciascun settore
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={barData || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="sector"
                      angle={-45}
                      textAnchor="end"
                      height={100}
                      interval={0}
                      style={{ fontSize: "12px" }}
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        value >= 1000
                          ? `${(value / 1000).toFixed(0)}k`
                          : value.toString()
                      }
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        value.toLocaleString("it-IT") + " lavoratori"
                      }
                    />
                    <Legend />
                    <Bar dataKey="ENGEB" fill="#3b82f6" />
                    <Bar dataKey="Nazionali" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Top CCNLs Table */}
        {topCCNLsQuery.isLoading ? (
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Top 10 CCNL per Numero Lavoratori</CardTitle>
              <CardDescription>Caricamento…</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : topCCNLsQuery.error ? (
          <Card className="shadow-lg mb-8 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-5 w-5" />
                Top 10 CCNL non disponibile
              </CardTitle>
              <CardDescription>Errore nel caricamento dei dati.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => topCCNLsQuery.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Riprova
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Top 10 CCNL per Numero Lavoratori</CardTitle>
              <CardDescription>
                I contratti collettivi con il maggior numero di lavoratori
                applicanti
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nome CCNL</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Settore</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Emittente</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tipo</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Lavoratori</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Aziende</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(topCCNLs || []).map((ccnl, index) => (
                      <tr key={ccnl.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                        <td className="py-3 px-4 font-medium text-gray-900">{ccnl.name}</td>
                        <td className="py-3 px-4 text-gray-600">{ccnl.sector}</td>
                        <td className="py-3 px-4 text-gray-600">{ccnl.issuer}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              ccnl.isENGEB === 1
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {ccnl.isENGEB === 1 ? "ENGEB" : "Nazionale"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          {(ccnl.numeroLavoratori || 0).toLocaleString("it-IT")}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {(ccnl.numeroAziende || 0).toLocaleString("it-IT")}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Sector Details Table */}
        {workersBySectorQuery.isLoading ? (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Dettaglio per Settore</CardTitle>
              <CardDescription>Caricamento…</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 animate-pulse">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded" />
                ))}
              </div>
            </CardContent>
          </Card>
        ) : workersBySectorQuery.error ? (
          <Card className="shadow-lg border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-5 w-5" />
                Dettaglio per settore non disponibile
              </CardTitle>
              <CardDescription>Errore nel caricamento dei dati.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => workersBySectorQuery.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Riprova
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Dettaglio per Settore</CardTitle>
              <CardDescription>
                Statistiche complete di lavoratori, aziende e CCNL per ogni
                settore
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Settore</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Lavoratori</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Aziende</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">N° CCNL</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">% sul Totale</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(workersBySector || []).map((sector) => (
                      <tr key={sector.sector} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-gray-900">{sector.sector}</td>
                        <td className="py-3 px-4 text-right font-semibold text-gray-900">
                          {sector.totalWorkers.toLocaleString("it-IT")}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {sector.totalCompanies.toLocaleString("it-IT")}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">{sector.ccnlCount}</td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {aggregateStats?.totalWorkers
                            ? ((sector.totalWorkers / aggregateStats.totalWorkers) * 100).toFixed(1)
                            : 0}
                          %
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monthly Trend Section */}
        {monthlyTrendQuery.isLoading ? (
          <ChartSkeleton 
            title="Evoluzione Temporale Ultimi 12 Mesi"
            description="Trend mensile del numero di lavoratori ENGEB vs Competitor"
            height={400}
          />
        ) : monthlyTrendQuery.error ? (
          <Card className="shadow-lg mb-8 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-5 w-5" />
                Trend mensile lavoratori non disponibile
              </CardTitle>
              <CardDescription>Errore nel caricamento dei dati.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => monthlyTrendQuery.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Riprova
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Evoluzione Temporale Ultimi 12 Mesi</CardTitle>
              <CardDescription>
                Trend mensile del numero di lavoratori ENGEB vs Competitor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Lavoratori', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString('it-IT')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="engebWorkers" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="ENGEB"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="nationalWorkers" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Nazionali"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        )}

        {monthlyTrendQuery.isLoading ? (
          <ChartSkeleton 
            title="Evoluzione Aziende Ultimi 12 Mesi"
            description="Trend mensile del numero di aziende aderenti ENGEB vs Competitor"
            height={400}
          />
        ) : monthlyTrendQuery.error ? (
          <Card className="shadow-lg mb-8 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-5 w-5" />
                Trend mensile aziende non disponibile
              </CardTitle>
              <CardDescription>Errore nel caricamento dei dati.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => monthlyTrendQuery.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Riprova
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Evoluzione Aziende Ultimi 12 Mesi</CardTitle>
            <CardDescription>
              Trend mensile del numero di aziende aderenti ENGEB vs Competitor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={monthlyTrend || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Aziende', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value: number) => value.toLocaleString('it-IT')}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="engebCompanies" 
                  stroke="#3b82f6" 
                  strokeWidth={2}
                  name="ENGEB"
                  dot={{ r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="nationalCompanies" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  name="Nazionali"
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        )}

        {/* Macro-Sector CNEL Charts */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Analisi per Macro-Settore CNEL</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Distribution by Macro-Sector */}
            {workersByMacroSectorQuery.isLoading ? (
              <ChartSkeleton 
                title="Distribuzione per Macro-Settore CNEL"
                description="Numero di lavoratori e CCNL per macro-settore"
                height={400}
              />
            ) : workersByMacroSectorQuery.error ? (
              <Card className="shadow-lg border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <AlertTriangle className="h-5 w-5" />
                    Dati macro-settori non disponibili
                  </CardTitle>
                  <CardDescription>Errore nel caricamento dei dati.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => workersByMacroSectorQuery.refetch()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Riprova
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Distribuzione per Macro-Settore CNEL</CardTitle>
                  <CardDescription>
                    Numero di lavoratori e CCNL per macro-settore
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={workersByMacroSector || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="macroSector"
                        angle={-45}
                        textAnchor="end"
                        height={150}
                        interval={0}
                        style={{ fontSize: "10px" }}
                      />
                      <YAxis
                        tickFormatter={(value) =>
                          value >= 1000
                            ? `${(value / 1000).toFixed(0)}k`
                            : value.toString()
                        }
                      />
                      <Tooltip
                        formatter={(value: number) =>
                          value.toLocaleString("it-IT") + " lavoratori"
                        }
                      />
                      <Legend />
                      <Bar dataKey="totalWorkers" fill="#3b82f6" name="Lavoratori" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* ENGEB Penetration by Macro-Sector */}
            {penetrationByMacroSectorQuery.isLoading ? (
              <ChartSkeleton 
                title="Penetrazione ENGEB per Macro-Settore"
                description="Percentuale di lavoratori ENGEB sul totale per settore"
                height={400}
              />
            ) : penetrationByMacroSectorQuery.error ? (
              <Card className="shadow-lg border-amber-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-amber-900">
                    <AlertTriangle className="h-5 w-5" />
                    Penetrazione non disponibile
                  </CardTitle>
                  <CardDescription>Errore nel caricamento dei dati.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" onClick={() => penetrationByMacroSectorQuery.refetch()}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Riprova
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Penetrazione ENGEB per Macro-Settore</CardTitle>
                  <CardDescription>
                    Percentuale di lavoratori ENGEB sul totale per settore
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={penetrationByMacroSector || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="macroSector"
                        angle={-45}
                        textAnchor="end"
                        height={150}
                        interval={0}
                        style={{ fontSize: "10px" }}
                      />
                      <YAxis
                        tickFormatter={(value) => `${value.toFixed(0)}%`}
                      />
                      <Tooltip
                        formatter={(value: number) =>
                          `${value.toFixed(2)}%`
                        }
                      />
                      <Legend />
                      <Bar dataKey="penetrationPercentage" fill="#10b981" name="Penetrazione %" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Top CCNLs by Macro-Sector Table */}
        {workersByMacroSectorQuery.isLoading ? (
          <ChartSkeleton 
            title="Top 10 Macro-Settori CNEL"
            description="Settori con maggior numero di lavoratori"
            height={300}
          />
        ) : workersByMacroSectorQuery.error ? (
          <Card className="shadow-lg mb-8 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-900">
                <AlertTriangle className="h-5 w-5" />
                Top macro-settori non disponibile
              </CardTitle>
              <CardDescription>Errore nel caricamento dei dati.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" onClick={() => workersByMacroSectorQuery.refetch()}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Riprova
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="shadow-lg mb-8">
            <CardHeader>
              <CardTitle>Top 10 Macro-Settori CNEL</CardTitle>
              <CardDescription>
                Settori con maggior numero di lavoratori e CCNL
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">#</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Macro-Settore</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Lavoratori</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Aziende</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">CCNL Totali</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">CCNL ENGEB</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(workersByMacroSector || []).slice(0, 10).map((sector, index) => (
                      <tr key={index} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                        <td className="py-3 px-4 font-medium">{sector.macroSector}</td>
                        <td className="py-3 px-4 text-right text-emerald-600 font-semibold">
                          {sector.totalWorkers.toLocaleString("it-IT")}
                        </td>
                        <td className="py-3 px-4 text-right text-amber-600 font-semibold">
                          {sector.totalCompanies.toLocaleString("it-IT")}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {sector.ccnlCount}
                        </td>
                        <td className="py-3 px-4 text-right text-blue-600 font-semibold">
                          {sector.engebCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Scopri i Vantaggi dei CCNL ENGEB
            </h2>
            <p className="text-gray-600 mb-6">
              Utilizza il nostro simulatore per confrontare i costi del lavoro
              tra CCNL ENGEB e contratti nazionali. Analizza stipendi,
              contributi e benefici con trasparenza totale.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/simulator">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  Vai al Simulatore
                </Button>
              </Link>
              <Link href="/cnel-database">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-blue-600 text-blue-600 hover:bg-blue-50"
                >
                  Database CCNL
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
