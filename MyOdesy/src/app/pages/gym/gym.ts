import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-gym',
  standalone: true,
  imports: [Navbar, Footer, CommonModule, FormsModule],
  templateUrl: './gym.html',
  styleUrl: './gym.scss',
})
export class Gym implements OnInit {
  username = '';

  diasSemana = 0;
  diasMes = 0;
  diasAnio = 0;
  metaSemanal = 0;
  metaMensual = 0;
  metaAnual = 0;
  streakCount = 0;

  weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  categorias = ['Pecho', 'Espalda', 'Piernas', 'Hombros', 'Brazos', 'Cardio', 'Full Body'];

  diasEntrenadosSemana: {[key: string]: boolean} = {
    Mon: false, Tue: false, Wed: false, Thu: false,
    Fri: false, Sat: false, Sun: false
  };

  categoriasDia: {[key: string]: string} = {
    Mon: '', Tue: '', Wed: '', Thu: '',
    Fri: '', Sat: '', Sun: ''
  };

  editDiasSemanaStr = '';
  editDiasMesStr = '';
  editMetaSemanalStr = '';
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

  ngOnInit() {
    const usuario = JSON.parse(localStorage.getItem('UsuarioLogueado') || '{}');
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    this.username = perfil.usuario || perfil.nombre || usuario.name || 'Usuario';

    if (perfil.metaGymSemanal) this.metaSemanal = perfil.metaGymSemanal;
    if (perfil.metaGymMensual) this.metaMensual = perfil.metaGymMensual;

    const gym = JSON.parse(localStorage.getItem('datosGym') || '{}');
    if (gym.diasSemana !== undefined) this.diasSemana = gym.diasSemana;
    if (gym.diasMes !== undefined) this.diasMes = gym.diasMes;
    if (gym.diasAnio !== undefined) this.diasAnio = gym.diasAnio;
    if (gym.metaSemanal !== undefined) this.metaSemanal = gym.metaSemanal;
    if (gym.metaMensual !== undefined) this.metaMensual = gym.metaMensual;
    if (gym.metaAnual !== undefined) this.metaAnual = gym.metaAnual;
    if (gym.streakCount !== undefined) this.streakCount = gym.streakCount;
    if (gym.diasEntrenadosSemana) this.diasEntrenadosSemana = gym.diasEntrenadosSemana;
    if (gym.categoriasDia) this.categoriasDia = gym.categoriasDia;

    const progreso = localStorage.getItem('progresoGym');
    if (progreso) this.progresoMensual = JSON.parse(progreso);

    this.verificarNuevaSemana();
    this.verificarNuevoMes();
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

  private verificarNuevaSemana() {
    const semanaActual = this.getSemanaAnio().toString();
    const semanaGuardada = localStorage.getItem('semanaGym');

    if (semanaGuardada !== semanaActual) {
      this.actualizarProgresoMes();
      this.diasSemana = 0;
      this.diasEntrenadosSemana = {
        Mon: false, Tue: false, Wed: false, Thu: false,
        Fri: false, Sat: false, Sun: false
      };
      this.categoriasDia = {
        Mon: '', Tue: '', Wed: '', Thu: '',
        Fri: '', Sat: '', Sun: ''
      };
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

    const [anio, mes] = mesGuardado.split('-').map(Number);
    const mesesEs: {[key: number]: string} = {
      0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr',
      4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug',
      8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dic'
    };
    const nombreMes = mesesEs[mes];
    const idx = this.progresoMensual.findIndex(p => p.mes === nombreMes);

    if (idx !== -1 && this.metaMensual > 0) {
      this.progresoMensual[idx].porcentaje = Math.min(
        Math.round((this.diasMes / this.metaMensual) * 100),
        100
      );
    }
    localStorage.setItem('progresoGym', JSON.stringify(this.progresoMensual));
  }

  private numeroValido(valor: string): boolean {
    return parseInt(valor) > 0;
  }

  private yaRegistroHoy(): boolean {
    const hoy = new Date().toDateString();
    const ultimaRacha = localStorage.getItem('ultimaRachaGym');
    return ultimaRacha === hoy;
  }

  private marcarRachaHoy() {
    localStorage.setItem('ultimaRachaGym', new Date().toDateString());
  }

  guardarGym() {
    localStorage.setItem('datosGym', JSON.stringify({
      diasSemana: this.diasSemana,
      diasMes: this.diasMes,
      diasAnio: this.diasAnio,
      metaSemanal: this.metaSemanal,
      metaMensual: this.metaMensual,
      metaAnual: this.metaAnual,
      streakCount: this.streakCount,
      diasEntrenadosSemana: this.diasEntrenadosSemana,
      categoriasDia: this.categoriasDia,
    }));
  }

  actualizarProgresoMes() {
    const mesesEs: {[key: number]: string} = {
      0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr',
      4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug',
      8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dic'
    };
    const mesActual = mesesEs[new Date().getMonth()];
    const idx = this.progresoMensual.findIndex(p => p.mes === mesActual);

    if (idx !== -1 && this.metaMensual > 0) {
      this.progresoMensual[idx].porcentaje = Math.min(
        Math.round((this.diasMes / this.metaMensual) * 100),
        100
      );

      const cats = Object.values(this.categoriasDia).filter(c => c !== '');
      if (cats.length > 0) {
        const freq: {[key: string]: number} = {};
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

  toggleDia(dia: string, event: any) {
    const checked = event.target.checked;
    this.diasEntrenadosSemana[dia] = checked;

    if (checked) {
      this.diasSemana++;
      this.diasMes++;
      this.diasAnio++;

      if (!this.yaRegistroHoy()) {
        this.streakCount++;
        this.marcarRachaHoy();
      }
    } else {
      this.diasSemana = Math.max(0, this.diasSemana - 1);
      this.diasMes = Math.max(0, this.diasMes - 1);
      this.diasAnio = Math.max(0, this.diasAnio - 1);
    }

    this.actualizarProgresoMes();
    this.guardarGym();
  }

  editarDiasSemana() {
    if (!this.numeroValido(this.editDiasSemanaStr)) {
      alert('Por favor ingresa un número válido mayor a 0.');
      return;
    }
    this.diasSemana = parseInt(this.editDiasSemanaStr);
    this.editDiasSemanaStr = '';
    this.guardarGym();
  }

  editarDiasMes() {
    if (!this.numeroValido(this.editDiasMesStr)) {
      alert('Por favor ingresa un número válido mayor a 0.');
      return;
    }
    this.diasMes = parseInt(this.editDiasMesStr);
    this.editDiasMesStr = '';
    this.actualizarProgresoMes();
    this.guardarGym();
  }

  editarMetaSemanal() {
    if (!this.numeroValido(this.editMetaSemanalStr)) {
      alert('Por favor ingresa un número válido mayor a 0.');
      return;
    }
    this.metaSemanal = parseInt(this.editMetaSemanalStr);
    this.editMetaSemanalStr = '';

    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.metaGymSemanal = this.metaSemanal;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
    this.guardarGym();
  }

  editarMetaMensual() {
    if (!this.numeroValido(this.editMetaMensualStr)) {
      alert('Por favor ingresa un número válido mayor a 0.');
      return;
    }
    this.metaMensual = parseInt(this.editMetaMensualStr);
    this.editMetaMensualStr = '';
    this.actualizarProgresoMes();

    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.metaGymMensual = this.metaMensual;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
    this.guardarGym();
  }

  editarMetaAnual() {
    if (!this.numeroValido(this.editMetaAnualStr)) {
      alert('Por favor ingresa un número válido mayor a 0.');
      return;
    }
    this.metaAnual = parseInt(this.editMetaAnualStr);
    this.editMetaAnualStr = '';
    this.guardarGym();
  }
}