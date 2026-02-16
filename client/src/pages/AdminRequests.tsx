import { useMemo, useState } from "react";
import { Link } from "wouter";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

export default function AdminRequests() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const isStaff = user?.role === "admin" || user?.role === "consultant";
  if (!isStaff) {
    return (
      <AppShell title="Gestione richieste" subtitle="Accesso riservato allo staff">
        <div className="text-sm text-muted-foreground">Non autorizzato.</div>
      </AppShell>
    );
  }

  const [status, setStatus] = useState<string>("all");
  const [search, setSearch] = useState("");

  const q = trpc.services.adminRequests.useQuery({
    status: status === "all" ? undefined : (status as any),
    search: search.trim() || undefined,
    limit: 100,
    offset: 0,
  });

  const rows = useMemo(() => q.data?.items ?? [], [q.data?.items]);

  return (
    <AppShell title="Gestione richieste" subtitle="Vista staff: tutte le richieste e priorità operative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
        <div className="flex gap-2">
          <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cerca per oggetto o servizio..." className="w-[320px]" />
          <div className="w-[240px]">
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue placeholder="Stato" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutte</SelectItem>
                {Object.keys(statusLabels).map(k => (
                  <SelectItem key={k} value={k}>{statusLabels[k]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="text-xs text-muted-foreground">Totale: {q.data?.total ?? 0}</div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Elenco richieste</CardTitle>
        </CardHeader>
        <CardContent>
          {q.isLoading ? (
            <div className="text-sm text-muted-foreground">Caricamento...</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nessuna richiesta.</div>
          ) : (
            <div className="space-y-2">
              {rows.map((r: any) => (
                <div key={r.id} className="rounded-md border p-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-medium">{r.subject}</div>
                    <div className="text-xs text-muted-foreground">{r.serviceName} • {r.serviceCategory}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={r.status === "needs_info" ? "destructive" : "outline"}>
                      {statusLabels[r.status] ?? r.status}
                    </Badge>
                    <div className="text-xs text-muted-foreground hidden md:block">{new Date(r.updatedAt).toLocaleString("it-IT")}</div>
                    <Link href={`/requests/${r.id}`}>
                      <a><Button size="sm" variant="outline">Apri</Button></a>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="mt-4 text-xs text-muted-foreground">
        Suggerimento operativo: usa lo stato <b>needs_info</b> per richiedere integrazioni documentali.
      </div>
    </AppShell>
  );
}
