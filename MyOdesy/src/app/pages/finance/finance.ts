import { Component } from '@angular/core';
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
export class Finance {
  username = 'Daniela';

  // Datos mock — luego vendrán del backend
  saldoDisponible = 1250000;
  montoGastos = 200000;
  metaAnual = 3000000;
  metaMensual = 400000;
  montoAhorrado = 1600000;
  metaAhorroAnual = 3000000;
  streakCount = 3;

  months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  circles = Array.from({length: 12}, (_, i) => i + 1);
  categorias = ['Comida','Transporte','Entretenimiento','Salud','Educación','Otros'];

  // Formularios registro
  nuevoSaldo = 0;
  nuevoGasto = 0;
  categoriaGasto = '';
  nuevoAhorro = 0;

  // Formularios edición
  editSaldo = 0;
  editMetaMensual = 0;
  editMetaAnual = 0;
  editAhorro = 0;
  editGastos = 0;

  progresoAnual = [
    { mes: 'Jan', porcentaje: 80 },
    { mes: 'Feb', porcentaje: 80 },
    { mes: 'Mar', porcentaje: 88 },
    { mes: 'Apr', porcentaje: 40 },
    { mes: 'May', porcentaje: 80 },
    { mes: 'Jun', porcentaje: 88 },
    { mes: 'Jul', porcentaje: 48 },
    { mes: 'Aug', porcentaje: 55 },
    { mes: 'Sep', porcentaje: 80 },
    { mes: 'Oct', porcentaje: 70 },
    { mes: 'Nov', porcentaje: 90 },
    { mes: 'Dic', porcentaje: 100 },
  ];

  registrarSaldo() { this.saldoDisponible = this.nuevoSaldo; this.nuevoSaldo = 0; }
  registrarGasto() { this.montoGastos += this.nuevoGasto; this.nuevoGasto = 0; }
  registrarAhorro() { this.montoAhorrado += this.nuevoAhorro; this.nuevoAhorro = 0; }
  editarSaldo() { this.saldoDisponible = this.editSaldo; this.editSaldo = 0; }
  editarMetaMensual() { this.metaMensual = this.editMetaMensual; this.editMetaMensual = 0; }
  editarMetaAnual() { this.metaAnual = this.editMetaAnual; this.editMetaAnual = 0; }
  editarAhorro() { this.montoAhorrado = this.editAhorro; this.editAhorro = 0; }
  editarGastos() { this.montoGastos = this.editGastos; this.editGastos = 0; }
}