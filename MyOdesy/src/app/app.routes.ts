import { Routes } from '@angular/router';
import { Start } from './pages/start/start';
import { LoginRegister } from './pages/login-register/login-register';
import { Home } from './pages/home/home';
import { Finance } from './pages/finance/finance';
import { Gym } from './pages/gym/gym';
import { UserProfile } from './pages/user-profile/user-profile';

export const routes: Routes = [
  { path: '', component: Start },
  { path: 'login', component: LoginRegister },
  { path: 'home', component: Home },
  { path: 'finanzas', component: Finance },
  { path: 'gym', component: Gym },
  { path: 'perfil', component: UserProfile },
  { path: '**', redirectTo: '' }
];