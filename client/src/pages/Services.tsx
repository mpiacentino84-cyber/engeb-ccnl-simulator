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
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Services() {
  const { user } = useAuth();
  const isStaff = user?.role === "admin" || user?.role === "consultant";
  const [, setLocation] = useLocation();

  const [search, setSearch] = useState("");
  const list = trpc.services.list.useQuery({ search: search.trim() || undefined, limit: 100 });

  const upsert = trpc.services.upsert.useMutation();
  const [editorOpen, setEditorOpen] = useState(false);
  const [form, setForm] = useState({
    id: undefined as number | undefined,
    name: "",
    category: "Ente bilaterale",
    description: "",
    eligibility: "",
    procedure: "",
    slaDays: 15,
    status: "draft" as "draft" | "published" | "archived",
  });

  const items = useMemo(() => list.data ?? [], [list.data]);

  const openNew = () => {
    setForm({
      id: undefined,
      name: "Nuovo servizio",
      category: "Ente bilaterale",
      description: "",
      eligibility: "",
      procedure: "",
      slaDays: 15,
      status: "draft",
    });
    setEditorOpen(true);
  };

  const save = async () => {
    const res = await upsert.mutateAsync({
      id: form.id,
      name: form.name,
      category: form.category,
      description: form.description || null,
      eligibility: form.eligibility || null,
      procedure: form.procedure || null,
      slaDays: form.slaDays ?? null,
      status: form.status,
    });
    await list.refetch();
    setEditorOpen(false);
    setLocation(`/services/${res.id}`);
  };

  return (
    <AppShell title="Servizi" subtitle="Catalogo servizi, prestazioni e procedure (sindacati / enti bilaterali).">
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center justify-between">
              Catalogo
              {isStaff ? (
                <Dialog open={editorOpen} onOpenChange={setEditorOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" onClick={openNew}>
                      Nuovo
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>{form.id ? "Modifica servizio" : "Nuovo servizio"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-3">
                      <div className="grid gap-2">
                        <Label>Nome</Label>
                        <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="grid gap-2">
                          <Label>Categoria</Label>
                          <Input value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
                        </div>
                        <div className="grid gap-2">
                          <Label>Stato</Label>
                          <Select value={form.status} onValueChange={(v: any) => setForm(p => ({ ...p, status: v }))}>
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
                        <Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Requisiti / eleggibilità</Label>
                        <Textarea value={form.eligibility} onChange={e => setForm(p => ({ ...p, eligibility: e.target.value }))} rows={3} />
                      </div>
                      <div className="grid gap-2">
                        <Label>Procedura / istruzioni</Label>
                        <Textarea value={form.procedure} onChange={e => setForm(p => ({ ...p, procedure: e.target.value }))} rows={5} />
                      </div>
                      <div className="grid gap-2">
                        <Label>SLA (giorni) – opzionale</Label>
                        <Input type="number" value={form.slaDays} onChange={e => setForm(p => ({ ...p, slaDays: Number(e.target.value) }))} />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditorOpen(false)}>Annulla</Button>
                      <Button disabled={upsert.isPending} onClick={save}>Salva</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : null}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca servizi..." />
            {list.isLoading ? (
              <div className="text-sm text-muted-foreground">Caricamento...</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-muted-foreground">Nessun servizio disponibile.</div>
            ) : (
              <div className="space-y-2">
                {items.map((s: any) => (
                  <Link key={s.id} href={`/services/${s.id}`}>
                    <a className="block rounded-md border p-2 hover:bg-muted/40">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-medium text-sm line-clamp-1">{s.name}</div>
                        <Badge variant="outline">{s.category}</Badge>
                      </div>
                      {isStaff && s.status !== "published" ? (
                        <div className="text-xs text-muted-foreground mt-1">Stato: {s.status}</div>
                      ) : null}
                    </a>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Come funziona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Seleziona un servizio per vedere requisiti, procedura e modulistica. Se sei autenticato, puoi avviare una richiesta
              guidata con caricamento documenti e tracciamento stato.
            </p>
            <p>
              <b>Nota:</b> questa area fornisce informazioni generali e workflow operativi. Non sostituisce consulenza legale.
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
