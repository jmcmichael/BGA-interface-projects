import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';
import { Process } from '../../core/models/process.model';
import { ApiStartResponse, ApiProcessesResponse, ApiMeta } from '../../core/models/api-responses.model';

@Injectable()
export class ProcessService {
  private API_PATH = 'http://localhost:4200/api/v1';

  constructor(private http: HttpClient) { }

  query(): Observable<ApiProcessesResponse> {
    return this.http
      .get<ApiProcessesResponse>(`${this.API_PATH}/processes`);
    // .pipe(map(result => result as ApiProcessesResponse));
  }

  get(id): Observable<Process> {
    return this.http
      .get<Process>(`${this.API_PATH}/processes/${id}`)
      .pipe(map(process => process || null));
  }

  archive(id): Observable<string> {
    return this.http
      .get<string>(`${this.API_PATH}/archive/${id}`)
      .pipe(map(message => message || null));
  }

  start(processParameters: any): Observable<ApiStartResponse> {
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    }

    return this.http.post(`${this.API_PATH}/staging`, processParameters, httpOptions)
      .map((res) => res as ApiStartResponse);
  }

  // archive(id: number): Observable<string> {
  //   return this.http.get(`${this.api}/archive/${id}`)
  //     .map((response: Response) => {
  //       return response.statusText;
  //     });
  // }
}
