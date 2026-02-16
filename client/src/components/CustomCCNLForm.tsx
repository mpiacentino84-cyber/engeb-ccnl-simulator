import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, Save, ArrowLeft, ArrowRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface Level {
  level: string;
  description: string;
  baseSalaryMonthly: string;
}

interface Contribution {
  name: string;
  description: string;
  percentage: string;
  amount: string;
  isPercentage: number;
  category: "bilateral" | "pension" | "health" | "other";
}

interface CustomCCNLFormProps {
  ccnlId?: number | null; // If provided, edit mode
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CustomCCNLForm({ ccnlId, onSuccess, onCancel }: CustomCCNLFormProps) {
  const isEditMode = !!ccnlId;
  // Using sonner toast
  const [step, setStep] = useState(1);
  const [location] = useLocation();
  
  // Extract template data from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const templateData = params.get('template');
    
    if (templateData) {
      try {
        const decoded = JSON.parse(atob(templateData));
        
        // Pre-fill basic info
        if (decoded.name) setName(`${decoded.name} (Copia)`);
        if (decoded.sector) setSector(decoded.sector);
        if (decoded.sectorCategory) setSectorCategory(decoded.sectorCategory);
        if (decoded.issuer) setIssuer(decoded.issuer);
        if (decoded.validFrom) setValidFrom(decoded.validFrom);
        if (decoded.validTo) setValidTo(decoded.validTo);
        if (decoded.description) setDescription(decoded.description);
        
        // Pre-fill levels
        if (decoded.levels && decoded.levels.length > 0) {
          setLevels(decoded.levels.map((l: any) => ({
            level: l.level,
            description: l.description,
            baseSalaryMonthly: l.baseSalaryMonthly.toString(),
          })));
        }
        
        // Pre-fill additional costs
        if (decoded.additionalCosts) {
          if (decoded.additionalCosts.tfr) setTfr(decoded.additionalCosts.tfr.toString());
          if (decoded.additionalCosts.socialContributions) setSocialContributions(decoded.additionalCosts.socialContributions.toString());
          if (decoded.additionalCosts.otherBenefits) setOtherBenefits(decoded.additionalCosts.otherBenefits.toString());
        }
        
        // Pre-fill contributions
        if (decoded.contributions && decoded.contributions.length > 0) {
          setContributions(decoded.contributions.map((c: any) => ({
            name: c.name,
            description: c.description || '',
            percentage: c.percentage ? c.percentage.toString() : '0',
            amount: c.amount ? c.amount.toString() : '0',
            isPercentage: c.isPercentage ? 1 : 0,
            category: c.category || 'other',
          })));
        }
        
        toast.info("CCNL Caricato", {
          description: "I dati del CCNL selezionato sono stati caricati. Puoi modificarli prima di salvare.",
        });
      } catch (error) {
        console.error('Error parsing template data:', error);
        toast.error("Errore", {
          description: "Impossibile caricare i dati del template.",
        });
      }
    }
  }, []);

  // Step 1: Basic info
  const [name, setName] = useState("");
  const [sector, setSector] = useState("");
  const [sectorCategory, setSectorCategory] = useState("servizi");
  const [issuer, setIssuer] = useState("");
  const [validFrom, setValidFrom] = useState("");
  const [validTo, setValidTo] = useState("");
  const [description, setDescription] = useState("");

  // Step 2: Levels
  const [levels, setLevels] = useState<Level[]>([
    { level: "1", description: "", baseSalaryMonthly: "" },
  ]);

  // Step 3: Additional costs
  const [tfr, setTfr] = useState("6.91");
  const [socialContributions, setSocialContributions] = useState("30");
  const [otherBenefits, setOtherBenefits] = useState("0");

  // Step 4: Contributions
  const [contributions, setContributions] = useState<Contribution[]>([]);

  const createMutation = trpc.ccnl.createCustom.useMutation({
    onSuccess: () => {
      toast.success("CCNL Personalizzato Creato", {
        description: "Il contratto è stato salvato con successo e può essere utilizzato nel simulatore.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Errore", {
        description: error.message,
      });
    },
  });

  const updateMutation = trpc.ccnl.updateCustom.useMutation({
    onSuccess: () => {
      toast.success("CCNL Aggiornato", {
        description: "Le modifiche sono state salvate con successo.",
      });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error("Errore", {
        description: error.message,
      });
    },
  });

  // Load existing CCNL data in edit mode
  const { data: existingCCNL, isLoading: loadingCCNL } = trpc.ccnl.getComplete.useQuery(
    { id: ccnlId! },
    { enabled: isEditMode && !!ccnlId }
  );

  useEffect(() => {
    if (isEditMode && existingCCNL) {
      // Load basic info
      setName(existingCCNL.name);
      setSector(existingCCNL.sector);
      setSectorCategory(existingCCNL.sectorCategory);
      setIssuer(existingCCNL.issuer || "");
      setValidFrom(existingCCNL.validFrom || "");
      setValidTo(existingCCNL.validTo || "");
      setDescription(existingCCNL.description || "");

      // Load levels
      if (existingCCNL.levels && existingCCNL.levels.length > 0) {
        setLevels(
          existingCCNL.levels.map((l) => ({
            level: l.level,
            description: l.description,
            baseSalaryMonthly: l.baseSalaryMonthly,
          }))
        );
      }

      // Load additional costs
      if (existingCCNL.additionalCosts) {
        setTfr(existingCCNL.additionalCosts.tfr);
        setSocialContributions(existingCCNL.additionalCosts.socialContributions);
        setOtherBenefits(existingCCNL.additionalCosts.otherBenefits);
      }

      // Load contributions
      if (existingCCNL.contributions && existingCCNL.contributions.length > 0) {
        setContributions(
          existingCCNL.contributions.map((c) => ({
            name: c.name,
            description: c.description || "",
            percentage: c.percentage,
            amount: c.amount,
            isPercentage: c.isPercentage,
            category: c.category as "bilateral" | "pension" | "health" | "other",
          }))
        );
      }
    }
  }, [isEditMode, existingCCNL]);

  const addLevel = () => {
    setLevels([...levels, { level: `${levels.length + 1}`, description: "", baseSalaryMonthly: "" }]);
  };

  const removeLevel = (index: number) => {
    if (levels.length > 1) {
      setLevels(levels.filter((_, i) => i !== index));
    }
  };

  const updateLevel = (index: number, field: keyof Level, value: string) => {
    const newLevels = [...levels];
    newLevels[index][field] = value;
    setLevels(newLevels);
  };

  const addContribution = () => {
    setContributions([
      ...contributions,
      {
        name: "",
        description: "",
        percentage: "0",
        amount: "0",
        isPercentage: 0,
        category: "other",
      },
    ]);
  };

  const removeContribution = (index: number) => {
    setContributions(contributions.filter((_, i) => i !== index));
  };

  const updateContribution = (index: number, field: keyof Contribution, value: string | number) => {
    const newContributions = [...contributions];
    newContributions[index] = { ...newContributions[index], [field]: value };
    setContributions(newContributions);
  };

  const handleSubmit = () => {
    if (isEditMode && ccnlId) {
      // Update existing CCNL
      updateMutation.mutate({
        id: ccnlId,
        ccnl: {
          name,
          sector,
          sectorCategory,
          issuer,
          validFrom,
          validTo,
          description,
        },
        levels,
        additionalCosts: {
          tfr,
          socialContributions,
          otherBenefits,
        },
        contributions,
      });
    } else {
      // Create new CCNL
      const externalId = `custom_${name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;

      createMutation.mutate({
        ccnl: {
          externalId,
          name,
          sector,
          sectorCategory,
          issuer,
          validFrom,
          validTo,
          description,
        },
        levels,
        additionalCosts: {
          tfr,
          socialContributions,
          otherBenefits,
        },
        contributions,
      });
    }
  };

  const canProceedStep1 = name && sector && issuer && validFrom && validTo;
  const canProceedStep2 = levels.every((l) => l.level && l.description && l.baseSalaryMonthly);
  const canProceedStep3 = tfr && socialContributions && otherBenefits;

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
        <CardTitle>{isEditMode ? "Modifica CCNL Personalizzato" : "Crea CCNL Personalizzato"}</CardTitle>
        <CardDescription>
          {isEditMode
            ? "Modifica i dettagli del contratto collettivo"
            : "Inserisci i dettagli del contratto collettivo per utilizzarlo nel simulatore"}
        </CardDescription>
        <div className="flex items-center gap-2 mt-4">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 h-2 rounded-full ${
                s <= step ? "bg-blue-600" : "bg-gray-200"
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Passo {step} di 4: {
            step === 1 ? "Informazioni Base" :
            step === 2 ? "Livelli Professionali" :
            step === 3 ? "Costi Aggiuntivi" :
            "Contributi Specifici"
          }
        </p>
      </CardHeader>

      <CardContent className="pt-6">
        {/* Step 1: Basic Info */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Contratto *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="es. CCNL Commercio"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Settore *</Label>
              <Input
                id="sector"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                placeholder="es. Commercio e Terziario"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sectorCategory">Categoria Settore *</Label>
              <Select value={sectorCategory} onValueChange={setSectorCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent position="popper" sideOffset={5} collisionPadding={10}>
                  <SelectItem value="servizi">Servizi</SelectItem>
                  <SelectItem value="industria">Industria</SelectItem>
                  <SelectItem value="artigianato">Artigianato</SelectItem>
                  <SelectItem value="commercio">Commercio</SelectItem>
                  <SelectItem value="turismo">Turismo</SelectItem>
                  <SelectItem value="sanita">Sanità</SelectItem>
                  <SelectItem value="altro">Altro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="issuer">Emittente *</Label>
              <Input
                id="issuer"
                value={issuer}
                onChange={(e) => setIssuer(e.target.value)}
                placeholder="es. Confcommercio - CGIL, CISL, UIL"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Valido Da *</Label>
                <Input
                  id="validFrom"
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  placeholder="es. 01/01/2024"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="validTo">Valido Fino *</Label>
                <Input
                  id="validTo"
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  placeholder="es. 31/12/2026"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrizione (opzionale)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Note aggiuntive sul contratto..."
                rows={3}
              />
            </div>
          </div>
        )}

        {/* Step 2: Levels */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Livelli Professionali *</Label>
              <Button onClick={addLevel} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Aggiungi Livello
              </Button>
            </div>

            {levels.map((level, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-sm">Livello {index + 1}</h4>
                  {levels.length > 1 && (
                    <Button
                      onClick={() => removeLevel(index)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  )}
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Codice Livello</Label>
                    <Input
                      value={level.level}
                      onChange={(e) => updateLevel(index, "level", e.target.value)}
                      placeholder="es. A1, B2, Quadro"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrizione</Label>
                    <Input
                      value={level.description}
                      onChange={(e) => updateLevel(index, "description", e.target.value)}
                      placeholder="es. Impiegato di 1° livello"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Stipendio Base Mensile (€)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={level.baseSalaryMonthly}
                      onChange={(e) => updateLevel(index, "baseSalaryMonthly", e.target.value)}
                      placeholder="es. 1500.00"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Step 3: Additional Costs */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tfr">TFR (%) *</Label>
              <Input
                id="tfr"
                type="number"
                step="0.01"
                value={tfr}
                onChange={(e) => setTfr(e.target.value)}
                placeholder="es. 6.91"
              />
              <p className="text-xs text-gray-500">
                Percentuale standard italiana: 6.91%
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="socialContributions">Contributi Sociali (%) *</Label>
              <Input
                id="socialContributions"
                type="number"
                step="0.01"
                value={socialContributions}
                onChange={(e) => setSocialContributions(e.target.value)}
                placeholder="es. 30.00"
              />
              <p className="text-xs text-gray-500">
                Percentuale tipica: 30-35% (INPS + altri contributi)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="otherBenefits">Altri Benefici (%) *</Label>
              <Input
                id="otherBenefits"
                type="number"
                step="0.01"
                value={otherBenefits}
                onChange={(e) => setOtherBenefits(e.target.value)}
                placeholder="es. 0.00"
              />
              <p className="text-xs text-gray-500">
                Benefit aggiuntivi (buoni pasto, welfare, ecc.)
              </p>
            </div>
          </div>
        )}

        {/* Step 4: Contributions */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label>Contributi Specifici (opzionale)</Label>
              <Button onClick={addContribution} size="sm" variant="outline">
                <Plus className="h-4 w-4 mr-1" />
                Aggiungi Contributo
              </Button>
            </div>

            {contributions.length === 0 && (
              <div className="text-center py-8 text-gray-500 text-sm">
                Nessun contributo specifico aggiunto. Puoi procedere al salvataggio o aggiungere contributi come COASCO, assistenza sanitaria, ecc.
              </div>
            )}

            {contributions.map((contrib, index) => (
              <Card key={index} className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <h4 className="font-semibold text-sm">Contributo {index + 1}</h4>
                  <Button
                    onClick={() => removeContribution(index)}
                    size="sm"
                    variant="ghost"
                    className="h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label>Nome Contributo</Label>
                    <Input
                      value={contrib.name}
                      onChange={(e) => updateContribution(index, "name", e.target.value)}
                      placeholder="es. COASCO, Assistenza Sanitaria"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Descrizione</Label>
                    <Textarea
                      value={contrib.description}
                      onChange={(e) => updateContribution(index, "description", e.target.value)}
                      placeholder="Descrizione del contributo..."
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Tipo</Label>
                    <Select
                      value={contrib.isPercentage.toString()}
                      onValueChange={(val) =>
                        updateContribution(index, "isPercentage", parseInt(val))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={5} collisionPadding={10}>
                        <SelectItem value="0">Importo Fisso (€)</SelectItem>
                        <SelectItem value="1">Percentuale (%)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {contrib.isPercentage === 1 ? (
                    <div className="space-y-2">
                      <Label>Percentuale (%)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={contrib.percentage}
                        onChange={(e) => updateContribution(index, "percentage", e.target.value)}
                        placeholder="es. 2.50"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label>Importo Mensile (€)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        value={contrib.amount}
                        onChange={(e) => updateContribution(index, "amount", e.target.value)}
                        placeholder="es. 10.00"
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label>Categoria</Label>
                    <Select
                      value={contrib.category}
                      onValueChange={(val) =>
                        updateContribution(index, "category", val as any)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent position="popper" sideOffset={5} collisionPadding={10}>
                        <SelectItem value="bilateral">Ente Bilaterale</SelectItem>
                        <SelectItem value="pension">Previdenziale</SelectItem>
                        <SelectItem value="health">Sanitaria</SelectItem>
                        <SelectItem value="other">Altro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-6 pt-6 border-t">
          <div className="flex gap-2">
            {onCancel && (
              <Button onClick={onCancel} variant="outline">
                Annulla
              </Button>
            )}
            {step > 1 && (
              <Button onClick={() => setStep(step - 1)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Indietro
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {step < 4 && (
              <Button
                onClick={() => setStep(step + 1)}
                disabled={
                  (step === 1 && !canProceedStep1) ||
                  (step === 2 && !canProceedStep2) ||
                  (step === 3 && !canProceedStep3)
                }
              >
                Avanti
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            )}

            {step === 4 && (
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending || (isEditMode && loadingCCNL)}
                className="bg-green-600 hover:bg-green-700"
              >
                <Save className="h-4 w-4 mr-1" />
                {(createMutation.isPending || updateMutation.isPending)
                  ? "Salvataggio..."
                  : isEditMode
                  ? "Salva Modifiche"
                  : "Salva CCNL"}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
