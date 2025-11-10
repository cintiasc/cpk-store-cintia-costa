# 🧁 Cupcake Store - E-Commerce de Cupcakes

Este repositório documenta o projeto final da disciplina **Projeto Integrador Transdisciplinar em Engenharia de Software II**. 

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Como Executar](#como-executar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Níveis de Acesso](#níveis-de-acesso)
- [Configuração Inicial](#configuração-inicial)
- [Fluxos Principais](#fluxos-principais)

---

## 🎯 Visão Geral

O objetivo principal foi aplicar os conceitos de engenharia de software (requisitos, design, implementação, testes) no desenvolvimento de uma aplicação full-stack.

A **Cupcake Store** é a plataforma de e-commerce resultante, desenvolvida com React e Node.js, que permite a venda online de cupcakes. A plataforma oferece uma experiência completa para clientes, funcionários e administradores, com recursos de:

- Catálogo de produtos com avaliações
- Carrinho de compras e checkout
- Gestão de pedidos com rastreamento de status
- Sistema de avaliações (reviews) de produtos
- Painel administrativo completo
- Notificações SMS (simuladas)
- Conformidade com LGPD

---

## ✨ Funcionalidades

### Para Clientes 👤
- ✅ Navegação por catálogo de produtos
- ✅ Visualização detalhada de produtos com avaliações
- ✅ Carrinho de compras com gestão de quantidades
- ✅ Finalização de pedidos (checkout)
- ✅ Acompanhamento de pedidos em tempo real
- ✅ Avaliação de produtos comprados (estrelas 1-5 + comentário)
- ✅ Repetir pedidos anteriores
- ✅ Aceitação de termos LGPD

### Para Funcionários 👨‍💼
- ✅ Todas as funcionalidades de cliente
- ✅ Gestão de produtos (criar, editar, desativar)
- ✅ Fila de pedidos em tempo real
- ✅ Atualização de status de pedidos
- ✅ Dashboard com visão geral

### Para Administradores 👑
- ✅ Todas as funcionalidades de funcionário
- ✅ Gestão completa de usuários
- ✅ Pré-cadastro de usuários com definição de role
- ✅ Edição de informações de usuários
- ✅ Promoção/rebaixamento de níveis de acesso
- ✅ Visualização de todos os usuários do sistema

### Recursos Técnicos 🔧
- ✅ Autenticação via Replit Auth (OIDC)
- ✅ Banco de dados PostgreSQL (Neon)
- ✅ Notificações SMS simuladas (console.log)
- ✅ Sistema de avaliações com verificação de compra
- ✅ Soft delete em produtos (preserva histórico)
- ✅ Cache inteligente com React Query
- ✅ Interface responsiva e moderna

---

## 🛠️ Tecnologias

### Frontend
- **React 18** - Biblioteca para construção de interfaces
- **TypeScript** - Tipagem estática
- **Vite** - Build tool e dev server
- **Wouter** - Roteamento client-side
- **TanStack Query (React Query)** - Gerenciamento de estado do servidor
- **Zustand** - Estado global (carrinho)
- **Shadcn/ui** - Componentes UI (baseado em Radix UI)
- **Tailwind CSS** - Estilização
- **React Hook Form + Zod** - Formulários e validação

### Backend
- **Node.js** - Runtime JavaScript
- **Express.js** - Framework web
- **TypeScript** - Tipagem estática
- **Drizzle ORM** - ORM para PostgreSQL
- **Passport.js** - Autenticação (estratégia OIDC)
- **Express Session** - Gerenciamento de sessões

### Banco de Dados
- **PostgreSQL** (via Neon) - Banco de dados relacional
- **Linguagem**: SQL (dialeto PostgreSQL)

### Autenticação
- **Replit Auth** - Provedor OIDC (OpenID Connect)
- Sistema de sessões com cookies httpOnly

### Infraestrutura
- **Replit** - Plataforma de hospedagem e desenvolvimento
- **Neon** - PostgreSQL serverless

---

## 🚀 Como Executar

### Pré-requisitos
- Conta Replit (para autenticação e hospedagem)
- Node.js 18+ (já configurado no Replit)

### Passos

1. **Clone ou Fork o Projeto no Replit**

2. **Instale as Dependências**
   ```bash
   npm install
   ```

3. **Configure o Banco de Dados**
   - O banco PostgreSQL já está configurado via Neon
   - Variáveis de ambiente são gerenciadas automaticamente

4. **Execute o Projeto**
   ```bash
   npm run dev
   ```
   O servidor inicia automaticamente na porta 5000

5. **Acesse a Aplicação**
   - Abra o navegador no endereço fornecido pelo Replit
   - Faça login com sua conta Replit

---

## 📁 Estrutura do Projeto

```
cupcake-store/
├── client/                      # Frontend React
│   └── src/
│       ├── components/          # Componentes reutilizáveis
│       │   ├── ui/             # Componentes Shadcn/ui
│       │   ├── header.tsx      # Cabeçalho da aplicação
│       │   └── review-modal.tsx # Modal de avaliação
│       ├── hooks/              # Custom hooks
│       │   ├── useAuth.ts      # Hook de autenticação
│       │   └── useCart.ts      # Hook do carrinho
│       ├── lib/                # Utilitários
│       ├── pages/              # Páginas da aplicação
│       │   ├── home.tsx        # Página inicial
│       │   ├── products.tsx    # Catálogo de produtos
│       │   ├── product-detail.tsx # Detalhe do produto
│       │   ├── cart.tsx        # Carrinho de compras
│       │   ├── checkout.tsx    # Finalização de pedido
│       │   ├── orders.tsx      # Pedidos do cliente
│       │   ├── dashboard.tsx   # Dashboard funcionário
│       │   └── admin.tsx       # Painel admin
│       └── App.tsx             # Componente raiz
│
├── server/                      # Backend Node.js
│   ├── db.ts                   # Conexão com banco de dados
│   ├── routes.ts               # Rotas da API
│   ├── storage.ts              # Camada de dados (abstração do DB)
│   ├── replitAuth.ts           # Configuração Replit Auth
│   ├── smsService.ts           # Serviço de SMS (simulado)
│   └── index.ts                # Entrada do servidor
│
├── shared/                      # Código compartilhado
│   └── schema.ts               # Schemas Drizzle + Zod
│
├── drizzle/                     # Migrações do banco
│
└── package.json                # Dependências do projeto
```

---

## 👥 Níveis de Acesso

### 🟢 Cliente (Padrão)
- **Criação**: Automática no primeiro login
- **Permissões**:
  - Navegar produtos
  - Adicionar ao carrinho
  - Fazer pedidos
  - Acompanhar pedidos
  - Avaliar produtos comprados
- **Rotas**: `/`, `/products`, `/cart`, `/checkout`, `/orders`

### 🔵 Funcionário
- **Criação**: Promovido por admin via pré-cadastro ou painel admin
- **Permissões**:
  - Todas as permissões de cliente +
  - Gerenciar produtos (criar, editar, desativar)
  - Visualizar fila de pedidos
  - Atualizar status de pedidos
- **Rotas**: Todas de cliente + `/dashboard`

### 🔴 Administrador
- **Criação**: Primeiro admin via SQL, demais via painel admin
- **Permissões**:
  - Todas as permissões de funcionário +
  - Gerenciar usuários
  - Pré-cadastrar usuários com role definida
  - Editar informações de usuários
  - Promover/rebaixar usuários
- **Rotas**: Todas + `/admin`

---

## ⚙️ Configuração Inicial

### 1. Criar o Primeiro Administrador

Após fazer o primeiro login como cliente, execute no console SQL:

```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';
```

### 2. Adicionar Produtos Iniciais

Como admin ou funcionário:
1. Acesse o Dashboard (`/dashboard`)
2. Clique em "Adicionar Produto"
3. Preencha: nome, descrição, preço, estoque e URL da imagem
4. Salve o produto

### 3. Pré-cadastrar Funcionários/Admins

Como admin:
1. Acesse o painel Admin (`/admin`)
2. Clique em "Pré-cadastrar Usuário"
3. Informe:
   - Email do futuro usuário
   - Role desejada (employee ou admin)
   - Opcionalmente: nome e telefone
4. No primeiro login, o usuário receberá automaticamente a role

---

## 📊 Fluxos Principais

### Fluxo de Compra (Cliente)
```
1. Navegar produtos → 2. Adicionar ao carrinho → 
3. Revisar carrinho → 4. Fazer checkout → 
5. Acompanhar pedido → 6. Avaliar produtos
```

### Fluxo de Pedido (Funcionário)
```
1. Visualizar fila de pedidos → 
2. Alterar status (Em Preparação) → 
3. Marcar como Pronto para Entrega → 
4. Marcar como Entregue
```

### Fluxo de Avaliação (Cliente)
```
1. Fazer pedido → 2. Aguardar entrega → 
3. Ver botão "Avaliar" em Meus Pedidos → 
4. Dar estrelas (1-5) + comentário → 
5. Publicar avaliação
```

### Gestão de Produtos (Funcionário/Admin)
```
1. Acessar Dashboard → 2. Adicionar/Editar produto → 
3. Definir estoque e preço → 4. Desativar se necessário
```

---

## 🔐 Segurança e LGPD

- ✅ **Autenticação segura** via Replit Auth (OIDC)
- ✅ **Sessões criptografadas** com cookies httpOnly
- ✅ **Validação de dados** com Zod em frontend e backend
- ✅ **Proteção de rotas** por middleware de autorização
- ✅ **Aceitação de termos LGPD** obrigatória
- ✅ **Senhas gerenciadas** pelo provedor OIDC (nunca armazenadas localmente)
- ✅ **SQL injection** prevenido pelo Drizzle ORM

---

## 📱 Notificações SMS (Simuladas)

O sistema simula envio de SMS em três cenários:

1. **Pré-cadastro**: Quando admin pré-cadastra usuário com telefone
2. **Pedido pronto**: Quando pedido atinge status "Pronto para Entrega"
3. **Atualização de dados**: Quando admin edita informações do usuário

> 💡 **Nota**: Atualmente as mensagens são exibidas no console. Para produção, integre com provedores como Twilio, Infobip ou SMSDev editando `server/smsService.ts`.

---

## 🗄️ Banco de Dados

### Estrutura de Tabelas

- **users**: Usuários do sistema (id, email, firstName, lastName, role, phoneNumber, lgpdAccepted)
- **products**: Produtos à venda (id, name, description, price, imageUrl, stock, isActive)
- **orders**: Pedidos realizados (id, userId, status, totalAmount, createdAt)
- **orderItems**: Itens de cada pedido (id, orderId, productId, quantity, priceAtPurchase)
- **reviews**: Avaliações de produtos (id, userId, productId, rating, comment)
- **sessions**: Sessões de autenticação
- **preassigned_roles**: Roles pré-atribuídas para novos usuários

### Status de Pedidos

- `pending` - Pendente
- `in_preparation` - Em Preparação
- `ready_for_delivery` - Pronto para Entrega
- `delivered` - Entregue

---

## 🎨 Design System

- **Fontes**: Playfair Display (títulos) + Inter (UI)
- **Cores**: Sistema de cores semânticas com suporte a dark mode
- **Componentes**: Shadcn/ui (Radix UI + Tailwind CSS)
- **Layout**: Responsivo com breakpoints mobile-first
- **Espaçamento**: Sistema consistente (2, 4, 6, 8, 12, 16, 20, 24px)

---

## 📝 Scripts Disponíveis

```bash
# Desenvolvimento (inicia frontend + backend)
npm run dev

# Build para produção
npm run build

# Sincronizar schema do banco (desenvolvimento)
npm run db:push

# Gerar migrations
npm run db:generate

# Aplicar migrations
npm run db:migrate
```

---

## 🐛 Troubleshooting

### Erro de conexão com banco de dados
- Verifique se as variáveis `DATABASE_URL` e outras `PG*` estão configuradas
- Reinicie o workflow da aplicação

### Usuário não consegue fazer login
- Verifique se o Replit Auth está configurado corretamente
- Confirme que `SESSION_SECRET` existe nas variáveis de ambiente

### Produtos não aparecem
- Verifique se existem produtos com `isActive = true` no banco
- Adicione produtos pelo Dashboard

### Botão "Avaliar" não aparece
- Confirme que o pedido está com status `delivered`
- Verifique se o produto já não foi avaliado pelo usuário

---

## 📄 Licença

Este projeto foi desenvolvido para fins educacionais e comerciais.

---

## 👨‍💻 Desenvolvimento

Desenvolvido com ❤️ usando React, Node.js, PostgreSQL e Replit.

Para suporte ou dúvidas sobre o Replit, consulte a [documentação oficial](https://docs.replit.com).

---

## 🚀 Próximos Passos

Sugestões para evolução da plataforma:

- [ ] Integração com gateway de pagamento real (Stripe, Mercado Pago)
- [ ] Sistema de cupons de desconto
- [ ] Programa de fidelidade
- [ ] Notificações push no navegador
- [ ] Chat de suporte em tempo real
- [ ] Área de favoritos
- [ ] Recomendações personalizadas
- [ ] Dashboard com métricas e gráficos
- [ ] Integração SMS real (Twilio, etc.)
- [ ] Upload de imagens de produtos
- [ ] Sistema de categorias de produtos
- [ ] Gestão de estoque com alertas
