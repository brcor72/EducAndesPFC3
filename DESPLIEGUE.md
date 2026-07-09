# 🚀 Despliegue en la nube — EducAndes

## Arquitectura de producción

```
Internet → Vercel (Frontend React)
                ↕
           Railway (Backend NestJS)
                ↕
           Railway (PostgreSQL DB)
```

Costo: **GRATIS** con los planes gratuitos de ambas plataformas.

---

## 1️⃣ Subir a GitHub (requisito previo)

```powershell
# En PowerShell, una sola vez:
gh auth login
gh repo create EducAndes --public --push --source C:\Users\HP\Desktop\EducAndes
```

---

## 2️⃣ Desplegar Backend + BD en Railway

Railway da $5/mes gratis — suficiente para este proyecto.

### Pasos:
1. Ir a **https://railway.app** → "Start a New Project"
2. Elegir **"Deploy from GitHub repo"**
3. Seleccionar tu repo **EducAndes**
4. Railway detecta el `railway.toml` automáticamente
5. Hacer clic en **"Add a service"** → **"Database"** → **PostgreSQL**
6. Railway genera automáticamente la variable `DATABASE_URL`

### Variables de entorno en Railway (Settings → Variables):
```
JWT_SECRET=genera_uno_largo_y_aleatorio_aqui_minimo_32_chars
JWT_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_DAYS=7
NODE_ENV=production
FRONTEND_URL=https://tu-app.vercel.app   ← actualizar después
PORT=3001
```

### Después de desplegar:
- Railway te da una URL como: `https://educandes-production.up.railway.app`
- Anota esa URL — la necesitarás para el frontend

---

## 3️⃣ Desplegar Frontend en Vercel

Vercel es completamente gratis para proyectos estáticos.

### Pasos:
1. Ir a **https://vercel.com** → "Add New Project"
2. Importar tu repo **EducAndes** de GitHub
3. Configurar:
   - **Root Directory:** `frontend`
   - **Framework:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Añadir variable de entorno:
   ```
   VITE_API_URL=https://tu-url.up.railway.app/api/v1
   ```
   *(reemplaza con la URL real de Railway)*
5. Hacer clic en **Deploy**

### Resultado:
- Vercel te da una URL como: `https://educandes.vercel.app`
- ¡Esta es tu URL pública para compartir!

---

## 4️⃣ Conectar Frontend ↔ Backend

1. Copia tu URL de Vercel: `https://educandes.vercel.app`
2. Ve a Railway → tu proyecto → Settings → Variables
3. Actualiza: `FRONTEND_URL=https://educandes.vercel.app`
4. Railway redespliega automáticamente

---

## 5️⃣ Dominio personalizado (opcional, ~$10/año)

### Opción A — Dominio gratis con Railway:
Railway ya te da `tu-proyecto.up.railway.app` sin costo.

### Opción B — Dominio .com o .pe propio:
1. Comprar en **namecheap.com** o **nic.pe** (~$10-15/año)
2. En Vercel: Settings → Domains → añadir tu dominio
3. En Railway: Settings → Networking → Custom Domain
4. Seguir las instrucciones de DNS que dan ambas plataformas

---

## 📊 Resumen de URLs finales

| Servicio | URL |
|---|---|
| Frontend público | https://educandes.vercel.app |
| API Backend | https://tu-proyecto.up.railway.app/api/v1 |
| Swagger Docs | https://tu-proyecto.up.railway.app/api/docs |
| GitHub repo | https://github.com/TU_USUARIO/EducAndes |

---

## 🔄 Actualizar el código en el futuro

Cada vez que hagas cambios locales:
```powershell
cd C:\Users\HP\Desktop\EducAndes
git add .
git commit -m "descripcion del cambio"
git push
```
Railway y Vercel detectan el push y redesplegan automáticamente en ~2 minutos.
