# 🌿 Calipe Digital

<div align="center">

**Plataforma de E-commerce Headless de Alto Desempenho**

[![PHP](https://img.shields.io/badge/PHP-8.x-7a86b8?style=flat-square&logo=php)](https://php.net)
[![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)](https://react.dev)
[![MySQL](https://img.shields.io/badge/MySQL-8.x-4479a1?style=flat-square&logo=mysql)](https://mysql.com)
[![Tailwind](https://img.shields.io/badge/Tailwind-3.x-06b6d4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)
[![Licença](https://img.shields.io/badge/Licença-MIT-4f8c61?style=flat-square)](#licença)

*O nome nasce da folha — a cor vem do eucalipto.*

</div>

---

## 📖 Índice

- [Visão Geral](#-visão-geral)
- [Stack Tecnológico](#-stack-tecnológico)
- [Funcionalidades](#-funcionalidades)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação Passo a Passo](#-instalação-passo-a-passo)
- [Configuração](#-configuração)
- [API Reference](#-api-reference)
- [Paleta de Cores](#-paleta-de-cores--eucalipto)
- [Autenticação](#-autenticação)
- [Deploy em Produção](#-deploy-em-produção)
- [FAQ](#-faq)

---

## 🌿 Visão Geral

O **Calipe Digital** é uma plataforma de e-commerce construída sobre arquitectura **headless moderna**: o backend PHP serve uma API REST pura em JSON, enquanto o frontend React consome essa API de forma completamente desacoplada. Cada camada pode evoluir, escalar e ser testada independentemente.

```
┌─────────────────────┐         ┌──────────────────────┐
│   Frontend React    │  HTTP   │    Backend PHP API   │
│   localhost:5173    │ ◄────► │   localhost/backend  │
│   Tailwind + Zustand│  JSON   │   JWT + PDO + MySQL  │
└─────────────────────┘         └──────────────────────┘
```

### Por que Headless?
- **Performance**: O SPA React carrega instantaneamente após o primeiro acesso
- **Flexibilidade**: O mesmo backend pode servir uma app mobile no futuro
- **Escalabilidade**: Frontend e backend escalam de forma independente
- **DX Superior**: Hot-reload no frontend sem reiniciar o servidor PHP

---

## 🚀 Stack Tecnológico

### Frontend
| Tecnologia | Versão | Propósito |
|---|---|---|
| React.js | 18.x | SPA — Interface do utilizador |
| Vite | 5.x | Build tool ultrarrápido |
| Tailwind CSS | 3.x | Estilização utilitária |
| Zustand | 4.x | Gestão de estado global |
| React Router | 6.x | Roteamento client-side |
| Axios | 1.x | Chamadas à API |
| Framer Motion | 11.x | Animações e transições |
| Lucide React | — | Iconografia SVG |
| React Hot Toast | 2.x | Notificações elegantes |

### Backend
| Tecnologia | Versão | Propósito |
|---|---|---|
| PHP (Puro) | 8.2+ | API RESTful — entrega JSON |
| MySQL | 8.x | Base de dados relacional |
| PDO | — | Acesso seguro à BD (prepared statements) |
| JWT (manual) | HS256 | Autenticação stateless |
| XAMPP | 8.x | Ambiente local (Apache + MySQL + PHP) |

---

## 📦 Funcionalidades

### 🌐 Área Pública — Customer Experience

| Funcionalidade | Descrição |
|---|---|
| **Vitrine Dinâmica** | Filtros por categoria, preço e popularidade. Ordenação em tempo real. |
| **Smart Search** | Busca fulltext com sugestões automáticas enquanto digita |
| **Página de Produto** | Galeria com zoom, especificações, avaliações e produtos relacionados |
| **Carrinho Persistente** | Estado salvo via Zustand + localStorage. Sincronizado entre tabs. |
| **Checkout Progressivo** | Fluxo em 3 passos: endereço → pagamento → confirmação |
| **Área do Cliente** | Histórico de pedidos, gestão de endereços e dados pessoais |

### 🛡️ Painel Administrativo — Business Control

| Funcionalidade | Descrição |
|---|---|
| **Dashboard Analítico** | KPIs em tempo real: receita, pedidos, ticket médio, clientes |
| **Gráficos de Vendas** | Receita e volume por mês (últimos 6 meses) |
| **Gestão de Inventário** | CRUD completo de produtos com upload de imagens |
| **Controlo de Pedidos** | Mudança de status: Pendente → Pago → Preparando → Enviado → Entregue |
| **Gestão de Categorias** | Criação e organização de categorias com hierarquia pai/filho |
| **Gestão de Clientes** | Base de dados centralizada com histórico de compras |

---

## 🗂️ Estrutura do Projeto

```
calipe-digital/
│
├── backend/                         # API PHP (htdocs do XAMPP)
│   ├── config/
│   │   ├── database.php             # Conexão PDO (Singleton)
│   │   ├── jwt.php                  # Geração e validação JWT HS256
│   │   └── env.php                  # Carregamento de variáveis de ambiente
│   │
│   ├── controllers/                 # Lógica de negócio (1 ficheiro por recurso)
│   │   ├── AuthController.php       # Login, Register, Me
│   │   ├── ProductController.php    # CRUD + Search + Upload
│   │   ├── CategoryController.php   # CRUD de categorias
│   │   ├── OrderController.php      # Criação e gestão de pedidos
│   │   └── UserController.php       # Gestão de clientes (admin)
│   │
│   ├── models/                      # Camada de dados (queries SQL)
│   │   ├── UserModel.php
│   │   ├── ProductModel.php
│   │   ├── CategoryModel.php
│   │   └── OrderModel.php
│   │
│   ├── middleware/
│   │   └── AuthMiddleware.php       # Validação JWT em rotas protegidas
│   │
│   ├── routes/
│   │   └── api.php                  # Roteador REST (URI + método → controller)
│   │
│   ├── uploads/                     # Imagens de produtos (git-ignored)
│   ├── .htaccess                    # Rewrite rules (Apache)
│   ├── .env.example                 # Template de variáveis de ambiente
│   ├── index.php                    # Entry point único da API
│   └── database.sql                 # Schema + seeds iniciais
│
├── frontend/                        # SPA React (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Componentes reutilizáveis (Button, Card, etc.)
│   │   │   └── layouts/             # PublicLayout, AdminLayout
│   │   │
│   │   ├── pages/
│   │   │   ├── public/              # Home, Products, Product, Cart, Checkout...
│   │   │   └── admin/               # Dashboard, Products, Orders, Customers...
│   │   │
│   │   ├── services/
│   │   │   └── api.js               # Instância Axios + todos os endpoints
│   │   │
│   │   ├── store/
│   │   │   ├── authStore.js         # Estado de autenticação (Zustand)
│   │   │   └── cartStore.js         # Estado do carrinho (Zustand + persist)
│   │   │
│   │   ├── App.jsx                  # Roteamento principal
│   │   ├── main.jsx                 # Entry point React
│   │   └── index.css                # Variáveis CSS globais e estilos base
│   │
│   ├── tailwind.config.js           # Paleta eucalipto + tipografia
│   ├── vite.config.js               # Aliases (@/) e proxy para API
│   └── package.json
│
└── docs/                            # Documentação adicional
    └── INSTALLATION.md              # Este guia detalhado
```

---

## 🔧 Pré-requisitos

Antes de começar, certifique-se de ter instalado:

| Ferramenta | Versão Mínima | Download |
|---|---|---|
| XAMPP | 8.2+ | [apachefriends.org](https://www.apachefriends.org) |
| Node.js | 18.x LTS | [nodejs.org](https://nodejs.org) |
| npm | 9.x | Incluído com Node.js |
| Git | 2.x | [git-scm.com](https://git-scm.com) |

**Verificar instalações:**
```bash
php --version     # PHP 8.2.x ou superior
node --version    # v18.x.x ou superior
npm --version     # 9.x.x ou superior
git --version     # 2.x.x
```

---

## 📥 Instalação Passo a Passo

### Passo 1 — Clonar o Repositório

```bash
git clone https://github.com/seu-usuario/calipe-digital.git
cd calipe-digital
```

---

### Passo 2 — Configurar o Backend (PHP + MySQL)

#### 2.1 — Copiar para htdocs

Mova (ou crie um link simbólico) da pasta `backend` para o diretório `htdocs` do XAMPP:

**Windows:**
```bash
# Opção 1: Copiar
xcopy backend C:\xampp\htdocs\calipe-digital\backend /E /I

# Opção 2: Link simbólico (recomendado — reflecte alterações automaticamente)
mklink /D "C:\xampp\htdocs\calipe-digital" "%cd%"
```

**macOS / Linux:**
```bash
# Link simbólico (recomendado)
ln -s "$(pwd)" /Applications/XAMPP/htdocs/calipe-digital
# ou
ln -s "$(pwd)" /opt/lampp/htdocs/calipe-digital
```

#### 2.2 — Criar o ficheiro de ambiente

```bash
cd backend
cp .env.example .env
```

Edite o `.env` com as suas credenciais MySQL:

```ini
DB_HOST=localhost
DB_NAME=calipe_digital
DB_USER=root
DB_PASS=           # deixe vazio se não tem senha no XAMPP local
JWT_SECRET=GERE_UMA_CHAVE_FORTE_AQUI
ALLOWED_ORIGIN=http://localhost:5173
```

> 💡 **Gerar JWT_SECRET seguro:**
> ```bash
> # Linux/macOS
> openssl rand -hex 64
> # Windows (PowerShell)
> [System.Convert]::ToBase64String([System.Security.Cryptography.RandomNumberGenerator]::GetBytes(64))
> ```

#### 2.3 — Criar a base de dados

1. Abra o **XAMPP Control Panel** e inicie `Apache` e `MySQL`
2. Aceda ao **phpMyAdmin**: http://localhost/phpmyadmin
3. Clique em **"Nova"** (New) na barra lateral
4. Crie uma base de dados chamada `calipe_digital` com `utf8mb4_unicode_ci`
5. Seleccione a base criada e clique em **"SQL"**
6. Cole o conteúdo de `backend/database.sql` e clique **"Executar"**

**Ou via linha de comandos:**
```bash
mysql -u root -p < backend/database.sql
```

#### 2.4 — Verificar o backend

Abra no browser: **http://localhost/calipe-digital/backend/api/products**

Deve receber:
```json
{
  "status": "success",
  "data": [ ... ],
  "message": "Produtos listados com sucesso."
}
```

---

### Passo 3 — Configurar o Frontend (React + Vite)

#### 3.1 — Instalar dependências

```bash
cd frontend
npm install
```

#### 3.2 — Configurar variáveis de ambiente

```bash
cp .env.example .env.local
```

Conteúdo do `.env.local`:
```ini
VITE_API_URL=http://localhost/calipe-digital/backend
```

#### 3.3 — Iniciar o servidor de desenvolvimento

```bash
npm run dev
```

O terminal mostrará:
```
  VITE v5.x.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
```

Aceda a **http://localhost:5173** — a loja está a funcionar! 🎉

---

### Passo 4 — Acessar o Painel Admin

1. Aceda a http://localhost:5173/login
2. Utilize as credenciais do administrador criadas pelo seed:

| Campo | Valor |
|---|---|
| Email | `admin@calipe.ao` |
| Senha | `Admin@2026` |

> ⚠️ **Segurança**: Altere imediatamente a senha do admin em produção!

---

## ⚙️ Configuração

### Variáveis de Ambiente — Backend

| Variável | Padrão | Descrição |
|---|---|---|
| `DB_HOST` | `localhost` | Host do MySQL |
| `DB_NAME` | `calipe_digital` | Nome da base de dados |
| `DB_USER` | `root` | Utilizador MySQL |
| `DB_PASS` | *(vazio)* | Senha MySQL |
| `JWT_SECRET` | — | Chave de assinatura JWT (obrigatória) |
| `JWT_EXPIRATION` | `86400` | Duração do token em segundos (24h) |
| `ALLOWED_ORIGIN` | `http://localhost:5173` | URL do frontend para CORS |
| `UPLOAD_MAX_SIZE` | `5242880` | Tamanho máximo de upload (5 MB) |
| `APP_ENV` | `development` | `development` ou `production` |

### Variáveis de Ambiente — Frontend

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost/calipe-digital/backend` | URL base da API |

---

## 🔌 API Reference

Todos os endpoints retornam JSON com a estrutura:
```json
{
  "status": "success" | "error",
  "data": { ... } | [ ... ],
  "message": "Descrição do resultado"
}
```

### Autenticação
```
POST   /api/auth/login           # Login → retorna JWT
POST   /api/auth/register        # Registo de novo cliente
GET    /api/auth/me              # Perfil do utilizador autenticado 🔒
```

### Produtos
```
GET    /api/products             # Lista produtos (filtros: categoria, preco_max, destaque)
GET    /api/products/search?q=   # Smart search fulltext
GET    /api/products/{slug}      # Detalhe do produto
POST   /api/products             # Criar produto 🔒 Admin
PUT    /api/products/{id}        # Actualizar produto 🔒 Admin
DELETE /api/products/{id}        # Desactivar produto 🔒 Admin
POST   /api/products/{id}/image  # Upload de imagem 🔒 Admin
```

### Categorias
```
GET    /api/categories           # Lista categorias
POST   /api/categories           # Criar categoria 🔒 Admin
PUT    /api/categories/{id}      # Actualizar 🔒 Admin
DELETE /api/categories/{id}      # Desactivar 🔒 Admin
```

### Pedidos
```
POST   /api/orders               # Criar pedido 🔒 Cliente
GET    /api/orders               # Meus pedidos 🔒 Cliente / Todos 🔒 Admin
GET    /api/orders/{id}          # Detalhe do pedido 🔒
PUT    /api/orders/{id}/status   # Actualizar status 🔒 Admin
```

### Utilizadores (Admin)
```
GET    /api/users                # Lista clientes 🔒 Admin
GET    /api/users/{id}           # Detalhe do cliente 🔒 Admin
```

### Dashboard
```
GET    /api/dashboard/stats      # KPIs gerais 🔒 Admin
GET    /api/dashboard/revenue    # Receita por mês 🔒 Admin
```

> 🔒 = Requer header `Authorization: Bearer {token}`

---

## 🎨 Paleta de Cores — Eucalipto

A identidade visual do Calipe Digital é inspirada nas folhas do eucalipto (*Eucalyptus globulus*): os verdes acinzentados, o prateado do verso da folha e os tons terrosos da casca.

```css
/* Verdes Eucalipto — cor principal */
--eucalyptus-50:  #f2f7f4   /* névoa de eucalipto */
--eucalyptus-200: #c3dccb   /* verde prateado claro */
--eucalyptus-300: #9dc4a9   /* folha madura clara */
--eucalyptus-500: #4f8c61   /* folha de eucalipto — PRIMÁRIA */
--eucalyptus-700: #315a40   /* sombra da folha */
--eucalyptus-900: #1f3828   /* eucalipto noturno */

/* Cinzas Prateados — verso da folha */
--silver-300: #bfc6bf       /* verso prateado */
--silver-500: #7d8c7d       /* cinza eucalipto */

/* Terrosos — casca e raiz */
--earth-400: #a08060        /* casca clara */
--earth-700: #5c4033        /* madeira escura */
```

---

## 🔐 Autenticação

O sistema usa **JWT (JSON Web Tokens) HS256** stateless:

```
┌────────┐   POST /auth/login   ┌──────────┐
│ Client │ ─────────────────►  │  Backend │
│        │  { email, senha }    │          │
│        │ ◄─────────────────  │          │
│        │  { token, user }     └──────────┘
│        │
│        │  GET /api/protected
│        │  Authorization: Bearer {token}
│        │ ─────────────────►  Valida JWT → 200 OK
└────────┘                      Token expirado → 401
```

**Duração do token:** 24 horas (configurável em `JWT_EXPIRATION`)

---

## 🚢 Deploy em Produção

### Checklist de Segurança

- [ ] Alterar `JWT_SECRET` para uma chave forte (64+ bytes)
- [ ] Alterar a senha do admin padrão
- [ ] Definir `APP_ENV=production` e `APP_DEBUG=false`
- [ ] Configurar `ALLOWED_ORIGIN` com o domínio real
- [ ] Activar HTTPS (certificado SSL/TLS)
- [ ] Configurar backup automático do MySQL
- [ ] Rever permissões da pasta `uploads/` (755)

### Build do Frontend

```bash
cd frontend
npm run build
# Pasta dist/ gerada — fazer upload para o servidor
```

### Configuração Apache (`.htaccess` do backend)

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*)$ index.php [QSA,L]
```

---

## ❓ FAQ

**Q: Posso usar com PostgreSQL em vez de MySQL?**
A: Sim. A camada PDO é agnóstica. Ajuste o DSN em `config/database.php` e reveja queries que usam sintaxe MySQL específica (ex: `FULLTEXT`, `DATE_FORMAT`).

**Q: O carrinho persiste entre sessões?**
A: Sim. O Zustand usa `persist` middleware com localStorage. Os itens ficam guardados até checkout ou limpeza manual.

**Q: Como adicionar um novo método de pagamento?**
A: O campo `metodo_pagamento` na tabela `pedidos` é uma string livre. Basta adicionar a opção no frontend (`CheckoutPage.jsx`) e processar no backend conforme necessário.

**Q: Como funciona o upload de imagens?**
A: `POST /api/products/{id}/image` aceita `multipart/form-data`. As imagens são guardadas em `backend/uploads/` e o path é guardado na BD. Em produção, recomenda-se usar um CDN (Cloudflare R2, AWS S3).

---

## 📄 Licença

MIT © 2026 Calipe Digital

---

<div align="center">
<strong>🌿 Calipe Digital — Onde o código encontra a natureza</strong>
</div>
