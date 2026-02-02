import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Zap, TrendingUp, Droplets } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { toast } from "sonner";

import MainLayout from "@/components/MainLayout";
export default function Simulators() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("fire");

  // Fire Simulator
  const [fireParams, setFireParams] = useState({
    temperature: 25,
    humidity: 60,
    windSpeed: 15,
  });

  // Water Simulator
  const [waterParams, setWaterParams] = useState({
    rainfall: 50,
    evaporation: 20,
    infiltration: 15,
  });

  // Pollution Simulator
  const [pollutionParams, setPollutionParams] = useState({
    emission: 50,
    windSpeed: 10,
    stability: 50,
  });

  const createSimulation = trpc.simulations.create.useMutation();

  // Fire Risk Calculation
  const calculateFireRisk = () => {
    const tempNorm = (fireParams.temperature - 15) / 30;
    const humidityNorm = (90 - fireParams.humidity) / 80;
    const windNorm = fireParams.windSpeed / 60;
    return Math.min(100, (tempNorm * 0.3 + humidityNorm * 0.3 + windNorm * 0.2) * 100);
  };

  // Water Balance Calculation
  const calculateWaterBalance = () => {
    const balance = fireParams.temperature - fireParams.humidity - fireParams.windSpeed;
    return Math.max(0, Math.min(100, 50 + balance));
  };

  // Pollution Dispersion
  const calculatePollutionDispersion = () => {
    const dispersion = pollutionParams.emission * (1 - pollutionParams.windSpeed / 100) * (pollutionParams.stability / 100);
    return Math.min(100, dispersion);
  };

  const handleSaveSimulation = async () => {
    if (!user) {
      toast.error("Você precisa estar autenticado");
      return;
    }

    try {
      const simType = activeTab === "fire" ? "fire" : activeTab === "water" ? "water" : "pollution";
      const params = activeTab === "fire" ? fireParams : activeTab === "water" ? waterParams : pollutionParams;
      const results = {
        risk: activeTab === "fire" ? calculateFireRisk() : activeTab === "water" ? calculateWaterBalance() : calculatePollutionDispersion(),
        timestamp: new Date().toISOString(),
      };

      await createSimulation.mutateAsync({
        type: simType as any,
        parameters: params,
        results: results,
      });

      toast.success("Simulação salva! +3 pontos");
    } catch (error) {
      console.error("Erro ao salvar simulação:", error);
      toast.error("Erro ao salvar simulação");
    }
  };

  return (
    <MainLayout>
<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Simuladores Educativos
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Explore fenômenos ambientais através de simulações interativas
            </p>
          </div>
  
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="fire" className="flex items-center gap-2">
                <span className="text-xl">🔥</span>
                Incêndio
              </TabsTrigger>
              <TabsTrigger value="water" className="flex items-center gap-2">
                <span className="text-xl">💧</span>
                Hidrologia
              </TabsTrigger>
              <TabsTrigger value="pollution" className="flex items-center gap-2">
                <span className="text-xl">💨</span>
                Poluição
              </TabsTrigger>
            </TabsList>
  
            {/* Fire Simulator */}
            <TabsContent value="fire">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Simulador de Propagação de Incêndio
                    </CardTitle>
                    <CardDescription className="text-red-100">
                      Ajuste os parâmetros para ver como o fogo se propaga
                    </CardDescription>
                  </CardHeader>
  
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold">Temperatura: {fireParams.temperature}°C</label>
                        <Badge variant="outline">{fireParams.temperature > 30 ? "🔥 Quente" : "🌡️ Normal"}</Badge>
                      </div>
                      <Slider
                        min={15}
                        max={45}
                        step={1}
                        value={[fireParams.temperature]}
                        onValueChange={(val) => setFireParams({ ...fireParams, temperature: val[0] })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Intervalo: 15-45°C</p>
                    </div>
  
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold">Umidade: {fireParams.humidity}%</label>
                        <Badge variant="outline">{fireParams.humidity < 40 ? "⚠️ Seca" : "✓ Úmida"}</Badge>
                      </div>
                      <Slider
                        min={10}
                        max={90}
                        step={1}
                        value={[fireParams.humidity]}
                        onValueChange={(val) => setFireParams({ ...fireParams, humidity: val[0] })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Intervalo: 10-90%</p>
                    </div>
  
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold">Vento: {fireParams.windSpeed} km/h</label>
                        <Badge variant="outline">{fireParams.windSpeed > 30 ? "💨 Forte" : "🌬️ Fraco"}</Badge>
                      </div>
                      <Slider
                        min={0}
                        max={60}
                        step={1}
                        value={[fireParams.windSpeed]}
                        onValueChange={(val) => setFireParams({ ...fireParams, windSpeed: val[0] })}
                      />
                      <p className="text-xs text-gray-500 mt-1">Intervalo: 0-60 km/h</p>
                    </div>
  
                    <Button onClick={handleSaveSimulation} className="w-full bg-gradient-to-r from-red-600 to-orange-600">
                      Salvar Simulação (+3 pontos)
                    </Button>
                  </CardContent>
                </Card>
  
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
                    <CardTitle>Análise de Risco</CardTitle>
                  </CardHeader>
  
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold">Risco de Propagação</span>
                          <span className="text-2xl font-bold text-red-600">{calculateFireRisk().toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                            style={{ width: `${calculateFireRisk()}%` }}
                          />
                        </div>
                      </div>
  
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">📊 Interpretação</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {calculateFireRisk() < 30
                            ? "Risco baixo. Condições desfavoráveis para propagação de incêndio."
                            : calculateFireRisk() < 60
                            ? "Risco moderado. Vigilância recomendada."
                            : "Risco alto. Condições perigosas para propagação de incêndio."}
                        </p>
                      </div>
  
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">💡 Dica</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Aumentar a umidade e reduzir o vento diminui significativamente o risco de propagação.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
  
            {/* Water Simulator */}
            <TabsContent value="water">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <Droplets className="w-5 h-5" />
                      Simulador Hidrológico
                    </CardTitle>
                    <CardDescription className="text-blue-100">
                      Balanço hídrico anual (365 dias)
                    </CardDescription>
                  </CardHeader>
  
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold">Precipitação: {waterParams.rainfall} mm</label>
                      </div>
                      <Slider
                        min={0}
                        max={200}
                        step={5}
                        value={[waterParams.rainfall]}
                        onValueChange={(val) => setWaterParams({ ...waterParams, rainfall: val[0] })}
                      />
                    </div>
  
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold">Evaporação: {waterParams.evaporation} mm</label>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[waterParams.evaporation]}
                        onValueChange={(val) => setWaterParams({ ...waterParams, evaporation: val[0] })}
                      />
                    </div>
  
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold">Infiltração: {waterParams.infiltration} mm</label>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[waterParams.infiltration]}
                        onValueChange={(val) => setWaterParams({ ...waterParams, infiltration: val[0] })}
                      />
                    </div>
  
                    <Button onClick={handleSaveSimulation} className="w-full bg-gradient-to-r from-blue-600 to-cyan-600">
                      Salvar Simulação (+3 pontos)
                    </Button>
                  </CardContent>
                </Card>
  
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-teal-500 to-blue-500 text-white rounded-t-lg">
                    <CardTitle>Balanço Hídrico</CardTitle>
                  </CardHeader>
  
                  <CardContent className="pt-6">
                    <div className="space-y-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <span>Precipitação</span>
                          <span className="font-bold text-blue-600">{waterParams.rainfall} mm</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span>- Evaporação</span>
                          <span className="font-bold text-orange-600">{waterParams.evaporation} mm</span>
                        </div>
                        <div className="flex justify-between items-center mb-2">
                          <span>- Infiltração</span>
                          <span className="font-bold text-green-600">{waterParams.infiltration} mm</span>
                        </div>
                        <div className="border-t-2 border-gray-300 pt-2 flex justify-between items-center">
                          <span className="font-semibold">Escoamento</span>
                          <span className="text-xl font-bold text-cyan-600">
                            {Math.max(0, waterParams.rainfall - waterParams.evaporation - waterParams.infiltration)} mm
                          </span>
                        </div>
                      </div>
  
                      <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">📊 Interpretação</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          O escoamento representa a água disponível para rios e aquíferos. Um balanço positivo indica disponibilidade hídrica.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
  
            {/* Pollution Simulator */}
            <TabsContent value="pollution">
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Simulador de Dispersão de Poluentes
                    </CardTitle>
                    <CardDescription className="text-purple-100">
                      Modelo Gaussiano de Pluma
                    </CardDescription>
                  </CardHeader>
  
                  <CardContent className="pt-6 space-y-6">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold">Emissão: {pollutionParams.emission}%</label>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[pollutionParams.emission]}
                        onValueChange={(val) => setPollutionParams({ ...pollutionParams, emission: val[0] })}
                      />
                    </div>
  
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold">Velocidade do Vento: {pollutionParams.windSpeed} km/h</label>
                      </div>
                      <Slider
                        min={0}
                        max={50}
                        step={5}
                        value={[pollutionParams.windSpeed]}
                        onValueChange={(val) => setPollutionParams({ ...pollutionParams, windSpeed: val[0] })}
                      />
                    </div>
  
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="font-semibold">Estabilidade Atmosférica: {pollutionParams.stability}%</label>
                      </div>
                      <Slider
                        min={0}
                        max={100}
                        step={5}
                        value={[pollutionParams.stability]}
                        onValueChange={(val) => setPollutionParams({ ...pollutionParams, stability: val[0] })}
                      />
                    </div>
  
                    <Button onClick={handleSaveSimulation} className="w-full bg-gradient-to-r from-purple-600 to-pink-600">
                      Salvar Simulação (+3 pontos)
                    </Button>
                  </CardContent>
                </Card>
  
                <Card className="shadow-lg border-0">
                  <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-lg">
                    <CardTitle>Concentração de Poluentes</CardTitle>
                  </CardHeader>
  
                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between items-center mb-3">
                          <span className="font-semibold">Concentração Máxima</span>
                          <span className="text-2xl font-bold text-purple-600">
                            {calculatePollutionDispersion().toFixed(1)} µg/m³
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 transition-all"
                            style={{ width: `${calculatePollutionDispersion()}%` }}
                          />
                        </div>
                      </div>
  
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">📊 Interpretação</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {calculatePollutionDispersion() < 35
                            ? "Qualidade do ar boa. Poluentes bem dispersos."
                            : calculatePollutionDispersion() < 70
                            ? "Qualidade do ar moderada. Recomenda-se cautela."
                            : "Qualidade do ar ruim. Concentração alta de poluentes."}
                        </p>
                      </div>
  
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold mb-2">💡 Dica</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Aumentar a velocidade do vento melhora a dispersão de poluentes na atmosfera.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </MainLayout>
  );
}
