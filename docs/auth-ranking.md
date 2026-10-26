# Auth, perfil y ranking privado

Ingreso **solo con Google** (Better Auth) y datos en **Neon Postgres**. No hay email/contraseña ni lista pública de ranking.

Sin estas variables el build pasa igual: el botón "Entrar con Google" avisa que el ingreso todavía no está habilitado, y `POST /api/entrega` sigue el stub de T06.

## Variables

Copiar `.env.example` a `.env` en local. En Vercel: Project → Settings → Environment Variables (Production y Preview).

| Variable | Obligatoria para login | Qué es |
|---|---|---|
| `DATABASE_URL` | sí | Connection string **pooled** de Neon (el host lleva `-pooler`), con `sslmode=require`. |
| `BETTER_AUTH_SECRET` | sí | `openssl rand -base64 32`. Firma la cookie de sesión. |
| `GOOGLE_CLIENT_ID` | sí | OAuth client ID (tipo Web). |
| `GOOGLE_CLIENT_SECRET` | sí | OAuth client secret. |
| `ADMIN_SECRET` | para el ranking | `openssl rand -base64 32`. Solo el `POST /api/admin/ranking`. |
| `BETTER_AUTH_URL` | en producción | Origen canónico, sin barra final: `https://tren-solar-hackathon.vercel.app`. En local **dejarla vacía**: el callback se arma con el host del request (`localhost` o un preview `*.vercel.app`). |
| `ENTREGA_WEBHOOK_URL` | no | Sigue siendo el destino del form (T06). |

`DATABASE_URL` de migraciones largas puede ser el string **directo** (sin `-pooler`). La app en Vercel usa el pooled.

## Neon

1. Crear un proyecto en [Neon](https://neon.tech) (Postgres).
2. En el dashboard, copiar el connection string **Pooled connection**.
3. Pegarlo en `DATABASE_URL`.

La primera request autenticada crea las tablas de Better Auth (`user`, `session`, `account`, `verification`) y las nuestras:

- `profile` — una fila por `user.id` (nombre, Jujuy, localidad, GitHub, one-liner).
- `ranking` — una fila por email, con `in_top` y `updated_at`.
- `ranking_meta` — una sola fila (`id = 1`) con la etiqueta de la última semana.

No hace falta correr un CLI para el alta inicial. Si preferís migrar antes de abrir tráfico y ya está `DATABASE_URL` en el entorno: `npx auth@latest migrate` (el CLI lee la config de Better Auth; en este repo la migración también corre sola al bootear `getAuth()`).

## Google Cloud OAuth

1. [Google Cloud Console](https://console.cloud.google.com/) → APIs y servicios → Credenciales → Crear credenciales → **ID de cliente de OAuth** → Aplicación web.
2. Pantalla de consentimiento: externa o interna, con los scopes por defecto de OpenID (`openid`, `email`, `profile`). No hace falta un scope extra.
3. **Orígenes autorizados de JavaScript**
   - `http://localhost:4321`
   - `https://tren-solar-hackathon.vercel.app`
4. **URIs de redireccionamiento autorizados**
   - `http://localhost:4321/api/auth/callback/google`
   - `https://tren-solar-hackathon.vercel.app/api/auth/callback/google`
5. Copiar Client ID y Client secret a `GOOGLE_CLIENT_ID` y `GOOGLE_CLIENT_SECRET`.

El dev server de Astro es el puerto **4321**, no 3000. Si Google responde `redirect_uri_mismatch`, la URI que falta es exactamente la de arriba (con `/api/auth/callback/google`).

Los previews de Vercel (`https://<rama>-<proyecto>.vercel.app`) solo van a poder entrar con Google si agregás esa URI de callback en la consola. El código acepta el host `*.vercel.app` cuando `BETTER_AUTH_URL` está vacío; con `BETTER_AUTH_URL` fija, el callback sale de ese origen (el de producción).

## Qué ve la persona

1. Nav: **Entrar con Google**. Con sesión: avatar (o inicial), link a `#mi-estado` y **Salir**.
2. `#perfil`: email de solo lectura, nombre, "Vivo o resido en Jujuy", localidad, GitHub, una línea. El medidor va de 0 a 100 de a 20.
3. El 100% pide los cinco: nombre y apellido, confirmación de Jujuy en sí, localidad (2–80, solo si Jujuy), `https://github.com/usuario` o `…/usuario/repo`, y una línea de 3–120 caracteres.
4. `#mi-estado`: con perfil al 100%, una sola frase — **Estás en el top 30** o **Todavía no estás en el top** — más la etiqueta de la semana si la organización la mandó. No hay listas ni puntajes.
5. `#entrega`: si el auth está configurado, hace falta sesión y perfil al 100%. El email que se despacha es el de Google (`userId` viaja en el webhook). Si el auth no está configurado, el form sigue como en T06.

## Ranking del fin de semana

La lista del body **reemplaza** el top. No es un delta.

- Cada email del array queda `inTop=true` (se compara en minúsculas con el email de Google).
- Cualquier otra fila de `ranking` pasa a `inTop=false`.
- Máximo 30 emails. Duplicados se ignoran. `emails: []` deja a nadie en el top.
- `weekLabel` (opcional, hasta 80 caracteres) es el texto que ve cada persona, también quien no está en el top.
- Quien todavía no tiene fila se muestra como "Todavía no estás en el top" y ve la etiqueta de `ranking_meta`.

No hay pantalla de admin. Desde la máquina de la organización:

```bash
curl -sS -X POST https://tren-solar-hackathon.vercel.app/api/admin/ranking \
  -H "Authorization: Bearer $ADMIN_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"emails":["ana@gmail.com","bruno@gmail.com"],"weekLabel":"Semana 4 · 2026-11-02"}'
```

Respuesta (sin repetir los emails):

```json
{ "ok": true, "inTop": 2, "total": 2, "weekLabel": "Semana 4 · 2026-11-02" }
```

`total` cuenta filas guardadas (incluye gente que alguna semana estuvo y ahora quedó en false). `inTop` es cuántas quedaron en true. Un secreto mal puesto responde `401`. Sin `ADMIN_SECRET` o sin `DATABASE_URL`, `503`.

Local, el mismo `curl` contra `http://localhost:4321/api/admin/ranking`.
