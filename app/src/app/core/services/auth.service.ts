import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { User } from '../../model/user';
import { jwtDecode } from 'jwt-decode';
import { RegisterRequest } from '../../model/register-request';
import { AuthRequest } from '../../model/auth-request';
import { environment } from '../../../environments/environment.prod';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiAuthUrl;
  private tokenKey = 'auth_token';

  constructor(private http: HttpClient) {
    this.loadUserFromToken();
  }

  login(credentials: AuthRequest): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${this.apiUrl}/login`, credentials)
      .pipe(
        tap(response => {
          localStorage.setItem(this.tokenKey, response.token);
          this.loadUserFromToken();
        })
      );
  }

  register(userData: RegisterRequest): Observable<User> {
    return this.http.post<User>(`${this.apiUrl}/register`, userData);
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem('user_uuid');
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  private loadUserFromToken(): void {
    const token = this.getToken();
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const uuid = decoded.uuid;
        localStorage.setItem('user_uuid', uuid);
      } catch (error) {
        console.error('Error decodificando token', error);
        this.logout();
      }
    }
  }

  getCurrentUser(): Observable<User> {
    const uuid = localStorage.getItem('user_uuid');
    return this.http.get<User>(`${this.apiUrl}/profile/${uuid}`);
  }
}
