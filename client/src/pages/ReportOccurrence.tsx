import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { MapPin, Upload, AlertCircle } from "lucide-react";
import MainLayout from "@/components/MainLayout";

const OCCURRENCE_TYPES = [
  { value: "fire", label: "🔥 Incêndio", icon: "🔥" },
  { value: "water_pollution", label: "💧 Poluição da Água", icon: "💧" },
  { value: "air_pollution", label: "💨 Poluição do Ar", icon: "💨" },
  { value: "drought", label: "🏜️ Seca", icon: "🏜️" },
  { value: "deforestation", label: "🌳 Desmatamento", icon: "🌳" },
  { value: "flooding", label: "🌊 Enchente", icon: "🌊" },
  { value: "other", label: "❓ Outro", icon: "❓" },
];

const SEVERITY_LEVELS = [
  { value: "low", label: "Baixa", color: "bg-blue-500" },
  { value: "medium", label: "Média", color: "bg-yellow-500" },
  { value: "high", label: "Alta", color: "bg-orange-500" },
  { value: "critical", label: "Crítica", color: "bg-red-500" },
];

export default function ReportOccurrence() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string>("fire");
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [description, setDescription] = useState<string>("");
  const [severity, setSeverity] = useState<string>("medium");
  const [photos, setPhotos] = useState<File[]>([]);
  const [physicalParams, setPhysicalParams] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const createOccurrence = trpc.occurrences.create.useMutation();

  // Get current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast.success("Localização capturada com sucesso!");
        },
        (error) => {
          console.error("Erro ao obter localização:", error);
          toast.error("Não foi possível obter sua localização");
        }
      );
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 5) {
      toast.error("Máximo de 5 fotos permitidas");
      return;
    }
    setPhotos([...photos, ...files]);
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error("Você precisa estar autenticado");
      return;
    }

    if (!latitude || !longitude) {
      toast.error("Localização é obrigatória");
      return;
    }

    setLoading(true);
    try {
      await createOccurrence.mutateAsync({
        type: selectedType as any,
        latitude,
        longitude,
        description,
        severity: severity as any,
        physicalParameters: Object.keys(physicalParams).length > 0 ? physicalParams : undefined,
      });

      toast.success("Ocorrência registrada com sucesso! +10 pontos");
      
      // Reset form
      setDescription("");
      setPhotos([]);
      setPhysicalParams({});
      setSeverity("medium");
    } catch (error) {
      console.error("Erro ao registrar ocorrência:", error);
      toast.error("Erro ao registrar ocorrência");
    } finally {
      setLoading(false);
    }
  };

  const renderPhysicalParams = () => {
    switch (selectedType) {
      case "fire":
        return (
          <div className="space-y-4">
            <div>
              <Label>Temperatura Ambiente: {physicalParams.temperature || 25}°C</Label>
              <Slider
                min={15}
                max={45}
                step={1}
                value={[physicalParams.temperature || 25]}
                onValueChange={(val) => setPhysicalParams({ ...physicalParams, temperature: val[0] })}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Umidade Relativa: {physicalParams.humidity || 50}%</Label>
              <Slider
                min={10}
                max={90}
                step={1}
                value={[physicalParams.humidity || 50]}
                onValueChange={(val) => setPhysicalParams({ ...physicalParams, humidity: val[0] })}
                className="mt-2"
              />
            </div>
            <div>
              <Label>Velocidade do Vento: {physicalParams.windSpeed || 10} km/h</Label>
              <Slider
                min={0}
                max={60}
                step={1}
                value={[physicalParams.windSpeed || 10]}
                onValueChange={(val) => setPhysicalParams({ ...physicalParams, windSpeed: val[0] })}
                className="mt-2"
              />
            </div>
            <div>
              <Label htmlFor="vegetation">Tipo de Vegetação</Label>
              <Select value={physicalParams.vegetation || "grass"} onValueChange={(val) => setPhysicalParams({ ...physicalParams, vegetation: val })}>
                <SelectTrigger id="vegetation">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="grass">Grama</SelectItem>
                  <SelectItem value="shrub">Arbustos</SelectItem>
                  <SelectItem value="forest">Floresta</SelectItem>
                  <SelectItem value="mixed">Misto</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "water_pollution":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="water-level">Nível da Água</Label>
              <Select value={physicalParams.waterLevel || "normal"} onValueChange={(val) => setPhysicalParams({ ...physicalParams, waterLevel: val })}>
                <SelectTrigger id="water-level">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixo</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="high">Alto</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="water-color">Cor da Água</Label>
              <Select value={physicalParams.waterColor || "clear"} onValueChange={(val) => setPhysicalParams({ ...physicalParams, waterColor: val })}>
                <SelectTrigger id="water-color">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Transparente</SelectItem>
                  <SelectItem value="cloudy">Turva</SelectItem>
                  <SelectItem value="brown">Marrom</SelectItem>
                  <SelectItem value="green">Verde</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case "air_pollution":
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="air-quality">Qualidade do Ar Percebida</Label>
              <Select value={physicalParams.airQuality || "good"} onValueChange={(val) => setPhysicalParams({ ...physicalParams, airQuality: val })}>
                <SelectTrigger id="air-quality">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">Boa</SelectItem>
                  <SelectItem value="moderate">Moderada</SelectItem>
                  <SelectItem value="poor">Ruim</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="visibility">Visibilidade</Label>
              <Select value={physicalParams.visibility || "clear"} onValueChange={(val) => setPhysicalParams({ ...physicalParams, visibility: val })}>
                <SelectTrigger id="visibility">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clear">Clara</SelectItem>
                  <SelectItem value="hazy">Nebulosa</SelectItem>
                  <SelectItem value="poor">Péssima</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="container max-w-2xl mx-auto px-4">
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5" />
                Registrar Ocorrência Ambiental
              </CardTitle>
              <CardDescription className="text-emerald-100">
                Ajude a comunidade reportando problemas ambientais na sua região
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Tipo de Ocorrência */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Tipo de Ocorrência</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {OCCURRENCE_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setSelectedType(type.value)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          selectedType === type.value
                            ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                            : "border-gray-200 dark:border-gray-700 hover:border-emerald-300"
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-xs">{type.label.split(" ")[1]}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Localização */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="0.00001"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      placeholder="Ex: -5.8967"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="0.00001"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      placeholder="Ex: -35.2075"
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Severidade */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Nível de Severidade</Label>
                  <div className="grid grid-cols-4 gap-2">
                    {SEVERITY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setSeverity(level.value)}
                        className={`p-3 rounded-lg border-2 transition-all font-medium ${
                          severity === level.value
                            ? `${level.color} text-white border-2 border-current`
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300"
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Descrição */}
                <div>
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva a situação em detalhes..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 min-h-24"
                  />
                </div>

                {/* Parâmetros Físicos */}
                <Tabs defaultValue="params" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="params">Parâmetros Físicos</TabsTrigger>
                    <TabsTrigger value="photos">Fotos ({photos.length}/5)</TabsTrigger>
                  </TabsList>

                  <TabsContent value="params" className="mt-4">
                    {renderPhysicalParams()}
                  </TabsContent>

                  <TabsContent value="photos" className="mt-4">
                    <div className="space-y-4">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-emerald-300 rounded-lg p-6 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors flex flex-col items-center gap-2"
                      >
                        <Upload className="w-6 h-6 text-emerald-600" />
                        <span className="font-medium text-emerald-700 dark:text-emerald-300">
                          Clique para adicionar fotos
                        </span>
                        <span className="text-sm text-gray-500">Máximo 5 fotos</span>
                      </button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />

                      {photos.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {photos.map((photo, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={`Preview ${idx}`}
                                className="w-full h-24 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removePhoto(idx)}
                                className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={loading || !latitude || !longitude}
                  className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold py-3 rounded-lg transition-all"
                >
                  {loading ? "Registrando..." : "Registrar Ocorrência (+10 pontos)"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}