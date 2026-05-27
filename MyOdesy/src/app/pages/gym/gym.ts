import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { GymService } from '../../services/gym/gym';
import { AuthService } from '../../services/my-odesy';
import { MetaGymDto, RachaGymEstadoDTO } from '../../core/models/api.models';

@Component({
  selector: 'app-gym',
  standalone: true,
  imports: [Navbar, Footer, CommonModule, FormsModule],
  templateUrl: './gym.html',
  styleUrl: './gym.scss',
})
export class Gym implements OnInit {
  username = '';

  // IDs de la BD
  private idMetaGym: number | null = null;
  private userId = 0;

  // Estado de la racha (viene del API)
  rachaEstado: RachaGymEstadoDTO | null = null;

  // Días configurados por el usuario (["MONDAY", "WEDNESDAY", "FRIDAY"])
  diasSeleccionados: string[] = [];

  // Estado semanal derivado del rachaEstado
  get diasConfigurados(): string[]       { return this.rachaEstado?.diasConfigurados ?? this.diasSeleccionados; }
  get diasMarcados(): string[]           { return this.rachaEstado?.diasMarcadosEstaSemana ?? []; }
  get cantidadDiasGymSemana(): number    { return this.rachaEstado?.cantidadDiasGymSemana ?? this.diasSeleccionados.length; }
  get diasSemana(): number               { return this.rachaEstado?.diasCompletadosSemana ?? 0; }
  get streakCount(): number              { return this.rachaEstado?.rachaActual ?? 0; }
  get mayorRacha(): number               { return this.rachaEstado?.mayorRacha ?? 0; }

  // Contadores locales (solo mes y año se siguen llevando local)
  diasMes = 0;
  diasAnio = 0;
  metaMensual = 0;
  metaAnual = 0;

  categorias = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Cardio', 'Full Body'];
  categoriasDia: { [dia: string]: string } = {};

  // Días de la semana disponibles
  readonly DIAS_SEMANA = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
  readonly DIAS_LABELS: { [key: string]: string } = {
    MONDAY: 'LUN', TUESDAY: 'MAR', WEDNESDAY: 'MIÉ',
    THURSDAY: 'JUE', FRIDAY: 'VIE', SATURDAY: 'SÁB', SUNDAY: 'DOM'
  };

  // Strings para formularios locales
  editDiasMesStr = '';
  editMetaMensualStr = '';
  editMetaAnualStr = '';

  progresoMensual = [
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
    private gymService: GymService,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const session = this.authService.currentUser();
    this.userId = session?.userId ?? 0;
    this.username = session?.firstName || session?.username || 'Usuario';

    this.cargarDesdeLocalStorage();

    if (this.userId) {
      this.gymService.getByUserId(this.userId).subscribe(meta => {
        if (meta?.idMetaGym) {
          this.idMetaGym = meta.idMetaGym;
          this.diasSeleccionados = meta.diasParaIrGymSemana ?? [];
          // Cargar estado de racha
          this.cargarRachaEstado(meta.idMetaGym);
        }
      });
    }

    this.verificarNuevoMes();
  }

  // ── Utilidades ────────────────────────────────────────────────────────────

  get limitesMes(): number {
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
  }

  get limitesAnio(): number {
    const anio = new Date().getFullYear();
    return (anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0)) ? 366 : 365;
  }

  isDiaSeleccionado(dia: string): boolean {
    return this.diasSeleccionados.includes(dia);
  }

  isDiaMarcado(dia: string): boolean {
    return this.diasMarcados.includes(dia);
  }

  private getMesAnio(): string {
    const ahora = new Date();
    return `${ahora.getFullYear()}-${ahora.getMonth()}`;
  }

  // ── Carga y guardado ──────────────────────────────────────────────────────

  private cargarDesdeLocalStorage() {
    const gym = JSON.parse(localStorage.getItem('datosGym') || '{}');
    if (gym.diasMes !== undefined)       this.diasMes    = gym.diasMes;
    if (gym.diasAnio !== undefined)      this.diasAnio   = gym.diasAnio;
    if (gym.metaMensual !== undefined)   this.metaMensual = gym.metaMensual;
    if (gym.metaAnual !== undefined)     this.metaAnual  = gym.metaAnual;
    if (gym.diasSeleccionados)           this.diasSeleccionados = gym.diasSeleccionados;
    if (gym.categoriasDia)               this.categoriasDia = gym.categoriasDia;

    const progreso = localStorage.getItem('progresoGym');
    if (progreso) this.progresoMensual = JSON.parse(progreso);
  }

  guardarGym() {
    localStorage.setItem('datosGym', JSON.stringify({
      diasMes: this.diasMes,
      diasAnio: this.diasAnio,
      metaMensual: this.metaMensual,
      metaAnual: this.metaAnual,
      diasSeleccionados: this.diasSeleccionados,
      categoriasDia: this.categoriasDia,
    }));
  }

  private cargarRachaEstado(idMetaGym: number) {
    this.gymService.getRachaEstado(idMetaGym).subscribe(estado => {
      this.rachaEstado = estado;
      this.cacheRachaEnLocalStorage();
    });
  }

  private cacheRachaEnLocalStorage() {
    if (!this.rachaEstado) return;
    const gym = JSON.parse(localStorage.getItem('datosGym') || '{}');
    gym.streakCount            = this.rachaEstado.rachaActual;
    gym.mayorRacha             = this.rachaEstado.mayorRacha;
    gym.diasSemana             = this.rachaEstado.diasCompletadosSemana;
    gym.cantidadDiasGymSemana  = this.rachaEstado.cantidadDiasGymSemana;
    localStorage.setItem('datosGym', JSON.stringify(gym));
  }

  private buildMetaDto(): MetaGymDto {
    return {
      idMetaGym: this.idMetaGym ?? undefined,
      idUsuario: this.userId,
      categoria: 1,
      diasParaIrGymSemana: this.diasSeleccionados,
      metaActivaDelGym: true,
    };
  }

  private sincronizarMeta() {
    if (!this.userId || this.diasSeleccionados.length === 0) return;
    this.gymService.createOrUpdate(this.buildMetaDto()).subscribe(saved => {
      this.idMetaGym = saved.idMetaGym ?? this.idMetaGym;
      if (this.idMetaGym) this.cargarRachaEstado(this.idMetaGym);
    });
  }

  // ── Verificaciones de período ──────────────────────────────────────────────

  private verificarNuevoMes() {
    const mesActual = this.getMesAnio();
    const mesGuardado = localStorage.getItem('mesGym');
    if (mesGuardado !== mesActual) {
      this.actualizarProgresoMesAnterior(mesGuardado);
      this.diasMes = 0;
      localStorage.setItem('mesGym', mesActual);
      this.guardarGym();
    }
  }

  private actualizarProgresoMesAnterior(mesGuardado: string | null) {
    if (!mesGuardado) return;
    const [, mes] = mesGuardado.split('-').map(Number);
    const mesesEs: { [key: number]: string } = {
      0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr',
      4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug',
      8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dic'
    };
    const idx = this.progresoMensual.findIndex(p => p.mes === mesesEs[mes]);
    if (idx !== -1 && this.metaMensual > 0) {
      this.progresoMensual[idx].porcentaje = Math.min(
        Math.round((this.diasMes / this.metaMensual) * 100), 100
      );
    }
    localStorage.setItem('progresoGym', JSON.stringify(this.progresoMensual));
  }

  // ── Progreso ──────────────────────────────────────────────────────────────

  actualizarProgresoMes() {
    const mesesEs: { [key: number]: string } = {
      0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr',
      4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug',
      8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dic'
    };
    const idx = this.progresoMensual.findIndex(p => p.mes === mesesEs[new Date().getMonth()]);
    if (idx !== -1 && this.metaMensual > 0) {
      this.progresoMensual[idx].porcentaje = Math.min(
        Math.round((this.diasMes / this.metaMensual) * 100), 100
      );
      const cats = Object.values(this.categoriasDia).filter(c => c !== '');
      if (cats.length > 0) {
        const freq: { [key: string]: number } = {};
        cats.forEach(c => freq[c] = (freq[c] || 0) + 1);
        this.progresoMensual[idx].categoria = Object.entries(freq)
          .sort((a, b) => b[1] - a[1])[0][0];
      }
    }
    localStorage.setItem('progresoGym', JSON.stringify(this.progresoMensual));
  }

  calcularProgresoAnual(): number {
    if (this.metaAnual <= 0) return 0;
    return Math.min(Math.round((this.diasAnio / this.metaAnual) * 100), 100);
  }

  // ── Interacciones del usuario ─────────────────────────────────────────────

  /** Toggle de día en la configuración (selector LUN–DOM). */
  toggleDiaSeleccion(dia: string) {
    const idx = this.diasSeleccionados.indexOf(dia);
    if (idx === -1) {
      this.diasSeleccionados = [...this.diasSeleccionados, dia];
    } else {
      this.diasSeleccionados = this.diasSeleccionados.filter(d => d !== dia);
    }
  }

  /** Guarda la meta con los días seleccionados y sincroniza con la API. */
  configurarDiasGymSemana() {
    if (this.diasSeleccionados.length === 0) {
      alert('Selecciona al menos un día de la semana.');
      return;
    }
    this.guardarGym();
    this.sincronizarMeta();
  }

  /**
   * Marca/desmarca un día de entrenamiento de los configurados.
   * Llama al API para registrar la sesión.
   */
  toggleGymCheck(dia: string) {
    if (!this.idMetaGym) return;
    if (this.isDiaMarcado(dia)) return;  // ya marcado, no se puede desmarcar por ahora

    this.diasMes++;
    this.diasAnio++;
    this.actualizarProgresoMes();
    this.guardarGym();

    this.gymService.registrarSesion({ idMetaGym: this.idMetaGym, diaGym: dia })
      .subscribe(estado => {
        this.rachaEstado = estado;
        this.cacheRachaEnLocalStorage();
      });
  }

  editarDiasMes() {
    const n = parseInt(this.editDiasMesStr);
    const max = this.limitesMes;
    if (!n || n <= 0 || n > max) {
      alert(`Ingresa un número entre 1 y ${max}.`);
      return;
    }
    this.diasMes = n;
    this.editDiasMesStr = '';
    this.actualizarProgresoMes();
    this.guardarGym();
  }

  editarMetaMensual() {
    const n = parseInt(this.editMetaMensualStr);
    const max = this.limitesMes;
    if (!n || n <= 0 || n > max) {
      alert(`Ingresa un número entre 1 y ${max}.`);
      return;
    }
    this.metaMensual = n;
    this.editMetaMensualStr = '';
    this.actualizarProgresoMes();
    this.guardarGym();
  }

  editarMetaAnual() {
    const n = parseInt(this.editMetaAnualStr);
    const max = this.limitesAnio;
    if (!n || n <= 0 || n > max) {
      alert(`Ingresa un número entre 1 y ${max}.`);
      return;
    }
    this.metaAnual = n;
    this.editMetaAnualStr = '';
    this.guardarGym();
  }
}
