import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { FinanceGoalDto } from '../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class FinanceService {

  private readonly BASE = `${environment.apiUrl}/api/myodesy/financeGoals`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<FinanceGoalDto[]> {
    return this.http.get<FinanceGoalDto[]>(this.BASE);
  }

  getByUserId(userId: number): Observable<FinanceGoalDto | null> {
    return this.getAll().pipe(
      map(goals => goals.find(g => g.userId === userId) ?? null),
      catchError(() => of(null))
    );
  }

  create(dto: FinanceGoalDto): Observable<FinanceGoalDto> {
    return this.http.post<FinanceGoalDto>(this.BASE, dto);
  }

  update(id: number, dto: FinanceGoalDto): Observable<FinanceGoalDto> {
    return this.http.put<FinanceGoalDto>(`${this.BASE}/${id}`, dto);
  }

  /**
   * Crea o actualiza la meta de finanzas del usuario.
   * Si ya existe un financeGoalId, hace PUT; si no, POST.
   */
  createOrUpdate(dto: FinanceGoalDto): Observable<FinanceGoalDto> {
    if (dto.financeGoalId) {
      return this.update(dto.financeGoalId, dto);
    }
    return this.create(dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}
