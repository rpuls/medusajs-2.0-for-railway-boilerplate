# Makefile para Migração Vertex AI → Gemini AI Studio

.PHONY: help migrate verify clean backup restore test

# Variáveis
BACKUP_DIR = .migration-backup
TIMESTAMP = $(shell date +%Y%m%d_%H%M%S)

help: ## Mostrar ajuda
	@echo "🚀 Migração Vertex AI → Gemini AI Studio"
	@echo ""
	@echo "Comandos disponíveis:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

backup: ## Criar backup completo antes da migração
	@echo "💾 Criando backup completo..."
	@mkdir -p $(BACKUP_DIR)/$(TIMESTAMP)
	@cp package.json $(BACKUP_DIR)/$(TIMESTAMP)/ 2>/dev/null || true
	@cp package-lock.json $(BACKUP_DIR)/$(TIMESTAMP)/ 2>/dev/null || true
	@cp yarn.lock $(BACKUP_DIR)/$(TIMESTAMP)/ 2>/dev/null || true
	@cp .env* $(BACKUP_DIR)/$(TIMESTAMP)/ 2>/dev/null || true
	@echo "✅ Backup criado em: $(BACKUP_DIR)/$(TIMESTAMP)"

migrate: backup ## Executar migração completa
	@echo "🚀 Iniciando migração completa..."
	@node scripts/migrate-dependencies.js
	@node scripts/update-env-vars.js
	@echo "✅ Migração concluída!"

verify: ## Verificar status da migração
	@echo "🔍 Verificando migração..."
	@node scripts/verify-migration.js

install-new: ## Instalar apenas nova dependência
	@echo "📥 Instalando @google/generative-ai..."
	@npm install @google/generative-ai
	@echo "✅ Instalação concluída!"

remove-old: ## Remover apenas dependências antigas
	@echo "🗑️ Removendo dependências antigas..."
	@npm uninstall @google-cloud/aiplatform google-auth-library
	@echo "✅ Remoção concluída!"

quick-migrate: ## Migração rápida (apenas dependências)
	@echo "⚡ Migração rápida..."
	@npm uninstall @google-cloud/aiplatform google-auth-library
	@npm install @google/generative-ai
	@npm audit fix --force
	@echo "✅ Migração rápida concluída!"

test: ## Testar nova integração
	@echo "🧪 Testando integração..."
	@node -e "try { require('@google/generative-ai'); console.log('✅ @google/generative-ai OK'); } catch(e) { console.log('❌ Erro:', e.message); }"
	@node -e "try { require('@google-cloud/aiplatform'); console.log('⚠️ @google-cloud/aiplatform ainda presente'); } catch(e) { console.log('✅ @google-cloud/aiplatform removida'); }"

clean: ## Limpar arquivos temporários
	@echo "🧹 Limpando arquivos temporários..."
	@rm -f package.json.backup
	@rm -f .env*.backup
	@rm -f .env.gemini-template
	@npm cache clean --force
	@echo "✅ Limpeza concluída!"

restore: ## Restaurar backup mais recente
	@echo "🔄 Restaurando backup..."
	@LATEST_BACKUP=$$(ls -t $(BACKUP_DIR) | head -n1); \
	if [ -n "$$LATEST_BACKUP" ]; then \
		cp $(BACKUP_DIR)/$$LATEST_BACKUP/* . 2>/dev/null || true; \
		npm install; \
		echo "✅ Backup $$LATEST_BACKUP restaurado"; \
	else \
		echo "❌ Nenhum backup encontrado"; \
	fi

status: ## Mostrar status atual
	@echo "📊 Status atual:"
	@echo ""
	@echo "📦 Dependências instaladas:"
	@npm list --depth=0 2>/dev/null | grep -E "(google|generative)" || echo "  Nenhuma dependência Google encontrada"
	@echo ""
	@echo "📄 Arquivos de configuração:"
	@ls -la .env* 2>/dev/null || echo "  Nenhum arquivo .env encontrado"
	@echo ""
	@echo "💾 Backups disponíveis:"
	@ls -la $(BACKUP_DIR) 2>/dev/null || echo "  Nenhum backup encontrado"

# Comandos compostos
full-migration: backup migrate verify ## Migração completa com verificação
	@echo "🎉 Migração completa finalizada!"

safe-migration: backup quick-migrate test ## Migração segura e rápida
	@echo "🛡️ Migração segura concluída!"
