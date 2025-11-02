# Sistema de Perfis de Usuário - Cupcake Store

## Visão Geral

A Cupcake Store possui três níveis de acesso de usuário:
- **Cliente (client)**: Usuário padrão que pode comprar produtos
- **Funcionário (employee)**: Pode gerenciar produtos e pedidos
- **Administrador (admin)**: Tem acesso total ao sistema, incluindo gestão de usuários

## Como Funciona o Sistema de Autenticação

### 1. Primeiro Login (Criação de Conta)

Quando um usuário faz login pela primeira vez usando Replit Auth:
- Uma nova conta é criada **automaticamente** no banco de dados
- O perfil padrão atribuído é **"client"** (cliente)
- Os dados são sincronizados do Replit Auth (email, nome, foto de perfil)
- O consentimento LGPD é registrado automaticamente

### 2. Alteração de Perfil de Usuário

Somente **administradores** podem alterar o perfil de outros usuários:
1. Fazer login como administrador
2. Acessar o painel admin em `/admin`
3. Selecionar o perfil desejado para cada usuário (client, employee, admin)
4. As mudanças são aplicadas imediatamente

## Permissões por Perfil

### Cliente (client)
**Acesso permitido:**
- ✅ Navegar e visualizar produtos
- ✅ Adicionar produtos ao carrinho
- ✅ Finalizar pedidos
- ✅ Visualizar histórico de pedidos próprios
- ✅ Avaliar produtos comprados

**Acesso negado:**
- ❌ Painel de gerenciamento de produtos
- ❌ Painel de gerenciamento de pedidos
- ❌ Painel de administração de usuários

### Funcionário (employee)
**Acesso permitido:**
- ✅ Todas as permissões de Cliente
- ✅ Painel Dashboard (`/dashboard`):
  - Gerenciar produtos (criar, editar, excluir)
  - Visualizar fila de todos os pedidos
  - Atualizar status de pedidos

**Acesso negado:**
- ❌ Painel de administração de usuários

### Administrador (admin)
**Acesso permitido:**
- ✅ Todas as permissões de Funcionário
- ✅ Painel Admin (`/admin`):
  - Visualizar todos os usuários
  - Alterar perfil de usuários (client ↔ employee ↔ admin)
  - Excluir usuários do sistema

## Como Testar Diferentes Perfis

### Testando como Cliente
1. Faça login normalmente com Replit Auth
2. Explore o catálogo de produtos
3. Adicione produtos ao carrinho
4. Finalize um pedido
5. Visualize seu histórico em "Meus Pedidos"

### Testando como Funcionário
1. Peça a um administrador para alterar seu perfil para "employee"
2. Faça logout e login novamente
3. Acesse o Dashboard em `/dashboard`
4. Gerencie produtos e pedidos

### Testando como Administrador
1. Seu perfil já foi promovido para "admin"
2. Faça logout e login novamente para as permissões serem aplicadas
3. Acesse o painel Admin em `/admin`
4. Gerencie usuários e seus perfis

## Seu Usuário Atual

✅ **Seu email**: cintia_costa@ymail.com
✅ **Perfil atual**: **Administrador (admin)**
✅ **Status**: Pronto para testar todas as funcionalidades!

## Próximos Passos

1. **Faça logout e login novamente** para as permissões de admin serem aplicadas
2. Teste o fluxo completo como admin
3. Crie usuários de teste com diferentes perfis usando o painel `/admin`
4. Teste as restrições de acesso de cada perfil

## Comandos SQL Úteis (Desenvolvimento)

### Promover um usuário a admin:
```sql
UPDATE users 
SET role = 'admin' 
WHERE email = 'seu-email@exemplo.com';
```

### Verificar perfis de todos os usuários:
```sql
SELECT email, first_name, last_name, role 
FROM users 
ORDER BY role, email;
```

### Criar usuário de teste:
```sql
INSERT INTO users (id, email, first_name, last_name, role, lgpd_accepted)
VALUES ('test-123', 'teste@exemplo.com', 'Nome', 'Sobrenome', 'client', NOW());
```

---

**Nota**: O sistema usa autenticação Replit Auth (OIDC), então todos os usuários devem fazer login através do botão "Entrar" na interface. Não é possível criar usuários manualmente sem autenticação.
