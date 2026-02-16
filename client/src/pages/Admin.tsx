import { useAuth } from "@/_core/hooks/useAuth";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CCNLFormDialog } from "@/components/CCNLFormDialog";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { Plus, Pencil, Trash2, Loader2, Shield, ArrowUpDown, ArrowUp, ArrowDown, Search } from "lucide-react";
import { getLoginUrl } from "@/const";
import { useLocation } from "wouter";

export default function Admin() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCCNL, setSelectedCCNL] = useState<any>(null);

  // State for search and filters
  const [searchQuery, setSearchQuery] = useState("");
  const [sectorFilter, setSectorFilter] = useState<string>("all");
  const [issuerFilter, setIssuerFilter] = useState<string>("all");

  // State for sorting
  const [sortColumn, setSortColumn] = useState<"name" | "sector" | "updatedAt" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Fetch all CCNL
  const { data: ccnls, isLoading, refetch } = trpc.ccnl.getAll.useQuery();

  // Filter and sort CCNL based on search, filters and sorting
  const filteredCCNLs = useMemo(() => {
    const filtered = ccnls?.filter((ccnl) => {
      // Search filter
      const matchesSearch = searchQuery === "" || 
        ccnl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ccnl.sector.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ccnl.issuer && ccnl.issuer.toLowerCase().includes(searchQuery.toLowerCase()));

      // Sector filter
      const matchesSector = sectorFilter === "all" || ccnl.sector === sectorFilter;

      // Issuer filter
      const matchesIssuer = issuerFilter === "all" || ccnl.issuer === issuerFilter;

      return matchesSearch && matchesSector && matchesIssuer;
    });

    // Apply sorting
    if (!filtered || !sortColumn) return filtered;

    return [...filtered].sort((a, b) => {
      let compareValue = 0;

      if (sortColumn === "name") {
        compareValue = a.name.localeCompare(b.name);
      } else if (sortColumn === "sector") {
        compareValue = a.sector.localeCompare(b.sector);
      } else if (sortColumn === "updatedAt") {
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        compareValue = dateA - dateB;
      }

      return sortDirection === "asc" ? compareValue : -compareValue;
    });
  }, [ccnls, searchQuery, sectorFilter, issuerFilter, sortColumn, sortDirection]);

  const handleEdit = (ccnl: any) => {
    setSelectedCCNL(ccnl);
    setDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedCCNL(null);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedCCNL(null);
  };

  // Handle column sorting
  const handleSort = (column: "name" | "sector" | "updatedAt") => {
    if (sortColumn === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  // Check if user is admin
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    window.location.href = getLoginUrl();
    return null;
  }

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600">Accesso Negato</CardTitle>
            <CardDescription>
              Solo gli amministratori possono accedere a questa pagina.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={() => setLocation("/")} className="w-full">
              Torna alla Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Dashboard Amministrazione
              </h1>
              <p className="text-gray-600 mt-1">
                Gestione CCNL, livelli professionali e contributi
              </p>
            </div>
            <Button onClick={() => setLocation("/")} variant="outline">
              Torna al Simulatore
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto py-8">
        {/* CCNL Management Section */}
        <Card className="shadow-lg">
          <CardHeader className="bg-blue-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-blue-900">
                  Gestione CCNL
                </CardTitle>
                <CardDescription>
                  Visualizza e gestisci tutti i Contratti Collettivi Nazionali
                </CardDescription>
              </div>
              <Button
                onClick={handleCreate}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="mr-2 h-4 w-4" />
                Nuovo CCNL
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {/* Search and Filters */}
            <div className="mb-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search Bar */}
                <div className="md:col-span-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Cerca per nome, settore o emittente..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10"
                  />
                </div>

                {/* Sector Filter */}
                <div>
                  <Select value={sectorFilter} onValueChange={setSectorFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtra per settore" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti i Settori</SelectItem>
                      <SelectItem value="Commercio">Commercio</SelectItem>
                      <SelectItem value="Turismo">Turismo</SelectItem>
                      <SelectItem value="Terziario">Terziario</SelectItem>
                      <SelectItem value="Servizi">Servizi</SelectItem>
                      <SelectItem value="Sanità">Sanità</SelectItem>
                      <SelectItem value="Artigianato">Artigianato</SelectItem>
                      <SelectItem value="Logistica">Logistica</SelectItem>
                      <SelectItem value="Multiservizi">Multiservizi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Issuer Filter */}
                <div>
                  <Select value={issuerFilter} onValueChange={setIssuerFilter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Filtra per emittente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tutti gli Emittenti</SelectItem>
                      <SelectItem value="ENGEB">ENGEB</SelectItem>
                      <SelectItem value="EBINTER">EBINTER</SelectItem>
                      <SelectItem value="EBIL">EBIL</SelectItem>
                      <SelectItem value="EBNT">EBNT</SelectItem>
                      <SelectItem value="Artigianato">Artigianato</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>
                  Visualizzati {filteredCCNLs?.length || 0} di {ccnls?.length || 0} CCNL
                </span>
                {(searchQuery || sectorFilter !== "all" || issuerFilter !== "all") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("");
                      setSectorFilter("all");
                      setIssuerFilter("all");
                    }}
                  >
                    Cancella Filtri
                  </Button>
                )}
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              </div>
            ) : ccnls && ccnls.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>ID</TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("name")}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors font-semibold"
                        >
                          Nome CCNL
                          {sortColumn === "name" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-40" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("sector")}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors font-semibold"
                        >
                          Settore
                          {sortColumn === "sector" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-40" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>Emittente</TableHead>
                      <TableHead>
                        <button
                          onClick={() => handleSort("updatedAt")}
                          className="flex items-center gap-1 hover:text-blue-600 transition-colors font-semibold"
                        >
                          Ultimo Aggiornamento
                          {sortColumn === "updatedAt" ? (
                            sortDirection === "asc" ? (
                              <ArrowUp className="h-4 w-4" />
                            ) : (
                              <ArrowDown className="h-4 w-4" />
                            )
                          ) : (
                            <ArrowUpDown className="h-4 w-4 opacity-40" />
                          )}
                        </button>
                      </TableHead>
                      <TableHead>ENGEB</TableHead>
                      <TableHead className="text-right">Azioni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCCNLs?.map((ccnl) => (
                      <TableRow key={ccnl.id}>
                        <TableCell className="font-medium">
                          {ccnl.id}
                        </TableCell>
                        <TableCell>{ccnl.name}</TableCell>
                        <TableCell>{ccnl.sector}</TableCell>
                        <TableCell>{ccnl.issuer}</TableCell>
                        <TableCell>
                          {ccnl.updatedAt ? new Date(ccnl.updatedAt).toLocaleDateString("it-IT") : "N/A"}
                        </TableCell>
                        <TableCell>
                          {ccnl.isENGEB ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Sì
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              No
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0"
                              onClick={() => handleEdit(ccnl)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">
                  Nessun CCNL presente nel database
                </p>
                <Button
                  onClick={handleCreate}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Aggiungi il primo CCNL
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Totale CCNL
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">
                {ccnls?.length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Contratti nel database
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                CCNL ENGEB
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {ccnls?.filter((c) => c.isENGEB).length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Contratti gestiti da ENGEB
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                CCNL Nazionali
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {ccnls?.filter((c) => !c.isENGEB).length || 0}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Contratti competitor
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions Card */}
        <Card className="mt-6 shadow-lg">
          <CardHeader className="bg-blue-50 border-b">
            <CardTitle>Azioni Rapide</CardTitle>
            <CardDescription>
              Accesso rapido alle funzionalità amministrative
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button
                onClick={() => setLocation("/users")}
                className="h-20 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800"
              >
                <div className="flex flex-col items-center">
                  <Shield className="h-6 w-6 mb-2" />
                  <span>Gestione Utenti</span>
                </div>
              </Button>
              <Button
                onClick={handleCreate}
                className="h-20 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              >
                <div className="flex flex-col items-center">
                  <Plus className="h-6 w-6 mb-2" />
                  <span>Nuovo CCNL</span>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Info Card */}
        <Card className="mt-6 shadow-lg bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-900">
              Istruzioni Dashboard
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-blue-800">
              <li>
                • <strong>Nuovo CCNL</strong>: Clicca il pulsante per aggiungere
                un nuovo contratto collettivo
              </li>
              <li>
                • <strong>Modifica</strong>: Usa l'icona matita per modificare i
                dettagli di un CCNL esistente
              </li>
              <li>
                • <strong>Elimina</strong>: Usa l'icona cestino per rimuovere un
                CCNL (attenzione: azione irreversibile)
              </li>
              <li>
                • <strong>Migrazione Dati</strong>: Esegui lo script di
                migrazione per popolare il database con i 22 CCNL esistenti
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* CCNL Form Dialog */}
      <CCNLFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        ccnl={selectedCCNL}
        onSuccess={() => {
          refetch();
          handleDialogClose();
        }}
      />
    </div>
  );
}
