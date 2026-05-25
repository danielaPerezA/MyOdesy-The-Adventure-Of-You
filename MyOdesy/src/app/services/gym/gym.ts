import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GymGoalDto } from '../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class GymService {

  private readonly BASE = `${environment.apiUrl}/api/myodesy/gymGoals`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<GymGoalDto[]> {
    return this.http.get<GymGoalDto[]>(this.BASE);
  }

  getByUserId(userId: number): Observable<GymGoalDto | null> {
    return this.getAll().pipe(
      map(goals => goals.find(g => g.userId === userId) ?? null),
      catchError(() => of(null))
    );
  }

  create(dto: GymGoalDto): Observable<GymGoalDto> {
    return this.http.post<GymGoalDto>(this.BASE, dto);
  }

  update(id: number, dto: GymGoalDto): Observable<GymGoalDto> {
    return this.http.put<GymGoalDto>(`${this.BASE}/${id}`, dto);
  }

  /**
   * Crea o actualiza la meta de gym del usuario.
   * Si ya existe un gymGoalId (cargado previamente), hace PUT; si no, POST.
   */
  createOrUpdate(dto: GymGoalDto): Observable<GymGoalDto> {
    if (dto.gymGoalId) {
      return this.update(dto.gymGoalId, dto);
    }
    return this.create(dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }
}
