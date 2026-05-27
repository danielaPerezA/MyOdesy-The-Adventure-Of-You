import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { FinanceService } from '../../services/finance/finance';
import { AuthService } from '../../services/my-odesy';
import { FinanceGoalDto, RachaFinanzasEstadoDTO } from '../../core/models/api.models';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [Navbar, Footer, CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrl: './finance.scss',
})
export class Finance implements OnInit {
  username = '';

  // IDs de la BD
  private idMetaFinanza: number | null = null;
  private userId = 0;

  // Estado de racha desde la API
  rachaEstado: RachaFinanzasEstadoDTO | null = null;

  // Getters de racha derivados del estado API
  get streakCount(): number        { return this.rachaEstado?.rachaActual     ?? 0; }
  get mayorRacha(): number         { return this.rachaEstado?.mayorRacha      ?? 0; }
  get cantidadFrecuencias(): number { return this.rachaEstado?.cantidadFrecuencias ?? this._cantidadFrecuencias; }
  get periodoActual(): number      { return this.rachaEstado?.periodoActual   ?? 0; }
  get periodoRegistrado(): boolean { return this.rachaEstado?.periodoRegistrado ?? false; }
  get montoAhorrado(): number      { return this.rachaEstado?.ahorroActual    ?? this._montoAhorrado; }
  get metaAhorroPorFrecuencia(): number { return this.rachaEstado?.metaAhorro ?? this._metaAhorroPorFrecuencia; }

  // Estado local (campos que el backend no almacena en la meta de ahorro)
  saldoDisponible = 0;
  montoGastos = 0;
  metaAnual = 0;
  metaMensual = 0;

  // Backing fields para los getters
  private _cantidadFrecuencias = 0;
  private _montoAhorrado = 0;
  private _metaAhorroPorFrecuencia = 0;

  frecuenciaAhorro: 'SEMANAL' | 'MENSUAL' = 'MENSUAL';

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

    if (this.userId) {
      this.financeService.getByUserId(this.userId).subscribe(goal => {
        if (goal?.idMetaFinanza) {
          this.idMetaFinanza = goal.idMetaFinanza;
          this._cantidadFrecuencias = goal.cantidadFrecuencias ?? 0;
          this._metaAhorroPorFrecuencia = Number(goal.metaAhorro) ?? 0;
          this.frecuenciaAhorro = goal.frecuenciaAhorro as 'SEMANAL' | 'MENSUAL';
          // Cargar estado de racha
          this.cargarRachaEstado(goal.idMetaFinanza);
        }
      });
    }
  }

  // ── Formato ───────────────────────────────────────────────────────────────

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
    if (perfil.metaAhorroMensual)        this.metaMensual               = perfil.metaAhorroMensual;
    if (perfil.metaAhorroAnual)          this.metaAnual                 = perfil.metaAhorroAnual;
    if (perfil.frecuenciaAhorro)         this.frecuenciaAhorro          = perfil.frecuenciaAhorro;
    if (perfil.cantidadFrecuencias)      this._cantidadFrecuencias      = perfil.cantidadFrecuencias;
    if (perfil.metaAhorroPorFrecuencia)  this._metaAhorroPorFrecuencia  = perfil.metaAhorroPorFrecuencia;

    const finanzas = JSON.parse(localStorage.getItem('datosFinanzas') || '{}');
    if (finanzas.saldoDisponible !== undefined) this.saldoDisponible = finanzas.saldoDisponible;
    if (finanzas.montoGastos !== undefined)     this.montoGastos    = finanzas.montoGastos;
    if (finanzas.montoAhorrado !== undefined)   this._montoAhorrado = finanzas.montoAhorrado;

    const progreso = localStorage.getItem('progresoFinanzas');
    if (progreso) this.progresoAnual = JSON.parse(progreso);
  }

  guardarLocal() {
    localStorage.setItem('datosFinanzas', JSON.stringify({
      saldoDisponible: this.saldoDisponible,
      montoGastos:     this.montoGastos,
      montoAhorrado:   this._montoAhorrado,
    }));
  }

  private buildDto(): FinanceGoalDto {
    return {
      idMetaFinanza:        this.idMetaFinanza ?? undefined,
      idUsuario:            this.userId,
      categoria:            1,
      ahorroActual:         this._montoAhorrado,
      categoriasDeFinanzas: 1,
      frecuenciaAhorro:     this.frecuenciaAhorro,
      cantidadFrecuencias:  this._cantidadFrecuencias,
      metaAhorro:           this._metaAhorroPorFrecuencia,
    };
  }

  private sincronizarMeta() {
    if (!this.userId || this._cantidadFrecuencias <= 0 || this._metaAhorroPorFrecuencia <= 0) return;
    this.financeService.createOrUpdate(this.buildDto()).subscribe(saved => {
      this.idMetaFinanza = saved.idMetaFinanza ?? this.idMetaFinanza;
      if (this.idMetaFinanza) this.cargarRachaEstado(this.idMetaFinanza);
    });
  }

  private cargarRachaEstado(idMetaFinanza: number) {
    this.financeService.getRachaEstado(idMetaFinanza).subscribe(estado => {
      this.rachaEstado = estado;
      this.cacheRachaEnLocalStorage();
    });
  }

  private cacheRachaEnLocalStorage() {
    if (!this.rachaEstado) return;
    const fin = JSON.parse(localStorage.getItem('datosFinanzas') || '{}');
    fin.streakCount           = this.rachaEstado.rachaActual;
    fin.mayorRacha            = this.rachaEstado.mayorRacha;
    fin.ahorroFrecuenciaActual = this.rachaEstado.ahorroActual;
    localStorage.setItem('datosFinanzas', JSON.stringify(fin));
  }

  // ── Progreso ──────────────────────────────────────────────────────────────

  actualizarProgresoMes() {
    const mesesEs: { [key: number]: string } = {
      0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr',
      4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug',
      8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dic',
    };
    const idx = this.progresoAnual.findIndex(p => p.mes === mesesEs[new Date().getMonth()]);
    if (idx !== -1 && this.metaMensual > 0) {
      this.progresoAnual[idx].porcentaje = Math.min(
        Math.round((this._montoAhorrado / this.metaMensual) * 100), 100
      );
      if (this.categoriaGasto) this.progresoAnual[idx].categoria = this.categoriaGasto;
    }
    localStorage.setItem('progresoFinanzas', JSON.stringify(this.progresoAnual));
  }

  calcularProgresoAnual(): number {
    const meta = this.metaAnual;
    if (meta <= 0) return 0;
    return Math.min(Math.round((this._montoAhorrado / meta) * 100), 100);
  }

  calcularProgresoFrecuencia(): number {
    const meta = this.metaAhorroPorFrecuencia;
    if (meta <= 0) return 0;
    const actual = this.rachaEstado?.ahorroActual ?? this._montoAhorrado;
    return Math.min(Math.round((actual / meta) * 100), 100);
  }

  getCirculosActivos(): number {
    return this.rachaEstado?.periodoActual ?? 0;
  }

  // ── Acciones del usuario ──────────────────────────────────────────────────

  registrarSaldo() {
    if (!this.montoValido(this.nuevoSaldoStr)) { alert('Monto inválido.'); return; }
    this.saldoDisponible = this.parseMonto(this.nuevoSaldoStr);
    this.nuevoSaldoStr = '';
    this.guardarLocal();
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
    this.guardarLocal();
    localStorage.setItem('progresoFinanzas', JSON.stringify(this.progresoAnual));
  }

  /**
   * Registra ahorro del período actual.
   * Llama al API → el backend evalúa si se cumplió la meta y actualiza la racha.
   */
  registrarAhorro() {
    if (!this.montoValido(this.nuevoAhorroStr)) { alert('Monto inválido.'); return; }
    if (!this.idMetaFinanza) {
      alert('Primero configura tu meta de ahorro (frecuencia + cantidad + monto).');
      return;
    }

    const monto = this.parseMonto(this.nuevoAhorroStr);
    this._montoAhorrado += monto;
    this.nuevoAhorroStr = '';

    this.financeService.registrarAhorro({
      idMetaFinanza: this.idMetaFinanza,
      montoAhorro: monto
    }).subscribe(estado => {
      this.rachaEstado = estado;
      this.cacheRachaEnLocalStorage();
    });

    this.actualizarProgresoMes();
    this.guardarLocal();
  }

  cambiarFrecuencia(nuevaFrecuencia: 'SEMANAL' | 'MENSUAL') {
    this.frecuenciaAhorro = nuevaFrecuencia;
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.frecuenciaAhorro = nuevaFrecuencia;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
    this.sincronizarMeta();
  }

  configurarCantidadFrecuencias() {
    const n = parseInt(this.editCantidadFrecuenciasStr, 10);
    if (!n || n <= 0) { alert('Ingresa un número válido mayor a 0.'); return; }
    this._cantidadFrecuencias = n;
    this.editCantidadFrecuenciasStr = '';
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.cantidadFrecuencias = n;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
    this.sincronizarMeta();
  }

  editarSaldo() {
    if (!this.montoValido(this.editSaldoStr)) { alert('Monto inválido.'); return; }
    this.saldoDisponible = this.parseMonto(this.editSaldoStr);
    this.editSaldoStr = '';
    this.guardarLocal();
  }

  editarMetaMensual() {
    if (!this.montoValido(this.editMetaMensualStr)) { alert('Monto inválido.'); return; }
    this.metaMensual = this.parseMonto(this.editMetaMensualStr);
    this.editMetaMensualStr = '';
    this.actualizarProgresoMes();
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.metaAhorroMensual = this.metaMensual;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
  }

  editarMetaAnual() {
    if (!this.montoValido(this.editMetaAnualStr)) { alert('Monto inválido.'); return; }
    this.metaAnual = this.parseMonto(this.editMetaAnualStr);
    this.editMetaAnualStr = '';
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.metaAhorroAnual = this.metaAnual;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
  }

  editarMetaFrecuencia() {
    if (!this.montoValido(this.editMetaFrecuenciaStr)) { alert('Monto inválido.'); return; }
    this._metaAhorroPorFrecuencia = this.parseMonto(this.editMetaFrecuenciaStr);
    this.editMetaFrecuenciaStr = '';
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.metaAhorroPorFrecuencia = this._metaAhorroPorFrecuencia;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
    this.sincronizarMeta();
  }

  editarAhorro() {
    if (!this.montoValido(this.editAhorroStr)) { alert('Monto inválido.'); return; }
    this._montoAhorrado = this.parseMonto(this.editAhorroStr);
    this.editAhorroStr = '';
    this.actualizarProgresoMes();
    this.guardarLocal();
  }

  editarGastos() {
    if (!this.montoValido(this.editGastosStr)) { alert('Monto inválido.'); return; }
    this.montoGastos = this.parseMonto(this.editGastosStr);
    this.editGastosStr = '';
    this.guardarLocal();
  }
}