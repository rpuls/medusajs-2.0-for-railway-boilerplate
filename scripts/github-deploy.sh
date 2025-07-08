#!/bin/bash

# Script para deploy automático no GitHub e Railway
# Este script envia o código para o GitHub e configura o Railway

set -e

echo "🚀 GITHUB + RAILWAY DEPLOY AUTOMATION"
echo "====================================="

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️ $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️ $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }

# Configurações
REPO_URL="https://github.com/exzosdigital/volaron-project.git"
BRANCH_NAME="railway-automation"
COMMIT_MESSAGE="feat: Railway automation setup with complete file structure"

# 1. Verificar se estamos em um repositório Git
log_info "1. Verificando repositório Git..."

if [ ! -d ".git" ]; then
    log_info "Inicializando repositório Git..."
    git init
    git remote add origin $REPO_URL
    log_success "Repositório Git inicializado"
else
    log_success "Repositório Git encontrado"
fi

# 2. Criar/mudar para a branch
log_info "2. Configurando branch '$BRANCH_NAME'..."

# Verificar se a branch existe localmente
if git show-ref --verify --quiet refs/heads/$BRANCH_NAME; then
    log_info "Branch '$BRANCH_NAME' existe, fazendo checkout..."
    git checkout $BRANCH_NAME
else
    log_info "Criando nova branch '$BRANCH_NAME'..."
    git checkout -b $BRANCH_NAME
fi

log_success "Branch '$BRANCH_NAME' ativa"

# 3. Adicionar todos os arquivos
log_info "3. Adicionan
