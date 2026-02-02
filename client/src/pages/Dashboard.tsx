import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Trophy, Star, TrendingUp, Users, AlertCircle, Zap } from "lucide-react";
import { Link, Redirect } from "wouter";
import MainLayout from "@/components/MainLayout";

const BADGE_INFO: Record<string, { icon: string; color: string; description: string }> = {
  fire_watcher: { icon: "🔥", color: "text-red-600", description: "Vigilante do Fogo" },
  water_guardian: { icon: "💧", color: "text-blue-600", description: "Guardião da Água" },
  verifier: { icon: "✓", color: "text-green-600", description: "Verificador" },
  student: { icon: "📚", color: "text-yellow-600", description: "Estudante" },
  star: { icon: "⭐", color: "text-purple-600", description: "Estrela" },
  environmental_hero: { icon: "🦸", color: "text-orange-600", description: "Herói Ambiental" },
};

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  const { data: topRankings } = trpc.gamification.getTopRankings.useQuery({ limit: 10 });
  const { data: monthlyRankings } = trpc.gamification.getMonthlyRankings.useQuery({ limit: 10 });
  const { data: userBadges } = trpc.gamification.getUserBadges.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user }
  );
  const { data: recentOccurrences } = trpc.occurrences.getRecent.useQuery({ limit: 50 });

  // Redirecionar administradores para o painel correto
  if (isAuthenticated && user?.role === 'admin') {
    return <Redirect to="/admin" />;
  }

  // Prepare chart data
  const occurrencesByType = recentOccurrences
    ? Object.entries(
        recentOccurrences.reduce((acc: Record<string, number>, occ) => {
          acc[occ.type] = (acc[occ.type] || 0) + 1;
          return acc;
        }, {})
      ).map(([type, count]) => ({
        name: type.replace(/_/g, " "),
        value: count,
      }))
    : [];

  const occurrencesBySeverity = recentOccurrences
    ? Object.entries(
        recentOccurrences.reduce((acc: Record<string, number>, occ) => {
          acc[occ.severity] = (acc[occ.severity] || 0) + 1;
          return acc;
        }, {})
      ).map(([severity, count]) => ({
        name: severity,
        value: count,
      }))
    : [];

  const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];

  return (
    <MainLayout>
      <div className="container mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Bem-vindo, {user?.name}! 👋</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card className="shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pontos Totais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-emerald-600">{user?.points || 0}</div>
              <p className="text-xs text-gray-500 mt-1">+10 por ocorrência, +5 por validação</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Confiança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600">{(Number(user?.trustScore) || 0).toFixed(2)}</div>
              <p className="text-xs text-gray-500 mt-1">Score de confiabilidade</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Badges</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-600">{userBadges?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Conquistas desbloqueadas</p>
            </CardContent>
          </Card>

          <Card className="shadow-lg border-0">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Ocorrências</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">{recentOccurrences?.length || 0}</div>
              <p className="text-xs text-gray-500 mt-1">Total na plataforma</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Occurrences by Type */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Ocorrências por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={occurrencesByType}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {occurrencesByType.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Occurrences by Severity */}
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Ocorrências por Severidade</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={occurrencesBySeverity}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Rankings */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Global Rankings */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Trophy className="w-5 h-5" />
                Top 10 Global
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {topRankings?.slice(0, 5).map((rank, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-yellow-600">#{idx + 1}</span>
                      <span className="font-medium">Usuário #{rank.userId}</span>
                    </div>
                    <span className="font-bold text-emerald-600">{rank.totalPoints} pts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Monthly Rankings */}
          <Card className="shadow-lg border-0">
            <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Top 10 Mensal
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                {monthlyRankings?.slice(0, 5).map((rank, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-purple-600">#{idx + 1}</span>
                      <span className="font-medium">Usuário #{rank.userId}</span>
                    </div>
                    <span className="font-bold text-blue-600">{rank.monthlyPoints} pts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Badges */}
        {userBadges && userBadges.length > 0 && (
          <Card className="shadow-lg border-0 mb-8">
            <CardHeader className="bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Suas Conquistas
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                {userBadges.map((badge, idx) => {
                  const info = BADGE_INFO[badge.badgeType];
                  return (
                    <div key={idx} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:shadow-lg transition-shadow">
                      <div className="text-4xl mb-2">{info?.icon}</div>
                      <p className="text-xs font-semibold">{info?.description}</p>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Link href="/report">
              <Button className="bg-gradient-to-r from-emerald-600 to-green-600">
                <AlertCircle className="w-4 h-4 mr-2" />
                Reportar Ocorrência
              </Button>
            </Link>
            <Link href="/map">
              <Button variant="outline">
                <TrendingUp className="w-4 h-4 mr-2" />
                Ver Mapa
              </Button>
            </Link>
            <Link href="/simulators">
              <Button variant="outline">
                <Zap className="w-4 h-4 mr-2" />
                Simuladores
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
