import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-finance',
  standalone: true,
  imports: [Navbar, Footer, CommonModule, FormsModule],
  templateUrl: './finance.html',
  styleUrl: './finance.scss',
})
export class Finance implements OnInit {
  username = 'Daniela';

  saldoDisponible = 0;
  montoGastos = 0;
  metaAnual = 0;
  metaMensual = 0;
  montoAhorrado = 0;
  metaAhorroAnual = 0;
  streakCount = 0;

  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  circles = Array.from({length: 12}, (_, i) => i + 1);
  categorias = ['Comida','Transporte','Entretenimiento','Salud','Educación','Otros'];

  nuevoSaldoStr = '';
  nuevoGastoStr = '';
  categoriaGasto = '';
  nuevoAhorroStr = '';

  editSaldoStr = '';
  editMetaMensualStr = '';
  editMetaAnualStr = '';
  editAhorroStr = '';
  editGastosStr = '';

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

  ngOnInit() {
    const usuario = JSON.parse(localStorage.getItem('UsuarioLogueado') || '{}');
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    this.username = perfil.usuario || perfil.nombre || usuario.name || 'Usuario';

    if (perfil.metaAhorroMensual) this.metaMensual = perfil.metaAhorroMensual;
    if (perfil.metaAhorroAnual) this.metaAnual = perfil.metaAhorroAnual;

    const finanzas = JSON.parse(localStorage.getItem('datosFinanzas') || '{}');
    if (finanzas.saldoDisponible !== undefined) this.saldoDisponible = finanzas.saldoDisponible;
    if (finanzas.montoGastos !== undefined) this.montoGastos = finanzas.montoGastos;
    if (finanzas.montoAhorrado !== undefined) this.montoAhorrado = finanzas.montoAhorrado;
    if (finanzas.metaAhorroAnual !== undefined) this.metaAhorroAnual = finanzas.metaAhorroAnual;
    if (finanzas.streakCount !== undefined) this.streakCount = finanzas.streakCount;

    const progreso = localStorage.getItem('progresoFinanzas');
    if (progreso) this.progresoAnual = JSON.parse(progreso);
  }

  parseMonto(valor: string): number {
    return parseInt(valor.replace(/\./g, '').replace(/,/g, '')) || 0;
  }

  formatMonto(valor: number): string {
    return valor.toLocaleString('es-CO');
  }

  private montoValido(valor: string): boolean {
    return this.parseMonto(valor) > 0;
  }

  private yaRegistroHoy(): boolean {
    const hoy = new Date().toDateString();
    const ultimaRacha = localStorage.getItem('ultimaRachaFinanzas');
    return ultimaRacha === hoy;
  }

  private marcarRachaHoy() {
    localStorage.setItem('ultimaRachaFinanzas', new Date().toDateString());
  }

  guardarFinanzas() {
    localStorage.setItem('datosFinanzas', JSON.stringify({
      saldoDisponible: this.saldoDisponible,
      montoGastos: this.montoGastos,
      montoAhorrado: this.montoAhorrado,
      metaAhorroAnual: this.metaAhorroAnual,
      streakCount: this.streakCount,
    }));
  }

  actualizarProgresoMes() {
    const mesesEs: {[key: number]: string} = {
      0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr',
      4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug',
      8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dic'
    };
    const mesActual = mesesEs[new Date().getMonth()];
    const idx = this.progresoAnual.findIndex(p => p.mes === mesActual);

    if (idx !== -1 && this.metaMensual > 0) {
      this.progresoAnual[idx].porcentaje = Math.min(
        Math.round((this.montoAhorrado / this.metaMensual) * 100),
        100
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

  registrarSaldo() {
    if (!this.montoValido(this.nuevoSaldoStr)) {
      alert('Por favor ingresa un monto válido mayor a 0.');
      return;
    }
    this.saldoDisponible = this.parseMonto(this.nuevoSaldoStr);
    this.nuevoSaldoStr = '';
    this.guardarFinanzas();
  }

  registrarGasto() {
    if (!this.montoValido(this.nuevoGastoStr)) {
      alert('Por favor ingresa un monto válido mayor a 0.');
      return;
    }
    if (!this.categoriaGasto) {
      alert('Por favor selecciona una categoría.');
      return;
    }
    const monto = this.parseMonto(this.nuevoGastoStr);
    this.montoGastos += monto;
    this.saldoDisponible -= monto;

    const mesesEs: {[key: number]: string} = {
      0: 'Jan', 1: 'Feb', 2: 'Mar', 3: 'Apr',
      4: 'May', 5: 'Jun', 6: 'Jul', 7: 'Aug',
      8: 'Sep', 9: 'Oct', 10: 'Nov', 11: 'Dic'
    };
    const mesActual = mesesEs[new Date().getMonth()];
    const idx = this.progresoAnual.findIndex(p => p.mes === mesActual);
    if (idx !== -1) {
      this.progresoAnual[idx].categoria = this.categoriaGasto;
    }

    this.nuevoGastoStr = '';
    this.categoriaGasto = '';
    this.guardarFinanzas();
    localStorage.setItem('progresoFinanzas', JSON.stringify(this.progresoAnual));
  }

  registrarAhorro() {
    if (!this.montoValido(this.nuevoAhorroStr)) {
      alert('Por favor ingresa un monto válido mayor a 0.');
      return;
    }

    this.montoAhorrado += this.parseMonto(this.nuevoAhorroStr);
    this.nuevoAhorroStr = '';

    if (!this.yaRegistroHoy()) {
      this.streakCount++;
      this.marcarRachaHoy();
    }

    this.actualizarProgresoMes();
    this.guardarFinanzas();
  }

  editarSaldo() {
    if (!this.montoValido(this.editSaldoStr)) {
      alert('Por favor ingresa un monto válido mayor a 0.');
      return;
    }
    this.saldoDisponible = this.parseMonto(this.editSaldoStr);
    this.editSaldoStr = '';
    this.guardarFinanzas();
  }

  editarMetaMensual() {
    if (!this.montoValido(this.editMetaMensualStr)) {
      alert('Por favor ingresa un monto válido mayor a 0.');
      return;
    }
    this.metaMensual = this.parseMonto(this.editMetaMensualStr);
    this.editMetaMensualStr = '';
    this.actualizarProgresoMes();

    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.metaAhorroMensual = this.metaMensual;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
  }

  editarMetaAnual() {
    if (!this.montoValido(this.editMetaAnualStr)) {
      alert('Por favor ingresa un monto válido mayor a 0.');
      return;
    }
    this.metaAnual = this.parseMonto(this.editMetaAnualStr);
    this.metaAhorroAnual = this.metaAnual;
    this.editMetaAnualStr = '';
    this.guardarFinanzas();

    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    perfil.metaAhorroAnual = this.metaAnual;
    localStorage.setItem('perfilUsuario', JSON.stringify(perfil));
  }

  editarAhorro() {
    if (!this.montoValido(this.editAhorroStr)) {
      alert('Por favor ingresa un monto válido mayor a 0.');
      return;
    }
    this.montoAhorrado = this.parseMonto(this.editAhorroStr);
    this.editAhorroStr = '';
    this.actualizarProgresoMes();
    this.guardarFinanzas();
  }

  editarGastos() {
    if (!this.montoValido(this.editGastosStr)) {
      alert('Por favor ingresa un monto válido mayor a 0.');
      return;
    }
    this.montoGastos = this.parseMonto(this.editGastosStr);
    this.editGastosStr = '';
    this.guardarFinanzas();
  }
}