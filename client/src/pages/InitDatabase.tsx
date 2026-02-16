import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";

export default function InitDatabase() {
  const [result, setResult] = useState<{
    success: boolean;
    steps: string[];
    errors: string[];
  } | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const initMutation = trpc.init.database.useMutation({
    onSuccess: (data) => {
      setResult(data);
      setIsInitializing(false);
    },
    onError: (error) => {
      setResult({
        success: false,
        steps: [],
        errors: [error.message],
      });
      setIsInitializing(false);
    },
  });

  const handleInitialize = () => {
    setIsInitializing(true);
    setResult(null);
    initMutation.mutate();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Inizializzazione Database</CardTitle>
          <CardDescription>
            Esegui questa operazione una sola volta per inizializzare il database con tabelle, CCNL e statistiche.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!result && !isInitializing && (
            <Alert>
              <AlertDescription>
                <p className="mb-4">
                  Questa operazione eseguirà:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Creazione delle tabelle del database (migrazioni Drizzle)</li>
                  <li>Popolamento di 26 CCNL con livelli e contributi</li>
                  <li>Popolamento delle statistiche mensili per i grafici trend</li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  ⏱️ Tempo stimato: 2-5 minuti
                </p>
              </AlertDescription>
            </Alert>
          )}

          {isInitializing && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-3 text-lg">Inizializzazione in corso...</span>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <Alert variant={result.success ? "default" : "destructive"}>
                <AlertDescription className="flex items-center">
                  {result.success ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Inizializzazione completata con successo!</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="h-5 w-5 mr-2" />
                      <span className="font-semibold">Inizializzazione fallita</span>
                    </>
                  )}
                </AlertDescription>
              </Alert>

              {result.steps.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Passi Eseguiti</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 font-mono text-sm">
                      {result.steps.map((step, idx) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-muted-foreground mr-2">{idx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {result.errors.length > 0 && (
                <Card className="border-destructive">
                  <CardHeader>
                    <CardTitle className="text-lg text-destructive">Errori</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 font-mono text-sm text-destructive">
                      {result.errors.map((error, idx) => (
                        <li key={idx}>{error}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {result.success && (
                <div className="pt-4">
                  <Button
                    onClick={() => (window.location.href = "/")}
                    className="w-full"
                  >
                    Vai alla Home
                  </Button>
                </div>
              )}
            </div>
          )}

          {!result && !isInitializing && (
            <Button
              onClick={handleInitialize}
              className="w-full"
              size="lg"
            >
              Inizializza Database
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
