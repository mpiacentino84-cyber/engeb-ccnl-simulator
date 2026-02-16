import { useMemo, useState } from "react";
import { Link } from "wouter";
import { AppShell } from "@/components/AppShell";
import { AIAssistant } from "@/components/AIAssistant";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { trpc } from "@/lib/trpc";

const TYPES = [
  { value: "all", label: "Tutti" },
  { value: "law", label: "Legge" },
  { value: "decree", label: "Decreto" },
  { value: "legislative_decree", label: "D.Lgs." },
  { value: "circular", label: "Circolare" },
  { value: "practice", label: "Prassi" },
  { value: "jurisprudence", label: "Giurisprudenza" },
  { value: "contract", label: "Contratto" },
  { value: "other", label: "Altro" },
] as const;

export default function Legal() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<(typeof TYPES)[number]["value"]>("all");
  const [year, setYear] = useState("");

  const query = trpc.legal.list.useQuery({
    search: search.trim() || undefined,
    type: type === "all" ? undefined : (type as any),
    year: year.trim() || undefined,
    limit: 50,
    offset: 0,
  });

  const items = useMemo(() => query.data ?? [], [query.data]);

  return (
    <AppShell
      title="Normativa & Prassi"
      subtitle="Archivio operativo con fonti ufficiali, sintesi e scadenze."
    >
      <div className="mb-4 rounded-md border bg-muted/30 p-3 text-sm text-muted-foreground">
        Questo archivio è pensato per supporto operativo. Le informazioni sono generali e non sostituiscono un parere legale.
      </div>

      <div className="grid gap-3 md:grid-cols-3 mb-6">
        <div className="md:col-span-2">
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cerca per titolo, ente, keyword..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Select value={type} onValueChange={v => setType(v as any)}>
            <SelectTrigger>
              <SelectValue placeholder="Tipo" />
            </SelectTrigger>
            <SelectContent>
              {TYPES.map(t => (
                <SelectItem key={t.value} value={t.value}>
                  {t.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input value={year} onChange={e => setYear(e.target.value)} placeholder="Anno (es. 2026)" />
        </div>
      </div>

      {query.isLoading ? (
        <div className="text-muted-foreground">Caricamento...</div>
      ) : items.length === 0 ? (
        <div className="text-muted-foreground">Nessun risultato. (Suggerimento: avvia lo script di seed per dati demo.)</div>
      ) : (
        <div className="grid gap-3">
          {items.map(item => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">{item.type}</Badge>
                      {item.status !== "published" && <Badge variant="destructive">{item.status}</Badge>}
                      {item.issuingBody && <Badge variant="outline">{item.issuingBody}</Badge>}
                      {item.publishedAt && <Badge variant="outline">{item.publishedAt}</Badge>}
                    </div>
                    <h3 className="text-lg font-semibold mt-2">
                      <Link href={`/legal/${item.id}`}>
                        <a className="hover:underline">{item.title}</a>
                      </Link>
                    </h3>
                    {item.summary ? (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-3">{item.summary}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/legal/${item.id}`}>
                      <Button variant="outline">Apri</Button>
                    </Link>
                    {item.officialUrl ? (
                      <a href={item.officialUrl} target="_blank" rel="noreferrer">
                        <Button>Fonte ufficiale</Button>
                      </a>
                    ) : null}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AIAssistant scope="legal" />
    </AppShell>
  );
}
