import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface CCNLFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ccnl?: any; // For edit mode
  onSuccess: () => void;
}

export function CCNLFormDialog({
  open,
  onOpenChange,
  ccnl,
  onSuccess,
}: CCNLFormDialogProps) {
  const isEditMode = !!ccnl;

  const [formData, setFormData] = useState({
    externalId: ccnl?.externalId || "",
    name: ccnl?.name || "",
    sector: ccnl?.sector || "",
    sectorCategory: ccnl?.sectorCategory || "commercio",
    issuer: ccnl?.issuer || "",
    validFrom: ccnl?.validFrom || "",
    validTo: ccnl?.validTo || "",
    description: ccnl?.description || "",
    isENGEB: ccnl?.isENGEB || 0,
  });

  const createMutation = trpc.ccnl.create.useMutation({
    onSuccess: () => {
      toast.success("CCNL creato con successo!");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const updateMutation = trpc.ccnl.update.useMutation({
    onSuccess: () => {
      toast.success("CCNL aggiornato con successo!");
      onSuccess();
      onOpenChange(false);
    },
    onError: (error) => {
      toast.error(`Errore: ${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (isEditMode) {
      updateMutation.mutate({
        id: ccnl.id,
        data: formData,
      });
    } else {
      createMutation.mutate(formData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditMode ? "Modifica CCNL" : "Nuovo CCNL"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Modifica i dettagli del contratto collettivo"
              : "Aggiungi un nuovo contratto collettivo al database"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="externalId">ID Esterno *</Label>
              <Input
                id="externalId"
                value={formData.externalId}
                onChange={(e) =>
                  setFormData({ ...formData, externalId: e.target.value })
                }
                required
                disabled={isEditMode}
                placeholder="es. engeb_commercio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome CCNL *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
                placeholder="es. ENGEB Commercio"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="sector">Settore *</Label>
            <Input
              id="sector"
              value={formData.sector}
              onChange={(e) =>
                setFormData({ ...formData, sector: e.target.value })
              }
              required
              placeholder="es. Commercio, Distribuzione, Vendita"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sectorCategory">Categoria Settore *</Label>
              <Select
                value={formData.sectorCategory}
                onValueChange={(value) =>
                  setFormData({ ...formData, sectorCategory: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="commercio">Commercio</SelectItem>
                  <SelectItem value="turismo">Turismo</SelectItem>
                  <SelectItem value="artigianato">Artigianato</SelectItem>
                  <SelectItem value="logistica">Logistica</SelectItem>
                  <SelectItem value="servizi">Servizi</SelectItem>
                  <SelectItem value="multiservizi">Multiservizi</SelectItem>
                  <SelectItem value="sanita">Sanità</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuer">Emittente *</Label>
              <Input
                id="issuer"
                value={formData.issuer}
                onChange={(e) =>
                  setFormData({ ...formData, issuer: e.target.value })
                }
                required
                placeholder="es. ENGEB"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="validFrom">Valido Da *</Label>
              <Input
                id="validFrom"
                type="date"
                value={formData.validFrom}
                onChange={(e) =>
                  setFormData({ ...formData, validFrom: e.target.value })
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="validTo">Valido Fino *</Label>
              <Input
                id="validTo"
                type="date"
                value={formData.validTo}
                onChange={(e) =>
                  setFormData({ ...formData, validTo: e.target.value })
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrizione</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Descrizione opzionale del CCNL"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="isENGEB">Tipo CCNL *</Label>
            <Select
              value={formData.isENGEB.toString()}
              onValueChange={(value) =>
                setFormData({ ...formData, isENGEB: parseInt(value) })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">CCNL ENGEB</SelectItem>
                <SelectItem value="0">CCNL Nazionale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Annulla
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditMode ? "Aggiorna" : "Crea"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
