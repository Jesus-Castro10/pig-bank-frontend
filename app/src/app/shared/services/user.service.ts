import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiAuthUrl = environment.apiAuthUrl;

  constructor(private http: HttpClient) { }

  updateUser(userId: number, updatedData: any): Observable<any> {
    return this.http.put(`${this.apiAuthUrl}/profile/${userId}`, updatedData);
  }

  uploadAvatar(userId: number, imagePayload: any): Observable<any> {
    return this.http.post(`${this.apiAuthUrl}/profile/${userId}/avatar`, imagePayload);
  }
}
