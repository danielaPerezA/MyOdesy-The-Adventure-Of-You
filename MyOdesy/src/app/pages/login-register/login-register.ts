import { Component, ViewEncapsulation } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/my-odesy';

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
  loading = false;

  loginData = {
    email: '',
    password: '',
    remember: false
  };

  registerData = {
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    terms: false
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  switchTab(tab: 'login' | 'register') {
    this.activeTab = tab;
    this.errorMsg = '';
  }

  onLogin() {
    this.errorMsg = '';
    if (!this.loginData.email || !this.loginData.password) {
      this.errorMsg = 'Completa todos los campos.';
      return;
    }

    this.loading = true;
    this.authService.login(this.loginData.email, this.loginData.password).subscribe(res => {
      this.loading = false;
      if (res.success) {
        this.router.navigate(['/home']);
      } else {
        this.errorMsg = res.message;
      }
    });
  }

  onRegister() {
    this.errorMsg = '';
    const { firstName, lastName, username, email, password, terms } = this.registerData;

    if (!firstName || !lastName || !username || !email || !password) {
      this.errorMsg = 'Completa todos los campos.';
      return;
    }
    if (!terms) {
      this.errorMsg = 'Debes aceptar los términos.';
      return;
    }

    this.loading = true;
    this.authService.register(firstName, lastName, email, username, password).subscribe(res => {
      this.loading = false;
      if (res.success) {
        this.errorMsg = '';
        this.switchTab('login');
      } else {
        this.errorMsg = res.message;
      }
    });
  }
}
