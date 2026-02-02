# Script de Correção Automática - EcoMonitor Windows
# Execute este arquivo no PowerShell

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CORREÇÃO AUTOMÁTICA - ECOMONITOR" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar se está no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ ERRO: Execute este script no diretório raiz do projeto!" -ForegroundColor Red
    Write-Host "   Navegue até: C:\Users\IRN\Documents\ECo\ecomonitor-v2.0-com-auth-local\ecomonitor" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Exemplo:" -ForegroundColor Yellow
    Write-Host "   cd C:\Users\IRN\Documents\ECo\ecomonitor-v2.0-com-auth-local\ecomonitor" -ForegroundColor Yellow
    Write-Host "   .\corrigir-projeto.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✓ Diretório correto encontrado" -ForegroundColor Green
Write-Host ""

# Passo 1: Remover .npmrc problemático
Write-Host "[1/6] Removendo .npmrc problemático..." -ForegroundColor Yellow
if (Test-Path .npmrc) {
    Remove-Item .npmrc -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ .npmrc removido" -ForegroundColor Green
} else {
    Write-Host "  ℹ .npmrc não encontrado (já foi removido)" -ForegroundColor Gray
}
Write-Host ""

# Passo 2: Limpar cache do npm
Write-Host "[2/6] Limpando cache do npm..." -ForegroundColor Yellow
npm cache clean --force 2>&1 | Out-Null
Write-Host "  ✓ Cache limpo" -ForegroundColor Green
Write-Host ""

# Passo 3: Remover node_modules e package-lock.json
Write-Host "[3/6] Removendo instalações antigas..." -ForegroundColor Yellow
if (Test-Path node_modules) {
    Write-Host "  Removendo node_modules (isso pode demorar)..." -ForegroundColor Gray
    Remove-Item node_modules -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ node_modules removido" -ForegroundColor Green
}

if (Test-Path package-lock.json) {
    Remove-Item package-lock.json -Force -ErrorAction SilentlyContinue
    Write-Host "  ✓ package-lock.json removido" -ForegroundColor Green
}
Write-Host ""

# Passo 4: Instalar dependências
Write-Host "[4/6] Instalando dependências (isso pode demorar alguns minutos)..." -ForegroundColor Yellow
Write-Host ""

npm install

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ ERRO ao instalar dependências!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Possíveis soluções:" -ForegroundColor Yellow
    Write-Host "1. Verifique sua conexão com a internet" -ForegroundColor White
    Write-Host "2. Execute: npm config delete proxy" -ForegroundColor White
    Write-Host "3. Execute: npm config delete https-proxy" -ForegroundColor White
    Write-Host "4. Tente novamente: npm install" -ForegroundColor White
    exit 1
}

Write-Host ""
Write-Host "  ✓ Dependências instaladas com sucesso!" -ForegroundColor Green
Write-Host ""

# Passo 5: Adicionar componentes shadcn/ui
Write-Host "[5/6] Adicionando componentes shadcn/ui..." -ForegroundColor Yellow

Write-Host "  Adicionando Avatar..." -ForegroundColor Gray
npx shadcn-ui@latest add avatar -y 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Avatar adicionado" -ForegroundColor Green
}

Write-Host "  Adicionando DropdownMenu..." -ForegroundColor Gray
npx shadcn-ui@latest add dropdown-menu -y 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ DropdownMenu adicionado" -ForegroundColor Green
}

Write-Host "  Adicionando Badge..." -ForegroundColor Gray
npx shadcn-ui@latest add badge -y 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✓ Badge adicionado" -ForegroundColor Green
}

Write-Host ""

# Passo 6: Verificação final
Write-Host "[6/6] Verificando instalação..." -ForegroundColor Yellow
$componentesOk = $true

$componentes = @(
    "client\src\components\ui\avatar.tsx",
    "client\src\components\ui\dropdown-menu.tsx",
    "client\src\components\ui\badge.tsx"
)

foreach ($componente in $componentes) {
    if (Test-Path $componente) {
        Write-Host "  ✓ $(Split-Path $componente -Leaf) encontrado" -ForegroundColor Green
    } else {
        Write-Host "  ⚠ $(Split-Path $componente -Leaf) não encontrado" -ForegroundColor Yellow
        $componentesOk = $false
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($componentesOk) {
    Write-Host "  ✅ PROJETO PRONTO PARA USAR!" -ForegroundColor Green
} else {
    Write-Host "  ⚠ PROJETO INSTALADO (com avisos)" -ForegroundColor Yellow
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Próximos Passos:" -ForegroundColor Cyan
Write-Host ""
Write-Host "  1. Inicie o servidor:" -ForegroundColor White
Write-Host "     npm run dev" -ForegroundColor Yellow
Write-Host ""
Write-Host "  2. Acesse no navegador:" -ForegroundColor White
Write-Host "     http://localhost:5000" -ForegroundColor Yellow
Write-Host ""
Write-Host "  3. Crie uma conta em:" -ForegroundColor White
Write-Host "     http://localhost:5000/register" -ForegroundColor Yellow
Write-Host ""
Write-Host "  4. Faça login e explore o sistema!" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 Dica: Se encontrar erros ao iniciar, execute:" -ForegroundColor Gray
Write-Host "   npm run db:push" -ForegroundColor Gray
Write-Host ""
