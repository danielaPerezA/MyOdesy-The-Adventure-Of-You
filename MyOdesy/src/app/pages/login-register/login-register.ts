import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { AuthService } from '../../services/my-odesy';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-login-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, Navbar, Footer],
  templateUrl: './login-register.html',
  styleUrl: './login-register.scss',
  encapsulation: ViewEncapsulation.None
})
export class LoginRegister implements OnInit {

  activeTab: 'login' | 'register' = 'login';
  errorMsg = '';
  loadingLogin = false;
  loadingRegister = false;

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
    password: ''
  };

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    // Despertar el backend de Render (free tier duerme tras inactividad)
    this.http.get(`${environment.apiUrl}/api/myodesy/users`, { responseType: 'text' })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

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

    this.loadingLogin = true;
    this.authService.login(this.loginData.email, this.loginData.password).subscribe(res => {
      this.loadingLogin = false;
      if (res.success) {
        this.router.navigate(['/home']);
      } else {
        this.errorMsg = res.message;
      }
    });
  }

  onRegister() {
    this.errorMsg = '';
    const { firstName, lastName, username, email, password } = this.registerData;

    if (!firstName || !lastName || !username || !email || !password) {
      this.errorMsg = 'Completa todos los campos.';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.errorMsg = 'Ingresa un correo electrónico válido.';
      return;
    }

    if (password.length < 8) {
      this.errorMsg = 'La contraseña debe tener mínimo 8 caracteres.';
      return;
    }

    this.loadingRegister = true;
    this.authService.register(firstName, lastName, email, username, password).subscribe(res => {
      this.loadingRegister = false;
      if (res.success) {
        this.errorMsg = '';
        this.registerData = { firstName: '', lastName: '', username: '', email: '', password: '' };
        this.switchTab('login');
      } else {
        // El backend devuelve mensaje específico si el correo ya existe
        this.errorMsg = res.message;
      }
    });
  }
}
