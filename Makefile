# Makefile para o Projeto Backstage
# Este arquivo automatiza os passos de instalação, build, teste e execução.

# --- Variáveis ---
# Define o nome da imagem Docker para ser facilmente alterado.
DOCKER_IMAGE_TAG := backstage

# --- Alvos (Targets) ---

.PHONY: all install build run help

# Alvo padrão: executado quando você digita apenas 'make'
# Instala as dependências e depois constrói o projeto.
all: install build run

# Alvo para instalar as dependências do projeto.
install:
	@echo "--- 📦 Instalando dependências do projeto... ---"
	yarn install
	@echo "--- ✅ Dependências instaladas com sucesso! ---"

build:
	@echo "--- ⚙️  Compilando artefatos do backend... ---"
	yarn workspace backend build
	@echo "--- ✅ Artefatos do backend compilados! ---"

run:
	@echo "--- 🚀 Iniciando a aplicação com Docker Compose... ---"
	yarn start
	@echo "--- ✅ Aplicação iniciada! ---"
	@echo "Acesse no link: http://${APP_URL}:${APP_PORT}"

# Alvo de ajuda para listar e explicar os comandos disponíveis.
help:
	@echo "Comandos disponíveis no Makefile:"
	@echo "  make all          - Executa 'install' e 'build'."
	@echo "  make install      - Instala todas as dependências com yarn."
	@echo "  make build        - Compila o backend e constrói a imagem Docker."
	@echo "  make run          - Inicia a aplicação via Docker Compose."
	@echo "  make test         - (Placeholder) Executa a suíte de testes."
	@echo "  make clean        - Remove os artefatos gerados pelo build."
	@echo "  make help         - Mostra esta mensagem de ajuda."
