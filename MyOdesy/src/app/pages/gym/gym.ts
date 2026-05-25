import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { GymService } from '../../services/gym/gym';
import { AuthService } from '../../services/my-odesy';
import { GymGoalDto } from '../../core/models/api.models';

@Component({
  selector: 'app-gym',
  standalone: true,
  imports: [Navbar, Footer, CommonModule, FormsModule],
  templateUrl: './gym.html',
  styleUrl: './gym.scss',
})
export class Gym implements OnInit {
  username = '';

  // ID de la meta en la BD (null si aún no existe)
  private gymGoalId: number | null = null;
  private userId = 0;

  // Configuración de la meta
  cantidadDiasGymSemana = 0;
  metaMensual = 0;
  metaAnual = 0;

  // Contadores acumulados
  diasSemana = 0;
  diasMes = 0;
  diasAnio = 0;

  // Rachas
  streakCount = 0;
  mayorRacha = 0;

  // Checkboxes dinámicos: longitud = cantidadDiasGymSemana
  diasGymChecks: boolean[] = [];
  categoriasDia: string[] = [];

  categorias = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Cardio', 'Full Body'];

  // Strings para formularios de edición
  editCantidadDiasStr = '';
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
    // Datos de sesión
    const session = this.authService.currentUser();
    this.userId = session?.userId ?? 0;
    this.username = session?.firstName || session?.username || 'Usuario';

    // Cargar estado local (cache offline / contadores de progreso)
    this.cargarDesdeLocalStorage();

    // Cargar meta desde la API
    if (this.userId) {
      this.gymService.getByUserId(this.userId).subscribe(goal => {
        if (goal) {
          this.gymGoalId = goal.gymGoalId ?? null;
          this.cantidadDiasGymSemana = goal.weeklyGymDays ?? 0;
          // Reconstruir checkboxes si no hay estado local
          const gym = JSON.parse(localStorage.getItem('datosGym') || '{}');
          if (!gym.diasGymChecks) this.initCheckboxes();
        }
      });
    }

    this.verificarNuevaSemana();
    this.verificarNuevoMes();
  }

  // ── Utilidades ────────────────────────────────────────────────────────────

  getRange(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }

  private initCheckboxes() {
    this.diasGymChecks = Array(this.cantidadDiasGymSemana).fill(false);
    this.categoriasDia = Array(this.cantidadDiasGymSemana).fill('');
  }

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

  get limitesMes(): number {
    const ahora = new Date();
    return new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0).getDate();
  }

  get limitesAnio(): number {
    const anio = new Date().getFullYear();
    return (anio % 4 === 0 && (anio % 100 !== 0 || anio % 400 === 0)) ? 366 : 365;
  }

  // ── Carga y guardado ──────────────────────────────────────────────────────

  private cargarDesdeLocalStorage() {
    const gym = JSON.parse(localStorage.getItem('datosGym') || '{}');
    if (gym.cantidadDiasGymSemana !== undefined) this.cantidadDiasGymSemana = gym.cantidadDiasGymSemana;
    if (gym.diasMes !== undefined)    this.diasMes    = gym.diasMes;
    if (gym.diasAnio !== undefined)   this.diasAnio   = gym.diasAnio;
    if (gym.metaMensual !== undefined) this.metaMensual = gym.metaMensual;
    if (gym.metaAnual !== undefined)  this.metaAnual  = gym.metaAnual;
    if (gym.streakCount !== undefined) this.streakCount = gym.streakCount;
    if (gym.mayorRacha !== undefined) this.mayorRacha = gym.mayorRacha;
    this.diasGymChecks = gym.diasGymChecks || [];
    this.categoriasDia = gym.categoriasDia || Array(this.cantidadDiasGymSemana).fill('');

    const progreso = localStorage.getItem('progresoGym');
    if (progreso) this.progresoMensual = JSON.parse(progreso);

    this.diasSemana = this.diasGymChecks.filter(c => c).length;
  }

  guardarGym() {
    localStorage.setItem('datosGym', JSON.stringify({
      cantidadDiasGymSemana: this.cantidadDiasGymSemana,
      diasSemana: this.diasSemana,
      diasMes: this.diasMes,
      diasAnio: this.diasAnio,
      metaMensual: this.metaMensual,
      metaAnual: this.metaAnual,
      streakCount: this.streakCount,
      mayorRacha: this.mayorRacha,
      diasGymChecks: this.diasGymChecks,
      categoriasDia: this.categoriasDia,
    }));
  }

  /** Construye el DTO para enviar a la API. */
  private buildDto(): GymGoalDto {
    return {
      gymGoalId: this.gymGoalId ?? undefined,
      userId: this.userId,
      categoryId: 1,                              // categoría general por defecto
      weeklyGymDays: this.cantidadDiasGymSemana,
      targetDaysPerWeek: this.cantidadDiasGymSemana,
      activeGoal: true,
    };
  }

  /** Sincroniza la meta con la API y guarda el ID devuelto. */
  private sincronizarMeta() {
    if (!this.userId) return;
    this.gymService.createOrUpdate(this.buildDto()).subscribe(saved => {
      this.gymGoalId = saved.gymGoalId ?? this.gymGoalId;
    });
  }

  // ── Verificaciones de período ──────────────────────────────────────────────

  private verificarNuevaSemana() {
    const semanaActual = this.getSemanaAnio().toString();
    const semanaGuardada = localStorage.getItem('semanaGym');

    if (semanaGuardada !== semanaActual) {
      const claveRachaAnterior = `racha-gym-semana-${semanaGuardada}`;
      const ultimaRacha = localStorage.getItem('ultimaRachaGymSemana');

      if (semanaGuardada && ultimaRacha !== claveRachaAnterior && this.cantidadDiasGymSemana > 0) {
        if (!this.diasGymChecks.every(c => c)) {
          this.streakCount = 0;
        }
      }

      this.actualizarProgresoMes();
      this.diasSemana = 0;
      this.initCheckboxes();
      localStorage.setItem('semanaGym', semanaActual);
      this.guardarGym();
    }
  }

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
    const nombreMes = mesesEs[mes];
    const idx = this.progresoMensual.findIndex(p => p.mes === nombreMes);
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
    const mesActual = mesesEs[new Date().getMonth()];
    const idx = this.progresoMensual.findIndex(p => p.mes === mesActual);
    if (idx !== -1 && this.metaMensual > 0) {
      this.progresoMensual[idx].porcentaje = Math.min(
        Math.round((this.diasMes / this.metaMensual) * 100), 100
      );
      const cats = this.categoriasDia.filter(c => c !== '');
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

  toggleGymCheck(index: number, event: any) {
    const checked = event.target.checked;
    this.diasGymChecks[index] = checked;

    if (checked) {
      this.diasSemana++;
      this.diasMes++;
      this.diasAnio++;
    } else {
      this.diasSemana = Math.max(0, this.diasSemana - 1);
      this.diasMes = Math.max(0, this.diasMes - 1);
      this.diasAnio = Math.max(0, this.diasAnio - 1);
    }

    const todosCompletados = this.cantidadDiasGymSemana > 0 && this.diasGymChecks.every(c => c);
    const claveRacha = `racha-gym-semana-${this.getSemanaAnio()}`;
    const ultimaRacha = localStorage.getItem('ultimaRachaGymSemana');

    if (todosCompletados && ultimaRacha !== claveRacha) {
      this.streakCount++;
      if (this.streakCount > this.mayorRacha) this.mayorRacha = this.streakCount;
      localStorage.setItem('ultimaRachaGymSemana', claveRacha);
    }

    this.actualizarProgresoMes();
    this.guardarGym();
  }

  configurarDiasGymSemana() {
    const n = parseInt(this.editCantidadDiasStr);
    if (!n || n <= 0 || n > 7) {
      alert('Ingresa un número válido entre 1 y 7.');
      return;
    }
    this.cantidadDiasGymSemana = n;
    this.initCheckboxes();
    this.diasSemana = 0;
    this.editCantidadDiasStr = '';
    this.guardarGym();
    this.sincronizarMeta();   // ← API call
  }

  editarDiasMes() {
    const n = parseInt(this.editDiasMesStr);
    const max = this.limitesMes;
    if (!n || n <= 0 || n > max) {
      alert(`Ingresa un número entre 1 y ${max} (días del mes actual).`);
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
      alert(`Ingresa un número entre 1 y ${max} (días del mes actual).`);
      return;
    }
    this.metaMensual = n;
    this.editMetaMensualStr = '';
    this.actualizarProgresoMes();
    this.guardarGym();
    this.sincronizarMeta();   // ← API call
  }

  editarMetaAnual() {
    const n = parseInt(this.editMetaAnualStr);
    const max = this.limitesAnio;
    if (!n || n <= 0 || n > max) {
      alert(`Ingresa un número entre 1 y ${max} (días del año actual).`);
      return;
    }
    this.metaAnual = n;
    this.editMetaAnualStr = '';
    this.guardarGym();
    this.sincronizarMeta();   // ← API call
  }
}
