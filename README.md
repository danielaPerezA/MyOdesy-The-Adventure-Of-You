# MyOdesy 🌱
### *The Adventure of Being You*

Aplicación web progresiva (PWA) para adultos jóvenes que quieren construir hábitos reales — en el gym y en sus finanzas — desde un solo lugar, con un sistema de rachas que hace que mantener la disciplina se sienta como un juego.

---

## ¿Qué es MyOdesy?

MyOdesy centraliza dos áreas que suelen gestionarse por separado: la **rutina de gimnasio** y las **finanzas personales**. A través de un sistema de rachas diarias y notificaciones automáticas por email, la app convierte el registro de hábitos en una experiencia motivadora y continua.

> Si estás a punto de perder tu racha, MyOdesy te avisa. Si ya la perdiste, también.

---

## Funcionalidades principales

### 🏋️ Gestión de Gym
- Registro de días de entrenamiento con grupo muscular trabajado
- Metas semanales, mensuales y anuales de asistencia
- Visualización de progreso con barras mensuales
- Racha de entrenamiento con calendario semanal

### 💰 Gestión de Finanzas
- Registro de saldo disponible, gastos y ahorros
- Categorización de transacciones
- Metas de ahorro mensuales y anuales
- Dashboard con progreso de ahorro mes a mes

### 🔥 Sistema de Rachas
- Contador de racha activa por módulo (Gym y Finanzas)
- Actualización automática al registrar actividad
- Detección de inactividad y pérdida de racha
- Notificación por email a las 23:00 hrs si no completaste tu meta del día
- Email de confirmación de racha perdida al día siguiente

### 📊 Dashboard personalizado
- Vista de bienvenida con resumen del estado del usuario
- Estadísticas de progreso en tiempo real
- Acceso rápido a ambos módulos

---

## Tech Stack

| Capa | Tecnología |
|---|---|
| Frontend | Angular 17+ |
| Estilos | SCSS con variables globales |
| Backend | Python + FastAPI |
| Base de datos | PostgreSQL (Supabase) |
| Hosting frontend | Vercel |
| Hosting backend | Render |
| Emails | Brevo |
| Control de versiones | Git + GitHub |

---

## Estructura del proyecto

```
MyOdesy/
├── src/
│   ├── app/
│   │   ├── components/          # Componentes reutilizables
│   │   │   ├── navbar/
│   │   │   ├── footer/
│   │   │   ├── streak-card/     # Tarjeta de racha (compartida entre gym y finanzas)
│   │   │   ├── progress-bar/    # Barras de progreso mensual
│   │   │   └── stat-card/       # Tarjetas de estadísticas
│   │   ├── guards/
│   │   │   └── my-odesy-guard.ts
│   │   ├── pages/               # Pantallas de la aplicación
│   │   │   ├── start/           # Landing pública
│   │   │   ├── login-register/  # Autenticación
│   │   │   ├── home/            # Dashboard principal post-login
│   │   │   ├── finanzas/        # Módulo de finanzas
│   │   │   └── gym/             # Módulo de gym
│   │   ├── services/            # Servicios de comunicación con el backend
│   │   │   ├── auth/
│   │   │   ├── finance/
│   │   │   ├── gym/
│   │   │   └── users/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   │   ├── icons/               # Íconos SVG/PNG (fuego, usuario, logout, redes)
│   │   └── img/                 # Imágenes (logo, ilustraciones)
│   ├── styles/
│   │   ├── _variables.scss      # Colores, tipografía, espaciados
│   │   ├── _base.scss           # Reset y estilos globales
│   │   └── styles.scss          # Punto de entrada de estilos
│   ├── index.html
│   └── main.ts
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Instalación y ejecución local

### Prerrequisitos
- Node.js 18+
- Angular CLI (`npm install -g @angular/cli`)

### Pasos

```bash
# 1. Clonar el repositorio
git clone https://github.com/tu-usuario/myodesy-the-adventure-of-you.git
cd myodesy-the-adventure-of-you/MyOdesy

# 2. Instalar dependencias
npm install

# 3. Correr en desarrollo
ng serve

# 4. Abrir en el navegador
# http://localhost:4200
```

---

## Variables de entorno

Crea un archivo `environment.ts` dentro de `src/environments/` con la siguiente estructura:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',  // URL del backend FastAPI
};
```

> ⚠️ Nunca subas credenciales reales al repositorio. Usa `.gitignore` para excluir archivos de entorno de producción.

---

## Casos de prueba definidos

| ID | Caso | Descripción |
|---|---|---|
| CP-01 | Registro e inicio de sesión | Valida el flujo de autenticación completo |
| CP-02 | Registro de sesión de gym | Verifica actualización de racha y progreso de meta |
| CP-03 | Registro de transacciones financieras | Comprueba que el dashboard refleja los datos en tiempo real |
| CP-04 | Notificación de advertencia por email | Valida el envío automático a las 23:00 hrs |
| CP-05 | Responsividad en dispositivo móvil | Confirma que la PWA funciona correctamente en mobile |
| CP-06 | Persistencia de datos entre sesiones | Garantiza que el historial no se pierde al cerrar sesión |

---

## Equipo

| Nombre | Rol |
|---|---|
| Celene Parra Vega | Full-stack — Backend, base de datos, lógica de rachas |
| Daniela Pérez Agualimpia | Full-stack — Frontend, diseño UI/UX, dashboards |

---

## Estado del proyecto

- [x] Estructura base del proyecto Angular
- [x] Diseño UI/UX en Figma
- [x] Sistema de autenticación
- [ ] Módulo de Gym
- [ ] Módulo de Finanzas
- [ ] Sistema de Rachas
- [ ] Notificaciones por email
- [ ] Despliegue en producción

---

*Laboratorio de Software — 2026*
