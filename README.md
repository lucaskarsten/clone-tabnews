# clone-tabnews

Clone do tabnews para o curso de dev do deschamps

## Variáveis de ambiente PostgreSQL

O código usa conexão direta com `pg` e espera as variáveis:

```
POSTGRES_HOST
POSTGRES_PORT
POSTGRES_USER
POSTGRES_DB
POSTGRES_PASSWORD
```

Como comodidade, os nomes genéricos `PGHOST`, `PGUSER`, `PGPASSWORD`,
`PGDATABASE` e `PGPORT` também são aceitos (é o padrão do cliente `psql`
e de vários provedores). Se nenhuma senha válida for encontrada o servidor
vai falhar com erro explicando o problema em vez de um baixo‑nível
"client password must be a string".

Alguns bancos (Neon, Heroku, etc.) exigem conexão segura. É possível
informar a política via `PGSSLMODE` ou `POSTGRES_SSLMODE` — o código lê
essas variáveis e habilita SSL (`require`, `prefer`, `verify-full`, ...)
durante a conexão. Sem isso, o erro "connection is insecure (try using
`sslmode=require`)" pode aparecer.

A API `/api/knowledge` cria a tabela automaticamente na primeira chamada,
o que evita necessidade de executar migrações manualmente em ambientes
transientes.

Para checar se a aplicação consegue falar com o banco usando qualquer
conjunto de variáveis (por exemplo, suas credenciais de produção) há um
script auxiliar:

```bash
# export os dados que você listou no shell
PGHOST='...'
PGDATABASE=''
PGUSER=''
PGPASSWORD=''
PGSSLMODE=
PGCHANNELBINDING=

# então execute:
node infra/check-connection.js
```

Se a conexão for bem‑sucedida ele exibirá o horário do servidor e
sairá com código 0, caso contrário mostrará o erro retornado pelo driver
(e.g. senha indefinida, timeout, etc.).

### Executando migrações

Para rodar migrations use os scripts npm que já carregam as variáveis de
ambiente e, opcionalmente, definem o `DATABASE_URL`:

```bash
npm run migration:up       # carrega .env.development se existir e usa $DATABASE_URL
npm run migration:up:dev   # igual, mas passa flag adicional para o migrator
```

Evite chamar `node-pg-migrate` diretamente; a CLI não respeita `PGHOST`
/`PGPASSWORD` etc. e pode gerar o erro “client password must be a string”.
Se preferir executar manualmente, forneça a URL completa:

```bash
PGHOST=... PGPASSWORD=... node-pg-migrate --migrations-dir infra/migrations \
  --url "$PGHOST..." up
```

### Corrigindo migrações já aplicadas erroneamente

Se você criar ou editar um arquivo de migração mas ele já tiver sido
registrado em `pgmigrations`, o runner não voltará a executá‑lo. Isso é
intencional, mas às vezes resultará em erros como “relation already
exists” se a versão anterior tiver gerado um objeto diferente.

Para resolver:

1. **Ajuste o arquivo** (por exemplo, troque o nome da tabela ou use
   `ifNotExists`), como foi feito na migração `add-memory-table`.
2. **Remova a linha correspondente em `pgmigrations`** usando um cliente
   SQL ou execute `DROP SCHEMA public CASCADE; CREATE SCHEMA public;`
   em pequenos ambientes de desenvolvimento quando for seguro.
   Isso limpa o histórico e permite que as migrations sejam reaplicadas.
3. Para evitar futuros acidentes, adicione `ifNotExists`/`ifExists` às
   operações ou escrever validações no `up`.

Estas medidas deixam as migrações tolerantes e facilitam o reset do
ambiente de desenvolvedor quando você está apenas brincando localmente.
