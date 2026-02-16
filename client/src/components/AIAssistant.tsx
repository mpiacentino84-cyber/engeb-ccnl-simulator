import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

export function AIAssistant({ scope = "all" as const }: { scope?: "legal" | "toolkit" | "all" }) {
  const [question, setQuestion] = useState("");
  const ask = trpc.ai.ask.useMutation();

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-base">Assistente (AI)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Scrivi una domanda. L'assistente risponde usando le fonti presenti nel database e cita i riferimenti.
          <span className="ml-2"><Badge variant="secondary">Informazioni generali</Badge></span>
        </p>
        <Textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          placeholder="Es: Quali passi devo seguire per una richiesta di ANF?"
          rows={3}
        />
        <div className="flex items-center gap-2">
          <Button
            disabled={ask.isLoading || question.trim().length < 3}
            onClick={() => ask.mutate({ question: question.trim(), scope })}
          >
            Chiedi
          </Button>
          {ask.isLoading && <span className="text-sm text-muted-foreground">Elaborazione...</span>}
        </div>

        {ask.data?.answer && (
          <div className="rounded-md border bg-muted/30 p-3">
            <div className="whitespace-pre-wrap text-sm">{ask.data.answer}</div>
          </div>
        )}

        {ask.data?.sources?.length ? (
          <div className="text-xs text-muted-foreground">
            <div className="font-medium text-foreground mb-1">Fonti (dal database)</div>
            <ul className="list-disc pl-5 space-y-1">
              {ask.data.sources.map(s => (
                <li key={s.id}>
                  {s.url ? (
                    <a className="underline" href={s.url} target="_blank" rel="noreferrer">
                      {s.title}
                    </a>
                  ) : (
                    <span>{s.title}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
