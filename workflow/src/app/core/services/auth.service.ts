import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { LoginRequest } from '../models/Interfaces/LoginRequest.interface';
import { LoginResponse } from '../models/Interfaces/Login-response.interface';
import { User } from '../models/Interfaces/User.entity';
import { Role } from '../models/utils/Role.enum';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://localhost:7151/api';
  private tokenKey = 'auth_token';
  private userKey = 'user_data';

  constructor(private http: HttpClient) {}

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          localStorage.setItem(this.tokenKey, response.token);
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
        }),
      );
  }

  logout(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
  }

  getToken(): string | null {
    return localStorage.getItem(this.tokenKey);
  }

getUser(): User | null {
  const userStr = localStorage.getItem(this.userKey);
  if (!userStr) return null;

  try {
    const user = JSON.parse(userStr);
    return user;
  } catch (e) {
    return null;
  }
}

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isManager(): boolean {
    const user = this.getUser();
    return user?.roles?.includes('Manager') || false;
  }

  isUser(): boolean {
    const user = this.getUser();
    return user?.roles?.includes('User') || false;
  }

  getUserId(): string | null {
    const user = this.getUser();
    return user?.id || null;
  }

  getUserRole(): string {
    const user = this.getUser();
    return user?.roles?.[0] || '';
  }
}
