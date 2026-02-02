import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, Redirect } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportOccurrence from "./pages/ReportOccurrence";
import MapView from "./pages/MapView";
import Simulators from "./pages/Simulators";
import Dashboard from "./pages/Dashboard";
import Feed from "./pages/Feed";
import AdminPanel from "./pages/AdminPanel";
import Alerts from "./pages/Alerts";
import ActivityHistory from "./pages/ActivityHistory";
import ReportContent from "./pages/ReportContent";
import DataExport from "./pages/DataExport";
import UserSettings from "./pages/Settings";
import About from "./pages/About";
import PredictiveDashboard from "./pages/PredictiveDashboard";
import { useAuth } from "./_core/hooks/useAuth";
import { Loader2 } from "lucide-react";

// Componente para proteger rotas
function ProtectedRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Redirect to="/login" />;
  }

  return <Component {...rest} />;
}

// Componente para redirecionar usuários autenticados
function PublicRoute({ component: Component, ...rest }: any) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (isAuthenticated) {
    if (user?.role === 'admin') {
      return <Redirect to="/admin" />;
    }
    return <Redirect to="/dashboard" />;
  }

  return <Component {...rest} />;
}

function Router() {
  return (
    <Switch>
      {/* Rotas públicas - redirecionam para dashboard se autenticado */}
      <Route path="/login">
        {() => <PublicRoute component={Login} />}
      </Route>
      <Route path="/register">
        {() => <PublicRoute component={Register} />}
      </Route>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />

      {/* Rotas protegidas - requerem autenticação */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/report">
        {() => <ProtectedRoute component={ReportOccurrence} />}
      </Route>
      <Route path="/map">
        {() => <ProtectedRoute component={MapView} />}
      </Route>
      <Route path="/simulators">
        {() => <ProtectedRoute component={Simulators} />}
      </Route>
      <Route path="/feed">
        {() => <ProtectedRoute component={Feed} />}
      </Route>
      <Route path="/admin">
        {() => <ProtectedRoute component={AdminPanel} />}
      </Route>
      <Route path="/alerts">
        {() => <ProtectedRoute component={Alerts} />}
      </Route>
      <Route path="/activity">
        {() => <ProtectedRoute component={ActivityHistory} />}
      </Route>
      <Route path="/report-content">
        {() => <ProtectedRoute component={ReportContent} />}
      </Route>
      <Route path="/export">
        {() => <ProtectedRoute component={DataExport} />}
      </Route>
      <Route path="/settings">
        {() => <ProtectedRoute component={UserSettings} />}
      </Route>
      <Route path="/predictive">
        {() => <ProtectedRoute component={PredictiveDashboard} />}
      </Route>

      {/* 404 */}
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
