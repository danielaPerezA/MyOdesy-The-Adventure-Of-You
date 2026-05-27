import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [Navbar, Footer, CommonModule, FormsModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile implements OnInit {
  username = '';
  showForm = false;
  showMetas = false;
  perfilCompleto = false;

  datosUsuario = {
    nombre: '',
    apellidos: '',
    edad: null as number | null,
    celular: '',
    usuario: '',
    email: '',
    metaAhorroMensual: null as number | null,
    metaAhorroAnual: null as number | null,
    metaGymSemanal: null as number | null,
    metaGymMensual: null as number | null,
  };

  ngOnInit() {
    const usuario = JSON.parse(localStorage.getItem('UsuarioLogueado') || '{}');
    this.username = usuario.name || usuario.email || 'Usuario';
    this.datosUsuario.email = usuario.email || '';

    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    if (perfil.nombre) {
      this.datosUsuario = { ...this.datosUsuario, ...perfil };
      this.username = perfil.usuario || perfil.nombre || this.username;
    }

    this.verificarPerfil();
  }

  toggleForm() { this.showForm = !this.showForm; }
  toggleMetas() { this.showMetas = !this.showMetas; }

  verificarPerfil() {
    const d = this.datosUsuario;
    this.perfilCompleto = !!(
      d.nombre && d.apellidos && d.celular && d.usuario &&
      d.metaAhorroMensual && d.metaGymMensual
    );
  }

  guardarDatos() {
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    const actualizado = { ...perfil, ...this.datosUsuario };
    localStorage.setItem('perfilUsuario', JSON.stringify(actualizado));
    this.username = this.datosUsuario.usuario || this.datosUsuario.nombre;
    this.verificarPerfil();
    this.showForm = false;
  }

  guardarMetas() {
    const perfil = JSON.parse(localStorage.getItem('perfilUsuario') || '{}');
    const actualizado = { ...perfil, ...this.datosUsuario };
    localStorage.setItem('perfilUsuario', JSON.stringify(actualizado));
    this.verificarPerfil();
    this.showMetas = false;
  }
}