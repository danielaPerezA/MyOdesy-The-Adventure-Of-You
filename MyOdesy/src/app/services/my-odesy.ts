import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, map, catchError, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SessionData,
  SystemUser
} from '../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private readonly BASE = environment.apiUrl;
  private readonly SESSION_KEY = 'myodesy_session';

  currentUser = signal<SessionData | null>(this.loadSession());

  constructor(private http: HttpClient) {}

  // ── Sesión ────────────────────────────────────────────────────────────────

  private loadSession(): SessionData | null {
    const raw = sessionStorage.getItem(this.SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  private saveSession(data: SessionData): void {
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(data));
    sessionStorage.setItem('token', data.token);
    this.currentUser.set(data);
  }

  getCurrentUserId(): number | null {
    return this.currentUser()?.userId ?? null;
  }

  isLoggedIn(): boolean {
    return this.currentUser() !== null;
  }

  logout(): void {
    sessionStorage.removeItem(this.SESSION_KEY);
    sessionStorage.removeItem('token');
    this.currentUser.set(null);
  }

  // ── Login ─────────────────────────────────────────────────────────────────

  login(email: string, password: string): Observable<{ success: boolean; message: string }> {
    const body: LoginRequest = { email, password };

    return this.http.post<AuthResponse>(`${this.BASE}/api/myodesy/login`, body).pipe(
      switchMap(authResp => {
        // Guardar token provisional para que el interceptor lo incluya en la next request
        sessionStorage.setItem('token', authResp.token);

        // Obtener userId buscando por email en la lista de usuarios
        return this.http.get<SystemUser[]>(`${this.BASE}/api/myodesy/users`).pipe(
          map(users => {
            const user = users.find(u => u.email === email);
            const session: SessionData = {
              token: authResp.token,
              userId: user?.userId ?? 0,
              email: authResp.email,
              username: authResp.username,
              firstName: authResp.firstName,
              lastName: authResp.lastName,
            };
            this.saveSession(session);
            // Compatibilidad con el resto del código que lee 'UsuarioLogueado'
            localStorage.setItem('UsuarioLogueado', JSON.stringify({
              id: session.userId,
              name: `${session.firstName} ${session.lastName}`,
              email: session.email,
            }));
            return { success: true, message: `Bienvenida, ${authResp.firstName}` };
          })
        );
      }),
      catchError(err => {
        const msg = err.error?.message || 'Credenciales incorrectas.';
        return of({ success: false, message: msg });
      })
    );
  }

  // ── Register ──────────────────────────────────────────────────────────────

  register(
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    password: string
  ): Observable<{ success: boolean; message: string }> {
    const body: RegisterRequest = { firstName, lastName, email, username, password };

    return this.http.post<AuthResponse>(`${this.BASE}/api/myodesy/register`, body).pipe(
      map(() => ({ success: true, message: 'Cuenta creada. Inicia sesión.' })),
      catchError(err => {
        const msg = err.error?.message || 'Error al registrar. Intenta de nuevo.';
        return of({ success: false, message: msg });
      })
    );
  }
}
