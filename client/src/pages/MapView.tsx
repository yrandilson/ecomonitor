import { useEffect, useRef, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { MapPin, AlertCircle, TrendingUp } from "lucide-react";
import { toast } from "sonner";

import MainLayout from "@/components/MainLayout";
const OCCURRENCE_ICONS: Record<string, string> = {
  fire: "🔥",
  water_pollution: "💧",
  air_pollution: "💨",
  drought: "🏜️",
  deforestation: "🌳",
  flooding: "🌊",
  other: "❓",
};

const SEVERITY_COLORS: Record<string, string> = {
  low: "bg-blue-100 text-blue-800 border-blue-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  critical: "bg-red-100 text-red-800 border-red-300",
};

export default function MapView() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedOccurrence, setSelectedOccurrence] = useState<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  const [markers, setMarkers] = useState<any[]>([]);

  const { data: recentOccurrences, isLoading } = trpc.occurrences.getRecent.useQuery({ limit: 100 });

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || mapInstance) return;

    // Dynamically import Leaflet
    import("leaflet").then((L) => {
      const map = L.map(mapContainer.current!).setView([-5.8967, -35.2075], 10); // Quixadá, CE

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      setMapInstance(map);
    });
  }, []);

  // Update markers when occurrences change
  useEffect(() => {
    if (!mapInstance || !recentOccurrences) return;

    // Clear existing markers
    markers.forEach((marker) => marker.remove());

    import("leaflet").then((L) => {
      const newMarkers: any[] = [];

      recentOccurrences.forEach((occurrence) => {
        // Filter by type and severity
        if (selectedType !== "all" && occurrence.type !== selectedType) return;
        if (selectedSeverity !== "all" && occurrence.severity !== selectedSeverity) return;

        const icon = OCCURRENCE_ICONS[occurrence.type as keyof typeof OCCURRENCE_ICONS] || "❓";

        // Create custom marker
        const markerElement = document.createElement("div");
        markerElement.className = "text-3xl cursor-pointer hover:scale-125 transition-transform";
        markerElement.innerHTML = icon;
        markerElement.style.filter = "drop-shadow(0 2px 4px rgba(0,0,0,0.3))";

        const customIcon = L.divIcon({
          html: markerElement.outerHTML,
          iconSize: [40, 40],
          className: "custom-marker",
        });

        const marker = L.marker([(occurrence.latitude as unknown as number), (occurrence.longitude as unknown as number)], {
          icon: customIcon,
        })
          .addTo(mapInstance)
          .on("click", () => {
            setSelectedOccurrence(occurrence);
          });

        newMarkers.push(marker);
      });

      setMarkers(newMarkers);
    });
  }, [mapInstance, recentOccurrences, selectedType, selectedSeverity]);

  return (
    <MainLayout>
<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Map */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-0 h-full">
                <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-lg">
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Mapa de Ocorrências
                  </CardTitle>
                  <CardDescription className="text-emerald-100">
                    Visualize os problemas ambientais reportados na região
                  </CardDescription>
                </CardHeader>
  
                <CardContent className="p-0">
                  <div
                    ref={mapContainer}
                    className="w-full h-96 lg:h-[600px] rounded-b-lg"
                    style={{ minHeight: "400px" }}
                  />
                </CardContent>
              </Card>
            </div>
  
            {/* Sidebar */}
            <div className="space-y-4">
              {/* Filters */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-t-lg">
                  <CardTitle className="text-lg">Filtros</CardTitle>
                </CardHeader>
  
                <CardContent className="pt-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Tipo de Ocorrência</label>
                    <Select value={selectedType} onValueChange={setSelectedType}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os Tipos</SelectItem>
                        <SelectItem value="fire">🔥 Incêndio</SelectItem>
                        <SelectItem value="water_pollution">💧 Poluição da Água</SelectItem>
                        <SelectItem value="air_pollution">💨 Poluição do Ar</SelectItem>
                        <SelectItem value="drought">🏜️ Seca</SelectItem>
                        <SelectItem value="deforestation">🌳 Desmatamento</SelectItem>
                        <SelectItem value="flooding">🌊 Enchente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
  
                  <div>
                    <label className="text-sm font-medium mb-2 block">Severidade</label>
                    <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas</SelectItem>
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="critical">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
  
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700">
                    Aplicar Filtros
                  </Button>
                </CardContent>
              </Card>
  
              {/* Selected Occurrence Details */}
              {selectedOccurrence && (
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      Detalhes
                    </CardTitle>
                  </CardHeader>
  
                  <CardContent className="pt-4 space-y-3">
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Tipo</p>
                      <p className="text-lg font-semibold">
                        {OCCURRENCE_ICONS[selectedOccurrence.type as keyof typeof OCCURRENCE_ICONS]}{" "}
                        {selectedOccurrence.type.replace(/_/g, " ")}
                      </p>
                    </div>
  
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Severidade</p>
                      <Badge className={`${SEVERITY_COLORS[selectedOccurrence.severity]}`}>
                        {selectedOccurrence.severity.toUpperCase()}
                      </Badge>
                    </div>
  
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Localização</p>
                      <p className="text-sm font-mono">
                        {selectedOccurrence.latitude.toFixed(4)}, {selectedOccurrence.longitude.toFixed(4)}
                      </p>
                    </div>
  
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold">Descrição</p>
                      <p className="text-sm">{selectedOccurrence.description || "Sem descrição"}</p>
                    </div>
  
                    <div className="flex gap-2 pt-2">
                      <Badge variant="outline" className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3" />
                        Risco: {(selectedOccurrence.riskScore || 0).toFixed(1)}
                      </Badge>
                    </div>
  
                    <div className="flex gap-2 text-xs text-gray-500">
                      <span>✓ {selectedOccurrence.communityValidations || 0} validações</span>
                      <span>✕ {selectedOccurrence.communityRejections || 0} rejeições</span>
                    </div>
                  </CardContent>
                </Card>
              )}
  
              {/* Statistics */}
              <Card className="shadow-lg border-0">
                <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
                  <CardTitle className="text-lg">Estatísticas</CardTitle>
                </CardHeader>
  
                <CardContent className="pt-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Total de Ocorrências:</span>
                      <span className="font-bold">{recentOccurrences?.length || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Críticas:</span>
                      <span className="font-bold text-red-600">
                        {recentOccurrences?.filter((o) => o.severity === "critical").length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Validadas:</span>
                      <span className="font-bold text-green-600">
                        {recentOccurrences?.filter((o) => o.status === "validated").length || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
