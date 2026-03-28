import { Component, ViewEncapsulation } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar, Footer],
  templateUrl: './login-register.html',
  styleUrl: './login-register.scss',
  encapsulation: ViewEncapsulation.None
})
export class LoginRegister {

  activeTab: 'login' | 'register' = 'login';
  errorMsg = '';

  loginData = {
    email: '',
    password: '',
    remember: false
  };

  registerData = {
    name: '',
    genero: '',
    email: '',
    password: '',
    terms: false
  };

  constructor(private router: Router) {}

  switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.errorMsg = '';
  }

  onLogin() {
    this.errorMsg = '';
    const usuarios: any[] = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const validUser = usuarios.find(
      u => u.email === this.loginData.email && u.password === this.loginData.password
    );

    if (!validUser) {
      this.errorMsg = 'Usuario y/o contraseña incorrectos.';
      return;
    }

    localStorage.setItem('UsuarioLogueado', JSON.stringify(validUser));
    localStorage.setItem('emailUsuario', validUser.email);
    this.router.navigate(['/home']);   // ← cambiado de /dashboard a /home
  }

  onRegister() {
    this.errorMsg = '';

    if (!this.registerData.terms) {
      this.errorMsg = 'Debes aceptar los términos y condiciones.';
      return;
    }

    const usuarios: any[] = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const existe = usuarios.find(u => u.email === this.registerData.email);

    if (existe) {
      this.errorMsg = 'Este email ya está registrado.';
      return;
    }

    usuarios.push({ ...this.registerData });
    localStorage.setItem('usuarios', JSON.stringify(usuarios));

    this.switchTab('login');
  }
}