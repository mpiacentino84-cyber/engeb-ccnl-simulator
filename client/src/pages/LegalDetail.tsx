import { Link } from "wouter";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";

export default function LegalDetail({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const query = trpc.legal.getById.useQuery({ id }, { enabled: Number.isFinite(id) });

  const src = query.data;

  return (
    <AppShell title="Dettaglio fonte" subtitle="Normativa & Prassi">
      <div className="mb-4">
        <Link href="/legal">
          <a className="text-sm underline">← Torna alla lista</a>
        </Link>
      </div>

      {query.isLoading ? (
        <div className="text-muted-foreground">Caricamento...</div>
      ) : !src ? (
        <div className="text-muted-foreground">Fonte non trovata</div>
      ) : (
        <div className="space-y-3">
          <Card>
            <CardContent className="p-5">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="secondary">{src.type}</Badge>
                    {src.issuingBody && <Badge variant="outline">{src.issuingBody}</Badge>}
                    {src.publishedAt && <Badge variant="outline">Pubblicazione: {src.publishedAt}</Badge>}
                    {src.effectiveFrom && <Badge variant="outline">Decorrenza: {src.effectiveFrom}</Badge>}
                    {src.effectiveTo && <Badge variant="outline">Fine: {src.effectiveTo}</Badge>}
                    {src.status !== "published" && <Badge variant="destructive">{src.status}</Badge>}
                  </div>
                  <h1 className="text-2xl font-semibold mt-3">{src.title}</h1>
                  {src.tags?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {src.tags.map((t: string) => (
                        <Badge key={t} variant="secondary">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
                <div className="flex gap-2">
                  {src.officialUrl ? (
                    <a href={src.officialUrl} target="_blank" rel="noreferrer">
                      <Button>Fonte ufficiale</Button>
                    </a>
                  ) : null}
                </div>
              </div>

              {src.summary ? (
                <div className="mt-4">
                  <h2 className="font-semibold">Sintesi</h2>
                  <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{src.summary}</p>
                </div>
              ) : null}

              {src.body ? (
                <div className="mt-4">
                  <h2 className="font-semibold">Contenuto</h2>
                  <div className="mt-2 rounded-md border bg-muted/20 p-3 text-sm whitespace-pre-wrap">
                    {src.body}
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {src.versions?.length ? (
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold">Versioni / Changelog</h2>
                <div className="mt-2 space-y-2">
                  {src.versions.map((v: any) => (
                    <div key={v.id} className="rounded-md border p-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{v.version}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(v.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {v.changeNote ? (
                        <p className="text-sm mt-2 whitespace-pre-wrap">{v.changeNote}</p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      )}
    </AppShell>
  );
}
