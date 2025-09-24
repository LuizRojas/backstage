# Backstage

Seja bem-vindo(a) ao projeto de plataforma de catálogo de software e ferramentas para DEVs usando backstage

Aqui você irá encontrar:

- Como iniciar a aplicacao
- Makefile
- Docker compose
- Workflow

## Primeiros passos (Makefile)

Como o projeto utiliza Makefile, basta apenas utilizar o comando:

```
$ make all
```

Que assim estará instalando os pacotes do yarn, buildando, e subindo o contêiner. Mas caso já tenha buildado e queira apenas rodar, utilize:

```
$ make run
```

Se precisar de ajuda com os comandos:

```
$ make help
```

## Dotenv

Lembre-se de preencher as variáveis de ambiente para usar o backstage sem problemas

```
GITHUB_TOKEN=
AUTH_GITHUB_CLIENT_ID=
AUTH_GITHUB_CLIENT_SECRET=
AUTH_GOOGLE_CLIENT_ID=
AUTH_GOOGLE_CLIENT_SECRET=

POSTGRES_HOST=
POSTGRES_PORT=
POSTGRES_DATABASE=
POSTGRES_USER=
POSTGRES_PASSWORD=

APP_URL=localhost
APP_PORT=7007

DOCKER_IMAGE_TAG=
```

## Yarn

Se quiser usar diretamente, basta usar os seguintes comandos:

```
yarn install && yarn start
```

## Docker compose

Se quiser usar via docker compose sem o Makefile:

```
docker compose up -d --build --force-recreate
```
