import { useMemo, useState } from "react";
import { Link } from "wouter";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function MyRequests() {
  const { user } = useAuth({ redirectOnUnauthenticated: true });
  const isStaff = user?.role === "admin" || user?.role === "consultant";

  const [status, setStatus] = useState<string>("all");
  const list = trpc.services.myRequests.useQuery({
    status: status === "all" ? undefined : (status as any),
    limit: 100,
  });

  const rows = useMemo(() => list.data ?? [], [list.data]);

  return (
    <AppShell title="Le mie richieste" subtitle="Tracciamento richieste servizi (stato, documenti, timeline).">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="text-sm text-muted-foreground">
          {isStaff ? (
            <span>
              Sei staff: per la vista completa usa <Link href="/admin/requests"><a className="underline">Gestione richieste</a></Link>.
            </span>
          ) : (
            <span>Qui trovi tutte le tue richieste.</span>
          )}
        </div>
        <div className="w-[240px]">
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Filtro stato" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tutte</SelectItem>
              {Object.keys(statusLabels).map(k => (
                <SelectItem key={k} value={k}>{statusLabels[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Elenco</CardTitle>
        </CardHeader>
        <CardContent>
          {list.isLoading ? (
            <div className="text-sm text-muted-foreground">Caricamento...</div>
          ) : rows.length === 0 ? (
            <div className="text-sm text-muted-foreground">Nessuna richiesta trovata.</div>
          ) : (
            <div className="space-y-2">
              {rows.map((r: any) => (
                <Link key={r.id} href={`/requests/${r.id}`}>
                  <a className="block rounded-md border p-3 hover:bg-muted/40">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">{r.subject}</div>
                        <div className="text-xs text-muted-foreground">
                          {r.serviceName} • {r.serviceCategory}
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={r.status === "needs_info" ? "destructive" : "outline"}>
                          {statusLabels[r.status] ?? r.status}
                        </Badge>
                        <div className="text-xs text-muted-foreground mt-1">
                          {new Date(r.updatedAt).toLocaleString("it-IT")}
                        </div>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
