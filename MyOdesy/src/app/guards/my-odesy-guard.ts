import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/my-odesy';
 
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
 
  // Si está logueado: permite acceso
  // Si no: redirige al login
  return auth.isLoggedIn() ? true : router.createUrlTree(['/login']);
};
