# 📥 Manual de Instalação Detalhado — Calipe Digital

Este guia cobre todos os cenários de instalação: **desenvolvimento local**, **servidor Linux** e **produção com VPS**.

---

## Índice

- [Requisitos de Sistema](#requisitos-de-sistema)
- [Instalação Local (XAMPP)](#instalação-local-xampp)
- [Instalação em Servidor Linux (Nginx + PHP-FPM)](#instalação-em-servidor-linux)
- [Variáveis de Ambiente Completas](#variáveis-de-ambiente-completas)
- [Solução de Problemas](#solução-de-problemas)

---

## Requisitos de Sistema

### Desenvolvimento Local
| Componente | Mínimo | Recomendado |
|---|---|---|
| PHP | 8.1 | 8.3 |
| MySQL | 8.0 | 8.0 |
| Node.js | 18 LTS | 20 LTS |
| RAM | 4 GB | 8 GB |
| Disco | 500 MB | 2 GB |

### Produção (VPS)
| Componente | Mínimo | Recomendado |
|---|---|---|
| CPU | 1 vCore | 2 vCores |
| RAM | 1 GB | 2 GB |
| Disco | 20 GB SSD | 50 GB SSD |
| SO | Ubuntu 22.04 LTS | Ubuntu 24.04 LTS |

---

## Instalação Local (XAMPP)

### 1. Instalar XAMPP

1. Descarregue o XAMPP para o seu SO em https://www.apachefriends.org
2. Execute o instalador e inclua: **Apache**, **MySQL**, **PHP**, **phpMyAdmin**
3. Abra o **XAMPP Control Panel** e inicie **Apache** e **MySQL**

### 2. Clonar e Configurar

```bash
# 1. Clone na pasta correcta
cd /opt/lampp/htdocs          # Linux
cd C:\xampp\htdocs             # Windows
cd /Applications/XAMPP/htdocs # macOS

git clone https://github.com/seu-usuario/calipe-digital.git
cd calipe-digital

# 2. Configurar ambiente do backend
cp backend/.env.example backend/.env
nano backend/.env              # ou use o seu editor preferido
```

### 3. Criar a Base de Dados

```bash
# Via CLI
mysql -u root -p
# No prompt MySQL:
source /path/to/calipe-digital/backend/database.sql
exit

# Ou via phpMyAdmin em http://localhost/phpmyadmin
```

### 4. Instalar e Iniciar o Frontend

```bash
cd frontend
npm install
npm run dev
# → Disponível em http://localhost:5173
```

---

## Instalação em Servidor Linux

### Ubuntu 22.04 / 24.04 — Nginx + PHP-FPM

#### 1. Instalar Dependências

```bash
sudo apt update && sudo apt upgrade -y

# PHP 8.2 + extensões
sudo apt install -y php8.2 php8.2-fpm php8.2-mysql php8.2-mbstring \
  php8.2-xml php8.2-curl php8.2-gd php8.2-zip

# MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Nginx
sudo apt install -y nginx

# Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
```

#### 2. Configurar MySQL

```bash
sudo mysql -u root -p
```
```sql
CREATE DATABASE calipe_digital CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'calipe_user'@'localhost' IDENTIFIED BY 'SENHA_FORTE_AQUI';
GRANT ALL PRIVILEGES ON calipe_digital.* TO 'calipe_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

```bash
mysql -u calipe_user -p calipe_digital < /var/www/calipe-digital/backend/database.sql
```

#### 3. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/calipe-digital
```

```nginx
# /etc/nginx/sites-available/calipe-digital
server {
    listen 80;
    server_name seudominio.com www.seudominio.com;

    # Frontend (React build)
    root /var/www/calipe-digital/frontend/dist;
    index index.html;

    # SPA: todas as rotas servem index.html (React Router)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API PHP
    location /api/ {
        alias /var/www/calipe-digital/backend/;
        try_files $uri $uri/ /backend/index.php?$query_string;

        location ~ \.php$ {
            fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
            fastcgi_param SCRIPT_FILENAME $request_filename;
            include fastcgi_params;
        }
    }

    # Uploads (imagens de produtos)
    location /uploads/ {
        alias /var/www/calipe-digital/backend/uploads/;
        add_header Cache-Control "public, max-age=31536000";
    }

    # Segurança: bloquear acesso a ficheiros sensíveis
    location ~ /\.(env|git|htaccess) {
        deny all;
    }

    # Logs
    access_log /var/log/nginx/calipe-digital.access.log;
    error_log  /var/log/nginx/calipe-digital.error.log;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/calipe-digital /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

#### 4. Configurar HTTPS (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d seudominio.com -d www.seudominio.com
# Certbot configura renovação automática automaticamente
```

#### 5. Build do Frontend para Produção

```bash
cd /var/www/calipe-digital/frontend

# Criar .env de produção
echo "VITE_API_URL=https://seudominio.com/api" > .env.production

npm install
npm run build
# → Pasta dist/ gerada
```

#### 6. Permissões

```bash
# Pasta uploads deve ser escrita pelo PHP
sudo chown -R www-data:www-data /var/www/calipe-digital/backend/uploads
sudo chmod 755 /var/www/calipe-digital/backend/uploads

# Backend: apenas leitura para o servidor web
sudo chown -R www-data:www-data /var/www/calipe-digital/backend
sudo chmod -R 644 /var/www/calipe-digital/backend
sudo chmod 755 /var/www/calipe-digital/backend

# Proteger .env
sudo chmod 600 /var/www/calipe-digital/backend/.env
```

---

## Variáveis de Ambiente Completas

### Backend `.env`

```ini
# Base de Dados
DB_HOST=localhost
DB_NAME=calipe_digital
DB_USER=calipe_user
DB_PASS=SENHA_FORTE_DO_MYSQL

# JWT — NUNCA usar o valor padrão em produção
# Gerar: openssl rand -hex 64
JWT_SECRET=d4f8a2b1c9e3f7a6b5d2e9c8f1a4b7d0e3f6a9c2b5e8d1f4a7b0c3e6f9a2b5c8

# Expiração do token (segundos) — 86400 = 24h
JWT_EXPIRATION=86400

# Upload de imagens
UPLOAD_MAX_SIZE=5242880
UPLOAD_ALLOWED_TYPES=image/jpeg,image/png,image/webp

# CORS
ALLOWED_ORIGIN=https://seudominio.com

# Ambiente
APP_ENV=production
APP_DEBUG=false
```

### Frontend `.env.production`

```ini
VITE_API_URL=https://seudominio.com/api
```

---

## Solução de Problemas

### Erro: "Access-Control-Allow-Origin"

**Causa**: O `ALLOWED_ORIGIN` no `.env` não corresponde à URL do frontend.

```ini
# Desenvolvimento
ALLOWED_ORIGIN=http://localhost:5173

# Produção
ALLOWED_ORIGIN=https://seudominio.com
```

---

### Erro: "Erro de conexão com a base de dados"

**Verificações**:
1. MySQL está a correr? `sudo systemctl status mysql`
2. Credenciais correctas no `.env`?
3. Base de dados existe? `SHOW DATABASES;` no MySQL

---

### Erro: "Token inválido" após deploy

**Causa**: O `JWT_SECRET` mudou entre ambientes ou o token expirou.

**Solução**: Faça logout e login novamente. Se persistir, verifique se o `JWT_SECRET` é consistente.

---

### PHP: Upload de imagem falha

**Verificações**:
```bash
# 1. Permissões da pasta uploads
ls -la backend/uploads/

# 2. Limites do PHP (php.ini)
php -r "echo ini_get('upload_max_filesize');"   # deve ser >= 5M
php -r "echo ini_get('post_max_size');"          # deve ser >= 5M

# 3. Ajustar no php.ini se necessário
upload_max_filesize = 10M
post_max_size = 10M
```

---

### Frontend: Página em branco após build

**Verificações**:
```bash
# Verificar se o build passou sem erros
npm run build

# Verificar se VITE_API_URL está correcto
cat frontend/.env.production

# Verificar erros no browser DevTools → Console
```

---

### MySQL: FULLTEXT não funciona com <3 palavras

**Causa**: MySQL por padrão ignora palavras com menos de 3 caracteres em busca FULLTEXT.

**Solução** (opcional, para Angola onde nomes curtos são comuns):
```sql
-- Reduzir tamanho mínimo para busca fulltext
-- Adicionar ao my.cnf / my.ini:
[mysqld]
ft_min_word_len=2

-- Depois recriar os índices:
REPAIR TABLE produtos QUICK;
```

---

*Manual gerado automaticamente — Calipe Digital v1.0 — 2026*
