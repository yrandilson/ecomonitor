import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Map, TrendingUp, Users, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-blue-50 to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌍</span>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
              EcoMonitor
            </h1>
          </div>
          <div className="flex gap-3">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" className="hover:bg-emerald-50">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/alerts">
                  <Button variant="outline" className="hover:bg-emerald-50">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Alertas
                  </Button>
                </Link>
                <Link href="/map">
                  <Button variant="outline" className="hover:bg-emerald-50">
                    <Map className="w-4 h-4 mr-2" />
                    Mapa
                  </Button>
                </Link>
                <Link href="/report">
                  <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    Reportar
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" className="hover:bg-emerald-50">
                    Entrar
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700">
                    Criar Conta
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <Badge className="mb-4 bg-emerald-100 text-emerald-800 border-emerald-300">
            Monitoramento Ambiental Colaborativo
          </Badge>
          
          <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-emerald-600 via-green-600 to-cyan-600 bg-clip-text text-transparent">
            Proteja o Ambiente Juntos
          </h2>
          
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            EcoMonitor é uma plataforma colaborativa que integra monitoramento em tempo real, análise científica de riscos e educação ambiental para proteger nossos recursos naturais.
          </p>

          <div className="flex gap-4 justify-center mb-12">
            {isAuthenticated ? (
              <>
                <Link href="/report">
                  <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    Reportar Ocorrência
                  </Button>
                </Link>
                <Link href="/map">
                  <Button size="lg" variant="outline" className="border-emerald-300 hover:bg-emerald-50">
                    <Map className="w-5 h-5 mr-2" />
                    Explorar Mapa
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Link href="/register">
                  <Button size="lg" className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-emerald-700 text-white">
                    Começar Agora
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="border-emerald-300 hover:bg-emerald-50">
                  Saiba Mais
                </Button>
              </>
            )}
          </div>

          {loading && <Loader2 className="w-6 h-6 animate-spin mx-auto" />}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white dark:bg-slate-800/50">
        <div className="container mx-auto max-w-5xl">
          <h3 className="text-3xl font-bold text-center mb-12">Funcionalidades Principais</h3>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-emerald-500 to-green-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Registro Colaborativo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Reporte incêndios, poluição, seca e outros problemas ambientais com fotos, localização GPS e parâmetros físicos.
                </p>
              </CardContent>
            </Card>

            {/* Feature 2 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Map className="w-5 h-5" />
                  Mapa Interativo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Visualize todas as ocorrências em tempo real no mapa, com filtros por tipo, severidade e data.
                </p>
              </CardContent>
            </Card>

            {/* Feature 3 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Análise de Riscos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Algoritmos científicos calculam automaticamente o risco de propagação de incêndios e outros fenômenos.
                </p>
              </CardContent>
            </Card>

            {/* Feature 4 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Simuladores Educativos
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Explore simuladores interativos de propagação de incêndio, hidrologia e dispersão de poluentes.
                </p>
              </CardContent>
            </Card>

            {/* Feature 5 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-indigo-500 to-blue-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Validação Comunitária
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-600 dark:text-gray-300">
                  A comunidade valida ocorrências, criando um sistema de confiança baseado em consenso.
                </p>
              </CardContent>
            </Card>

            {/* Feature 6 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Gamificação
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Ganhe pontos, badges e suba no ranking ao contribuir com reportes e validações.
                </p>
              </CardContent>
            </Card>

            {/* Feature 7 */}
            <Card className="border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader className="bg-gradient-to-br from-violet-500 to-purple-500 text-white rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Previsões ML
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <p className="text-gray-600 dark:text-gray-300">
                  Dashboard preditivo com Machine Learning para prever riscos de incêndio nos próximos 7 dias.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-emerald-600">1.247</div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Ocorrências Reportadas</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-blue-600">892</div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Validadas</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-600">358</div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Usuários Ativos</p>
            </div>
            <div>
              <div className="text-4xl font-bold text-orange-600">1.089</div>
              <p className="text-gray-600 dark:text-gray-300 mt-2">Simulações</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-gradient-to-r from-emerald-600 to-green-600">
        <div className="container mx-auto max-w-2xl text-center text-white">
          <h3 className="text-3xl font-bold mb-4">Pronto para Fazer Diferença?</h3>
          <p className="text-lg mb-8 text-emerald-100">
            Junte-se a centenas de pessoas que estão protegendo o ambiente através do monitoramento colaborativo.
          </p>
          {!isAuthenticated && (
            <Link href="/register">
              <Button size="lg" className="bg-white text-emerald-600 hover:bg-gray-100">
                Criar Conta Agora
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 px-4">
        <div className="container mx-auto text-center">
          <p>&copy; 2026 EcoMonitor. Monitoramento Ambiental Colaborativo.</p>
          <p className="text-sm text-gray-500 mt-2">Desenvolvido com ❤️ para proteger o ambiente</p>
        </div>
      </footer>
    </div>
  );
}
