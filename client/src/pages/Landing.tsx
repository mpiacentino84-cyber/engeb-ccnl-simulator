import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart3,
  TrendingUp,
  Users,
  Shield,
  Calculator,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useLocation } from "wouter";

export default function Landing() {
  const [, setLocation] = useLocation();

  const handleStartSimulator = () => {
    setLocation("/simulator");
  };

  const features = [
    {
      icon: Calculator,
      title: "Calcoli Precisi",
      description:
        "Confronta il costo del lavoro con algoritmi di calcolo affidabili e aggiornati",
    },
    {
      icon: BarChart3,
      title: "Visualizzazioni Grafiche",
      description: "Analizza i dati attraverso grafici intuitivi e facili da interpretare",
    },
    {
      icon: Shield,
      title: "Trasparenza Totale",
      description:
        "Visualizza tutti i contributi specifici: Ente Bilaterale, COASCO, Assistenza Sanitaria",
    },
    {
      icon: TrendingUp,
      title: "Trend di Crescita",
      description: "Scopri i dati di crescita e adesione di ENGEB per settore merceologico",
    },
    {
      icon: Users,
      title: "Confronto Settoriale",
      description: "Filtra per settore e confronta i CCNL più rilevanti per la tua attività",
    },
    {
      icon: ArrowRight,
      title: "Esportazione Dati",
      description: "Scarica i risultati del confronto in formato PDF per presentazioni",
    },
  ];

  const benefits = [
    {
      title: "Per le Imprese",
      points: [
        "Valuta il costo reale del lavoro con ENGEB",
        "Confronta i CCNL nazionali alternativi",
        "Analizza i benefici aggiuntivi offerti",
        "Prendi decisioni informate sulla contrattazione",
      ],
    },
    {
      title: "Per i Sindacati",
      points: [
        "Dimostra la competitività dei CCNL ENGEB",
        "Evidenzia i vantaggi della contrattazione collettiva",
        "Supporta la negoziazione con dati concreti",
        "Comunica il valore aggiunto ai lavoratori",
      ],
    },
    {
      title: "Per le Associazioni Datoriali",
      points: [
        "Strumento di advocacy per i CCNL ENGEB",
        "Facilita la comunicazione con le imprese associate",
        "Supporta la strategia di crescita territoriale",
        "Aumenta la visibilità e l'appeal dei servizi",
      ],
    },
  ];

  const stats = [
    { number: "7", label: "CCNL Disponibili" },
    { number: "1.400+", label: "Aziende Aderenti" },
    { number: "18.000+", label: "Lavoratori Tutelati" },
    { number: "€3.1M", label: "Fatturato Gestito" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Navigation */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="font-bold text-lg text-gray-800">ENGEB Simulator</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setLocation("/statistics")}
              variant="outline"
              className="hidden lg:inline-flex"
            >
              Statistiche
            </Button>
            <Button
              onClick={() => setLocation("/ccnl-database")}
              variant="outline"
              className="hidden md:inline-flex"
            >
              Database CCNL
            </Button>
            <Button
              onClick={() => setLocation("/my-ccnl")}
              variant="outline"
              className="hidden sm:inline-flex"
            >
              I Miei CCNL
            </Button>
            <Button onClick={handleStartSimulator} className="bg-blue-600 hover:bg-blue-700">
              Accedi al Simulatore
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Confronta il Costo del Lavoro
              </h1>
              <p className="text-xl text-gray-600">
                Scopri come i CCNL ENGEB si posizionano rispetto ai competitor nazionali. Analizza
                stipendi, contributi e benefici con trasparenza totale.
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={handleStartSimulator}
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold w-full sm:w-auto"
              >
                Inizia il Confronto Gratuito
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-gray-600">
                ✓ Nessuna registrazione richiesta • ✓ Risultati istantanei • ✓ Esportazione PDF
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4 pt-8 border-t">
              {stats.map((stat, idx) => (
                <div key={idx} className="space-y-1">
                  <p className="text-2xl font-bold text-blue-600">{stat.number}</p>
                  <p className="text-sm text-gray-600">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero Image/Illustration */}
          <div className="bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl p-8 shadow-lg">
            <div className="space-y-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-600">
                <p className="text-sm font-semibold text-gray-700">ENGEB Multisettore</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">€1.928,50</p>
                <p className="text-xs text-gray-500">Costo mensile</p>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-600">
                <p className="text-sm font-semibold text-gray-700">EBINTER Terziario</p>
                <p className="text-2xl font-bold text-green-600">€2.002,50</p>
                <p className="text-xs text-gray-500">Costo mensile</p>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
                <p className="text-sm font-semibold text-gray-700 mb-2">Differenza</p>
                <p className="text-2xl font-bold text-green-600">-€74/mese</p>
                <p className="text-xs text-gray-600 mt-2">
                  ✓ Vantaggio ENGEB: 3.84% all'anno
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Cosa Puoi Fare</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Il simulatore ENGEB offre una suite completa di strumenti per analizzare e confrontare
              i CCNL in modo professionale e trasparente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-blue-50 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Benefici per Tutti</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Che tu sia un'impresa, un sindacato o un'associazione datoriale, il simulatore offre
              valore concreto.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {benefits.map((benefit, idx) => (
              <Card key={idx} className="border-2">
                <CardHeader>
                  <CardTitle className="text-xl text-blue-600">{benefit.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {benefit.points.map((point, pidx) => (
                      <li key={pidx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-700">{point}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CCNL Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">CCNL Disponibili</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Confronta i principali contratti collettivi nazionali del lavoro
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { name: "ENGEB Multisettore", issuer: "CONFAEL-FAL / CONFIMITALIA", color: "blue" },
              { name: "ENGEB Turismo", issuer: "CONFAEL-FAL / SNALP", color: "blue" },
              { name: "ENGEB Commercio", issuer: "CONFIMITALIA / CONFAEL", color: "blue" },
              { name: "EBINTER Terziario", issuer: "Confcommercio / CGIL / CISL", color: "green" },
              { name: "EBNT Turismo", issuer: "EBNT", color: "green" },
              { name: "EBIL Intersettoriale", issuer: "EBIL / CONFIMPRESE", color: "green" },
              { name: "Artigianato", issuer: "CONFIMITALIA", color: "amber" },
            ].map((ccnl, idx) => (
              <Card key={idx} className={`border-l-4 ${
                ccnl.color === "blue"
                  ? "border-l-blue-600 bg-blue-50"
                  : ccnl.color === "green"
                    ? "border-l-green-600 bg-green-50"
                    : "border-l-amber-600 bg-amber-50"
              }`}>
                <CardContent className="pt-6">
                  <p className="font-semibold text-gray-900">{ccnl.name}</p>
                  <p className="text-sm text-gray-600 mt-2">{ccnl.issuer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-700 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Pronto a Confrontare i CCNL?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Accedi al simulatore gratuito e scopri come i CCNL ENGEB si posizionano nel mercato.
            Nessuna registrazione richiesta.
          </p>
          <Button
            onClick={handleStartSimulator}
            size="lg"
            className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-6 text-lg font-semibold"
          >
            Accedi al Simulatore
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <p className="font-semibold text-white mb-4">ENGEB</p>
              <p className="text-sm">
                Ente Bilaterale per il Commercio, il Turismo e i Servizi
              </p>
            </div>
            <div>
              <p className="font-semibold text-white mb-4">Strumenti</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={handleStartSimulator}
                    className="hover:text-white transition-colors"
                  >
                    Simulatore CCNL
                  </button>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Documentazione
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    FAQ
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-4">Informazioni</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Chi Siamo
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contatti
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-white mb-4">Seguici</p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Facebook
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 ENGEB. Tutti i diritti riservati.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
