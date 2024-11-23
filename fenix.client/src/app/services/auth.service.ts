import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, catchError, map, throwError } from 'rxjs';
import { IApiResponse, ILogInRequest, ILogInResponse } from '../DTO';
import { Router } from '@angular/router';
import * as CryptoJS from 'crypto-js';
import { environment } from '../../environments/environment';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  
  isLoggedIn() {
    const jwtHelper = new JwtHelperService();
    const token = this.getToken();
    return !jwtHelper.isTokenExpired(token);
  }

  setToken(data: ILogInResponse) {
    localStorage.setItem('accessToken', this.encrypt(data.accessToken));
    localStorage.setItem('refreshToken', this.encrypt(data.refreshToken));

  }
  private api = inject(ApiService);
  private router = inject(Router);
  constructor() { }

  login(loginRequest: ILogInRequest): Observable<IApiResponse<any>> {
    const url = `/User/login`;
    return this.api.post<ILogInRequest, ILogInResponse>(url, loginRequest).pipe(
      map(response =>  {
        if (response.success) {
          if (response.data) {
            this.setToken(response.data)
            this.router.navigate(['repo']);
          }
          return response;
        }
        return response;
      })
    );
  }

  signup(loginRequest: ILogInRequest): Observable<IApiResponse<any>> {
    const url = `/User/signup`;

    return this.api.post<ILogInRequest, ILogInResponse>(url, loginRequest).pipe(
      map(response => {
        if (response.success) {
          if (response.success && response.data) {
            this.setToken(response.data)
            this.router.navigate(['repo']);
          }
          return response;
        }
        return response;
      })
    );
  }
  refreshToken(): Observable<string | never> {
    return this.api
      .post<string, ILogInResponse>('/User/refresh-token', this.getToken() ?? '')
      .pipe(
        map((response) => {
          if (response.success && response.data) {
            this.setToken(response.data)
            return response.data.accessToken;
          }
          throw new Error('Failed to refresh token: No access token found in the response');
        }),
        catchError((error: any) => {
          console.error(error);
          return throwError(() => error);
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.clear();
    this.router.navigate(['']);
  }

  encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, environment.SECRET_KEY).toString();
  }
  getToken() {
    return this.decrypt(localStorage.getItem('accessToken') ?? '');
  }
  decrypt(data: string): string | null{
    try {
      return CryptoJS.AES.decrypt(data, environment.SECRET_KEY).toString(CryptoJS.enc.Utf8);
    } catch (error) {
      console.error('Error decrypting token:', error);
      return null;
    }
  }
}
