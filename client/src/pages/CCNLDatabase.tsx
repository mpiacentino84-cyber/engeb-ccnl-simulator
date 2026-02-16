import { useState, useMemo, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Users, Building2, TrendingUp, ArrowUpDown, Info, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function CCNLDatabase() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sectorFilter, setSectorFilter] = useState("all");
  const [macroSectorFilter, setMacroSectorFilter] = useState("all");
  const [issuerFilter, setIssuerFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"name" | "workers" | "companies">("workers");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedCCNL, setSelectedCCNL] = useState<any | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 50;

  const { data: paginatedData, isLoading } = trpc.ccnl.getAllPaginated.useQuery({
    page: currentPage,
    pageSize,
    searchTerm,
    sector: sectorFilter,
    issuer: issuerFilter,
    macroSector: macroSectorFilter,
  });

  const ccnls = paginatedData?.ccnls || [];
  const totalCount = paginatedData?.totalCount || 0;
  const totalPages = paginatedData?.totalPages || 0;

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sectorFilter, issuerFilter, macroSectorFilter]);

  // Sorting is now done client-side on the paginated results
  const filteredAndSortedCCNLs = useMemo(() => {
    if (!ccnls) return [];

    const sorted = [...ccnls];
    sorted.sort((a, b) => {
      let compareValue = 0;
      if (sortBy === "name") {
        compareValue = a.name.localeCompare(b.name);
      } else if (sortBy === "workers") {
        compareValue = (a.numeroLavoratori || 0) - (b.numeroLavoratori || 0);
      } else if (sortBy === "companies") {
        compareValue = (a.numeroAziende || 0) - (b.numeroAziende || 0);
      }
      return sortDirection === "asc" ? compareValue : -compareValue;
    });

    return sorted;
  }, [ccnls, sortBy, sortDirection]);

  const totalWorkers = useMemo(() => {
    return filteredAndSortedCCNLs.reduce((sum, ccnl) => sum + (ccnl.numeroLavoratori || 0), 0);
  }, [filteredAndSortedCCNLs]);

  const totalCompanies = useMemo(() => {
    return filteredAndSortedCCNLs.reduce((sum, ccnl) => sum + (ccnl.numeroAziende || 0), 0);
  }, [filteredAndSortedCCNLs]);

  const toggleSort = (column: "name" | "workers" | "companies") => {
    if (sortBy === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-blue-900 mb-3">
            Database CCNL CNEL
          </h1>
          <p className="text-lg text-blue-700">
            Archivio completo dei Contratti Collettivi Nazionali con dati di applicazione
          </p>
          <Badge variant="outline" className="mt-2">
            <Info className="w-3 h-3 mr-1" />
            Dati simulati - In attesa integrazione INPS-UNIEMENS
          </Badge>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                CCNL Totali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {filteredAndSortedCCNLs.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {totalCount.toLocaleString("it-IT")} contratti nel database
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Lavoratori Coperti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {totalWorkers.toLocaleString("it-IT")}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Totale lavoratori nei CCNL filtrati
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Building2 className="w-4 h-4" />
                Aziende Applicanti
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">
                {totalCompanies.toLocaleString("it-IT")}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Totale aziende che applicano i CCNL
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Ricerca e Filtri</CardTitle>
            <CardDescription>
              Cerca per nome, codice CNEL, contraenti datoriali/sindacali. Filtra per macro-settore CNEL.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Cerca per nome, settore, emittente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Select value={sectorFilter} onValueChange={setSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtra per settore" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i settori</SelectItem>
                  <SelectItem value="turismo">Turismo</SelectItem>
                  <SelectItem value="commercio">Commercio</SelectItem>
                  <SelectItem value="servizi">Servizi</SelectItem>
                  <SelectItem value="artigianato">Artigianato</SelectItem>
                  <SelectItem value="industria">Industria</SelectItem>
                  <SelectItem value="trasporti">Trasporti</SelectItem>
                  <SelectItem value="edilizia">Edilizia</SelectItem>
                  <SelectItem value="sanita">Sanità</SelectItem>
                  <SelectItem value="energia">Energia</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
              </Select>

              <Select value={issuerFilter} onValueChange={setIssuerFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filtra per emittente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti gli emittenti</SelectItem>
                  <SelectItem value="engeb">ENGEB</SelectItem>
                  <SelectItem value="nazionale">Nazionali</SelectItem>
                </SelectContent>
              </Select>

              <Select value={macroSectorFilter} onValueChange={setMacroSectorFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Macro-settore CNEL" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti i macro-settori</SelectItem>
                  <SelectItem value="AGRICOLTURA">Agricoltura</SelectItem>
                  <SelectItem value="ARTIGIANATO">Artigianato</SelectItem>
                  <SelectItem value="CHIMICI">Chimici</SelectItem>
                  <SelectItem value="COMMERCIO">Commercio</SelectItem>
                  <SelectItem value="CREDITO E ASSICURAZIONI">Credito e Assicurazioni</SelectItem>
                  <SelectItem value="EDILIZIA">Edilizia</SelectItem>
                  <SelectItem value="INDUSTRIA">Industria</SelectItem>
                  <SelectItem value="SANITA">Sanità</SelectItem>
                  <SelectItem value="TERZIARIO E SERVIZI">Terziario e Servizi</SelectItem>
                  <SelectItem value="TRASPORTI">Trasporti</SelectItem>
                  <SelectItem value="TURISMO">Turismo</SelectItem>
                  <SelectItem value="CCNL PLURISETTORIALI, MICROSETTORIALI E ALTRI">Plurisettoriali</SelectItem>
                  <SelectItem value="AMMINISTRAZIONE PUBBLICA">Amministrazione Pubblica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchTerm || sectorFilter !== "all" || macroSectorFilter !== "all" || issuerFilter !== "all") && (
              <div className="mt-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  {filteredAndSortedCCNLs.length} CCNL trovati
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm("");
                    setSectorFilter("all");
                    setMacroSectorFilter("all");
                    setIssuerFilter("all");
                  }}
                >
                  Cancella Filtri
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* CCNL Table */}
        <Card>
          <CardHeader>
            <CardTitle>Elenco Contratti Collettivi</CardTitle>
            <CardDescription>
              Clicca sulle intestazioni per ordinare
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Caricamento...</p>
              </div>
            ) : filteredAndSortedCCNLs.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Nessun CCNL trovato</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("name")}
                          className="font-semibold"
                        >
                          Nome Contratto
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Settore</TableHead>
                      <TableHead>Emittente</TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("workers")}
                          className="font-semibold"
                        >
                          Lavoratori
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleSort("companies")}
                          className="font-semibold"
                        >
                          Aziende
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                      <TableHead>Validità</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedCCNLs.map((ccnl) => (
                      <TableRow key={ccnl.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {ccnl.name}
                            {ccnl.isENGEB === 1 && (
                              <Badge variant="default" className="bg-blue-600">
                                ENGEB
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{ccnl.sector}</TableCell>
                        <TableCell>{ccnl.issuer}</TableCell>
                        <TableCell>
                          {ccnl.numeroLavoratori ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger>
                                  <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4 text-green-600" />
                                    <span className="font-semibold">
                                      {ccnl.numeroLavoratori.toLocaleString("it-IT")}
                                    </span>
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>Numero lavoratori coperti dal contratto</p>
                                  <p className="text-xs text-gray-400">
                                    Fonte: {ccnl.fonteDati || "simulato"}
                                  </p>
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-gray-400 text-sm">N/D</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {ccnl.numeroAziende ? (
                            <div className="flex items-center gap-1">
                              <Building2 className="w-4 h-4 text-purple-600" />
                              <span className="font-semibold">
                                {ccnl.numeroAziende.toLocaleString("it-IT")}
                              </span>
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">N/D</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {ccnl.validFrom} - {ccnl.validTo}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedCCNL(ccnl)}
                            >
                              <Info className="w-4 h-4 mr-1" />
                              Dettagli
                            </Button>
                            <Link href={`/?ccnl2=${ccnl.externalId}`}>
                              <Button variant="outline" size="sm">
                                <ExternalLink className="w-4 h-4 mr-1" />
                                Usa
                              </Button>
                            </Link>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            
            {/* Pagination Controls */}
            {!isLoading && totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-600">
                  Pagina {currentPage} di {totalPages} • {totalCount.toLocaleString("it-IT")} contratti totali
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                  >
                    Prima
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    Precedente
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="w-10"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Successiva
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    Ultima
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dialog Dettagli CCNL */}
        <Dialog open={selectedCCNL !== null} onOpenChange={(open) => !open && setSelectedCCNL(null)}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl">{selectedCCNL?.name}</DialogTitle>
              <DialogDescription>
                Dettagli completi del contratto collettivo nazionale
              </DialogDescription>
            </DialogHeader>
            {selectedCCNL && (
              <div className="space-y-6 mt-4">
                {/* Informazioni Base */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Codice CNEL</h3>
                    <p className="text-lg font-mono">{selectedCCNL.codiceCnel || "N/D"}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Macro-Settore CNEL</h3>
                    <Badge variant="outline" className="text-sm">
                      {selectedCCNL.macroSettoreCnel || "N/D"}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Settore</h3>
                    <p>{selectedCCNL.sector}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-1">Categoria</h3>
                    <p>{selectedCCNL.sectorCategory}</p>
                  </div>
                </div>

                {/* Statistiche */}
                <div className="border-t pt-4">
                  <h3 className="text-lg font-semibold mb-3">Statistiche Applicazione</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-gray-600">Lavoratori</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {selectedCCNL.numeroLavoratori?.toLocaleString("it-IT") || "N/D"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Building2 className="w-4 h-4 text-purple-600" />
                          <span className="text-sm text-gray-600">Aziende</span>
                        </div>
                        <p className="text-2xl font-bold">
                          {selectedCCNL.numeroAziende?.toLocaleString("it-IT") || "N/D"}
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="pt-4">
                        <div className="flex items-center gap-2 mb-1">
                          <Info className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-600">Fonte Dati</span>
                        </div>
                        <p className="text-sm font-semibold">
                          {selectedCCNL.fonteDati || "simulato"}
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </div>

                {/* Contraenti Datoriali */}
                {selectedCCNL.contraentiDatoriali && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Contraenti Datoriali</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedCCNL.contraentiDatoriali}
                    </p>
                  </div>
                )}

                {/* Contraenti Sindacali */}
                {selectedCCNL.contraentiSindacali && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Contraenti Sindacali</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedCCNL.contraentiSindacali}
                    </p>
                  </div>
                )}

                {/* Descrizione */}
                {selectedCCNL.description && (
                  <div className="border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2">Descrizione</h3>
                    <p className="text-sm text-gray-700 leading-relaxed">
                      {selectedCCNL.description}
                    </p>
                  </div>
                )}

                {/* Azioni */}
                <div className="border-t pt-4 flex gap-3">
                  <Link href={`/?ccnl2=${selectedCCNL.externalId}`}>
                    <Button className="w-full">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      Usa nel Simulatore
                    </Button>
                  </Link>
                  <Button variant="outline" onClick={() => setSelectedCCNL(null)}>
                    Chiudi
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
