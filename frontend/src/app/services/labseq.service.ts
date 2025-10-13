import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface LabSeqResponse {
  index: number;
  value: string;
  calculationTimeMs: number;
  fromCache: boolean;
}

export interface LabSeqError {
  error: string;
  message: string;
  status: number;
}

@Injectable({
  providedIn: 'root'
})
export class LabseqService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  /**
   * Get LabSeq value for a given index
   * @param n The index in the sequence
   * @returns Observable with the LabSeq response
   */
  getLabSeq(n: number): Observable<LabSeqResponse> {
    return this.http.get<LabSeqResponse>(`${this.apiUrl}/labseq/${n}`)
      .pipe(
        retry(1),
        catchError(this.handleError)
      );
  }

  /**
   * Check API health
   * @returns Observable with health status
   */
  checkHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/labseq/health`)
      .pipe(
        catchError(this.handleError)
      );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      } else {
        errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      }
    }
    
    return throwError(() => new Error(errorMessage));
  }
}