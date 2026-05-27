import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FinanceGoalDto, RachaFinanzasEstadoDTO, RegistroFinanzasDTO } from '../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class FinanceService {

  private readonly BASE   = `${environment.apiUrl}/api/myodesy/financeGoals`;
  private readonly RACHAS = `${environment.apiUrl}/api/myodesy/rachas/finanzas`;

  constructor(private http: HttpClient) {}

  // ── Meta ──────────────────────────────────────────────────────────────────

  getAll(): Observable<FinanceGoalDto[]> {
    return this.http.get<FinanceGoalDto[]>(this.BASE);
  }

  getById(id: number): Observable<FinanceGoalDto> {
    return this.http.get<FinanceGoalDto>(`${this.BASE}/${id}`);
  }

  /** Busca la meta financiera activa del usuario. */
  getByUserId(userId: number): Observable<FinanceGoalDto | null> {
    return this.getAll().pipe(
      map(goals => goals.find(g => g.idUsuario === userId) ?? null),
      catchError(() => of(null))
    );
  }

  create(dto: FinanceGoalDto): Observable<FinanceGoalDto> {
    return this.http.post<FinanceGoalDto>(this.BASE, dto);
  }

  update(id: number, dto: FinanceGoalDto): Observable<FinanceGoalDto> {
    return this.http.put<FinanceGoalDto>(`${this.BASE}/${id}`, dto);
  }

  /** POST si no existe, PUT si ya tiene idMetaFinanza. */
  createOrUpdate(dto: FinanceGoalDto): Observable<FinanceGoalDto> {
    return dto.idMetaFinanza ? this.update(dto.idMetaFinanza, dto) : this.create(dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  // ── Racha ─────────────────────────────────────────────────────────────────

  /** GET /rachas/finanzas/estado/{idMetaFinanza} */
  getRachaEstado(idMetaFinanza: number): Observable<RachaFinanzasEstadoDTO> {
    return this.http.get<RachaFinanzasEstadoDTO>(`${this.RACHAS}/estado/${idMetaFinanza}`);
  }

  /**
   * POST /rachas/finanzas/registrar
   * Registra el ahorro del período actual.
   * Devuelve el estado actualizado de la racha.
   */
  registrarAhorro(dto: RegistroFinanzasDTO): Observable<RachaFinanzasEstadoDTO> {
    return this.http.post<RachaFinanzasEstadoDTO>(`${this.RACHAS}/registrar`, dto);
  }
}
