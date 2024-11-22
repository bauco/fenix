import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, throwError } from 'rxjs';



@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private http = inject(HttpClient);
  private headers: HttpHeaders = new HttpHeaders({
    'Content-Type': 'application/json-patch+json',
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'X-XSS-Protection': '1; mode=block',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Access-Control-Allow-Headers': "Origin, Content-Type, Accept, Authorization",
    'Access-Control-Allow-Origin': 'https://localhost:50803/, https://localhost:5163/',
    'Access-Control-Allow-Credentials': 'true',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Accept': 'text/plain',
  });
  constructor() { }
  post<T>(url: string, data: any): Observable<T> {
    return this.http.post<any>( url, data, { observe:'response', headers: this.headers.append('Allow-control-methods', 'POST') }).pipe(
      map((response: any) => {
        if(response.status === 200){
          return response.body;
        }else{
          return response.body;
        }
      }),
      catchError( (error: any) => {
        console.error(error);
        return throwError(()=> error);
      })
    );
  }

  get<T>(url: string, workStation?: string | undefined): Observable<T> {
    return this.http.get<any>( url, { observe:'response', headers: this.headers.append('Allow-control-methods', 'GET') }).pipe(
      map((response: any) => {
        return response.body
      }),
      catchError( (error: any) => {
        console.error(error);
        return throwError(()=> error);
      })
    );
  }
}
