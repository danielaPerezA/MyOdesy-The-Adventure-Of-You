import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, catchError, of } from 'rxjs';
import { environment } from '../../../environments/environment';
import { MetaGymDto, RachaGymEstadoDTO, RegistroGymDTO } from '../../core/models/api.models';

@Injectable({ providedIn: 'root' })
export class GymService {

  private readonly BASE     = `${environment.apiUrl}/api/myodesy/gymGoals`;
  private readonly RACHAS   = `${environment.apiUrl}/api/myodesy/rachas/gym`;

  constructor(private http: HttpClient) {}

  // ── Meta ──────────────────────────────────────────────────────────────────

  getAll(): Observable<MetaGymDto[]> {
    return this.http.get<MetaGymDto[]>(this.BASE);
  }

  getById(id: number): Observable<MetaGymDto> {
    return this.http.get<MetaGymDto>(`${this.BASE}/${id}`);
  }

  /** Busca la meta activa del usuario dentro de la lista. */
  getByUserId(userId: number): Observable<MetaGymDto | null> {
    return this.getAll().pipe(
      map(goals => goals.find(g => g.idUsuario === userId) ?? null),
      catchError(() => of(null))
    );
  }

  create(dto: MetaGymDto): Observable<MetaGymDto> {
    return this.http.post<MetaGymDto>(this.BASE, dto);
  }

  update(id: number, dto: MetaGymDto): Observable<MetaGymDto> {
    return this.http.put<MetaGymDto>(`${this.BASE}/${id}`, dto);
  }

  /** POST si no existe, PUT si ya tiene idMetaGym. */
  createOrUpdate(dto: MetaGymDto): Observable<MetaGymDto> {
    return dto.idMetaGym ? this.update(dto.idMetaGym, dto) : this.create(dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.BASE}/${id}`);
  }

  // ── Racha ─────────────────────────────────────────────────────────────────

  /** GET /rachas/gym/estado/{idMetaGym} */
  getRachaEstado(idMetaGym: number): Observable<RachaGymEstadoDTO> {
    return this.http.get<RachaGymEstadoDTO>(`${this.RACHAS}/estado/${idMetaGym}`);
  }

  /**
   * POST /rachas/gym/registrar
   * Registra que el usuario fue al gym el día indicado.
   * Devuelve el estado actualizado de la racha.
   */
  registrarSesion(dto: RegistroGymDTO): Observable<RachaGymEstadoDTO> {
    return this.http.post<RachaGymEstadoDTO>(`${this.RACHAS}/registrar`, dto);
  }
}
