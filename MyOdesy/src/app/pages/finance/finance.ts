import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { FinanceService } from '../../services/finance/finance';
import { AuthService } from '../../services/my-odesy';
import { FinanceGoalDto } from '../../core/models/api.models';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [Navbar, Footer, CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrl: './finance.scss',
})
export class Finance implements OnInit {
  username = '';

  // ID de la meta en la BD
  private financeGoalId: number | null = null;
  private userId = 0;

  saldoDisponible = 0;
  montoGastos = 0;
  metaAnual = 0;
  metaMensual = 0;
  montoAhorrado = 0;
  metaAhorroAnual = 0;
  streakCount = 0;
  mayorRacha = 0;

  frecuenciaAhorro: 'semanal' | 'mensual' = 'mensual';
  cantidadFrecuencias = 0;
  metaAhorroPorFrecuencia = 0;
  ahorroFrecuenciaActual = 0;

  categorias = ['Comida', 'Transporte', 'Entretenimiento', 'Salud', 'Educación', 'Otros'];

  nuevoSaldoStr = '';
  nuevoGastoStr = '';
  categoriaGasto = '';
  nuevoAhorroStr = '';

  editSaldoStr = '';
  editMetaMensualStr = '';
  editMetaAnualStr = '';
  editAhorroStr = '';
  editGastosStr = '';
  editMetaFrecuenciaStr = '';
  editCantidadFrecuenciasStr = '';

  progresoAnual = [
    { mes: 'Jan', porcentaje: 0, categoria: '-' },
    { mes: 'Feb', porcentaje: 0, categoria: '-' },
    { mes: 'Mar', porcentaje: 0, categoria: '-' },
    { mes: 'Apr', porcentaje: 0, categoria: '-' },
    { mes: 'May', porcentaje: 0, categoria: '-' },
    { mes: 'Jun', porcentaje: 0, categoria: '-' },
    { mes: 'Jul', porcentaje: 0, categoria: '-' },
    { mes: 'Aug', porcentaje: 0, categoria: '-' },
    { mes: 'Sep', porcentaje: 0, categoria: '-' },
    { mes: 'Oct', porcentaje: 0, categoria: '-' },
    { mes: 'Nov', porcentaje: 0, categoria: '-' },
    { mes: 'Dic', porcentaje: 0, categoria: '-' },
  ];

  constructor(
    private financeService: FinanceService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const session = this.authService.currentUser();
    this.userId = session?.userId ?? 0;
    this.username = session?.firstName || session?.username || 'Usuario';

    this.cargarDesdeLocalStorage();

    // Cargar meta desde la API
    if (this.userId) {
      this.financeService.getByUserId(this.userId).subscribe(goal => {
        if (goal) {
          this.financeGoalId     = goal.financeGoalId ?? null;
          this.metaMensual       = goal.monthlySavingGoal ?? this.metaMensual;
          this.montoAhorrado     = goal.currentSaving     ?? this.montoAhorrado;
          this.montoGastos       = goal.monthlyExpenses   ?? this.montoGastos;
          this.metaAnual         = goal.yearlyGoal        ?? this.metaAnual;
          this.metaAhorroAnual   = this.metaAnual;
          this.saldoDisponible   = goal.monthlyIncome     ?? this.saldoDisponible;
          this.frecuenciaAhorro  = goal.categoryFinanceId === 1 ? 'semanal' : 'mensual';
          // Persistir en local para la próxima visita offline
          this.guardarFinanzas();
          this.actualizarProgresoMes();
        }
      });
    }

    this.verificarNuevaFrecuencia();
  }

  // ── Formato de montos ─────────────────────────────────────────────────────

  parseMonto(valor: string): number {
    if (!valor) return 0;
    return parseInt(valor.replace(/[^\d]/g, ''), 10) || 0;
  }

  formatMonto(valor: number): string {
    if (!valor && valor !== 0) return '';
    return Math.round(valor).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  onMontoInput(event: Event, campo: string) {
    const input = event.target as HTMLInputElement;
    const cursorPos = input.selectionStart ?? 0;
    const digitsBeforeCursor = input.value.slice(0, cursorPos).replace(/[^\d]/g, '').length;
    const soloDigitos = input.value.replace(/[^\d]/g, '');
    const formateado = soloDigitos ? this.formatMonto(parseInt(soloDigitos, 10)) : '';
    (this as any)[campo] = formateado;

    let contadorDigitos = 0;
    let nuevoCursor = formateado.length;
    for (let i = 0; i < formateado.length; i++) {
      if (/\d/.test(formateado[i])) {
        contadorDigitos++;
        if (contadorDigitos === digitsBeforeCursor) { nuevoCursor = i + 1; break; }
      }
    }
    requestAnimationFrame(() => {
      input.value = formateado;
      input.setSelectionRange(nuevoCursor, nuevoCursor);
    });
  }

  private montoValido(valor: string): boolean {
    return this.parseMonto(valor) > 0;
  }

  getRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  // ── Carga y guardado ──────────────────────────────────────────────────────

  private cargarDesdeLocalStorage() {
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    if (perfil.metaAhorroMensual)       this.metaMensual            = perfil.metaAhorroMensual;
    if (perfil.metaAhorroAnual)          this.metaAnual              = perfil.metaAhorroAnual;
    if (perfil.frecuenciaAhorro)         this.frecuenciaAhorro       = perfil.frecuenciaAhorro;
    if (perfil.cantidadFrecuencias)      this.cantidadFrecuencias    = perfil.cantidadFrecuencias;
    if (perfil.metaAhorroPorFrecuencia)  this.metaAhorroPorFrecuencia = perfil.metaAhorroPorFrecuencia;

    const finanzas = JSON.parse(localStorage.getItem('datosFinanzas') || '{}');
    if (finanzas.saldoDisponible !== undefined)      this.saldoDisponible      = finanzas.saldoDisponible;
    if (finanzas.montoGastos !== undefined)          this.montoGastos          = finanzas.montoGastos;
    if (finanzas.montoAhorrado !== undefined)        this.montoAhorrado        = finanzas.montoAhorrado;
    if (finanzas.metaAhorroAnual !== undefined)      this.metaAhorroAnual      = finanzas.metaAhorroAnual;
    if (finanzas.streakCount !== undefined)          this.streakCount          = finanzas.streakCount;
    if (finanzas.mayorRacha !== undefined)           this.mayorRacha           = finanzas.mayorRacha;
    if (finanzas.ahorroFrecuenciaActual !== undefined) this.ahorroFrecuenciaActual = finanzas.ahorroFrecuenciaActual;

    const progreso = localStorage.getItem('progresoFinanzas');
    if (progreso) this.progresoAnual = JSON.parse(progreso);
  }

  guardarFinanzas() {
    localStorage.setItem('datosFinanzas', JSON.stringify({
      saldoDisponible:      this.saldoDisponible,
      montoGastos:          this.montoGastos,
      montoAhorrado:        this.montoAhorrado,
      metaAhorroAnual:      this.metaAhorroAnual,
      streakCount:          this.streakCount,
      mayorRacha:           this.mayorRacha,
      ahorroFrecuenciaActual: this.ahorroFrecuenciaActual,
    }));
  }

  /** Construye el DTO para enviar a la API. */
  private buildDto(): FinanceGoalDto {
    return {
      financeGoalId:    this.financeGoalId ?? undefined,
      userId:           this.userId,
      categoryId:       1,
      monthlySavingGoal: this.metaMensual,
      currentSaving:    this.montoAhorrado,
      monthlyExpenses:  this.montoGastos,
      yearlyGoal:       this.metaAnual,
      monthlyIncome:    this.saldoDisponible,
      categoryFinanceId: this.frecuenciaAhorro === 'semanal' ? 1 : 2,
    };
  }

  /** Sincroniza la meta de finanzas con la API. */
  private sincronizarMeta() {
    if (!this.userId) return;
    this.financeService.createOrUpdate(this.buildDto()).subscribe(saved => {
      this.financeGoalId = saved.financeGoalId ?? this.financeGoalId;
    });
  }

  // ── Lógica de racha (automática) ──────────────────────────────────────────

  private getSemanaAnio(): number {
    const ahora = new Date();
    const inicioAnio = new Date(ahora.getFullYear(), 0, 1);
    const dias = Math.floor((ahora.getTime() - inicioAnio.getTime()) / 86400000);
    return Math.ceil((dias + inicioAnio.getDay() + 1) / 7);
  }

  private getMesAnio(): string {
    const ahora = new Date();
    return `${ahora.getFullYear()}-${ahora.getMonth()}`;
  }

  private getClaveRacha(): string {
    return this.frecuenciaAhorro === 'semanal'
      ? `racha-finanzas-sem-${this.getSemanaAnio()}`
      : `racha-finanzas-mes-${this.getMesAnio()}`;
  }

  private verificarNuevaFrecuencia() {
    const claveActual = this.getClaveRacha();
    const ultimaFrecuencia = localStorage.getItem('ultimaFrecuenciaFinanzas');

    if (ultimaFrecuencia && ultimaFrecuencia !== claveActual) {
      const meta = this.metaAhorroPorFrecuencia || this.metaMensual;
      if (meta > 0) {
        const ultimaRacha = localStorage.getItem('ultimaRachaFinanzas');
        if (ultimaRacha !== ultimaFrecuencia) {
          if (this.ahorroFrecuenciaActual >= meta) {
            this.completarRacha(this.ahorroFrecuenciaActual);
          } else {
            this.streakCount = 0;
          }
        }
      }
      this.ahorroFrecuenciaActual = 0;
      localStorage.setItem('ultimaFrecuenciaFinanzas', claveActual);
      this.guardarFinanzas();
    } else if (!ultimaFrecuencia) {
      localStorage.setItem('ultimaFrecuenciaFinanzas', claveActual);
    }
  }

  private completarRacha(ahorroPeriodo: number) {
    const claveActual = this.getClaveRacha();
    this.streakCount++;
    if (this.streakCount > this.mayorRacha) this.mayorRacha = this.streakCount;
    localStorage.setItem('ultimaRachaFinanzas', claveActual);
  }

  getCirculosActivos(): number {
    if (this.cantidadFrecuencias <= 0 || this.streakCount <= 0) return 0;
    const resto = this.streakCount % this.cantidadFrecuencias;
    return resto === 0 ? this.cantidadFrecuencias : resto;
  }

  // ── Progreso ──────────────────────────────────────────────────────────────

  actualizarProgresoMes() {
    const mesesEs: { [key: number]: string } = {
      0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr',
      4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug',
      8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dic',
    };
    const mesActual = mesesEs[new Date().getMonth()];
    const idx = this.progresoAnual.findIndex(p => p.mes === mesActual);
    if (idx !== -1 && this.metaMensual > 0) {
      this.progresoAnual[idx].porcentaje = Math.min(
        Math.round((this.montoAhorrado / this.metaMensual) * 100), 100
      );
      if (this.categoriaGasto) {
        this.progresoAnual[idx].categoria = this.categoriaGasto;
      }
    }
    localStorage.setItem('progresoFinanzas', JSON.stringify(this.progresoAnual));
  }

  calcularProgresoAnual(): number {
    const meta = this.metaAhorroAnual || this.metaAnual;
    if (meta <= 0) return 0;
    return Math.min(Math.round((this.montoAhorrado / meta) * 100), 100);
  }

  calcularProgresoFrecuencia(): number {
    const meta = this.metaAhorroPorFrecuencia || this.metaMensual;
    if (meta <= 0) return 0;
    return Math.min(Math.round((this.ahorroFrecuenciaActual / meta) * 100), 100);
  }

  // ── Acciones del usuario ──────────────────────────────────────────────────

  registrarSaldo() {
    if (!this.montoValido(this.nuevoSaldoStr)) { alert('Monto inválido.'); return; }
    this.saldoDisponible = this.parseMonto(this.nuevoSaldoStr);
    this.nuevoSaldoStr = '';
    this.guardarFinanzas();
    this.sincronizarMeta();   // ← API: actualiza monthlyIncome
  }

  registrarGasto() {
    if (!this.montoValido(this.nuevoGastoStr)) { alert('Monto inválido.'); return; }
    if (!this.categoriaGasto) { alert('Selecciona una categoría.'); return; }
    const monto = this.parseMonto(this.nuevoGastoStr);
    this.montoGastos += monto;
    this.saldoDisponible -= monto;
    const mesesEs: { [key: number]: string } = {
      0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr',
      4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug',
      8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dic',
    };
    const idx = this.progresoAnual.findIndex(p => p.mes === mesesEs[new Date().getMonth()]);
    if (idx !== -1) this.progresoAnual[idx].categoria = this.categoriaGasto;
    this.nuevoGastoStr = '';
    this.categoriaGasto = '';
    this.guardarFinanzas();
    localStorage.setItem('progresoFinanzas', JSON.stringify(this.progresoAnual));
    this.sincronizarMeta();   // ← API: actualiza monthlyExpenses
  }

  registrarAhorro() {
    if (!this.montoValido(this.nuevoAhorroStr)) { alert('Monto inválido.'); return; }
    const montoNuevo = this.parseMonto(this.nuevoAhorroStr);
    this.montoAhorrado += montoNuevo;
    this.ahorroFrecuenciaActual += montoNuevo;
    this.nuevoAhorroStr = '';

    const meta = this.metaAhorroPorFrecuencia || this.metaMensual;
    const claveActual = this.getClaveRacha();
    const ultimaRacha = localStorage.getItem('ultimaRachaFinanzas');
    if (meta > 0 && this.ahorroFrecuenciaActual >= meta && ultimaRacha !== claveActual) {
      this.completarRacha(this.ahorroFrecuenciaActual);
    }

    this.actualizarProgresoMes();
    this.guardarFinanzas();
    this.sincronizarMeta();   // ← API: actualiza currentSaving
  }

  cambiarFrecuencia(nuevaFrecuencia: 'semanal' | 'mensual') {
    this.frecuenciaAhorro = nuevaFrecuencia;
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.frecuenciaAhorro = nuevaFrecuencia;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
    this.verificarNuevaFrecuencia();
    this.sincronizarMeta();   // ← API: actualiza categoryFinanceId
  }

  configurarCantidadFrecuencias() {
    const n = parseInt(this.editCantidadFrecuenciasStr, 10);
    if (!n || n <= 0) { alert('Ingresa un número válido mayor a 0.'); return; }
    this.cantidadFrecuencias = n;
    this.editCantidadFrecuenciasStr = '';
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.cantidadFrecuencias = n;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
  }

  editarSaldo() {
    if (!this.montoValido(this.editSaldoStr)) { alert('Monto inválido.'); return; }
    this.saldoDisponible = this.parseMonto(this.editSaldoStr);
    this.editSaldoStr = '';
    this.guardarFinanzas();
    this.sincronizarMeta();
  }

  editarMetaMensual() {
    if (!this.montoValido(this.editMetaMensualStr)) { alert('Monto inválido.'); return; }
    this.metaMensual = this.parseMonto(this.editMetaMensualStr);
    this.editMetaMensualStr = '';
    this.actualizarProgresoMes();
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.metaAhorroMensual = this.metaMensual;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
    this.sincronizarMeta();   // ← API
  }

  editarMetaAnual() {
    if (!this.montoValido(this.editMetaAnualStr)) { alert('Monto inválido.'); return; }
    this.metaAnual = this.parseMonto(this.editMetaAnualStr);
    this.metaAhorroAnual = this.metaAnual;
    this.editMetaAnualStr = '';
    this.guardarFinanzas();
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.metaAhorroAnual = this.metaAnual;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
    this.sincronizarMeta();   // ← API
  }

  editarMetaFrecuencia() {
    if (!this.montoValido(this.editMetaFrecuenciaStr)) { alert('Monto inválido.'); return; }
    this.metaAhorroPorFrecuencia = this.parseMonto(this.editMetaFrecuenciaStr);
    this.editMetaFrecuenciaStr = '';
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.metaAhorroPorFrecuencia = this.metaAhorroPorFrecuencia;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
  }

  editarAhorro() {
    if (!this.montoValido(this.editAhorroStr)) { alert('Monto inválido.'); return; }
    this.montoAhorrado = this.parseMonto(this.editAhorroStr);
    this.editAhorroStr = '';
    this.actualizarProgresoMes();
    this.guardarFinanzas();
    this.sincronizarMeta();   // ← API
  }

  editarGastos() {
    if (!this.montoValido(this.editGastosStr)) { alert('Monto inválido.'); return; }
    this.montoGastos = this.parseMonto(this.editGastosStr);
    this.editGastosStr = '';
    this.guardarFinanzas();
    this.sincronizarMeta();   // ← API
  }
}
