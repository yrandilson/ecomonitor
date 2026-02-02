import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThumbsUp, ThumbsDown, MessageCircle, MapPin, Calendar, AlertCircle } from "lucide-react";
import { toast } from "sonner";

import MainLayout from "@/components/MainLayout";
export default function Feed() {
  const { user } = useAuth();
  const [selectedOccurrence, setSelectedOccurrence] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  
  const { data: recentOccurrences } = trpc.occurrences.getRecent.useQuery({ limit: 50 });
  const { data: validations } = trpc.validations.getByOccurrence.useQuery(
    { occurrenceId: selectedOccurrence || 0 },
    { enabled: !!selectedOccurrence }
  );
  const createValidation = trpc.validations.create.useMutation();

  const handleValidate = async (occurrenceId: number, isValid: boolean) => {
    try {
      await createValidation.mutateAsync({
        occurrenceId,
        isValid,
        comment: comment || undefined,
      });
      toast.success(isValid ? "Validado com sucesso! +5 pontos" : "Rejeitado com sucesso! +5 pontos");
      setComment("");
      setSelectedOccurrence(null);
    } catch (error) {
      toast.error("Erro ao validar ocorrência");
    }
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
      other: "⚠️",
    };
    return icons[type] || "📍";
  };

  return (
    <MainLayout>
<div className="min-h-screen bg-gradient-to-br from-emerald-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              Feed Colaborativo
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Valide ocorrências da comunidade e ganhe pontos
            </p>
          </div>
  
          <div className="space-y-4">
            {recentOccurrences?.map((occurrence) => {
              const validationCount = validations?.length || 0;
              const isSelected = selectedOccurrence === occurrence.id;
              
              return (
                <Card
                  key={occurrence.id}
                  className={`shadow-lg border-0 cursor-pointer transition-all ${
                    isSelected ? "ring-2 ring-emerald-500" : "hover:shadow-xl"
                  }`}
                  onClick={() => setSelectedOccurrence(isSelected ? null : occurrence.id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <span className="text-3xl">{getTypeIcon(occurrence.type)}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <CardTitle className="text-lg">
                              {occurrence.type.replace(/_/g, " ").toUpperCase()}
                            </CardTitle>
                            <Badge className={getSeverityColor(occurrence.severity)}>
                              {occurrence.severity}
                            </Badge>
                          </div>
                          <CardDescription className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {Number(occurrence.latitude).toFixed(4)}, {Number(occurrence.longitude).toFixed(4)}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {new Date(occurrence.createdAt).toLocaleDateString("pt-BR")}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-emerald-600">
                          {Number(occurrence.riskScore || 0).toFixed(1)}%
                        </div>
                        <p className="text-xs text-gray-500">Risco</p>
                      </div>
                    </div>
                  </CardHeader>
  
                  <CardContent className="space-y-4">
                    {occurrence.description && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{occurrence.description}</p>
                      </div>
                    )}
  
                    {/* Validation Stats */}
                    <div className="grid grid-cols-3 gap-2 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-green-600">
                          {validations?.filter(v => v.isValid).length || 0}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Validações</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-red-600">
                          {validations?.filter(v => !v.isValid).length || 0}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Rejeições</p>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">
                          {occurrence.status === "validated" ? "✓" : "⏳"}
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Status</p>
                      </div>
                    </div>
  
                    {/* Validation Form */}
                    {isSelected && user && (
                      <div className="space-y-3 bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border-2 border-emerald-200 dark:border-emerald-800">
                        <h4 className="font-semibold flex items-center gap-2">
                          <AlertCircle className="w-4 h-4" />
                          Validar esta ocorrência
                        </h4>
                        
                        <Textarea
                          placeholder="Adicione um comentário sobre sua validação (opcional)"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="min-h-20"
                        />
  
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleValidate(occurrence.id, true)}
                            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                            disabled={createValidation.isPending}
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Validar (+5 pts)
                          </Button>
                          <Button
                            onClick={() => handleValidate(occurrence.id, false)}
                            variant="outline"
                            className="flex-1 border-red-300 hover:bg-red-50"
                            disabled={createValidation.isPending}
                          >
                            <ThumbsDown className="w-4 h-4 mr-2" />
                            Rejeitar (+5 pts)
                          </Button>
                        </div>
                      </div>
                    )}
  
                    {/* Comments Section */}
                    {validations && validations.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2">
                          <MessageCircle className="w-4 h-4" />
                          Comentários ({validations.length})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {validations.map((validation, idx) => (
                            <div key={idx} className="bg-gray-50 dark:bg-gray-800 p-2 rounded text-sm">
                              <div className="flex items-center gap-2 mb-1">
                                <Avatar className="w-6 h-6">
                                  <AvatarFallback>U{validation.userId}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium">Usuário #{validation.userId}</span>
                                <Badge variant={validation.isValid ? "default" : "destructive"} className="text-xs">
                                  {validation.isValid ? "✓ Válido" : "✗ Inválido"}
                                </Badge>
                              </div>
                              {validation.comment && (
                                <p className="text-gray-700 dark:text-gray-300 ml-8">{validation.comment}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
  
          {!recentOccurrences || recentOccurrences.length === 0 && (
            <Card className="shadow-lg border-0 text-center py-12">
              <CardContent>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  Nenhuma ocorrência para validar no momento
                </p>
                <p className="text-sm text-gray-500">
                  Volte mais tarde ou registre uma nova ocorrência
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </MainLayout>
  );
}
