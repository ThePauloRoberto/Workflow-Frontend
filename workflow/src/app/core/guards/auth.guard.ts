import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    if (this.authService.getUser()) {
      return this.authService.checkAuthStatus().pipe(
        map(isValid => {
          if (isValid) {
            return true;
          }
          this.router.navigate(['/login']);
          return false;
        }),
        catchError(() => {
          this.router.navigate(['/login']);
          return of(false);
        })
      );
    }

    this.router.navigate(['/login']);
    return of(false);
  }
}
