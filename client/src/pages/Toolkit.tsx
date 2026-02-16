import { useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AIAssistant } from "@/components/AIAssistant";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { extractPlaceholders } from "@shared/templateRender";

type ChecklistItemForm = {
  position: number;
  text: string;
  notes?: string | null;
  isRequired: boolean;
};

type TemplateFieldForm = {
  name: string;
  label: string;
  fieldType: "text" | "date" | "number" | "email";
  required: boolean;
  defaultValue?: string | null;
  helpText?: string | null;
  position: number;
};

function downloadBase64(filename: string, mimeType: string, base64: string) {
  const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Toolkit() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "consultant";

  // ----- CHECKLISTS -----
  const [clSearch, setClSearch] = useState("");
  const [clSelectedId, setClSelectedId] = useState<number | null>(null);
  const checklistList = trpc.toolkit.checklistList.useQuery({
    search: clSearch.trim() || undefined,
    limit: 100,
  });
  const checklistGet = trpc.toolkit.checklistGet.useQuery(
    { id: clSelectedId ?? 0 },
    { enabled: Boolean(clSelectedId) }
  );
  const checklistUpsert = trpc.toolkit.checklistUpsert.useMutation();
  const checklistDelete = trpc.toolkit.checklistDelete.useMutation();

  // editor state
  const [clEditorOpen, setClEditorOpen] = useState(false);
  const [clForm, setClForm] = useState({
    id: undefined as number | undefined,
    title: "",
    category: "",
    description: "",
    status: "draft" as "draft" | "published" | "archived",
    items: [] as ChecklistItemForm[],
  });

  const openChecklistEditor = (mode: "new" | "edit") => {
    if (mode === "new") {
      setClForm({
        id: undefined,
        title: "",
        category: "Assunzione",
        description: "",
        status: "draft",
        items: [
          { position: 1, text: "Raccogli anagrafica lavoratore e documenti", notes: "", isRequired: true },
          { position: 2, text: "Verifica inquadramento e CCNL applicabile", notes: "", isRequired: true },
        ],
      });
    } else {
      const cl = checklistGet.data;
      if (!cl) return;
      setClForm({
        id: cl.id,
        title: cl.title,
        category: cl.category,
        description: cl.description ?? "",
        status: cl.status as any,
        items: (cl.items ?? []).map((it: any) => ({
          position: it.position,
          text: it.text,
          notes: it.notes ?? "",
          isRequired: Boolean(it.isRequired),
        })),
      });
    }
    setClEditorOpen(true);
  };

  const saveChecklist = async () => {
    const payload = {
      id: clForm.id,
      title: clForm.title,
      category: clForm.category,
      description: clForm.description || null,
      status: clForm.status,
      items: clForm.items.map(it => ({
        position: it.position,
        text: it.text,
        notes: it.notes || null,
        isRequired: it.isRequired,
        referenceSourceId: null,
      })),
    };
    const res = await checklistUpsert.mutateAsync(payload);
    await checklistList.refetch();
    setClSelectedId(res.id);
    setClEditorOpen(false);
  };

  // ----- TEMPLATES -----
  const [tplSearch, setTplSearch] = useState("");
  const [tplSelectedId, setTplSelectedId] = useState<number | null>(null);
  const templateList = trpc.toolkit.templateList.useQuery({
    search: tplSearch.trim() || undefined,
    limit: 100,
  });
  const templateGet = trpc.toolkit.templateGet.useQuery(
    { id: tplSelectedId ?? 0 },
    { enabled: Boolean(tplSelectedId) }
  );
  const templateUpsert = trpc.toolkit.templateUpsert.useMutation();
  const templateDelete = trpc.toolkit.templateDelete.useMutation();

  const [tplEditorOpen, setTplEditorOpen] = useState(false);
  const [tplForm, setTplForm] = useState({
    id: undefined as number | undefined,
    title: "",
    category: "Assunzione",
    description: "",
    status: "draft" as "draft" | "published" | "archived",
    format: "markdown" as "plaintext" | "markdown",
    content: "",
    fields: [] as TemplateFieldForm[],
  });

  const [tplData, setTplData] = useState<Record<string, string>>({});
  const renderPreview = trpc.toolkit.templateRender.useQuery(
    { templateId: tplSelectedId ?? 0, data: tplData },
    { enabled: Boolean(tplSelectedId) }
  );
  const exportDoc = trpc.toolkit.templateExportDoc.useQuery(
    { templateId: tplSelectedId ?? 0, data: tplData },
    { enabled: false }
  );

  const openTemplateEditor = (mode: "new" | "edit") => {
    if (mode === "new") {
      const sample = `Oggetto: Comunicazione di assunzione\n\nSpett.le {{azienda}}\n\nSi comunica l'assunzione del/la Sig./Sig.ra {{lavoratore_nome}} (CF {{lavoratore_cf}}) con decorrenza {{data_assunzione}} e inquadramento {{inquadramento}}.\n\nCordiali saluti\n{{firmatario}}`;
      const placeholders = extractPlaceholders(sample);
      setTplForm({
        id: undefined,
        title: "Comunicazione assunzione (bozza)",
        category: "Assunzione",
        description: "Template base - verificare e personalizzare.",
        status: "draft",
        format: "markdown",
        content: sample,
        fields: placeholders.map((p, idx) => ({
          name: p,
          label: p.replace(/_/g, " "),
          fieldType: "text",
          required: true,
          defaultValue: "",
          helpText: "",
          position: idx,
        })),
      });
    } else {
      const t = templateGet.data;
      if (!t) return;
      setTplForm({
        id: t.id,
        title: t.title,
        category: t.category,
        description: t.description ?? "",
        status: t.status as any,
        format: t.format as any,
        content: t.content,
        fields: (t.fields ?? []).map((f: any) => ({
          name: f.name,
          label: f.label,
          fieldType: f.fieldType,
          required: Boolean(f.required),
          defaultValue: f.defaultValue ?? "",
          helpText: f.helpText ?? "",
          position: f.position,
        })),
      });
    }
    setTplEditorOpen(true);
  };

  const recomputeFieldsFromContent = (content: string) => {
    const placeholders = extractPlaceholders(content);
    setTplForm(prev => {
      const existing = new Map(prev.fields.map(f => [f.name, f]));
      const next = placeholders.map((p, idx) => {
        const f = existing.get(p);
        return (
          f ?? {
            name: p,
            label: p.replace(/_/g, " "),
            fieldType: "text" as const,
            required: true,
            defaultValue: "",
            helpText: "",
            position: idx,
          }
        );
      });
      return { ...prev, content, fields: next.map((f, i) => ({ ...f, position: i })) };
    });
  };

  const saveTemplate = async () => {
    const payload = {
      id: tplForm.id,
      title: tplForm.title,
      category: tplForm.category,
      description: tplForm.description || null,
      status: tplForm.status,
      format: tplForm.format,
      content: tplForm.content,
      fields: tplForm.fields.map(f => ({
        name: f.name,
        label: f.label,
        fieldType: f.fieldType,
        required: f.required,
        defaultValue: f.defaultValue || null,
        helpText: f.helpText || null,
        position: f.position,
      })),
    };
    const res = await templateUpsert.mutateAsync(payload);
    await templateList.refetch();
    setTplSelectedId(res.id);
    setTplEditorOpen(false);
  };

  const checklistItems = useMemo(() => checklistList.data ?? [], [checklistList.data]);
  const templateItems = useMemo(() => templateList.data ?? [], [templateList.data]);

  return (
    <AppShell
      title="Toolkit consulente"
      subtitle="Checklist operative, template documentali e strumenti di lavoro (informazioni generali, non parere legale)."
    >
      <div className="mb-4 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
        Disclaimer: contenuti a fini informativi e operativi. Verifica sempre la normativa e la prassi applicabile prima dell'uso.
      </div>

      <Tabs defaultValue="checklists">
        <TabsList>
          <TabsTrigger value="checklists">Checklist</TabsTrigger>
          <TabsTrigger value="templates">Template</TabsTrigger>
        </TabsList>

        <TabsContent value="checklists" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Checklist
                  {isStaff ? (
                    <Dialog open={clEditorOpen} onOpenChange={setClEditorOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => openChecklistEditor("new")}>Nuova</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>{clForm.id ? "Modifica checklist" : "Nuova checklist"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-3">
                          <div className="grid gap-2">
                            <Label>Titolo</Label>
                            <Input value={clForm.title} onChange={e => setClForm(p => ({ ...p, title: e.target.value }))} />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2">
                              <Label>Categoria</Label>
                              <Input value={clForm.category} onChange={e => setClForm(p => ({ ...p, category: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                              <Label>Stato</Label>
                              <Select value={clForm.status} onValueChange={(v: any) => setClForm(p => ({ ...p, status: v }))}>
                                <SelectTrigger><SelectValue placeholder="Stato" /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="published">Published</SelectItem>
                                  <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label>Descrizione</Label>
                            <Textarea value={clForm.description} onChange={e => setClForm(p => ({ ...p, description: e.target.value }))} rows={3} />
                          </div>

                          <div className="rounded-md border p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium">Voci</div>
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  setClForm(p => ({
                                    ...p,
                                    items: [
                                      ...p.items,
                                      { position: p.items.length + 1, text: "", notes: "", isRequired: true },
                                    ],
                                  }))
                                }
                              >
                                + Aggiungi
                              </Button>
                            </div>
                            <div className="grid gap-2">
                              {clForm.items.map((it, idx) => (
                                <div key={idx} className="grid gap-2 rounded-md border p-2">
                                  <div className="flex gap-2">
                                    <Input
                                      className="w-20"
                                      type="number"
                                      value={it.position}
                                      onChange={e => {
                                        const v = Number(e.target.value);
                                        setClForm(p => {
                                          const items = [...p.items];
                                          items[idx] = { ...items[idx], position: Number.isFinite(v) ? v : items[idx].position };
                                          return { ...p, items };
                                        });
                                      }}
                                    />
                                    <Input
                                      value={it.text}
                                      placeholder="Testo voce"
                                      onChange={e => {
                                        const v = e.target.value;
                                        setClForm(p => {
                                          const items = [...p.items];
                                          items[idx] = { ...items[idx], text: v };
                                          return { ...p, items };
                                        });
                                      }}
                                    />
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() =>
                                        setClForm(p => ({
                                          ...p,
                                          items: p.items.filter((_, i) => i !== idx).map((x, i) => ({ ...x, position: i + 1 })),
                                        }))
                                      }
                                    >
                                      Rimuovi
                                    </Button>
                                  </div>
                                  <Textarea
                                    value={it.notes ?? ""}
                                    placeholder="Note (opzionale)"
                                    rows={2}
                                    onChange={e => {
                                      const v = e.target.value;
                                      setClForm(p => {
                                        const items = [...p.items];
                                        items[idx] = { ...items[idx], notes: v };
                                        return { ...p, items };
                                      });
                                    }}
                                  />
                                  <div className="text-xs text-muted-foreground">
                                    Obbligatoria: <b>{it.isRequired ? "Sì" : "No"}</b>
                                    <Button
                                      type="button"
                                      size="sm"
                                      variant="ghost"
                                      className="ml-2"
                                      onClick={() =>
                                        setClForm(p => {
                                          const items = [...p.items];
                                          items[idx] = { ...items[idx], isRequired: !items[idx].isRequired };
                                          return { ...p, items };
                                        })
                                      }
                                    >
                                      Cambia
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setClEditorOpen(false)}>Annulla</Button>
                          <Button disabled={checklistUpsert.isPending} onClick={saveChecklist}>Salva</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input value={clSearch} onChange={e => setClSearch(e.target.value)} placeholder="Cerca..." />
                {checklistList.isLoading ? (
                  <div className="text-sm text-muted-foreground">Caricamento...</div>
                ) : checklistItems.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Nessuna checklist disponibile.</div>
                ) : (
                  <div className="space-y-2">
                    {checklistItems.map((cl: any) => (
                      <button
                        key={cl.id}
                        className={`w-full text-left rounded-md border p-2 hover:bg-muted/40 ${clSelectedId === cl.id ? "bg-muted/50" : ""}`}
                        onClick={() => setClSelectedId(cl.id)}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-sm line-clamp-1">{cl.title}</div>
                          <Badge variant="outline">{cl.category}</Badge>
                        </div>
                        {isStaff && cl.status !== "published" ? (
                          <div className="text-xs text-muted-foreground mt-1">Stato: {cl.status}</div>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Dettaglio
                  {isStaff && checklistGet.data ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openChecklistEditor("edit")}>Modifica</Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!checklistGet.data) return;
                          if (!confirm("Eliminare la checklist?")) return;
                          await checklistDelete.mutateAsync({ id: checklistGet.data.id });
                          await checklistList.refetch();
                          setClSelectedId(null);
                        }}
                      >
                        Elimina
                      </Button>
                    </div>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!clSelectedId ? (
                  <div className="text-sm text-muted-foreground">Seleziona una checklist per vederne il contenuto.</div>
                ) : checklistGet.isLoading ? (
                  <div className="text-sm text-muted-foreground">Caricamento...</div>
                ) : !checklistGet.data ? (
                  <div className="text-sm text-muted-foreground">Checklist non trovata.</div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{checklistGet.data.category}</Badge>
                      <Badge variant="outline">{checklistGet.data.status}</Badge>
                      <span className="text-xs text-muted-foreground">
                        Aggiornata: {new Date(checklistGet.data.updatedAt).toLocaleString("it-IT")}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold mt-2">{checklistGet.data.title}</h2>
                    {checklistGet.data.description ? (
                      <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{checklistGet.data.description}</p>
                    ) : null}
                    <div className="mt-4 space-y-2">
                      {(checklistGet.data.items ?? []).map((it: any) => (
                        <div key={it.id} className="rounded-md border p-3">
                          <div className="flex items-center justify-between">
                            <div className="font-medium">
                              {it.position}. {it.text}
                            </div>
                            <Badge variant={it.isRequired ? "default" : "outline"}>
                              {it.isRequired ? "Obbligatoria" : "Facoltativa"}
                            </Badge>
                          </div>
                          {it.notes ? (
                            <div className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{it.notes}</div>
                          ) : null}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="md:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Template
                  {isStaff ? (
                    <Dialog open={tplEditorOpen} onOpenChange={setTplEditorOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="outline" onClick={() => openTemplateEditor("new")}>Nuovo</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-3xl">
                        <DialogHeader>
                          <DialogTitle>{tplForm.id ? "Modifica template" : "Nuovo template"}</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-3">
                          <div className="grid gap-2">
                            <Label>Titolo</Label>
                            <Input value={tplForm.title} onChange={e => setTplForm(p => ({ ...p, title: e.target.value }))} />
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="grid gap-2">
                              <Label>Categoria</Label>
                              <Input value={tplForm.category} onChange={e => setTplForm(p => ({ ...p, category: e.target.value }))} />
                            </div>
                            <div className="grid gap-2">
                              <Label>Formato</Label>
                              <Select value={tplForm.format} onValueChange={(v: any) => setTplForm(p => ({ ...p, format: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="markdown">Markdown</SelectItem>
                                  <SelectItem value="plaintext">Plaintext</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="grid gap-2">
                              <Label>Stato</Label>
                              <Select value={tplForm.status} onValueChange={(v: any) => setTplForm(p => ({ ...p, status: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="published">Published</SelectItem>
                                  <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid gap-2">
                            <Label>Descrizione</Label>
                            <Textarea value={tplForm.description} onChange={e => setTplForm(p => ({ ...p, description: e.target.value }))} rows={2} />
                          </div>
                          <div className="grid gap-2">
                            <div className="flex items-center justify-between">
                              <Label>Contenuto (usa {{placeholder}})</Label>
                              <Button type="button" variant="outline" size="sm" onClick={() => recomputeFieldsFromContent(tplForm.content)}>
                                Aggiorna campi
                              </Button>
                            </div>
                            <Textarea
                              value={tplForm.content}
                              onChange={e => recomputeFieldsFromContent(e.target.value)}
                              rows={10}
                            />
                          </div>

                          <div className="rounded-md border p-3">
                            <div className="font-medium mb-2">Campi (placeholders)</div>
                            <div className="grid gap-2">
                              {tplForm.fields.map((f, idx) => (
                                <div key={f.name} className="grid grid-cols-3 gap-2 items-start">
                                  <div className="text-sm mt-2"><Badge variant="outline">{f.name}</Badge></div>
                                  <Input
                                    value={f.label}
                                    placeholder="Etichetta"
                                    onChange={e => {
                                      const v = e.target.value;
                                      setTplForm(p => {
                                        const fields = [...p.fields];
                                        fields[idx] = { ...fields[idx], label: v };
                                        return { ...p, fields };
                                      });
                                    }}
                                  />
                                  <Select
                                    value={f.fieldType}
                                    onValueChange={(v: any) => {
                                      setTplForm(p => {
                                        const fields = [...p.fields];
                                        fields[idx] = { ...fields[idx], fieldType: v };
                                        return { ...p, fields };
                                      });
                                    }}
                                  >
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="text">Text</SelectItem>
                                      <SelectItem value="date">Date</SelectItem>
                                      <SelectItem value="number">Number</SelectItem>
                                      <SelectItem value="email">Email</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setTplEditorOpen(false)}>Annulla</Button>
                          <Button disabled={templateUpsert.isPending} onClick={saveTemplate}>Salva</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input value={tplSearch} onChange={e => setTplSearch(e.target.value)} placeholder="Cerca..." />
                {templateList.isLoading ? (
                  <div className="text-sm text-muted-foreground">Caricamento...</div>
                ) : templateItems.length === 0 ? (
                  <div className="text-sm text-muted-foreground">Nessun template disponibile.</div>
                ) : (
                  <div className="space-y-2">
                    {templateItems.map((t: any) => (
                      <button
                        key={t.id}
                        className={`w-full text-left rounded-md border p-2 hover:bg-muted/40 ${tplSelectedId === t.id ? "bg-muted/50" : ""}`}
                        onClick={() => {
                          setTplSelectedId(t.id);
                          setTplData({});
                        }}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="font-medium text-sm line-clamp-1">{t.title}</div>
                          <Badge variant="outline">{t.category}</Badge>
                        </div>
                        {isStaff && t.status !== "published" ? (
                          <div className="text-xs text-muted-foreground mt-1">Stato: {t.status}</div>
                        ) : null}
                      </button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center justify-between">
                  Generatore documento
                  {isStaff && templateGet.data ? (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openTemplateEditor("edit")}>Modifica</Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={async () => {
                          if (!templateGet.data) return;
                          if (!confirm("Eliminare il template?")) return;
                          await templateDelete.mutateAsync({ id: templateGet.data.id });
                          await templateList.refetch();
                          setTplSelectedId(null);
                        }}
                      >
                        Elimina
                      </Button>
                    </div>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {!tplSelectedId ? (
                  <div className="text-sm text-muted-foreground">Seleziona un template per compilare e generare il documento.</div>
                ) : templateGet.isLoading ? (
                  <div className="text-sm text-muted-foreground">Caricamento...</div>
                ) : !templateGet.data ? (
                  <div className="text-sm text-muted-foreground">Template non trovato.</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{templateGet.data.category}</Badge>
                      <Badge variant="outline">{templateGet.data.status}</Badge>
                      <span className="text-xs text-muted-foreground">Aggiornato: {new Date(templateGet.data.updatedAt).toLocaleString("it-IT")}</span>
                    </div>
                    <h2 className="text-xl font-semibold">{templateGet.data.title}</h2>
                    {templateGet.data.description ? (
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{templateGet.data.description}</p>
                    ) : null}

                    <div className="grid gap-3 md:grid-cols-2">
                      {(templateGet.data.fields ?? []).map((f: any) => (
                        <div key={f.id} className="grid gap-1">
                          <Label>{f.label}</Label>
                          <Input
                            type={f.fieldType === "email" ? "email" : f.fieldType === "number" ? "number" : f.fieldType === "date" ? "date" : "text"}
                            value={tplData[f.name] ?? ""}
                            onChange={e => setTplData(p => ({ ...p, [f.name]: e.target.value }))}
                            placeholder={f.name}
                          />
                          {f.helpText ? <div className="text-xs text-muted-foreground">{f.helpText}</div> : null}
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Button
                        variant="outline"
                        onClick={async () => {
                          const r = await exportDoc.refetch();
                          if (!r.data) return;
                          downloadBase64(r.data.filename, r.data.mimeType, r.data.contentBase64);
                        }}
                      >
                        Scarica .doc
                      </Button>
                      {renderPreview.data?.missingKeys?.length ? (
                        <span className="text-xs text-muted-foreground">
                          Campi mancanti: {renderPreview.data.missingKeys.join(", ")}
                        </span>
                      ) : null}
                    </div>

                    <div className="rounded-md border bg-muted/20 p-3">
                      <div className="text-sm font-medium mb-2">Anteprima</div>
                      <div className="text-sm whitespace-pre-wrap">{renderPreview.data?.output ?? ""}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <AIAssistant scope="toolkit" />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
