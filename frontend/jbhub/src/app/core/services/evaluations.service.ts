import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Evaluation, CreateEvaluationDto } from '../models/evaluation.model';

@Injectable({ providedIn: 'root' })
export class EvaluationsService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/evaluations`;

  lister() {
    return this.http.get<ApiResponse<Evaluation[]>>(this.api);
  }

  parPublication(publicationId: number) {
    return this.http.get<ApiResponse<Evaluation[]>>(`${this.api}/publication/${publicationId}`);
  }

  evaluer(dto: CreateEvaluationDto) {
    return this.http.post<ApiResponse<Evaluation>>(this.api, dto);
  }
}
