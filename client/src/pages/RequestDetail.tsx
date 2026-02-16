import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

const statusLabels: Record<string, string> = {
  draft: "Bozza",
  submitted: "Inviata",
  in_review: "In lavorazione",
  needs_info: "Richiesta integrazioni",
  approved: "Approvata",
  rejected: "Respinta",
  closed: "Chiusa",
};

async function fileToBase64(file: File): Promise<string> {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export default function RequestDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const isStaff = user?.role === "admin" || user?.role === "consultant";
  const [, setLocation] = useLocation();

  const req = trpc.services.requestGet.useQuery({ id }, { enabled: Number.isFinite(id) });
  const upload = trpc.files.uploadBase64.useMutation();
  const addFile = trpc.services.requestAddFile.useMutation();
  const submit = trpc.services.requestSubmit.useMutation();
  const updateStatus = trpc.services.updateRequestStatus.useMutation();
  const utils = trpc.useUtils();

  const [note, setNote] = useState("");
  const [toStatus, setToStatus] = useState<string>("in_review");

  const canUserSubmit = req.data && (req.data.status === "draft" || req.data.status === "needs_info");
  const canUpload = req.data && (req.data.status === "draft" || req.data.status === "needs_info" || isStaff);

  const files = useMemo(() => req.data?.files ?? [], [req.data?.files]);
  const events = useMemo(() => req.data?.events ?? [], [req.data?.events]);

  const openFile = async (fileId: number) => {
    const r = await utils.files.getDownloadUrl.fetch({ id: fileId });
    window.open(r.url, "_blank", "noreferrer");
  };

  const uploadOne = async (file: File) => {
    if (!req.data) return;
    const base64 = await fileToBase64(file);
    const up = await upload.mutateAsync({
      fileName: file.name,
      mimeType: file.type || "application/octet-stream",
      base64,
      purpose: "service_request",
      visibility: "private",
    });
    await addFile.mutateAsync({ requestId: req.data.id, fileId: up.id, label: file.name });
    await req.refetch();
  };

  const submitRequest = async () => {
    if (!req.data) return;
    await submit.mutateAsync({ requestId: req.data.id });
    await req.refetch();
  };

  const staffUpdate = async () => {
    if (!req.data) return;
    await updateStatus.mutateAsync({ requestId: req.data.id, toStatus: toStatus as any, note: note.trim() || null });
    setNote("");
    await req.refetch();
  };

  return (
    <AppShell title="Dettaglio richiesta" subtitle="Documenti, timeline e gestione stati (workflow).">
      <div className="mb-4 flex items-center justify-between gap-2">
        <Link href="/requests">
          <a className="text-sm underline">← Torna alle richieste</a>
        </Link>
        {isStaff ? (
          <Link href="/admin/requests">
            <a className="text-sm underline">Gestione staff</a>
          </Link>
        ) : null}
      </div>

      {req.isLoading ? (
        <div className="text-sm text-muted-foreground">Caricamento...</div>
      ) : !req.data ? (
        <div className="text-sm text-muted-foreground">Richiesta non trovata.</div>
      ) : (
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{req.data.serviceCategory}</Badge>
                    <Badge variant="outline">{req.data.serviceName}</Badge>
                    <Badge variant={req.data.status === "needs_info" ? "destructive" : "outline"}>
                      {statusLabels[req.data.status] ?? req.data.status}
                    </Badge>
                  </div>
                  <h1 className="text-2xl font-semibold mt-2">{req.data.subject}</h1>
                  {req.data.notes ? (
                    <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{req.data.notes}</p>
                  ) : null}
                </div>
                <div className="text-xs text-muted-foreground">
                  Aggiornata: {new Date(req.data.updatedAt).toLocaleString("it-IT")}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Documenti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {canUpload ? (
                <div className="grid gap-2">
                  <Label>Carica documento</Label>
                  <Input
                    type="file"
                    onChange={async e => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      await uploadOne(f);
                      e.currentTarget.value = "";
                    }}
                  />
                  <div className="text-xs text-muted-foreground">Max 8MB. Tipi consentiti: PDF, immagini, DOC/DOCX, XLS/XLSX, TXT.</div>
                </div>
              ) : null}

              {files.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nessun documento caricato.</div>
              ) : (
                <div className="space-y-2">
                  {files.map((f: any) => (
                    <div key={f.id} className="rounded-md border p-3 flex items-center justify-between gap-3">
                      <div>
                        <div className="font-medium text-sm">{f.label ?? f.fileName}</div>
                        <div className="text-xs text-muted-foreground">{f.fileName} • {Math.round((f.sizeBytes ?? 0) / 1024)} KB</div>
                      </div>
                      <Button variant="outline" onClick={() => openFile(f.fileId)}>Apri</Button>
                    </div>
                  ))}
                </div>
              )}

              {canUserSubmit ? (
                <div className="flex items-center gap-2">
                  <Button disabled={submit.isPending} onClick={submitRequest}>Invia richiesta</Button>
                  <span className="text-xs text-muted-foreground">Invia quando hai caricato i documenti.</span>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {isStaff ? (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Gestione staff</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label>Nuovo stato</Label>
                    <Select value={toStatus} onValueChange={setToStatus}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {Object.keys(statusLabels).map(k => (
                          <SelectItem key={k} value={k}>{statusLabels[k]}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label>Nota (opzionale)</Label>
                    <Textarea value={note} onChange={e => setNote(e.target.value)} rows={3} />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button disabled={updateStatus.isPending} onClick={staffUpdate}>Aggiorna</Button>
                  <Button variant="outline" onClick={() => setLocation(`/services/${req.data?.serviceId}`)}>Apri servizio</Button>
                </div>
              </CardContent>
            </Card>
          ) : null}

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-sm text-muted-foreground">Nessun evento.</div>
              ) : (
                <div className="space-y-2">
                  {events.map((ev: any) => (
                    <div key={ev.id} className="rounded-md border p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="text-sm">
                          <Badge variant="outline">{ev.toStatus}</Badge>
                          {ev.fromStatus ? <span className="text-xs text-muted-foreground"> ← {ev.fromStatus}</span> : null}
                        </div>
                        <div className="text-xs text-muted-foreground">{new Date(ev.createdAt).toLocaleString("it-IT")}</div>
                      </div>
                      {ev.note ? <div className="text-sm mt-2 whitespace-pre-wrap">{ev.note}</div> : null}
                    </div>
                  ))}
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
