# 📖 MANUAL COMPLETO - EcoMonitor

## Índice
1. [Visão Geral do Sistema](#visão-geral)
2. [Instalação e Configuração](#instalação)
3. [Guia de Uso Completo](#guia-de-uso)
4. [Funcionalidades Detalhadas](#funcionalidades)
5. [Arquitetura Técnica](#arquitetura)
6. [API tRPC Completa](#api)
7. [Banco de Dados](#banco-de-dados)
8. [Troubleshooting](#troubleshooting)

---

## 🌍 Visão Geral do Sistema {#visão-geral}

### O que é EcoMonitor?

EcoMonitor é uma plataforma web colaborativa que integra:
- **Monitoramento em tempo real** de ocorrências ambientais
- **Análise científica** de riscos usando modelos físicos
- **Educação ambiental** através de simuladores interativos
- **Engajamento comunitário** com validação colaborativa
- **Gamificação** para incentivar participação
- **Alertas geoespaciais** para ocorrências críticas
- **Gestão administrativa** da plataforma

### Objetivos Principais

1. Criar um sistema colaborativo de monitoramento ambiental
2. Integrar análise científica com dados comunitários
3. Educar usuários sobre fenômenos ambientais
4. Incentivar participação através de gamificação
5. Fornecer alertas críticos em tempo real
6. Facilitar moderação e gestão de conteúdo

### Públicos-alvo

- **Cidadãos**: Reportar ocorrências ambientais
- **Pesquisadores**: Acessar dados agregados
- **Educadores**: Usar simuladores em sala de aula
- **Administradores**: Moderar conteúdo e gerar relatórios

---

## 🚀 Instalação e Configuração {#instalação}

### Pré-requisitos

- **Node.js**: v18+ (recomendado 22.13.0)
- **npm/pnpm**: Gerenciador de pacotes
- **MySQL**: v8.0+ ou TiDB
- **Git**: Para controle de versão

### Passo 1: Clonar/Extrair Projeto

```bash
# Se estiver em ZIP
unzip ecomonitor-completo.zip
cd ecomonitor

# Ou clonar do Git
git clone <repo-url>
cd ecomonitor
```

### Passo 2: Criar Banco de Dados

```bash
# Conectar ao MySQL
mysql -u root -p

# Criar banco
CREATE DATABASE ecomonitor;
CREATE USER 'ecomonitor'@'localhost' IDENTIFIED BY 'senha_segura_aqui';
GRANT ALL PRIVILEGES ON ecomonitor.* TO 'ecomonitor'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### Passo 3: Configurar Variáveis de Ambiente

Criar arquivo `.env.local` na raiz do projeto:

```env
# ===== DATABASE =====
DATABASE_URL="mysql://ecomonitor:senha_segura_aqui@localhost:3306/ecomonitor"

# ===== AUTHENTICATION =====
JWT_SECRET="sua_chave_jwt_super_secreta_mude_em_producao_12345"
VITE_APP_ID="seu_app_id_manus"
OAUTH_SERVER_URL="https://api.manus.im"
VITE_OAUTH_PORTAL_URL="https://auth.manus.im"

# ===== OWNER INFO =====
OWNER_OPEN_ID="seu_openid_manus"
OWNER_NAME="Seu Nome Completo"

# ===== MANUS APIS =====
BUILT_IN_FORGE_API_URL="https://api.manus.im"
BUILT_IN_FORGE_API_KEY="sua_chave_api_manus"
VITE_FRONTEND_FORGE_API_URL="https://api.manus.im"
VITE_FRONTEND_FORGE_API_KEY="sua_chave_frontend_manus"

# ===== ANALYTICS (OPCIONAL) =====
VITE_ANALYTICS_ENDPOINT="https://analytics.example.com"
VITE_ANALYTICS_WEBSITE_ID="seu_website_id"
```

### Passo 4: Instalar Dependências

```bash
# Instalar com pnpm (recomendado)
pnpm install

# Ou com npm
npm install
```

### Passo 5: Executar Migrações

```bash
# Gerar migrações (já feitas, mas se precisar)
pnpm drizzle-kit generate

# Aplicar migrações ao banco
pnpm drizzle-kit migrate
```

### Passo 6: Iniciar Desenvolvimento

```bash
# Terminal 1: Servidor de desenvolvimento
pnpm dev

# O servidor estará em: http://localhost:3000
```

### Passo 7: Build para Produção

```bash
# Build
pnpm build

# Iniciar servidor de produção
pnpm start
```

---

## 📚 Guia de Uso Completo {#guia-de-uso}

### 1. Criar Conta e Fazer Login

1. Acesse http://localhost:3000
2. Clique em "Entrar" ou "Começar Agora"
3. Você será redirecionado para o portal Manus
4. Crie uma conta ou faça login
5. Autorize o acesso ao EcoMonitor
6. Você será redirecionado de volta com sessão ativa

**Roles disponíveis:**
- `user`: Usuário comum (padrão)
- `moderator`: Pode moderar conteúdo
- `admin`: Acesso total à plataforma

### 2. Registrar uma Ocorrência

**Caminho**: `/report`

#### Passo a Passo:

1. Clique em "Reportar Ocorrência" ou vá para `/report`
2. **Selecione o tipo de ocorrência**:
   - 🔥 Incêndio
   - 💧 Poluição de Água
   - 💨 Poluição do Ar
   - 🌵 Seca
   - 🌳 Desmatamento
   - 🌊 Enchente
   - ⚠️ Outro

3. **Defina a localização**:
   - Opção 1: Usar GPS automático (clique no botão de localização)
   - Opção 2: Clicar no mapa para selecionar
   - Opção 3: Digitar coordenadas manualmente

4. **Adicione parâmetros físicos** (variam por tipo):

   **Para Incêndio:**
   - Temperatura (15-45°C)
   - Umidade (10-90%)
   - Velocidade do vento (0-60 km/h)
   - Tipo de vegetação

   **Para Poluição de Água:**
   - Nível de água (baixo/normal/alto)
   - Cor da água (clara/turva/marrom/verde)
   - Temperatura (opcional)

   **Para Poluição do Ar:**
   - Qualidade do ar (boa/moderada/ruim)
   - Visibilidade (clara/turva/ruim)
   - Velocidade do vento (opcional)

   **Para Seca:**
   - Temperatura
   - Umidade
   - Precipitação recente (mm)

   **Para Desmatamento:**
   - Densidade de vegetação (0-100%)
   - Nível de acessibilidade (baixo/médio/alto)

   **Para Enchente:**
   - Elevação (metros)
   - Proximidade de água (metros)
   - Inclinação do terreno (graus)

5. **Adicione fotos** (até 5):
   - Clique em "Adicionar Foto"
   - Selecione arquivo do seu computador
   - Máximo 5 MB por foto

6. **Adicione descrição** (opcional):
   - Descreva o que você observou
   - Máximo 500 caracteres

7. **Selecione severidade**:
   - Baixa
   - Média
   - Alta
   - Crítica

8. **Clique em "Registrar Ocorrência"**

**Recompensa**: +10 pontos

**O que acontece:**
- Ocorrência é salva no banco
- Motor de física calcula risco automaticamente
- Alertas são enviados para usuários próximos
- Você ganha 10 pontos

### 3. Explorar o Mapa

**Caminho**: `/map`

#### Funcionalidades:

1. **Visualizar Ocorrências**:
   - Cada marcador representa uma ocorrência
   - Cores indicam severidade:
     - 🟢 Verde = Baixa
     - 🟡 Amarelo = Média
     - 🟠 Laranja = Alta
     - 🔴 Vermelho = Crítica

2. **Filtrar Ocorrências**:
   - Selecione tipo de ocorrência
   - Selecione intervalo de datas
   - Selecione severidade mínima

3. **Clicar em Marcador**:
   - Mostra popup com detalhes
   - Tipo, severidade, risco
   - Descrição e fotos
   - Número de validações
   - Botão para validar

4. **Zoom e Navegação**:
   - Use mouse wheel para zoom
   - Arraste para mover mapa
   - Duplo clique para zoom in

### 4. Usar Simuladores Educativos

**Caminho**: `/simulators`

#### Simulador de Incêndio

1. Vá para `/simulators`
2. Clique na aba "Incêndio"
3. Ajuste os sliders:
   - **Temperatura**: 15-45°C (arraste slider)
   - **Umidade**: 10-90% (arraste slider)
   - **Vento**: 0-60 km/h (arraste slider)
4. Veja o **Risco de Propagação** atualizar em tempo real
5. Leia a interpretação do risco
6. Clique "Salvar Simulação" para ganhar +3 pontos

**Interpretação de Risco:**
- 0-30%: Risco baixo (condições desfavoráveis)
- 30-60%: Risco moderado (vigilância recomendada)
- 60-100%: Risco alto (condições perigosas)

#### Simulador Hidrológico

1. Clique na aba "Hidrologia"
2. Ajuste parâmetros anuais:
   - **Precipitação**: 0-200 mm
   - **Evaporação**: 0-100 mm
   - **Infiltração**: 0-100 mm
3. Veja o **Escoamento** (água disponível para rios)
4. Fórmula: Escoamento = Precipitação - Evaporação - Infiltração
5. Salve para ganhar +3 pontos

#### Simulador de Poluição

1. Clique na aba "Poluição"
2. Ajuste parâmetros:
   - **Emissão**: 0-100%
   - **Velocidade do Vento**: 0-50 km/h
   - **Estabilidade Atmosférica**: 0-100%
3. Veja **Concentração de Poluentes** em tempo real
4. Maior vento = melhor dispersão
5. Salve para ganhar +3 pontos

### 5. Validar Ocorrências (Feed)

**Caminho**: `/feed`

#### Como Funciona:

1. Vá para `/feed`
2. Veja lista de ocorrências para validar
3. Clique em uma ocorrência para expandir
4. Veja estatísticas de validação:
   - Número de validações ✓
   - Número de rejeições ✗
   - Status atual (pendente/validado/rejeitado)
5. Adicione comentário (opcional)
6. Clique **"Validar"** ou **"Rejeitar"**
7. Ganhe +5 pontos

**Sistema de Votação:**
- Cada usuário pode validar uma ocorrência uma vez
- Validações são contadas
- Após 3+ validações: ocorrência é marcada como validada
- Após 3+ rejeições: ocorrência é marcada como rejeitada

### 6. Acompanhar Dashboard

**Caminho**: `/dashboard`

#### Seções:

1. **Estatísticas Pessoais**:
   - Pontos totais
   - Score de confiança
   - Badges conquistadas
   - Ocorrências reportadas

2. **Gráficos**:
   - Ocorrências por tipo (pizza)
   - Ocorrências por severidade (barras)

3. **Rankings**:
   - Top 10 Global (todos os tempos)
   - Top 10 Mensal (últimos 30 dias)

4. **Badges Conquistadas**:
   - 🔥 Vigia do Fogo (5+ ocorrências de incêndio)
   - 💧 Guardião da Água (5+ ocorrências de água)
   - ✓ Verificador (10+ validações)
   - 📚 Estudante (5+ simulações)
   - ⭐ Estrela (100+ pontos)
   - 🦸 Herói Ambiental (500+ pontos)

5. **Ações Rápidas**:
   - Botão para reportar ocorrência
   - Botão para explorar mapa
   - Botão para usar simuladores

### 7. Receber Alertas Geoespaciais

**Caminho**: `/alerts`

#### Configurar Alertas:

1. Vá para `/alerts`
2. **Configure Raio de Notificação**:
   - Arraste slider de 1 a 50 km
   - Você receberá alertas de ocorrências dentro deste raio

3. **Selecione Tipos de Alerta**:
   - 🔥 Incêndio
   - 💧 Água
   - 💨 Ar
   - 🌵 Seca
   - Clique nos badges para selecionar/desselecionar

4. **Clique "Salvar Configurações"**

#### Gerenciar Alertas:

1. Veja alertas em 3 abas:
   - **Todos**: Todos os alertas
   - **Não Lidos**: Apenas novos
   - **Críticos**: Apenas severidade crítica

2. Para cada alerta:
   - Veja tipo, mensagem e distância
   - Clique "Lido" para marcar como lido
   - Clique "Remover" para descartar

3. Alertas mostram:
   - Ícone do tipo
   - Mensagem descritiva
   - Localização (latitude/longitude)
   - Distância em km
   - Horário

### 8. Painel Administrativo

**Caminho**: `/admin` (requer role=admin)

#### Acesso:

1. Apenas usuários com `role=admin` podem acessar
2. Se tentar acessar sem permissão, verá mensagem de erro

#### Funcionalidades:

1. **Visão Geral**:
   - Total de ocorrências
   - Ocorrências validadas
   - Ocorrências críticas
   - Taxa de validação (%)

2. **Gráficos**:
   - Ocorrências por tipo (pizza)
   - Ocorrências por severidade (barras)

3. **Ocorrências Críticas**:
   - Lista de todas as críticas
   - Botão para validar
   - Botão para remover

4. **Top Usuários**:
   - Ranking dos 10 melhores
   - Pontos totais
   - Pontos mensais
   - Score de confiança

5. **Ferramentas de Moderação**:
   - Remover Conteúdo
   - Avisar Usuário
   - Gerenciar Roles
   - Exportar Relatório

---

## 🔧 Funcionalidades Detalhadas {#funcionalidades}

### Análise Física Automatizada

O sistema calcula automaticamente o risco de cada ocorrência usando modelos científicos:

#### 1. Incêndio (Arrhenius + Rothermel)

**Entrada:**
- Temperatura: 15-45°C
- Umidade: 10-90%
- Velocidade do vento: 0-60 km/h
- Tipo de vegetação: grass, shrub, forest, mixed

**Cálculo:**
```
tempNorm = (temperatura - 15) / 30
humidityNorm = (90 - umidade) / 80
windNorm = vento / 60

arrhenius = e^(-50000 / (8.314 * (temp + 273.15)))

risco = (tempNorm * 0.3 + humidityNorm * 0.3 + windNorm * 0.2 + arrhenius * 0.2) 
        * vegFactor * (1 + 0.1 * vento) * 100
```

**Saída:** Risco 0-100%

#### 2. Hidrologia (Penman + Darcy)

**Entrada:**
- Nível de água: low, normal, high
- Cor da água: clear, cloudy, brown, green
- Temperatura (opcional)
- Umidade (opcional)

**Cálculo:**
```
levelFactor = {low: 0.3, normal: 0.5, high: 0.8}
colorFactor = {clear: 0.1, cloudy: 0.4, brown: 0.7, green: 0.9}

penmanFactor = (temp / 40) * ((100 - humidity) / 100)

risco = (levelFactor * 0.4 + colorFactor * 0.4 + penmanFactor * 0.2) * 100
```

**Saída:** Risco 0-100%

#### 3. Poluição do Ar (Modelo Gaussiano)

**Entrada:**
- Qualidade do ar: good, moderate, poor
- Visibilidade: clear, hazy, poor
- Velocidade do vento (opcional)

**Cálculo:**
```
qualityFactor = {good: 0.1, moderate: 0.5, poor: 0.9}
visibilityFactor = {clear: 0.1, hazy: 0.5, poor: 0.9}

dispersionFactor = min(1, windSpeed / 10)

risco = ((qualityFactor * 0.4 + visibilityFactor * 0.4) 
         * (1 - dispersionFactor * 0.3) + 0.1) * 100
```

**Saída:** Risco 0-100%

#### 4. Seca (Balanço Hídrico)

**Entrada:**
- Temperatura: °C
- Umidade: %
- Precipitação: mm

**Cálculo:**
```
tempNorm = max(0, (temperatura - 25) / 20)
humidityDeficit = (100 - umidade) / 100
precipFactor = max(0, 1 - precipitacao / 100)

risco = (tempNorm * 0.3 + humidityDeficit * 0.4 + precipFactor * 0.3) * 100
```

**Saída:** Risco 0-100%

#### 5. Desmatamento (Densidade de Vegetação)

**Entrada:**
- Densidade de vegetação: 0-100%
- Nível de acessibilidade: low, medium, high

**Cálculo:**
```
vegRisk = (100 - vegetationDensity) / 100
accessFactors = {low: 0.2, medium: 0.5, high: 0.9}

risco = (vegRisk * 0.6 + accessFactors[accessibility] * 0.4) * 100
```

**Saída:** Risco 0-100%

#### 6. Enchente (Análise Topográfica)

**Entrada:**
- Elevação: metros
- Proximidade de água: metros
- Inclinação: graus

**Cálculo:**
```
elevationRisk = max(0, 1 - elevation / 1000)
proximityRisk = max(0, 1 - proximity_to_water / 500)
slopeRisk = max(0, 1 - slope / 45)

risco = (elevationRisk * 0.3 + proximityRisk * 0.4 + slopeRisk * 0.3) * 100
```

**Saída:** Risco 0-100%

### Sistema de Gamificação

#### Pontuação

| Ação | Pontos | Limite |
|------|--------|--------|
| Registrar ocorrência | +10 | Ilimitado |
| Validar ocorrência | +5 | 1 por ocorrência |
| Fazer simulação | +3 | Ilimitado |
| Comentar validação | +1 | Ilimitado |

#### Badges

| Badge | Ícone | Critério |
|-------|-------|----------|
| Vigia do Fogo | 🔥 | 5+ ocorrências de incêndio reportadas |
| Guardião da Água | 💧 | 5+ ocorrências de água reportadas |
| Verificador | ✓ | 10+ validações realizadas |
| Estudante | 📚 | 5+ simulações completadas |
| Estrela | ⭐ | 100+ pontos acumulados |
| Herói Ambiental | 🦸 | 500+ pontos acumulados |

#### Rankings

**Global:**
- Baseado em pontos totais de todos os tempos
- Atualizado em tempo real
- Top 10 exibido no dashboard

**Mensal:**
- Baseado em pontos dos últimos 30 dias
- Reseta no primeiro dia do mês
- Top 10 exibido no dashboard

### Validação Comunitária

#### Como Funciona

1. Cada ocorrência começa com status "pendente"
2. Usuários podem validar ou rejeitar
3. Cada usuário pode votar uma vez por ocorrência
4. Votos são contados:
   - 3+ validações → Status "validado"
   - 3+ rejeições → Status "rejeitado"
5. Usuários ganham +5 pontos por voto

#### Confiança do Usuário (Trust Score)

```
trustScore = (validacoesCorretas / totalValidacoes) * 100
```

- Aumenta quando validação está correta
- Diminui quando validação está incorreta
- Exibido no dashboard
- Usado para ordenar validadores

---

## 🏗️ Arquitetura Técnica {#arquitetura}

### Stack Tecnológico

```
┌─────────────────────────────────────────┐
│         Frontend (React 19)              │
│  ├─ Pages (Home, Report, Map, etc)     │
│  ├─ Components (UI, Forms)             │
│  ├─ Hooks (useAuth, useQuery)          │
│  └─ Styles (Tailwind CSS 4)            │
└──────────────────┬──────────────────────┘
                   │ tRPC
┌──────────────────┴──────────────────────┐
│      Backend (Express + tRPC)            │
│  ├─ Routers (occurrences, alerts)      │
│  ├─ DB Functions (queries)             │
│  ├─ Physics Engine                     │
│  └─ Auth (OAuth2)                      │
└──────────────────┬──────────────────────┘
                   │ Drizzle ORM
┌──────────────────┴──────────────────────┐
│      Database (MySQL)                    │
│  ├─ users, occurrences, photos         │
│  ├─ validations, simulations           │
│  ├─ alerts, badges, rankings           │
│  └─ Índices otimizados                 │
└─────────────────────────────────────────┘
```

### Fluxo de Dados

#### Registrar Ocorrência

```
1. Usuário preenche formulário em /report
2. Frontend valida dados
3. Chama trpc.occurrences.create
4. Backend:
   - Valida entrada
   - Calcula risco com physics.ts
   - Salva em database
   - Atualiza ranking (+10 pontos)
   - Cria alertas para usuários próximos
5. Frontend mostra confirmação
6. Redireciona para /map
```

#### Validar Ocorrência

```
1. Usuário vê ocorrência em /feed
2. Clica "Validar" ou "Rejeitar"
3. Chama trpc.validations.create
4. Backend:
   - Valida entrada
   - Salva validação
   - Atualiza ranking (+5 pontos)
   - Conta validações
   - Se 3+: marca como validado
   - Cria alerta para dono
5. Frontend atualiza contagem
6. Mostra confirmação
```

#### Usar Simulador

```
1. Usuário ajusta sliders em /simulators
2. Frontend calcula risco em tempo real
3. Clica "Salvar Simulação"
4. Chama trpc.simulations.create
5. Backend:
   - Valida entrada
   - Salva simulação
   - Atualiza ranking (+3 pontos)
6. Frontend mostra confirmação
7. Ganha +3 pontos
```

---

## 📡 API tRPC Completa {#api}

### Occurrences Router

#### `occurrences.create`
```typescript
// Entrada
{
  type: "fire" | "water_pollution" | "air_pollution" | "drought" | "deforestation" | "flooding" | "other",
  latitude: number,
  longitude: number,
  description?: string,
  severity?: "low" | "medium" | "high" | "critical",
  physicalParameters?: Record<string, any>
}

// Saída
{
  id: number,
  userId: number,
  type: string,
  latitude: number,
  longitude: number,
  riskScore: number,
  status: "pending" | "validated" | "rejected",
  createdAt: Date
}

// Recompensa: +10 pontos
```

#### `occurrences.getRecent`
```typescript
// Entrada
{ limit?: number }

// Saída
Array<Occurrence>

// Limite padrão: 20
```

#### `occurrences.getById`
```typescript
// Entrada
{ id: number }

// Saída
Occurrence | null
```

#### `occurrences.getByType`
```typescript
// Entrada
{ type: string, limit?: number }

// Saída
Array<Occurrence>

// Limite padrão: 50
```

#### `occurrences.getCritical`
```typescript
// Entrada
{ limit?: number }

// Saída
Array<Occurrence>

// Retorna apenas ocorrências críticas
```

#### `occurrences.getStats`
```typescript
// Entrada
{}

// Saída
{
  total: number,
  validated: number,
  critical: number,
  byType: Array<[string, number]>,
  bySeverity: Array<[string, number]>
}
```

### Validations Router

#### `validations.create`
```typescript
// Entrada
{
  occurrenceId: number,
  isValid: boolean,
  comment?: string
}

// Saída
void

// Recompensa: +5 pontos
```

#### `validations.getByOccurrence`
```typescript
// Entrada
{ occurrenceId: number }

// Saída
Array<{
  id: number,
  occurrenceId: number,
  userId: number,
  isValid: boolean,
  comment?: string,
  createdAt: Date
}>
```

### Simulations Router

#### `simulations.create`
```typescript
// Entrada
{
  type: "fire" | "water" | "pollution",
  parameters: Record<string, any>,
  results: Record<string, any>
}

// Saída
void

// Recompensa: +3 pontos
```

#### `simulations.getUserSimulations`
```typescript
// Entrada
{ limit?: number }

// Saída
Array<Simulation>

// Limite padrão: 20
```

### Gamification Router

#### `gamification.getTopRankings`
```typescript
// Entrada
{ limit?: number }

// Saída
Array<{
  userId: number,
  totalPoints: number,
  monthlyPoints: number
}>

// Limite padrão: 10
```

#### `gamification.getMonthlyRankings`
```typescript
// Entrada
{ limit?: number }

// Saída
Array<{
  userId: number,
  totalPoints: number,
  monthlyPoints: number
}>

// Limite padrão: 10
```

#### `gamification.getUserBadges`
```typescript
// Entrada
{ userId: number }

// Saída
Array<{
  id: number,
  userId: number,
  badgeType: string,
  unlockedAt: Date
}>
```

### Alerts Router

#### `alerts.getUserAlerts`
```typescript
// Entrada
{ unreadOnly?: boolean, limit?: number }

// Saída
Array<Alert>

// Limite padrão: 20
```

#### `alerts.markAsRead`
```typescript
// Entrada
{ alertId: number }

// Saída
void
```

---

## 💾 Banco de Dados {#banco-de-dados}

### Tabela: users

```sql
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  openId VARCHAR(64) UNIQUE NOT NULL,
  name TEXT,
  email VARCHAR(320),
  loginMethod VARCHAR(64),
  role ENUM('user', 'admin') DEFAULT 'user',
  points INT DEFAULT 0,
  trustScore DECIMAL(5,2) DEFAULT 0.00,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  lastSignedIn TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Tabela: occurrences

```sql
CREATE TABLE occurrences (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  type ENUM('fire', 'water_pollution', 'air_pollution', 'drought', 'deforestation', 'flooding', 'other'),
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  description TEXT,
  severity ENUM('low', 'medium', 'high', 'critical'),
  status ENUM('pending', 'validated', 'rejected') DEFAULT 'pending',
  riskScore DECIMAL(5, 2),
  physicalParameters JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_type (type),
  INDEX idx_severity (severity),
  INDEX idx_status (status),
  INDEX idx_location (latitude, longitude),
  INDEX idx_createdAt (createdAt)
);
```

### Tabela: photos

```sql
CREATE TABLE photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  occurrenceId INT NOT NULL,
  url TEXT NOT NULL,
  uploadedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (occurrenceId) REFERENCES occurrences(id) ON DELETE CASCADE,
  INDEX idx_occurrenceId (occurrenceId)
);
```

### Tabela: validations

```sql
CREATE TABLE validations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  occurrenceId INT NOT NULL,
  userId INT NOT NULL,
  isValid BOOLEAN NOT NULL,
  comment TEXT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (occurrenceId) REFERENCES occurrences(id) ON DELETE CASCADE,
  FOREIGN KEY (userId) REFERENCES users(id),
  UNIQUE KEY unique_validation (occurrenceId, userId),
  INDEX idx_isValid (isValid)
);
```

### Tabela: simulations

```sql
CREATE TABLE simulations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  type ENUM('fire', 'water', 'pollution'),
  parameters JSON,
  results JSON,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_type (type),
  INDEX idx_createdAt (createdAt)
);
```

### Tabela: alerts

```sql
CREATE TABLE alerts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  occurrenceId INT,
  type VARCHAR(50),
  severity ENUM('low', 'medium', 'high', 'critical'),
  message TEXT,
  isRead BOOLEAN DEFAULT FALSE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (occurrenceId) REFERENCES occurrences(id),
  INDEX idx_userId (userId),
  INDEX idx_isRead (isRead),
  INDEX idx_createdAt (createdAt)
);
```

### Tabela: badges

```sql
CREATE TABLE badges (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT NOT NULL,
  badgeType VARCHAR(50),
  unlockedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  UNIQUE KEY unique_badge (userId, badgeType),
  INDEX idx_badgeType (badgeType)
);
```

### Tabela: rankings

```sql
CREATE TABLE rankings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  userId INT UNIQUE NOT NULL,
  totalPoints INT DEFAULT 0,
  monthlyPoints INT DEFAULT 0,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  INDEX idx_totalPoints (totalPoints),
  INDEX idx_monthlyPoints (monthlyPoints)
);
```

---

## 🔍 Troubleshooting {#troubleshooting}

### Problema: "Cannot find module 'db'"

**Causa**: Servidor não encontra arquivo de banco de dados

**Solução**:
```bash
# Reiniciar servidor
pnpm dev

# Ou limpar cache
rm -rf node_modules/.vite
pnpm dev
```

### Problema: Erro de conexão com MySQL

**Causa**: Banco de dados não está rodando ou credenciais incorretas

**Solução**:
```bash
# Verificar se MySQL está rodando
mysql -u root -p -e "SELECT 1"

# Verificar DATABASE_URL em .env.local
# Formato: mysql://user:password@host:port/database

# Testar conexão
mysql -u ecomonitor -p -h localhost ecomonitor
```

### Problema: Leaflet não carrega no mapa

**Causa**: Dependências não instaladas

**Solução**:
```bash
# Reinstalar Leaflet
pnpm add leaflet @types/leaflet

# Reiniciar servidor
pnpm dev
```

### Problema: Simuladores não calculam risco

**Causa**: Physics.ts não está sendo importado

**Solução**:
```bash
# Verificar se physics.ts existe
ls -la server/physics.ts

# Verificar importação em routers.ts
grep "physics" server/routers.ts

# Reiniciar servidor
pnpm dev
```

### Problema: Alertas não aparecem

**Causa**: Dados mock não estão sendo exibidos

**Solução**:
```bash
# Verificar console do navegador (F12)
# Procurar por erros

# Verificar se rota /alerts existe
curl http://localhost:3000/alerts

# Reiniciar servidor
pnpm dev
```

### Problema: Autenticação não funciona

**Causa**: Variáveis de ambiente OAuth não configuradas

**Solução**:
```bash
# Verificar .env.local
cat .env.local | grep OAUTH

# Verificar se credenciais Manus estão corretas
# Criar nova aplicação em https://manus.im se necessário

# Reiniciar servidor
pnpm dev
```

### Problema: Banco de dados vazio

**Causa**: Migrações não foram executadas

**Solução**:
```bash
# Executar migrações
pnpm drizzle-kit migrate

# Verificar se tabelas foram criadas
mysql -u ecomonitor -p ecomonitor -e "SHOW TABLES;"

# Reiniciar servidor
pnpm dev
```

---

## 📞 Suporte e Contato

Para dúvidas ou problemas:

1. Consulte este manual
2. Verifique logs: `.manus-logs/`
3. Abra uma issue no repositório
4. Entre em contato com o time de desenvolvimento

---

## 📝 Changelog

### v1.0.0 (Fevereiro 2026)
- ✅ Autenticação com OAuth2
- ✅ Registro de ocorrências
- ✅ Mapa interativo
- ✅ Motor de análise física
- ✅ Simuladores educativos
- ✅ Feed colaborativo
- ✅ Gamificação
- ✅ Alertas geoespaciais
- ✅ Painel administrativo
- ✅ Validação comunitária

---

**Desenvolvido com ❤️ para proteger o ambiente**

**Última atualização**: Fevereiro 2026
**Versão**: 1.0.0
**Status**: Pronto para Produção
