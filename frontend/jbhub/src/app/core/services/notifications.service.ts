import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { ApiResponse } from '../models/api.model';
import { Notification } from '../models/notification.model';

@Injectable({ providedIn: 'root' })
export class NotificationsService {
  private http = inject(HttpClient);
  private api  = `${environment.apiUrl}/notifications`;

  lister() {
    return this.http.get<ApiResponse<Notification[]>>(this.api);
  }

  countNonLus() {
    return this.http.get<ApiResponse<{ total: number }>>(`${this.api}/non-lus`);
  }

  marquerLu(id: number) {
    return this.http.patch<ApiResponse<null>>(`${this.api}/${id}/lu`, {});
  }

  marquerTousLus() {
    return this.http.patch<ApiResponse<null>>(`${this.api}/tous-lus`, {});
  }
}
