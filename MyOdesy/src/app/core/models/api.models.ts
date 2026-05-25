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

// ── Users ─────────────────────────────────────────────────────────────────────

export interface SystemUser {
  userId: number;
  email: string;
  username: string;
  person?: {
    firstName?: string;
    lastName?: string;
  };
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

// ── Gym ───────────────────────────────────────────────────────────────────────

export interface GymGoalDto {
  gymGoalId?: number;
  userId: number;
  categoryId: number;
  weeklyGymDays: number;     // cantidad_dias_gym_semana → días por semana configurados
  targetDaysPerWeek: number; // dias_para_ir_gym_semana  → mismo valor (meta semanal)
  activeGoal: boolean;
}

// ── Finance ───────────────────────────────────────────────────────────────────

export interface FinanceGoalDto {
  financeGoalId?: number;
  userId: number;
  categoryId: number;
  monthlySavingGoal: number;  // meta_de_ahorro_del_mes
  currentSaving: number;      // ahorro_actual
  monthlyExpenses: number;    // gastos_del_mes
  yearlyGoal: number;         // meta_anual
  monthlyIncome: number;      // ingresos_del_mes (saldo disponible)
  categoryFinanceId: number;  // 1 = semanal, 2 = mensual
}
