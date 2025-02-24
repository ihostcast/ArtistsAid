# ArtistsAid Platform

Plataforma para conectar artistas y organizaciones culturales.

## Configuración del Proyecto

### Requisitos Previos
- Node.js >= 18.0.0
- PostgreSQL (Neon Database)
- Vercel CLI (opcional para despliegue local)

### Variables de Entorno
```env
NODE_ENV=production
DATABASE_URL=postgresql://[user]:[password]@[host]/[database]?sslmode=require
JWT_SECRET=[your-jwt-secret]
MAIN_DOMAIN=https://artistsaid.vercel.app
ADMIN_DOMAIN=https://admin.artistsaid.vercel.app
```

### Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/ihostcast/ArtistsAid.git
cd ArtistsAid
```

2. Instalar dependencias:
```bash
cd backend
npm install
```

3. Configurar la base de datos:
```bash
npx sequelize-cli db:migrate
npx sequelize-cli db:seed:all
```

### Desarrollo Local

1. Iniciar el servidor de desarrollo:
```bash
npm run dev
```

2. Acceder a:
- Frontend: http://localhost:3000
- Panel Admin: http://localhost:3000/admin

## Despliegue en Vercel

1. Configurar proyecto en Vercel:
```bash
vercel
```

2. Configurar variables de entorno en Vercel:
```bash
vercel env add DATABASE_URL
vercel env add JWT_SECRET
vercel env add NODE_ENV
vercel env add MAIN_DOMAIN
vercel env add ADMIN_DOMAIN
```

3. Desplegar a producción:
```bash
vercel --prod
```

### Acceso al Panel de Administración

URL: https://artists-aid.vercel.app/admin/login

Credenciales por defecto:
- Email: admin@artistsaid.com
- Password: Admin123!

## Estructura del Proyecto

```
backend/
├── api/              # Funciones serverless
├── src/
│   ├── config/      # Configuración
│   ├── models/      # Modelos de datos
│   ├── routes/      # Rutas de la API
│   ├── middleware/  # Middleware
│   └── public/      # Archivos estáticos
├── migrations/      # Migraciones de base de datos
└── seeders/        # Datos iniciales
```

## Características

- Autenticación JWT
- Panel de administración
- API RESTful
- Base de datos PostgreSQL (Neon)
- Despliegue serverless en Vercel

## Tecnologías

- Backend:
  - Node.js
  - Express
  - Sequelize
  - @neondatabase/serverless
  - JWT

- Frontend:
  - HTML/CSS/JavaScript
  - Bootstrap 5
  - Fetch API

## Seguridad

- SSL/TLS para conexiones de base de datos
- Encriptación de contraseñas con bcrypt
- Autenticación basada en tokens JWT
- Headers de seguridad con Helmet
- CORS configurado para dominios específicos

## Mantenimiento

### Base de Datos
- Backups automáticos con Neon
- Migraciones versionadas
- Pooling de conexiones optimizado

### Monitoreo
- Logs en Vercel
- Métricas de base de datos en Neon
- Alertas de errores configuradas

## Licencia

ISC

## Autor

ODG Music