import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Admin from "./pages/Admin";
import Users from "./pages/Users";
import Landing from "./pages/Landing";
import MyCCNL from "./pages/MyCCNL";
import SharedComparison from "./pages/SharedComparison";
import CCNLDatabase from "./pages/CCNLDatabase";
import Statistics from "./pages/Statistics";
import Legal from "./pages/Legal";
import LegalDetail from "./pages/LegalDetail";
import LegalAdmin from "./pages/LegalAdmin";
import Toolkit from "./pages/Toolkit";
import Services from "./pages/Services";
import ServiceDetail from "./pages/ServiceDetail";
import MyRequests from "./pages/MyRequests";
import RequestDetail from "./pages/RequestDetail";
import AdminRequests from "./pages/AdminRequests";
import InitDatabase from "./pages/InitDatabase";

function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Landing} />
      <Route path={"/simulator"} component={Home} />
      <Route path={"/admin"} component={Admin} />
      <Route path={"/users"} component={Users} />
      <Route path={"/admin/users"} component={Users} />
      <Route path={"/my-ccnl"} component={MyCCNL} />
      <Route path={"/my-ccnls"} component={MyCCNL} />
      <Route path={"/share"} component={SharedComparison} />
      <Route path={"/ccnl-database"} component={CCNLDatabase} />
      <Route path={"/database"} component={CCNLDatabase} />      <Route path={"/statistics"} component={Statistics} />
      <Route path={"/init-database"} component={InitDatabase} />

      {/* Normativa & Prassi */}
      <Route path={"/legal"} component={Legal} />
      <Route path={"/legal/:id"} component={LegalDetail} />
      <Route path={"/admin/legal"} component={LegalAdmin} />

      {/* Toolkit & Servizi */}
      <Route path={"/toolkit"} component={Toolkit} />
      <Route path={"/services"} component={Services} />
      <Route path={"/services/:id"} component={ServiceDetail} />
      <Route path={"/requests"} component={MyRequests} />
      <Route path={"/requests/:id"} component={RequestDetail} />
      <Route path={"/admin/requests"} component={AdminRequests} />

      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
