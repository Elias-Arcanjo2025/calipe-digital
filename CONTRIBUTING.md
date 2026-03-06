# 🤝 Guia de Contribuição — Calipe Digital

Obrigado por querer contribuir com o **Calipe Digital**! Este documento define os padrões e processos para manter a qualidade de código de uma plataforma de e-commerce de produção.

> *"Cada linha de código é uma folha nova — cuide dela."*

---

## 📖 Índice

- [Código de Conduta](#-código-de-conduta)
- [Como Contribuir](#-como-contribuir)
- [Fluxo de Trabalho Git](#-fluxo-de-trabalho-git)
- [Padrões de Commits](#-padrões-de-commits-semânticos)
- [Padrões de Código](#-padrões-de-código)
- [Testes](#-testes)
- [Pull Requests](#-pull-requests)
- [Revisão de Código](#-revisão-de-código)
- [Regras para IA](#-assistentes-de-ia--automação)

---

## 📜 Código de Conduta

Este projecto adopta o **Contributor Covenant v2.1**. Ao contribuir, compromete-se a:

- Usar linguagem acolhedora e inclusiva
- Respeitar diferentes pontos de vista e experiências
- Aceitar críticas construtivas com profissionalismo
- Focar-se no que é melhor para o projecto e comunidade

Comportamentos inaceitáveis devem ser reportados ao maintainer principal.

---

## 🚀 Como Contribuir

### Tipos de Contribuição Bem-vindos

| Tipo | Descrição |
|---|---|
| 🐛 **Bug fix** | Correcção de erros identificados |
| ✨ **Feature** | Nova funcionalidade alinhada com o roadmap |
| 📚 **Docs** | Melhorias na documentação |
| ♻️ **Refactor** | Melhoria de código sem alterar comportamento |
| 🎨 **Style** | Ajustes visuais e de UI/UX |
| 🔒 **Security** | Correcções de vulnerabilidades |
| ⚡ **Performance** | Optimizações de velocidade/memória |

### Antes de Começar

1. **Verifique os Issues** — a funcionalidade/bug já pode estar a ser trabalhado
2. **Abra um Issue** — descreva o que pretende fazer e aguarde feedback
3. **Faça fork** — apenas para contribuidores externos; colaboradores usam branches directas

---

## 🌿 Fluxo de Trabalho Git

> ⚠️ **REGRA DE OURO: A branch `main` é sagrada. NUNCA faça push directo. Qualquer push directo para `main` será rejeitado pelo repositório remoto.**

### Modelo de Branches

```
main          ← produção estável (protegida)
  └── develop ← integração (opcional para projectos grandes)
        ├── feature/sistema-de-pagamento-pix
        ├── fix/erro-calculo-frete
        ├── style/redesign-navbar
        └── refactor/extrair-hook-useCart
```

### Passo a Passo

#### 1. Sincronize a sua `main` local

```bash
git checkout main
git pull origin main
```

#### 2. Crie uma branch descritiva

Use um dos prefixos padrão + descrição em kebab-case:

```bash
# Nova funcionalidade
git checkout -b feature/sistema-de-pagamento-pix

# Correcção de bug
git checkout -b fix/erro-no-calculo-de-frete

# Alteração visual
git checkout -b style/redesign-produto-card

# Refactor
git checkout -b refactor/extrair-logica-auth

# Documentação
git checkout -b docs/actualizar-api-reference

# Segurança
git checkout -b security/patch-sql-injection-search
```

#### 3. Faça as suas alterações e commits

```bash
git add .
git commit -m "feat: adicionar integração com gateway de pagamento PIX"
```

#### 4. Mantenha a branch actualizada

```bash
# Antes de abrir o PR, sincronize com main
git fetch origin
git rebase origin/main
```

#### 5. Abra o Pull Request

```bash
git push origin feature/sistema-de-pagamento-pix
# → Abra o PR no GitHub/GitLab
```

---

## 📝 Padrões de Commits Semânticos

O projecto usa **Conventional Commits** para gerar changelogs automáticos e manter histórico legível.

### Formato

```
<tipo>(<âmbito opcional>): <descrição curta em imperativo>

[corpo opcional — explica o PORQUÊ, não o como]

[rodapé opcional — ex: Closes #123, BREAKING CHANGE:]
```

### Tipos Aceites

| Tipo | Emoji | Quando Usar |
|---|---|---|
| `feat` | ✨ | Nova funcionalidade visível ao utilizador |
| `fix` | 🐛 | Correcção de bug |
| `style` | 🎨 | CSS, Tailwind, ajustes visuais (sem lógica) |
| `refactor` | ♻️ | Melhoria de código sem mudar comportamento externo |
| `docs` | 📚 | README, comentários, JSDoc, PHPDoc |
| `test` | 🧪 | Testes unitários ou de integração |
| `perf` | ⚡ | Optimização de performance |
| `chore` | 🔧 | Configuração, dependências, CI/CD |
| `security` | 🔒 | Correcção de vulnerabilidade |
| `revert` | ⏪ | Reverter commit anterior |

### Âmbitos Sugeridos

`auth`, `cart`, `checkout`, `products`, `orders`, `admin`, `dashboard`, `api`, `db`, `ui`, `layout`

### Exemplos Corretos

```bash
# ✅ Bons commits
git commit -m "feat(checkout): adicionar suporte a pagamento por referência Multicaixa"
git commit -m "fix(cart): corrigir contagem incorrecta ao remover item duplicado"
git commit -m "style(navbar): ajustar espaçamento do logo no mobile"
git commit -m "refactor(auth): extrair lógica JWT para helper separado"
git commit -m "docs: adicionar exemplos de uso da API de pedidos"
git commit -m "perf(products): adicionar índice fulltext para busca mais rápida"

# ❌ Commits a evitar
git commit -m "fix"                    # sem descrição
git commit -m "varias mudancas"        # vago e sem tipo
git commit -m "WIP"                    # nunca commitar WIP para branch partilhada
git commit -m "actualizar ficheiros"   # não descreve o que mudou
```

### Commits com Breaking Changes

```bash
git commit -m "feat(api)!: mudar resposta da autenticação para incluir refresh token

BREAKING CHANGE: o campo 'token' foi renomeado para 'access_token'.
Actualizar todos os clientes que consumam /api/auth/login."
```

---

## 🎨 Padrões de Código

### Frontend (React + Tailwind)

#### Componentização

```jsx
// ✅ Correcto — componente em /components quando usado 2+ vezes
// frontend/src/components/ui/ProductCard.jsx
export function ProductCard({ product, onAddToCart }) {
  const { nome, preco, imagem_principal, preco_promocional } = product; // desestruturação limpa

  return (
    <article className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      {/* ... */}
    </article>
  );
}

// ❌ Incorrecto — lógica inline repetida em múltiplas páginas
```

#### Regras de Componentes

```jsx
// ✅ Nomeação PascalCase
ProductCard.jsx
CheckoutForm.jsx
AdminOrderTable.jsx

// ✅ Desestruturação de props
function Button({ label, onClick, variant = 'primary', disabled = false }) { }

// ✅ JSDoc para props complexas
/**
 * @param {Object}   props
 * @param {Product}  props.product          - Dados do produto
 * @param {Function} props.onAddToCart      - Callback ao adicionar ao carrinho
 * @param {boolean}  [props.showBadge=true] - Mostrar badge de destaque
 */
function ProductCard({ product, onAddToCart, showBadge = true }) { }

// ✅ Dark mode em TODOS os componentes novos
<div className="bg-white dark:bg-eucalyptus-900 text-gray-900 dark:text-eucalyptus-100">

// ❌ Nunca usar estilos inline para layout
<div style={{ marginTop: '16px' }}>   // use: className="mt-4"
```

#### Gestão de Estado

```jsx
// ✅ Zustand para estado global
import useCartStore from '@/store/cartStore';
const { items, addItem, removeItem } = useCartStore();

// ✅ useState para estado local do componente
const [isOpen, setIsOpen] = useState(false);

// ✅ useCallback para funções passadas como props
const handleSubmit = useCallback(async (data) => {
  // ...
}, [dependency]);

// ❌ Evitar prop drilling de mais de 2 níveis — use Context ou Zustand
```

#### Chamadas à API

```jsx
// ✅ Sempre tratar loading, erro e sucesso
const [loading, setLoading] = useState(false);
const [error, setError]     = useState(null);

async function fetchProducts() {
  setLoading(true);
  setError(null);
  try {
    const data = await productsAPI.list(filters);
    setProducts(data);
  } catch (err) {
    setError(err.message);
    toast.error('Não foi possível carregar os produtos.');
  } finally {
    setLoading(false);
  }
}
```

---

### Backend (PHP)

#### Segurança — Obrigatório

```php
// ✅ SEMPRE usar Prepared Statements (PDO)
$stmt = $this->db->prepare('SELECT id, nome FROM usuarios WHERE email = ?');
$stmt->execute([$email]);

// ❌ NUNCA concatenar variáveis em SQL — SQL Injection!
$query = "SELECT * FROM usuarios WHERE email = '$email'"; // PROIBIDO

// ✅ Sanitizar inputs de texto (não substitui prepared statements)
$nome = htmlspecialchars(trim($input['nome']), ENT_QUOTES, 'UTF-8');

// ✅ Validar emails com filter_var
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) { /* retornar 422 */ }

// ✅ Verificar tipos numéricos
$id = filter_var($input['id'], FILTER_VALIDATE_INT);
if ($id === false || $id <= 0) { /* retornar 422 */ }
```

#### Performance

```php
// ✅ Buscar apenas colunas necessárias
SELECT id, nome, email, role FROM usuarios   // ✅
SELECT * FROM usuarios                        // ❌

// ✅ Usar índices — colunas em WHERE/JOIN devem ter índice na BD
// (já definido no database.sql para as colunas críticas)

// ✅ Limitar resultados de listas
$limit  = min((int) ($filters['limit'] ?? 20), 100); // máximo 100 por request
$offset = (int) ($filters['offset'] ?? 0);

// ✅ Usar transações para operações múltiplas
$this->db->beginTransaction();
try {
    // múltiplas operações...
    $this->db->commit();
} catch (Throwable $e) {
    $this->db->rollBack();
    throw $e;
}
```

#### Respostas da API — Padrão Obrigatório

```php
// ✅ Formato padrão para TODAS as respostas
echo json_encode([
    'status'  => 'success',   // ou 'error'
    'data'    => $result,     // null se não aplicável
    'message' => 'Produtos listados com sucesso.',
]);

// ✅ Códigos HTTP corretos
// 200 OK — leitura bem-sucedida
// 201 Created — criação bem-sucedida
// 204 No Content — operação sem retorno de dados
// 400 Bad Request — erro de validação genérico
// 401 Unauthorized — não autenticado
// 403 Forbidden — autenticado mas sem permissão
// 404 Not Found — recurso não existe
// 409 Conflict — ex: email já registado
// 422 Unprocessable — falha de validação de dados
// 500 Internal Error — erros inesperados do servidor

// ✅ Comentários PHPDoc em todos os métodos públicos
/**
 * Cria um novo produto.
 *
 * @param  array $data  Dados validados do produto
 * @return int          ID do produto criado
 * @throws RuntimeException Se a inserção falhar
 */
public function create(array $data): int { }
```

---

## 🧪 Testes

### Frontend

```bash
# Executar testes (quando configurados)
npm run test

# Verificar build sem erros (OBRIGATÓRIO antes do PR)
npm run build

# Verificar linting
npm run lint
```

### Backend

Antes de abrir um PR, teste manualmente os endpoints afectados:

```bash
# Exemplo: testar login
curl -X POST http://localhost/calipe-digital/backend/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@calipe.ao","senha":"Admin@2026"}'

# Exemplo: testar rota protegida
curl http://localhost/calipe-digital/backend/api/auth/me \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📬 Pull Requests

### Checklist Obrigatório

Antes de submeter um PR, confirme todos os itens:

```
Backend:
[ ] Todos os inputs são validados e sanitizados
[ ] Queries usam prepared statements (sem concatenação)
[ ] Erros retornam JSON estruturado com código HTTP correcto
[ ] Nenhuma senha_hash ou dado sensível exposto na resposta
[ ] Comentários PHPDoc em métodos públicos novos/alterados

Frontend:
[ ] npm run build passa sem warnings nem erros
[ ] npm run lint passa limpo
[ ] Componentes novos suportam dark: mode do Tailwind
[ ] Loading, erro e estado vazio tratados em chamadas à API
[ ] Componentes usados 2+ vezes estão em /components

Geral:
[ ] Branch criada a partir de main actualizada
[ ] Commits seguem o padrão semântico
[ ] PR contém descrição clara do que foi alterado e porquê
[ ] Screenshots incluídos para alterações visuais
[ ] Sem ficheiros .env, credenciais ou dados sensíveis no commit
```

### Template de Descrição do PR

```markdown
## 📋 Descrição
Breve descrição do que foi feito e porquê.

## 🔄 Tipo de Alteração
- [ ] Bug fix (correcção que resolve um problema)
- [ ] Nova funcionalidade (adição que não quebra existente)
- [ ] Breaking change (alteração que quebra funcionalidade existente)
- [ ] Documentação

## 🧪 Como Testar
1. Aceder a ...
2. Clicar em ...
3. Verificar que ...

## 📸 Screenshots (se aplicável)
| Antes | Depois |
|---|---|
| ... | ... |

## ✅ Checklist
- [ ] npm run build passa
- [ ] Testado manualmente no browser
- [ ] Sem dados sensíveis no commit
```

---

## 🔍 Revisão de Código

### O Que Verificamos

- **Correctude**: O código faz o que descreve?
- **Segurança**: Inputs validados? Prepared statements? Sem exposição de dados sensíveis?
- **Performance**: Queries optimizadas? Sem N+1 queries?
- **Legibilidade**: Código auto-documentado? Comentários onde necessário?
- **Consistência**: Segue os padrões do projecto?
- **Responsividade**: UI funciona em mobile, tablet e desktop?

### Tempo de Resposta

- PRs serão revistos em até **3 dias úteis**
- PRs urgentes (segurança) em até **24 horas**

---

## 🤖 Assistentes de IA & Automação

> Bem-vindo, contribuidor automatizado! Estas regras aplicam-se especificamente a código gerado por IA.

### Obrigatório para IA

- **Validar responsividade**: Alterações de estilo não devem quebrar o layout em nenhum breakpoint (`sm`, `md`, `lg`, `xl`)
- **Preservar comentários críticos**: É **proibido** remover comentários de documentação de funções críticas (funções de segurança, cálculos de pagamento, gestão de stock)
- **Não alterar .env**: Nunca gerar, modificar ou sugerir valores de `.env` com credenciais reais
- **Prepared statements**: Toda query gerada deve usar PDO prepared statements — nunca concatenar variáveis

### Recomendado para IA

- Adicionar comentários explicativos em lógica não-óbvia
- Incluir validação de tipos em funções PHP novas
- Verificar se componentes React gerados têm variante `dark:` do Tailwind

---

## 📞 Contacto

- **Issues**: Use o GitHub Issues para bugs e feature requests
- **Discussões**: GitHub Discussions para dúvidas gerais
- **Segurança**: Para vulnerabilidades, envie email directamente ao maintainer (não use Issues públicos)

---

<div align="center">
<strong>🌿 Calipe Digital — Onde o código encontra a performance</strong><br>
<em>Cada contribuição é uma folha nova nesta árvore.</em>
</div>
