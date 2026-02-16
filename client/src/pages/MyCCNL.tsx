import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, FileText } from "lucide-react";
import { CustomCCNLForm } from "@/components/CustomCCNLForm";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function MyCCNL() {
  const { user, isAuthenticated, loading } = useAuth();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [selectedCCNLId, setSelectedCCNLId] = useState<number | null>(null);

  const { data: customCCNLs, isLoading, refetch } = trpc.ccnl.getMyCustom.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const deleteMutation = trpc.ccnl.deleteCustom.useMutation({
    onSuccess: () => {
      toast.success("CCNL Eliminato", {
        description: "Il contratto è stato eliminato con successo.",
      });
      refetch();
    },
    onError: (error) => {
      toast.error("Errore", {
        description: error.message,
      });
    },
  });

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Sei sicuro di voler eliminare il CCNL "${name}"?`)) {
      deleteMutation.mutate({ id });
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateDialog(false);
    refetch();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Caricamento...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Card className="max-w-md w-full mx-4">
          <CardHeader>
            <CardTitle>Accesso Richiesto</CardTitle>
            <CardDescription>
              Devi effettuare l'accesso per gestire i tuoi CCNL personalizzati.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => (window.location.href = getLoginUrl())} className="w-full">
              Accedi
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
          <h1 className="text-4xl font-bold text-blue-900 mb-3">I Miei CCNL Personalizzati</h1>
          <p className="text-lg text-blue-700">
            Gestisci i tuoi contratti collettivi personalizzati per utilizzarli nel simulatore
          </p>
        </div>

        {/* Create Button */}
        <div className="mb-6">
          <Button
            onClick={() => setShowCreateDialog(true)}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Crea Nuovo CCNL
          </Button>
        </div>

        {/* CCNL List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Caricamento CCNL...</p>
          </div>
        ) : customCCNLs && customCCNLs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customCCNLs.map((ccnl) => (
              <Card key={ccnl.id} className="shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
                  <div className="flex items-start justify-between">
                    <FileText className="h-8 w-8 text-blue-600" />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setSelectedCCNLId(ccnl.id);
                          setShowEditDialog(true);
                        }}
                      >
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(ccnl.id, ccnl.name)}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="mt-4 text-xl">{ccnl.name}</CardTitle>
                  <CardDescription>{ccnl.sector}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Categoria:</span>
                      <span className="font-semibold">{ccnl.sectorCategory}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Emittente:</span>
                      <span className="font-semibold text-right">{ccnl.issuer}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Validità:</span>
                      <span className="font-semibold">
                        {ccnl.validFrom} - {ccnl.validTo}
                      </span>
                    </div>
                    <div className="flex justify-between pt-2 border-t">
                      <span className="text-gray-600">Creato:</span>
                      <span className="text-xs text-gray-500">
                        {new Date(ccnl.createdAt).toLocaleDateString("it-IT")}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        window.location.href = `/simulator?ccnl2=${ccnl.externalId}`;
                      }}
                    >
                      Usa nel Simulatore
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-lg">
            <CardContent className="py-12 text-center">
              <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nessun CCNL Personalizzato
              </h3>
              <p className="text-gray-600 mb-6">
                Crea il tuo primo contratto collettivo personalizzato per utilizzarlo nel
                simulatore
              </p>
              <Button
                onClick={() => setShowCreateDialog(true)}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Crea Primo CCNL
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Create Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Crea Nuovo CCNL Personalizzato</DialogTitle>
            </DialogHeader>
            <CustomCCNLForm
              onSuccess={handleCreateSuccess}
              onCancel={() => setShowCreateDialog(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Modifica CCNL Personalizzato</DialogTitle>
            </DialogHeader>
            <CustomCCNLForm
              ccnlId={selectedCCNLId}
              onSuccess={() => {
                setShowEditDialog(false);
                setSelectedCCNLId(null);
                refetch();
              }}
              onCancel={() => {
                setShowEditDialog(false);
                setSelectedCCNLId(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
