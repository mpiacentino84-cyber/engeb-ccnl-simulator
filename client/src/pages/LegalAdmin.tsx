import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const TYPES = [
  "law",
  "decree",
  "legislative_decree",
  "circular",
  "practice",
  "jurisprudence",
  "contract",
  "other",
] as const;

const STATUSES = ["draft", "published", "archived"] as const;

export default function LegalAdmin() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [status, setStatus] = useState<(typeof STATUSES)[number] | "all">("all");
  const [search, setSearch] = useState("");
  const list = trpc.legal.list.useQuery({
    status: status === "all" ? undefined : status,
    search: search.trim() || undefined,
    limit: 100,
    offset: 0,
  });

  const upsert = trpc.legal.upsert.useMutation({
    onSuccess: async () => {
      await utils.legal.list.invalidate();
    },
  });

  const items = useMemo(() => list.data ?? [], [list.data]);
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selected = useMemo(
    () => items.find(i => i.id === selectedId) ?? null,
    [items, selectedId]
  );

  const detail = trpc.legal.getById.useQuery(
    { id: selectedId ?? 0 },
    { enabled: !!selectedId }
  );

  const [form, setForm] = useState<any>({
    type: "law",
    title: "",
    issuingBody: "",
    officialUrl: "",
    publishedAt: "",
    effectiveFrom: "",
    effectiveTo: "",
    status: "draft",
    summary: "",
    body: "",
    tags: "",
    versionNote: "",
  });

  useEffect(() => {
    if (!detail.data) return;
    const d = detail.data as any;
    setForm({
      id: d.id,
      type: d.type,
      title: d.title,
      issuingBody: d.issuingBody ?? "",
      officialUrl: d.officialUrl ?? "",
      publishedAt: d.publishedAt ?? "",
      effectiveFrom: d.effectiveFrom ?? "",
      effectiveTo: d.effectiveTo ?? "",
      status: d.status,
      summary: d.summary ?? "",
      body: d.body ?? "",
      tags: (d.tags ?? []).join(", "),
      versionNote: "",
    });
  }, [detail.data]);

  if (!user || user.role !== "admin") {
    return (
      <AppShell title="Admin Normativa" subtitle="Accesso riservato">
        <div className="text-muted-foreground">Solo admin.</div>
      </AppShell>
    );
  }

  const save = () => {
    upsert.mutate({
      id: form.id,
      type: form.type,
      title: form.title,
      issuingBody: form.issuingBody || null,
      officialUrl: form.officialUrl || null,
      publishedAt: form.publishedAt || null,
      effectiveFrom: form.effectiveFrom || null,
      effectiveTo: form.effectiveTo || null,
      status: form.status,
      summary: form.summary || null,
      body: form.body || null,
      tags: String(form.tags || "")
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean),
      versionNote: form.versionNote || null,
    });
  };

  const newDoc = () => {
    setSelectedId(null);
    setForm({
      type: "law",
      title: "",
      issuingBody: "",
      officialUrl: "",
      publishedAt: "",
      effectiveFrom: "",
      effectiveTo: "",
      status: "draft",
      summary: "",
      body: "",
      tags: "",
      versionNote: "",
    });
  };

  return (
    <AppShell title="Admin • Normativa & Prassi" subtitle="Gestione repository fonti">
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Elenco</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca..." />
              <Select value={status} onValueChange={v => setStatus(v as any)}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tutti</SelectItem>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={newDoc} variant="outline">
                Nuovo
              </Button>
            </div>
            {list.isLoading ? (
              <div className="text-muted-foreground">Caricamento...</div>
            ) : items.length === 0 ? (
              <div className="text-muted-foreground">Nessun elemento</div>
            ) : (
              <div className="space-y-2">
                {items.map(i => (
                  <button
                    key={i.id}
                    className={
                      "w-full text-left rounded-md border p-3 hover:bg-muted/40 transition " +
                      (selectedId === i.id ? "bg-muted/40" : "")
                    }
                    onClick={() => setSelectedId(i.id)}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{i.type}</Badge>
                      <Badge variant={i.status === "published" ? "outline" : "destructive"}>{i.status}</Badge>
                      {i.publishedAt && <Badge variant="outline">{i.publishedAt}</Badge>}
                    </div>
                    <div className="font-medium mt-2 line-clamp-2">{i.title}</div>
                    {i.issuingBody ? (
                      <div className="text-xs text-muted-foreground mt-1">{i.issuingBody}</div>
                    ) : null}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Editor</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Select value={form.type} onValueChange={v => setForm((f: any) => ({ ...f, type: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  {TYPES.map(t => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={form.status} onValueChange={v => setForm((f: any) => ({ ...f, status: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Stato" />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map(s => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Input value={form.title} onChange={e => setForm((f: any) => ({ ...f, title: e.target.value }))} placeholder="Titolo" />
            <div className="grid grid-cols-2 gap-3">
              <Input value={form.issuingBody} onChange={e => setForm((f: any) => ({ ...f, issuingBody: e.target.value }))} placeholder="Ente emanante" />
              <Input value={form.publishedAt} onChange={e => setForm((f: any) => ({ ...f, publishedAt: e.target.value }))} placeholder="Pubblicazione (YYYY-MM-DD)" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input value={form.effectiveFrom} onChange={e => setForm((f: any) => ({ ...f, effectiveFrom: e.target.value }))} placeholder="Decorrenza" />
              <Input value={form.effectiveTo} onChange={e => setForm((f: any) => ({ ...f, effectiveTo: e.target.value }))} placeholder="Fine" />
            </div>
            <Input value={form.officialUrl} onChange={e => setForm((f: any) => ({ ...f, officialUrl: e.target.value }))} placeholder="URL fonte ufficiale" />
            <Input value={form.tags} onChange={e => setForm((f: any) => ({ ...f, tags: e.target.value }))} placeholder="Tag (separati da virgola)" />
            <Textarea value={form.summary} onChange={e => setForm((f: any) => ({ ...f, summary: e.target.value }))} placeholder="Sintesi" rows={4} />
            <Textarea value={form.body} onChange={e => setForm((f: any) => ({ ...f, body: e.target.value }))} placeholder="Contenuto (testo/markdown)" rows={8} />
            <Textarea value={form.versionNote} onChange={e => setForm((f: any) => ({ ...f, versionNote: e.target.value }))} placeholder="Nota versione (opzionale)" rows={2} />

            <div className="flex items-center gap-2">
              <Button onClick={save} disabled={upsert.isLoading || !form.title || form.title.length < 3}>
                Salva
              </Button>
              {upsert.isLoading && <span className="text-sm text-muted-foreground">Salvataggio...</span>}
              {upsert.error && <span className="text-sm text-red-600">Errore: {upsert.error.message}</span>}
              {upsert.data?.id && <Badge variant="outline">ID: {upsert.data.id}</Badge>}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
