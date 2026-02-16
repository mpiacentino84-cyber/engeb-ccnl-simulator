import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export default function ServiceDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { user } = useAuth();
  const isAuthed = Boolean(user);
  const isStaff = user?.role === "admin" || user?.role === "consultant";
  const [, setLocation] = useLocation();

  const service = trpc.services.getById.useQuery({ id }, { enabled: Number.isFinite(id) });
  const upsert = trpc.services.upsert.useMutation();
  const addDoc = trpc.services.addDocument.useMutation();
  const upload = trpc.files.uploadBase64.useMutation();

  const createDraft = trpc.services.requestCreateDraft.useMutation();
  const addFile = trpc.services.requestAddFile.useMutation();
  const submit = trpc.services.requestSubmit.useMutation();

  const [requestId, setRequestId] = useState<number | null>(null);
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");

  const [docOpen, setDocOpen] = useState(false);
  const [docTitle, setDocTitle] = useState("");
  const [docRequired, setDocRequired] = useState(false);
  const [docFile, setDocFile] = useState<File | null>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    category: "",
    description: "",
    eligibility: "",
    procedure: "",
    slaDays: 0,
    status: "draft" as "draft" | "published" | "archived",
  });

  const s = service.data;
  const docs = useMemo(() => s?.documents ?? [], [s?.documents]);

  const startRequest = async () => {
    if (!s) return;
    const res = await createDraft.mutateAsync({
      serviceId: s.id,
      subject: subject.trim() || `Richiesta: ${s.name}`,
      notes: notes.trim() || null,
    });
    setRequestId(res.id);
  };

  const uploadRequestFile = async (file: File) => {
    if (!requestId) return;
    const base64 = await fileToBase64(file);
    const up = await upload.mutateAsync({
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      base64,
      purpose: "service_request",
      visibility: "private",
    });
    await addFile.mutateAsync({ requestId, fileId: up.id, label: file.name });
  };

  const submitRequest = async () => {
    if (!requestId) return;
    await submit.mutateAsync({ requestId });
    setLocation(`/requests/${requestId}`);
  };

  const openEdit = () => {
    if (!s) return;
    setEditForm({
      name: s.name,
      category: s.category,
      description: s.description ?? "",
      eligibility: s.eligibility ?? "",
      procedure: s.procedure ?? "",
      slaDays: s.slaDays ?? 0,
      status: s.status as any,
    });
    setEditOpen(true);
  };

  const saveEdit = async () => {
    if (!s) return;
    await upsert.mutateAsync({
      id: s.id,
      name: editForm.name,
      category: editForm.category,
      description: editForm.description || null,
      eligibility: editForm.eligibility || null,
      procedure: editForm.procedure || null,
      slaDays: editForm.slaDays || null,
      status: editForm.status,
    });
    await service.refetch();
    setEditOpen(false);
  };

  const addDocument = async () => {
    if (!s || !docFile) return;
    const base64 = await fileToBase64(docFile);
    const up = await upload.mutateAsync({
      fileName: docFile.name,
      mimeType: docFile.type || "application/octet-stream",
      base64,
      purpose: "service_doc",
      visibility: "public",
    });
    await addDoc.mutateAsync({ serviceId: s.id, title: docTitle || docFile.name, fileId: up.id, isRequired: docRequired });
    await service.refetch();
    setDocFile(null);
    setDocTitle("");
    setDocRequired(false);
    setDocOpen(false);
  };

  const utils = trpc.useUtils();

  const openFile = async (fileId: number) => {
    const r = await utils.files.getDownloadUrl.fetch({ id: fileId });
    window.open(r.url, "_blank", "noreferrer");
  };

  return (
    <AppShell title="Dettaglio servizio" subtitle="Servizi e prestazioni (wizard richiesta + upload + tracking).">
      <div className="mb-4">
        <Link href="/services">
          <a className="text-sm underline">← Torna al catalogo</a>
        </Link>
      </div>

      {service.isLoading ? (
        <div className="text-sm text-muted-foreground">Caricamento...</div>
      ) : !s ? (
        <div className="text-sm text-muted-foreground">Servizio non trovato.</div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{s.category}</Badge>
                    <Badge variant="outline">{s.status}</Badge>
                    {s.slaDays != null ? <Badge variant="outline">SLA: {s.slaDays} gg</Badge> : null}
                  </div>
                  <h1 className="text-2xl font-semibold mt-2">{s.name}</h1>
                  {s.description ? (
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{s.description}</p>
                  ) : null}
                </div>
                {isStaff ? (
                  <div className="flex gap-2">
                    <Dialog open={editOpen} onOpenChange={setEditOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" onClick={openEdit}>Modifica</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader><DialogTitle>Modifica servizio</DialogTitle></DialogHeader>
                        <div className="grid gap-3">
                          <div className="grid gap-2"><Label>Nome</Label><Input value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} /></div>
                          <div className="grid gap-2"><Label>Categoria</Label><Input value={editForm.category} onChange={e => setEditForm(p => ({ ...p, category: e.target.value }))} /></div>
                          <div className="grid gap-2"><Label>Descrizione</Label><Textarea value={editForm.description} onChange={e => setEditForm(p => ({ ...p, description: e.target.value }))} rows={3} /></div>
                          <div className="grid gap-2"><Label>Requisiti</Label><Textarea value={editForm.eligibility} onChange={e => setEditForm(p => ({ ...p, eligibility: e.target.value }))} rows={3} /></div>
                          <div className="grid gap-2"><Label>Procedura</Label><Textarea value={editForm.procedure} onChange={e => setEditForm(p => ({ ...p, procedure: e.target.value }))} rows={5} /></div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="grid gap-2"><Label>SLA (giorni)</Label><Input type="number" value={editForm.slaDays} onChange={e => setEditForm(p => ({ ...p, slaDays: Number(e.target.value) }))} /></div>
                            <div className="grid gap-2">
                              <Label>Stato</Label>
                              <Select value={editForm.status} onValueChange={(v: any) => setEditForm(p => ({ ...p, status: v }))}>
                                <SelectTrigger><SelectValue /></SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="draft">Draft</SelectItem>
                                  <SelectItem value="published">Published</SelectItem>
                                  <SelectItem value="archived">Archived</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setEditOpen(false)}>Annulla</Button>
                          <Button disabled={upsert.isPending} onClick={saveEdit}>Salva</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    <Dialog open={docOpen} onOpenChange={setDocOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">Aggiungi documento</Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-xl">
                        <DialogHeader><DialogTitle>Documento / modulistica</DialogTitle></DialogHeader>
                        <div className="grid gap-3">
                          <div className="grid gap-2">
                            <Label>Titolo</Label>
                            <Input value={docTitle} onChange={e => setDocTitle(e.target.value)} placeholder="Es: Modulo richiesta" />
                          </div>
                          <div className="grid gap-2">
                            <Label>File (PDF/DOCX/XLSX)</Label>
                            <Input type="file" onChange={e => setDocFile(e.target.files?.[0] ?? null)} />
                          </div>
                          <div className="flex items-center gap-2">
                            <Switch checked={docRequired} onCheckedChange={v => setDocRequired(Boolean(v))} />
                            <span className="text-sm">Richiesto</span>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setDocOpen(false)}>Annulla</Button>
                          <Button disabled={!docFile || addDoc.isPending || upload.isPending} onClick={addDocument}>Salva</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                ) : null}
              </div>

              {s.eligibility ? (
                <div className="mt-4">
                  <h2 className="font-semibold">Requisiti</h2>
                  <div className="mt-2 rounded-md border bg-muted/20 p-3 text-sm whitespace-pre-wrap">{s.eligibility}</div>
                </div>
              ) : null}
              {s.procedure ? (
                <div className="mt-4">
                  <h2 className="font-semibold">Procedura</h2>
                  <div className="mt-2 rounded-md border bg-muted/20 p-3 text-sm whitespace-pre-wrap">{s.procedure}</div>
                </div>
              ) : null}

              <div className="mt-4">
                <h2 className="font-semibold">Modulistica / Documenti</h2>
                <div className="mt-2 space-y-2">
                  {docs.length === 0 ? (
                    <div className="text-sm text-muted-foreground">Nessun documento associato.</div>
                  ) : (
                    docs.map((d: any) => (
                      <div key={d.id} className="rounded-md border p-3 flex items-center justify-between gap-3">
                        <div>
                          <div className="font-medium text-sm">{d.title}</div>
                          <div className="text-xs text-muted-foreground">{d.fileName}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          {Boolean(d.isRequired) ? <Badge>Richiesto</Badge> : <Badge variant="outline">Opzionale</Badge>}
                          <Button variant="outline" onClick={() => openFile(d.fileId)}>Apri</Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Richiesta prestazione</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {!isAuthed ? (
                <div className="text-sm text-muted-foreground">
                  Per avviare una richiesta devi effettuare il login.
                </div>
              ) : !requestId ? (
                <div className="grid gap-3">
                  <div className="grid gap-2">
                    <Label>Oggetto richiesta</Label>
                    <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder={`Es: Richiesta ${s.name}`} />
                  </div>
                  <div className="grid gap-2">
                    <Label>Note (opzionale)</Label>
                    <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} />
                  </div>
                  <div className="flex items-center gap-2">
                    <Button disabled={createDraft.isPending} onClick={startRequest}>Crea bozza</Button>
                    <span className="text-xs text-muted-foreground">Crei una bozza e poi carichi i documenti.</span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-sm">
                    Bozza #{requestId} creata. Carica i documenti e invia.
                  </div>
                  <div className="grid gap-2">
                    <Label>Carica documento</Label>
                    <Input
                      type="file"
                      onChange={async e => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        await uploadRequestFile(f);
                        e.currentTarget.value = "";
                      }}
                    />
                    <div className="text-xs text-muted-foreground">Max 8MB. Tipi consentiti: PDF, immagini, DOC/DOCX, XLS/XLSX, TXT.</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button disabled={submit.isPending} onClick={submitRequest}>Invia richiesta</Button>
                    <Link href={`/requests/${requestId}`}>
                      <a className="text-sm underline">Vai al dettaglio</a>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="text-xs text-muted-foreground">
            Disclaimer: informazioni generali e workflow operativi. Non sostituisce consulenza legale.
          </div>
        </div>
      )}
    </AppShell>
  );
}
