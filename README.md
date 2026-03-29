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
- Registro de días de entrenamiento por día de la semana con grupo muscular trabajado
- Metas semanales, mensuales y anuales de asistencia
- Visualización de progreso con barras mensuales y barra de progreso anual
- Racha de entrenamiento con calendario semanal
- Reinicio automático semanal y mensual — el progreso histórico se conserva
- Racha activa solo suma una vez por día

### 💰 Gestión de Finanzas
- Registro de saldo disponible, gastos (con categoría) y ahorros
- Metas de ahorro mensuales y anuales
- Dashboard con progreso de ahorro mes a mes y barra de meta anual
- Categoría de mayor gasto por mes visible en cada barra de progreso
- Racha de ahorro con validación de una vez por día
- Montos con formato de puntos por centenas (ej: 1.250.000)

### 🔥 Sistema de Rachas
- Contador de racha activa por módulo (Gym y Finanzas)
- Validación: la racha solo incrementa una vez por día
- Visualización con calendario de círculos activos y contador grande

### 👤 Perfil de Usuario
- Página de perfil accesible desde el navbar (ícono y nombre)
- Secciones desplegables para completar datos personales y metas
- Indicador de perfil completo/incompleto
- Aviso al iniciar sesión si el perfil está incompleto
- Las metas del perfil se sincronizan automáticamente con los dashboards

### 🏠 Home
- Saludo personalizado con nombre del usuario
- Acceso rápido a Finanzas y Gym
- Sección de registro de estado de ánimo y notas del día

### 🌐 Landing
- Hero con card descriptiva e ilustración
- Sección de características (Gym, Finanzas, Rachas)
- Mockup ilustrativo de los dashboards
- Footer con redes sociales

---

## Tech Stack

| Capa | Tecnología |
|---|---|
| Frontend | Angular 17+ (Standalone Components) |
| Estilos | SCSS con variables CSS globales |
| Estado temporal | localStorage (hasta integración con backend) |
| Backend (pendiente) | Python + FastAPI |
| Base de datos (pendiente) | PostgreSQL (Supabase) |
| Hosting frontend (pendiente) | Vercel |
| Hosting backend (pendiente) | Render |
| Emails (pendiente) | Brevo |
| Control de versiones | Git + GitHub |

---

## Estructura del proyecto

```
MyOdesy/
├── src/
│   ├── app/
│   │   ├── components/          # Componentes compartidos
│   │   │   ├── navbar/          # Navbar público y privado (@Input isPrivate, username)
│   │   │   └── footer/          # Footer con redes sociales
│   │   ├── guards/
│   │   │   └── my-odesy-guard.ts
│   │   ├── pages/               # Pantallas de la aplicación
│   │   │   ├── start/           # Landing pública
│   │   │   ├── login-register/  # Autenticación (Celene)
│   │   │   ├── home/            # Dashboard principal post-login
│   │   │   ├── finance/         # Módulo de finanzas
│   │   │   ├── gym/             # Módulo de gym
│   │   │   └── user-profile/    # Perfil del usuario
│   │   ├── services/            # Servicios (listos para conectar al backend)
│   │   │   ├── auth/
│   │   │   ├── finance/
│   │   │   ├── gym/
│   │   │   └── users/
│   │   ├── app.component.ts
│   │   ├── app.config.ts
│   │   └── app.routes.ts
│   ├── assets/
│   │   ├── icons/               # Íconos (fuego, usuario, logout, redes sociales)
│   │   └── img/                 # Imágenes (logo, ilustraciones, fondo)
│   ├── styles/
│   │   ├── _variables.scss      # Colores, tipografía, sombras
│   │   ├── base.scss            # Reset, estilos globales, clase .page-bg
│   │   └── styles.scss          # Punto de entrada de estilos
│   ├── index.html
│   └── main.ts
├── angular.json
├── package.json
└── tsconfig.json
```

---

## Rutas de la aplicación

| Ruta | Componente | Acceso |
|---|---|---|
| `/` | Start | Público |
| `/login` | LoginRegister | Público |
| `/home` | Home | Privado |
| `/finanzas` | Finance | Privado |
| `/gym` | Gym | Privado |
| `/perfil` | UserProfile | Privado |

---

## Variables CSS globales

Definidas en `src/styles/_variables.scss`:

```scss
--cream: #f5ede0
--fondo: #F1E6DF
--borde: #593325
--cream-dark: #e8d9c5
--brown-light: #c4a882
--brown: #8b6343
--brown-dark: #5c3d1e
--brown-deep: #3b2410
--off-white: #fdfaf6
--card-bg, --card-header-bg, --card-border
--shadow, --shadow-md
--letra: 'Courier New', monospace
```

---

## localStorage — claves utilizadas

| Clave | Contenido |
|---|---|
| `UsuarioLogueado` | Datos del usuario logueado |
| `perfilUsuario` | Datos del perfil (nombre, metas, etc.) |
| `datosFinanzas` | Saldo, gastos, ahorros, racha financiera |
| `progresoFinanzas` | Barras de progreso mensual de finanzas |
| `ultimaRachaFinanzas` | Fecha del último registro de ahorro |
| `datosGym` | Días entrenados, metas, racha gym |
| `progresoGym` | Barras de progreso mensual del gym |
| `ultimaRachaGym` | Fecha del último día entrenado |
| `semanaGym` | Número de semana actual (para reinicio semanal) |
| `mesGym` | Mes actual (para reinicio mensual) |

> ⚠️ El localStorage es temporal. Al conectar el backend, toda esta lógica migrará a los servicios en `src/app/services/`.

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

## Casos de prueba definidos

| ID | Caso | Estado |
|---|---|---|
| CP-01 | Registro e inicio de sesión | ✅ Implementado |
| CP-02 | Registro de sesión de gym y actualización de racha | ✅ Implementado |
| CP-03 | Registro de transacciones financieras y dashboard | ✅ Implementado |
| CP-04 | Notificación de advertencia de racha por email | ⏳ Pendiente (requiere backend) |
| CP-05 | Responsividad en dispositivo móvil | ⏳ Pendiente |
| CP-06 | Persistencia de datos entre sesiones | ✅ Implementado (localStorage) |

---

## Estado del proyecto

- [x] Estructura base del proyecto Angular
- [x] Diseño UI/UX
- [x] Sistema de autenticación (login/registro)
- [x] Landing page completa
- [x] Dashboard de Finanzas
- [x] Dashboard de Gym
- [x] Home post-login
- [x] Perfil de usuario
- [x] Sistema de rachas con validación diaria
- [x] Progress bars dinámicos
- [x] Persistencia con localStorage
- [ ] Conexión con backend FastAPI
- [ ] Base de datos PostgreSQL
- [ ] Notificaciones por email
- [ ] Despliegue en producción

---

## Equipo

| Nombre | Rol |
|---|---|
| Celene Parra Vega | Full-stack — Backend, base de datos, login/registro |
| Daniela Pérez Agualimpia | Full-stack — Frontend, diseño UI/UX, dashboards |

---

*Laboratorio de Software — 2025*