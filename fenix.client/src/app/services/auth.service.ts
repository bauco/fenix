import { inject, Injectable } from '@angular/core';
import { ApiService } from './api.service';
import { Observable, map } from 'rxjs';
import { IApiResponse, ILogInRequest } from '../DTO';
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

  setToken(data:any) {
    localStorage.setItem('token', this.encrypt(data));
  }
  private api = inject(ApiService);
  private router = inject(Router);
  constructor() { }

  login(loginRequest: ILogInRequest): Observable<IApiResponse<any>> {
    const url = `/User`;
    return this.api.post<IApiResponse<any>>(url, loginRequest).pipe(
      map(response =>  {
        if(response.success){
          this.setToken(response.data.token)
          this.router.navigate(['repo']);
          return response;
        }
        return response;
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
    return this.decrypt(localStorage.getItem('token') ?? '');
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
