import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, tap } from 'rxjs';
import { LoginRequest } from '../models/Interfaces/LoginRequest.interface';
import { LoginResponse } from '../models/Interfaces/Login-response.interface';
import { User } from '../models/Interfaces/User.entity';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://localhost:7151/api';
  private userKey = 'user_data';

  private _isAuthenticated = false;
  private _user: User | null = null;

  constructor(private http: HttpClient) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem(this.userKey);
    if (userStr) {
      try {
        this._user = JSON.parse(userStr);
        this._isAuthenticated = true;
      } catch (e) {
        this.clearAuth();
      }
    }
  }

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(
      `${this.apiUrl}/auth/login`,
      credentials,
      { withCredentials: true }
    ).pipe(
      tap(response => {
        this._user = response.user;
        this._isAuthenticated = true;
        localStorage.setItem(this.userKey, JSON.stringify(response.user));
      })
    );
  }

  logout(): void {
    this.http.post(`${this.apiUrl}/auth/logout`, {}, { withCredentials: true })
      .subscribe({
        complete: () => {
          this.clearAuth();
          window.location.href = '/login';
        },
        error: () => {
          this.clearAuth();
          window.location.href = '/login';
        }
      });
  }

  private clearAuth(): void {
    this._user = null;
    this._isAuthenticated = false;
    localStorage.removeItem(this.userKey);
  }

  checkAuthStatus(): Observable<boolean> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/auth/me`, { withCredentials: true })
      .pipe(
        map(response => {
          this._user = response.user;
          this._isAuthenticated = true;
          localStorage.setItem(this.userKey, JSON.stringify(response.user));
          return true;
        }),
        catchError(error => {
          this.clearAuth();
          return of(false);
        })
      );
  }

  getUser(): User | null {
    return this._user || this.getUserFromStorage();
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem(this.userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated(): boolean {
    return this._isAuthenticated || !!this.getUserFromStorage();
  }

  isManager(): boolean {
    return this.getUser()?.roles?.includes('Manager') || false;
  }

  isUser(): boolean {
    return this.getUser()?.roles?.includes('User') || false;
  }

  getUserId(): string | null {
    return this.getUser()?.id || null;
  }
}
