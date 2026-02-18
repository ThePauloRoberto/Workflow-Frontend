# 📋 Sistema de Solicitações - Workflow

Sistema completo para gerenciamento de solicitações internas com fluxo de aprovação, desenvolvido com **Angular 19** no frontend e **.NET Web API** no backend.

## 🚀 Tecnologias

### Frontend
- **Angular 19** - Framework principal
- **Angular Material** - Componentes de UI e modais
- **Bootstrap 5** - Estilização e layout responsivo
- **RxJS** - Programação reativa e gerenciamento de estado
- **JWT** - Autenticação via tokens

### Backend
- **.NET 8 Web API** - API RESTful
- **Entity Framework Core** - ORM para banco de dados
- **JWT Bearer** - Autenticação e autorização
- **SQL Server** - Banco de dados relacional

## 📌 Funcionalidades

### Autenticação e Autorização
- ✅ Login com email e senha
- ✅ JWT Token com claims de role
- ✅ Guards de rota (AuthGuard, RoleGuard)
- ✅ Roles: User (solicitante) e Manager (aprovador)

### Solicitações (Requests)
- ✅ Criar nova solicitação (apenas User)
- ✅ Listagem com cards e filtros
- ✅ Filtros por: Status, Categoria, Prioridade, Busca textual
- ✅ Paginação e ordenação
- ✅ Modal de detalhes com histórico

### Fluxo de Aprovação
- ✅ Aprovar solicitação (Manager)
- ✅ Rejeitar solicitação com motivo obrigatório (Manager)
- ✅ Histórico de alterações (timeline)
- ✅ Regras: apenas PENDING pode ser alterada

### Regras de Negócio
- ✅ User: vê apenas suas solicitações
- ✅ Manager: vê todas as solicitações
- ✅ User: pode criar novas solicitações
- ✅ Manager: pode aprovar/rejeitar solicitações PENDING

## 🎯 Capturas de Tela

*[Adicione aqui prints do sistema: login, listagem, modal de detalhe, etc]*

## 🔧 Como executar

### Pré-requisitos
- Node.js 18+ 
- Angular CLI 19+
- .NET 8 SDK
- SQL Server (ou Docker)

### Frontend

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/workflow-frontend.git

# Entre na pasta
cd workflow-frontend

# Instale as dependências
npm install

# Configure a API no environment.ts
# src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'https://localhost:7151/api'
};

# Execute o projeto
ng serve