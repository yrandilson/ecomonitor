import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, MapPin, AlertCircle, CheckCircle, Trash2, Settings } from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/MainLayout";

export default function Alerts() {
  const { user, isAuthenticated } = useAuth();
  const [filter, setFilter] = useState<"all" | "unread" | "critical">("unread");
  
  // Mock data for alerts
  const mockAlerts = [
    {
      id: 1,
      type: "fire",
      severity: "critical",
      message: "Incêndio crítico detectado a 2.3 km de sua localização",
      location: "Latitude: -23.5505, Longitude: -46.6333",
      distance: 2.3,
      isRead: false,
      createdAt: new Date(Date.now() - 5 * 60000),
    },
    {
      id: 2,
      type: "water_pollution",
      severity: "high",
      message: "Poluição de água detectada no rio próximo",
      location: "Latitude: -23.5510, Longitude: -46.6340",
      distance: 1.5,
      isRead: false,
      createdAt: new Date(Date.now() - 15 * 60000),
    },
    {
      id: 3,
      type: "drought",
      severity: "medium",
      message: "Condições de seca moderada na região",
      location: "Latitude: -23.5500, Longitude: -46.6330",
      distance: 5.2,
      isRead: true,
      createdAt: new Date(Date.now() - 60 * 60000),
    },
  ];

  const handleMarkAsRead = (alertId: number) => {
    toast.success("Alerta marcado como lido");
  };

  const handleDismiss = (alertId: number) => {
    toast.success("Alerta removido");
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300";
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "low":
        return "bg-green-100 text-green-800 border-green-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      fire: "🔥",
      water_pollution: "💧",
      air_pollution: "💨",
      drought: "🌵",
      deforestation: "🌳",
      flooding: "🌊",
    };
    return icons[type] || "📍";
  };

  const filteredAlerts = mockAlerts.filter((alert) => {
    if (filter === "unread") return !alert.isRead;
    if (filter === "critical") return alert.severity === "critical";
    return true;
  });

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
          <Card className="shadow-lg border-0">
            <CardContent className="pt-6 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">Você precisa estar autenticado para ver alertas</p>
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
              Alertas Geoespaciais
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Receba notificações de ocorrências críticas perto de você
            </p>
          </div>

          {/* Alert Settings */}
          <Card className="shadow-lg border-0 mb-8">
            <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações de Alertas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-sm">Raio de Notificação</label>
                  <p className="text-xs text-gray-500 mt-1">Distância máxima para receber alertas</p>
                  <div className="mt-2 flex gap-2">
                    <input type="range" min="1" max="50" defaultValue="10" className="flex-1" />
                    <span className="font-bold text-emerald-600">10 km</span>
                  </div>
                </div>
                <div>
                  <label className="font-semibold text-sm">Tipos de Alerta</label>
                  <p className="text-xs text-gray-500 mt-1">Selecione quais tipos deseja receber</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {["🔥 Incêndio", "💧 Água", "💨 Ar", "🌵 Seca"].map((type) => (
                      <Badge key={type} variant="outline" className="cursor-pointer hover:bg-emerald-100">
                        {type}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <Button className="w-full bg-gradient-to-r from-emerald-600 to-green-600">Salvar Configurações</Button>
            </CardContent>
          </Card>

          {/* Alerts Tabs */}
          <Tabs defaultValue="unread" onValueChange={(v) => setFilter(v as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="all" className="flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Todos ({mockAlerts.length})
              </TabsTrigger>
              <TabsTrigger value="unread" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Não Lidos ({mockAlerts.filter((a) => !a.isRead).length})
              </TabsTrigger>
              <TabsTrigger value="critical" className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Críticos ({mockAlerts.filter((a) => a.severity === "critical").length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {filteredAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onMarkAsRead={handleMarkAsRead}
                  onDismiss={handleDismiss}
                  getSeverityColor={getSeverityColor}
                  getTypeIcon={getTypeIcon}
                />
              ))}
            </TabsContent>

            <TabsContent value="unread" className="space-y-4">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismiss}
                    getSeverityColor={getSeverityColor}
                    getTypeIcon={getTypeIcon}
                  />
                ))
              ) : (
                <Card className="shadow-lg border-0 text-center py-8">
                  <CardContent>
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Nenhum alerta não lido!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="critical" className="space-y-4">
              {filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert) => (
                  <AlertCard
                    key={alert.id}
                    alert={alert}
                    onMarkAsRead={handleMarkAsRead}
                    onDismiss={handleDismiss}
                    getSeverityColor={getSeverityColor}
                    getTypeIcon={getTypeIcon}
                  />
                ))
              ) : (
                <Card className="shadow-lg border-0 text-center py-8">
                  <CardContent>
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-300">Nenhum alerta crítico no momento!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}

function AlertCard({ alert, onMarkAsRead, onDismiss, getSeverityColor, getTypeIcon }: any) {
  return (
    <Card className={`shadow-lg border-0 ${!alert.isRead ? "ring-2 ring-emerald-500" : ""}`}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <span className="text-3xl">{getTypeIcon(alert.type)}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{alert.message}</h3>
              <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
              {!alert.isRead && <Badge className="bg-emerald-100 text-emerald-800">Novo</Badge>}
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {alert.location}
              </span>
              <span className="font-semibold text-emerald-600">{alert.distance} km</span>
              <span>{alert.createdAt.toLocaleTimeString("pt-BR")}</span>
            </div>
          </div>
          <div className="flex gap-2">
            {!alert.isRead && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onMarkAsRead(alert.id)}
                className="border-emerald-300 hover:bg-emerald-50"
              >
                <CheckCircle className="w-4 h-4 mr-1" />
                Lido
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDismiss(alert.id)}
              className="border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Remover
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}