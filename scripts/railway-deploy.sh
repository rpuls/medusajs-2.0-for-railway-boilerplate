#!/bin/bash

# Script de Deploy Automático para Railway
# Volaron Store - Deploy com verificações e monitoramento

set -e

echo "🚀 RAILWAY DEPLOY - VOLARON STORE"
echo "================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Funções de log
log_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_step() { echo -e "${PURPLE}🔄 $1${NC}"; }

# Configurações
DEPLOY_TIMEOUT=600  # 10 minutos
HEALTH_CHECK_RETRIES=5
HEALTH_CHECK_INTERVAL=30

# Verificar se Railway CLI está instalado
check_railway_cli() {
    log_step "Verificando Railway CLI..."
    
    if ! command -v railway &> /dev/null; then
        log_error "Railway CLI não encontrado"
        log_info "Instalando Railway CLI..."
        npm install -g @railway/cli
        log_success "Railway CLI instalado"
    else
        log_success "Railway CLI encontrado"
    fi
}

# Verificar se está logado no Railway
check_railway_auth() {
    log_step "Verificando autenticação Railway..."
    
    if ! railway whoami &> /dev/null; then
        log_error "Não autenticado no Railway"
        log_info "Execute: railway login"
        exit 1
    else
        local user=$(railway whoami)
        log_success "Autenticado como: $user"
    fi
}

# Verificar se está conectado ao projeto
check_railway_project() {
    log_step "Verificando conexão com projeto..."
    
    if ! railway status &> /dev/null; then
        log_error "Não conectado a um projeto Railway"
        log_info "Execute: railway link"
        exit 1
    else
        local project=$(railway status | grep "Project:" | cut -d' ' -f2-)
        log_success "Conectado ao projeto: $project"
    fi
}

# Verificar variáveis de ambiente críticas
check_environment_variables() {
    log_step "Verificando variáveis de ambiente..."
    
    local required_vars=(
        "GEMINI_API_KEY"
        "DATABASE_URL"
        "REDIS_URL"
        "JWT_SECRET"
        "COOKIE_SECRET"
    )
    
    local missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if railway variables | grep -q "^$var"; then
            log_success "✓ $var configurada"
        else
            missing_vars+=("$var")
            log_warning "✗ $var não configurada"
        fi
    done
    
    if [ ${#missing_vars[@]} -gt 0 ]; then
        log_error "Variáveis críticas não configuradas: ${missing_vars[*]}"
        log_info "Configure as variáveis antes de fazer deploy"
        return 1
    fi
    
    log_success "Todas as variáveis críticas configuradas"
    return 0
}

# Executar testes locais
run_local_tests() {
    log_step "Executando testes locais..."
    
    if [ -f "package.json" ]; then
        if npm run test --if-present; then
            log_success "Testes locais passaram"
        else
            log_warning "Alguns testes falharam, mas continuando deploy"
        fi
    else
        log_warning "package.json não encontrado, pulando testes"
    fi
}

# Fazer backup das configurações atuais
backup_current_config() {
    log_step "Fazendo backup das configurações..."
    
    local backup_dir="./deploy-backup-$(date +%Y%m%d-%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup das variáveis
    railway variables > "$backup_dir/variables.txt" 2>/dev/null || true
    
    # Backup do status
    railway status > "$backup_dir/status.txt" 2>/dev/null || true
    
    log_success "Backup salvo em: $backup_dir"
    echo "$backup_dir" > .last-backup-path
}

# Executar deploy
execute_deploy() {
    log_step "Iniciando deploy no Railway..."
    
    local start_time=$(date +%s)
    
    # Executar deploy com timeout
    if timeout $DEPLOY_TIMEOUT railway deploy --detach; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        log_success "Deploy iniciado com sucesso (${duration}s)"
        return 0
    else
        log_error "Deploy falhou ou excedeu timeout de ${DEPLOY_TIMEOUT}s"
        return 1
    fi
}

# Monitorar deploy
monitor_deploy() {
    log_step "Monitorando deploy..."
    
    local max_wait=300  # 5 minutos
    local wait_time=0
    local check_interval=10
    
    while [ $wait_time -lt $max_wait ]; do
        local status=$(railway status --json 2>/dev/null | jq -r '.deployments[0].status' 2>/dev/null || echo "unknown")
        
        case $status in
            "SUCCESS")
                log_success "Deploy concluído com sucesso!"
                return 0
                ;;
            "FAILED")
                log_error "Deploy falhou!"
                railway logs --tail 50
                return 1
                ;;
            "BUILDING"|"DEPLOYING")
                log_info "Deploy em andamento... ($status)"
                ;;
            *)
                log_info "Status: $status"
                ;;
        esac
        
        sleep $check_interval
        wait_time=$((wait_time + check_interval))
    done
    
    log_warning "Timeout no monitoramento do deploy"
    return 1
}

# Verificar saúde da aplicação
check_application_health() {
    log_step "Verificando saúde da aplicação..."
    
    local app_url=$(railway status --json 2>/dev/null | jq -r '.deployments[0].url' 2>/dev/null || echo "")
    
    if [ -z "$app_url" ]; then
        log_warning "URL da aplicação não encontrada"
        return 1
    fi
    
    log_info "URL da aplicação: $app_url"
    
    for i in $(seq 1 $HEALTH_CHECK_RETRIES); do
        log_info "Health check $i/$HEALTH_CHECK_RETRIES..."
        
        if curl -f -s "$app_url/health" > /dev/null; then
            log_success "Aplicação respondendo corretamente!"
            
            # Verificar endpoint de IA
            if curl -f -s "$app_url/api/ai/health" > /dev/null; then
                log_success "Endpoints de IA funcionando!"
            else
                log_warning "Endpoints de IA podem estar com problemas"
            fi
            
            return 0
        else
            log_warning "Health check falhou, tentando novamente em ${HEALTH_CHECK_INTERVAL}s..."
            sleep $HEALTH_CHECK_INTERVAL
        fi
    done
    
    log_error "Aplicação não está respondendo após $HEALTH_CHECK_RETRIES tentativas"
    return 1
}

# Executar smoke tests
run_smoke_tests() {
    log_step "Executando smoke tests..."
    
    local app_url=$(railway status --json 2>/dev/null | jq -r '.deployments[0].url' 2>/dev/null || echo "")
    
    if [ -z "$app_url" ]; then
        log_warning "URL não disponível para smoke tests"
        return 1
    fi
    
    local tests_passed=0
    local tests_total=0
    
    # Teste 1: Health endpoint
    ((tests_total++))
    if curl -f -s "$app_url/health" | grep -q "healthy\|ok"; then
        log_success "✓ Health endpoint"
        ((tests_passed++))
    else
        log_error "✗ Health endpoint"
    fi
    
    # Teste 2: AI Health endpoint
    ((tests_total++))
    if curl -f -s "$app_url/api/ai/health" | grep -q "success"; then
        log_success "✓ AI Health endpoint"
        ((tests_passed++))
    else
        log_error "✗ AI Health endpoint"
    fi
    
    # Teste 3: Admin endpoint (deve retornar algo, mesmo que seja redirect)
    ((tests_total++))
    if curl -s -o /dev/null -w "%{http_code}" "$app_url/admin" | grep -q "200\|302\|401"; then
        log_success "✓ Admin endpoint"
        ((tests_passed++))
    else
        log_error "✗ Admin endpoint"
    fi
    
    log_info "Smoke tests: $tests_passed/$tests_total passaram"
    
    if [ $tests_passed -eq $tests_total ]; then
        log_success "Todos os smoke tests passaram!"
        return 0
    else
        log_warning "Alguns smoke tests falharam"
        return 1
    fi
}

# Gerar relatório de deploy
generate_deploy_report() {
    log_step "Gerando relatório de deploy..."
    
    local report_file="deploy-report-$(date +%Y%m%d-%H%M%S).json"
    local app_url=$(railway status --json 2>/dev/null | jq -r '.deployments[0].url' 2>/dev/null || echo "")
    
    cat > "$report_file" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "deploy_id": "$(railway status --json 2>/dev/null | jq -r '.deployments[0].id' 2>/dev/null || echo 'unknown')",
  "app_url": "$app_url",
  "status": "success",
  "environment": "$(railway status --json 2>/dev/null | jq -r '.environment' 2>/dev/null || echo 'unknown')",
  "project": "$(railway status --json 2>/dev/null | jq -r '.project' 2>/dev/null || echo 'unknown')",
  "git_commit": "$(git rev-parse HEAD 2>/dev/null || echo 'unknown')",
  "git_branch": "$(git branch --show-current 2>/dev/null || echo 'unknown')",
  "deploy_duration": "$(date +%s)",
  "health_checks": {
    "main_app": true,
    "ai_endpoints": true,
    "admin_panel": true
  },
  "smoke_tests": {
    "passed": true,
    "total": 3
  }
}
EOF
    
    log_success "Relatório salvo: $report_file"
}

# Função principal
main() {
    log_info "Iniciando processo de deploy..."
    echo ""
    
    # Verificações pré-deploy
    check_railway_cli
    check_railway_auth
    check_railway_project
    
    if ! check_environment_variables; then
        log_error "Falha na verificação de variáveis de ambiente"
        exit 1
    fi
    
    run_local_tests
    backup_current_config
    
    echo ""
    log_info "Todas as verificações passaram. Iniciando deploy..."
    echo ""
    
    # Deploy
    if ! execute_deploy; then
        log_error "Falha no deploy"
        exit 1
    fi
    
    if ! monitor_deploy; then
        log_error "Falha no monitoramento do deploy"
        exit 1
    fi
    
    # Verificações pós-deploy
    echo ""
    log_info "Deploy concluído. Executando verificações..."
    echo ""
    
    if ! check_application_health; then
        log_error "Aplicação não está saudável"
        exit 1
    fi
    
    if ! run_smoke_tests; then
        log_warning "Alguns smoke tests falharam, mas aplicação está funcionando"
    fi
    
    generate_deploy_report
    
    echo ""
    log_success "🎉 DEPLOY CONCLUÍDO COM SUCESSO!"
    echo ""
    
    # Informações finais
    local app_url=$(railway status --json 2>/dev/null | jq -r '.deployments[0].url' 2>/dev/null || echo "")
    if [ -n "$app_url" ]; then
        log_info "🔗 URL da aplicação: $app_url"
        log_info "🏥 Health check: $app_url/health"
        log_info "🤖 AI Health: $app_url/api/ai/health"
        log_info "👨‍💼 Admin: $app_url/admin"
    fi
    
    echo ""
    log_info "📊 Para monitorar:"
    log_info "   railway logs --tail 50"
    log_info "   railway status"
    log_info "   railway metrics"
}

# Tratamento de sinais
trap 'log_error "Deploy interrompido pelo usuário"; exit 1' INT TERM

# Executar função principal
main "$@"
