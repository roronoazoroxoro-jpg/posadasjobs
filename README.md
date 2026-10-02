# TucanJobs

Plataforma web de empleo para Posadas (Misiones): candidatos publican perfil técnico y CV; empresas publican puestos y contactan talento.

## Stack

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS
- Prisma + SQLite
- Auth por correo electrónico + clave (sesión firmada HMAC)

## Funcionalidades

- Registro / login con email (candidato o empresa)
- Perfil técnico, skills, experiencia, educación y CV
- Perfil de empresa
- Publicación, cierre y eliminación de empleos
- Búsqueda de empleos, empresas y talentos
- Postulaciones con carta de presentación
- Panel para gestionar estado de postulaciones y contactar candidatos

## Cuentas demo

| Rol | Email | Clave |
|-----|-------|-------|
| Valentín (destacado) | valentinprogramer234@gmail.com | Posadas2026! |
| Empresa | empresa@tucanjobs.com | Posadas2026! |
| Candidato demo | candidato@tucanjobs.com | Posadas2026! |

## Desarrollo local

```bash
npm install
npm run setup
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Variables de entorno

Copiá `.env.example` a `.env`:

- `DATABASE_URL` — ruta SQLite
- `AUTH_SECRET` — secreto de sesión
- `COOKIE_SECURE=true` en HTTPS / producción
