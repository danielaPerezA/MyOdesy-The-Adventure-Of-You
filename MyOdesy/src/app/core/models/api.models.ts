// ── Auth ──────────────────────────────────────────────────────────────────────

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
}

// ── Session (guardado en sessionStorage) ─────────────────────────────────────

export interface SessionData {
  token: string;
  userId: number;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
}

// ── Users ─────────────────────────────────────────────────────────────────────

export interface SystemUser {
  userId: number;
  email: string;
  username: string;
}

// ── Gym: meta ─────────────────────────────────────────────────────────────────

/**
 * POST/PUT /api/myodesy/gymGoals
 * diasParaIrGymSemana: ["MONDAY", "WEDNESDAY", "FRIDAY"]
 * El backend calcula cantidadDiasGymSemana = diasParaIrGymSemana.size()
 */
export interface MetaGymDto {
  idMetaGym?: number;
  idUsuario: number;
  categoria?: number;
  diasParaIrGymSemana: string[];   // MONDAY | TUESDAY | ... | SUNDAY
  metaActivaDelGym?: boolean;
}

// ── Gym: racha ────────────────────────────────────────────────────────────────

/**
 * GET /api/myodesy/rachas/gym/estado/{idMetaGym}
 * POST /api/myodesy/rachas/gym/registrar  → devuelve este mismo DTO
 */
export interface RachaGymEstadoDTO {
  idRachaGym: number;
  idMetaGym: number;
  diasConfigurados: string[];       // días que el usuario configuró
  diasMarcadosEstaSemana: string[]; // días ya marcados esta semana
  diasCompletadosSemana: number;
  cantidadDiasGymSemana: number;
  rachaActual: number;
  mayorRacha: number;
  rachaActiva: boolean;
  weekStart: string;                // LocalDate serializado: "2026-05-26"
}

/** POST /api/myodesy/rachas/gym/registrar */
export interface RegistroGymDTO {
  idMetaGym: number;
  diaGym: string;   // "MONDAY" | "TUESDAY" | ... | "SUNDAY"
}

// ── Finance: meta ─────────────────────────────────────────────────────────────

/**
 * POST/PUT /api/myodesy/financeGoals
 * frecuenciaAhorro: "SEMANAL" | "MENSUAL"
 */
export interface FinanceGoalDto {
  idMetaFinanza?: number;
  idUsuario: number;
  categoria: number;
  ahorroActual?: number;
  categoriasDeFinanzas: number;
  frecuenciaAhorro: 'SEMANAL' | 'MENSUAL';
  cantidadFrecuencias: number;
  metaAhorro: number;
}

// ── Finance: racha ────────────────────────────────────────────────────────────

/**
 * GET /api/myodesy/rachas/finanzas/estado/{idMetaFinanza}
 * POST /api/myodesy/rachas/finanzas/registrar → devuelve este mismo DTO
 */
export interface RachaFinanzasEstadoDTO {
  idRachaFinanza: number;
  idMetaFinanza: number;
  rachaActual: number;
  mayorRacha: number;
  rachaActiva: boolean;
  cantidadFrecuencias: number;
  periodoActual: number;
  periodoRegistrado: boolean;
  ahorroActual: number;
  metaAhorro: number;
  frecuenciaAhorro: string;
  fechaVencimiento: string;  // LocalDate: "2026-05-31"
}

/** POST /api/myodesy/rachas/finanzas/registrar */
export interface RegistroFinanzasDTO {
  idMetaFinanza: number;
  montoAhorro: number;
}

// ── Historial ─────────────────────────────────────────────────────────────────

export interface HistorialRachasDto {
  idHistorial: number;
  dia: string;
  completado: boolean;
  horaCompletado: string;
  acumulacion: number;
  notas: string;
  fechaCreacion: string;
  idRachaGym: number;
  idRachaFinanza: number;
  ahorroPorRacha: number;
  evento: string;
}
