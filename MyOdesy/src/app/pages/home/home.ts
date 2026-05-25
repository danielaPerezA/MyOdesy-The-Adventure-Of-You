import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

export interface Alerta {
  id: string;
  tipo: 'warn' | 'info';
  icono: string;
  mensaje: string;
  ruta: string;
  labelBtn: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [Navbar, Footer, RouterLink, CommonModule],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class Home implements OnInit {
  username = '';

  // ── GYM ───────────────────────────────────────────────────────────────────
  gymStreakCount = 0;
  gymMayorRacha = 0;
  gymDiasSemana = 0;
  gymCantidadDiasGymSemana = 0;
  gymDiasAnio = 0;
  gymMetaAnual = 0;
  gymDiasMes = 0;
  gymMetaMensual = 0;

  // ── FINANZAS ──────────────────────────────────────────────────────────────
  finStreakCount = 0;
  finMayorRacha = 0;
  finMontoAhorrado = 0;
  finMetaAnual = 0;
  finAhorroFrecuenciaActual = 0;
  finMetaPorFrecuencia = 0;
  finCantidadFrecuencias = 0;
  finSaldoDisponible = 0;
  finFrecuencia: 'semanal' | 'mensual' = 'mensual';

  // ── Alertas ───────────────────────────────────────────────────────────────
  alertas: Alerta[] = [];
  alertasDismissed: Set<string> = new Set();

  constructor(private router: Router) {}

  ngOnInit() {
    const usuario = JSON.parse(localStorage.getItem('UsuarioLogueado') || '{}');
    const perfil  = JSON.parse(localStorage.getItem('perfilUsuario')   || '{}');
    this.username = perfil.usuario || perfil.nombre || usuario.name || 'Usuario';

    // Gym
    const gym = JSON.parse(localStorage.getItem('datosGym') || '{}');
    this.gymStreakCount           = gym.streakCount           ?? 0;
    this.gymMayorRacha            = gym.mayorRacha            ?? 0;
    this.gymDiasSemana            = gym.diasSemana            ?? 0;
    this.gymCantidadDiasGymSemana = gym.cantidadDiasGymSemana ?? 0;
    this.gymDiasAnio              = gym.diasAnio              ?? 0;
    this.gymMetaAnual             = gym.metaAnual             ?? 0;
    this.gymDiasMes               = gym.diasMes               ?? 0;
    this.gymMetaMensual           = gym.metaMensual           ?? 0;

    // Finanzas
    const fin = JSON.parse(localStorage.getItem('datosFinanzas') || '{}');
    this.finStreakCount            = fin.streakCount              ?? 0;
    this.finMayorRacha             = fin.mayorRacha               ?? 0;
    this.finMontoAhorrado          = fin.montoAhorrado            ?? 0;
    this.finMetaAnual              = fin.metaAhorroAnual          ?? perfil.metaAhorroAnual ?? 0;
    this.finAhorroFrecuenciaActual = fin.ahorroFrecuenciaActual   ?? 0;
    this.finMetaPorFrecuencia      = perfil.metaAhorroPorFrecuencia ?? 0;
    this.finCantidadFrecuencias    = perfil.cantidadFrecuencias   ?? 0;
    this.finSaldoDisponible        = fin.saldoDisponible          ?? 0;
    this.finFrecuencia             = perfil.frecuenciaAhorro      ?? 'mensual';

    // Restaurar alertas cerradas en esta sesión
    const dismissed = sessionStorage.getItem('alertasDismissed');
    if (dismissed) this.alertasDismissed = new Set(JSON.parse(dismissed));

    this.calcularAlertas();
    this.solicitarPermisoNotificacion();
  }

  // ── Helpers de progreso ───────────────────────────────────────────────────

  get gymProgresoAnual(): number {
    if (this.gymMetaAnual <= 0) return 0;
    return Math.min(Math.round((this.gymDiasAnio / this.gymMetaAnual) * 100), 100);
  }

  get gymProgresoSemana(): number {
    if (this.gymCantidadDiasGymSemana <= 0) return 0;
    return Math.min(Math.round((this.gymDiasSemana / this.gymCantidadDiasGymSemana) * 100), 100);
  }

  get finProgresoAnual(): number {
    if (this.finMetaAnual <= 0) return 0;
    return Math.min(Math.round((this.finMontoAhorrado / this.finMetaAnual) * 100), 100);
  }

  get finProgresoPeriodo(): number {
    if (this.finMetaPorFrecuencia <= 0) return 0;
    return Math.min(Math.round((this.finAhorroFrecuenciaActual / this.finMetaPorFrecuencia) * 100), 100);
  }

  get gymSemanaCompleta(): boolean {
    return this.gymCantidadDiasGymSemana > 0 &&
           this.gymDiasSemana >= this.gymCantidadDiasGymSemana;
  }

  get finPeriodoCompleto(): boolean {
    return this.finMetaPorFrecuencia > 0 &&
           this.finAhorroFrecuenciaActual >= this.finMetaPorFrecuencia;
  }

  formatMonto(valor: number): string {
    return Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  // ── Alertas ───────────────────────────────────────────────────────────────

  private calcularAlertas() {
    const lista: Alerta[] = [];

    // ── GYM: configuración crítica ──
    if (this.gymCantidadDiasGymSemana === 0) {
      lista.push({
        id: 'gym-dias-semana',
        tipo: 'warn',
        icono: '🏋️',
        mensaje: 'No tienes configurado cuántos días irás al gym por semana. Sin esto no hay racha.',
        ruta: '/gym',
        labelBtn: 'Configurar gym'
      });
    }
    if (this.gymMetaMensual === 0) {
      lista.push({
        id: 'gym-meta-mensual',
        tipo: 'warn',
        icono: '📅',
        mensaje: 'No tienes una meta mensual de entrenamiento.',
        ruta: '/gym',
        labelBtn: 'Configurar'
      });
    }
    if (this.gymMetaAnual === 0) {
      lista.push({
        id: 'gym-meta-anual',
        tipo: 'info',
        icono: '🎯',
        mensaje: 'No tienes una meta anual de entrenamiento.',
        ruta: '/gym',
        labelBtn: 'Configurar'
      });
    }

    // ── FINANZAS: configuración crítica ──
    if (this.finMetaPorFrecuencia === 0) {
      lista.push({
        id: 'fin-meta-periodo',
        tipo: 'warn',
        icono: '💰',
        mensaje: 'No tienes una meta de ahorro por período. Sin esto no hay racha de ahorro.',
        ruta: '/finanzas',
        labelBtn: 'Configurar finanzas'
      });
    }
    if (this.finCantidadFrecuencias === 0) {
      lista.push({
        id: 'fin-cant-frecuencias',
        tipo: 'warn',
        icono: '🔁',
        mensaje: 'No tienes configurada la cantidad de períodos de ahorro.',
        ruta: '/finanzas',
        labelBtn: 'Configurar'
      });
    }
    if (this.finMetaAnual === 0) {
      lista.push({
        id: 'fin-meta-anual',
        tipo: 'info',
        icono: '🎯',
        mensaje: 'No tienes una meta anual de ahorro.',
        ruta: '/finanzas',
        labelBtn: 'Configurar'
      });
    }

    // ── Recordatorios de progreso (solo si ya está configurado) ──
    if (
      this.gymCantidadDiasGymSemana > 0 &&
      this.gymDiasSemana < this.gymCantidadDiasGymSemana
    ) {
      const faltanDias = this.gymCantidadDiasGymSemana - this.gymDiasSemana;
      lista.push({
        id: 'gym-semana-pendiente',
        tipo: 'info',
        icono: '⏰',
        mensaje: `Te ${faltanDias === 1 ? 'falta' : 'faltan'} ${faltanDias} día${faltanDias > 1 ? 's' : ''} de gym para completar la semana.`,
        ruta: '/gym',
        labelBtn: 'Ir al gym'
      });
    }

    if (
      this.finMetaPorFrecuencia > 0 &&
      this.finAhorroFrecuenciaActual < this.finMetaPorFrecuencia
    ) {
      const faltaMonto = this.finMetaPorFrecuencia - this.finAhorroFrecuenciaActual;
      lista.push({
        id: 'fin-periodo-pendiente',
        tipo: 'info',
        icono: '⏰',
        mensaje: `Te faltan ${this.formatMonto(faltaMonto)} COP para completar tu meta de ahorro del período.`,
        ruta: '/finanzas',
        labelBtn: 'Ir a finanzas'
      });
    }

    this.alertas = lista;
  }

  get alertasVisibles(): Alerta[] {
    return this.alertas.filter(a => !this.alertasDismissed.has(a.id));
  }

  get alertasWarn(): Alerta[] {
    return this.alertasVisibles.filter(a => a.tipo === 'warn');
  }

  dismissAlerta(id: string) {
    this.alertasDismissed.add(id);
    sessionStorage.setItem('alertasDismissed', JSON.stringify([...this.alertasDismissed]));
  }

  irAConfigurar(ruta: string) {
    this.router.navigate([ruta]);
  }

  // ── Notificaciones del navegador ──────────────────────────────────────────

  private solicitarPermisoNotificacion() {
    if (!('Notification' in window)) return;

    const warns = this.alertas.filter(a => a.tipo === 'warn');
    if (warns.length === 0) return;

    if (Notification.permission === 'granted') {
      this.enviarNotificacion(warns);
    } else if (Notification.permission === 'default') {
      Notification.requestPermission().then(permiso => {
        if (permiso === 'granted') this.enviarNotificacion(warns);
      });
    }
  }

  private enviarNotificacion(warns: Alerta[]) {
    // Solo una vez por sesión
    if (sessionStorage.getItem('notifEnviada')) return;

    const titulo = warns.length === 1
      ? 'MyOdesy — Configuración pendiente'
      : `MyOdesy — ${warns.length} configuraciones pendientes`;

    const cuerpo = warns.length === 1
      ? warns[0].mensaje
      : warns.map(a => `• ${a.mensaje}`).join('\n');

    new Notification(titulo, {
      body: cuerpo,
      icon: '/assets/icons/streaksFire.png'
    });

    sessionStorage.setItem('notifEnviada', '1');
  }
}
