# clone-tabnews

Clone do [TabNews](https://www.tabnews.com.br) feito no [curso.dev](https://curso.dev).
Next.js 13 (pages router), PostgreSQL com `pg` e `node-pg-migrate`, testes de
integração com Jest contra o banco real.

## Como este projeto foi feito

Acompanhei todas as aulas do curso. Os Dias 1–25 implementei à mão; dos Dias
26–56 em diante usei o Claude Code para a implementação, sob minha direção e
com revisão minha.

## Rodando localmente

Requisitos: Node 22 (`.nvmrc`), Docker com Compose.

```bash
npm ci
npm run dev        # sobe Postgres + Mailcatcher, roda migrations e o next dev
```

- App: http://localhost:3000
- Emails enviados em dev: http://localhost:1080 (Mailcatcher)

As variáveis de ambiente de desenvolvimento ficam em `.env.development`.
Todas as variáveis, com valores fictícios, estão em [`.env.example`](.env.example).
Segredos locais vão em `.env.local` (ignorado pelo git).

| Variável                      | Uso                                                          |
| ----------------------------- | ------------------------------------------------------------ |
| `POSTGRES_*` / `DATABASE_URL` | conexão com o banco; SSL em produção, `POSTGRES_CA` opcional |
| `PEPPER`                      | segredo somado à senha antes do bcrypt                       |
| `EMAIL_SMTP_*`                | servidor SMTP (nodemailer)                                   |
| `EMAIL_HTTP_HOST`/`_PORT`     | API do Mailcatcher, usada pelos testes                       |
| `WEBSERVER_URL`               | base do link de ativação enviado no email                    |

## Testes

```bash
npm test
```

Sobe os serviços, inicia o `next dev` e roda o Jest em série. Os testes ficam em
`tests/integration/` e falam com o servidor e o banco de verdade, sem mocks.
`tests/integration/orchestrator.js` limpa o banco, roda migrations e cria
usuários, sessões e lê emails do Mailcatcher.

Lint: `npm run lint:prettier:check` e `npm run lint:eslint:check`.

## API

Todas as rotas ficam em `/api/v1`. Erros seguem o formato
`{ name, message, action, status_code }`.

| Método | Rota                      | Feature exigida         | Descrição                                            |
| ------ | ------------------------- | ----------------------- | ---------------------------------------------------- |
| GET    | `/status`                 | —                       | saúde do banco; versão só com `read:status:all`      |
| GET    | `/migrations`             | `read:migration`        | migrations pendentes                                 |
| POST   | `/migrations`             | `create:migration`      | roda as pendentes (201 se rodou alguma)              |
| POST   | `/users`                  | `create:user`           | cadastra e envia email de ativação                   |
| GET    | `/users/[username]`       | —                       | perfil público; email só para o próprio usuário      |
| PATCH  | `/users/[username]`       | `update:user`           | edita a si mesmo; outros exigem `update:user:others` |
| PATCH  | `/activations/[token_id]` | `read:activation_token` | ativa a conta (token vale 15 min)                    |
| POST   | `/sessions`               | `create:session`        | login; seta cookie `session_id` (30 dias)            |
| DELETE | `/sessions`               | `read:session`          | logout; expira a sessão e limpa o cookie             |
| GET    | `/user`                   | `read:session`          | usuário da sessão; renova sessão e cookie            |

Anônimos têm `read:activation_token`, `create:session` e `create:user`. Um
usuário recém-cadastrado só tem `read:activation_token`; ao ativar a conta passa
a ter `create:session`, `read:session` e `update:user`.

## Estrutura

```
infra/       banco, email, erros, controller (next-connect), migrations
models/      user, password, session, authentication, authorization, activation, migrator
pages/       páginas (cadastro, login, status) e a API em pages/api/v1
components/  layout e formulário compartilhado (Primer React)
tests/       testes de integração
```
