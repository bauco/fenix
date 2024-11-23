import { HttpErrorResponse, HttpEvent, HttpHandler, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';
import { catchError, Observable, switchMap, throwError } from 'rxjs';

function handle401Error(req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> {
  const auth = inject(AuthService);
  return auth.refreshToken().pipe(
    switchMap((token: string) => {
      req = req.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
      return next(req);
    }),
    catchError(() => {
      auth.logout();
      return throwError(() => new Error('Token refresh failed'));
    })
  );
}

export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = inject(AuthService).getToken();
  if (authToken) {
    req = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${authToken}`)
    });
  }
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !req.url.includes('/auth/refresh')) {
        return handle401Error(req, next);
      }
      return throwError(() => error);
    }
    ));
}


 
