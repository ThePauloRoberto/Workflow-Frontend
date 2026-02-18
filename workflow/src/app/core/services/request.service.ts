import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

export interface RequestFilter {
  status?: string;      // "PENDING", "APPROVED", "REJECTED"
  category?: string;
  priority?: string;    // "Low", "Medium", "High"
  search?: string;
  createdBy?: string;
  page?: number;
  pageSize?: number;
  orderBy?: string;     // "created_at", "title", etc
  orderDirection?: string; // "asc" ou "desc"
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

@Injectable({
  providedIn: 'root'
})
export class RequestService {
  private apiUrl = `https://localhost:7151/api/Request`; // Singular, como na doc

  constructor(private http: HttpClient) {}

 getRequests(filter: RequestFilter = {}): Observable<PaginatedResponse<any>> {
  let params = new HttpParams();

  // FILTROS - com os nomes que a API espera
  if (filter.status) params = params.set('Status', filter.status); // Primeira letra maiúscula
  if (filter.category) params = params.set('Category', filter.category);
  if (filter.priority) params = params.set('Priority', filter.priority);
  if (filter.search) params = params.set('Search', filter.search);
  if (filter.createdBy) params = params.set('CreatedBy', filter.createdBy);

  // PAGINAÇÃO
  if (filter.page) params = params.set('Page', filter.page.toString());
  if (filter.pageSize) params = params.set('PageSize', filter.pageSize.toString());

  // ORDENAÇÃO - com primeira letra maiúscula
  if (filter.orderBy) {
    // Converte "created_at" para "Created_at" (primeira letra maiúscula)
    const orderByFormatted = filter.orderBy.charAt(0).toUpperCase() + filter.orderBy.slice(1);
    params = params.set('OrderBy', orderByFormatted);
  }
  if (filter.orderDirection) params = params.set('OrderDirection', filter.orderDirection);


  return this.http.get<any>(this.apiUrl, { params }).pipe(
    map(response => {
      const items = response.result || response.items || response || [];
      const totalCount = response.totalCount || items.length;
      const totalPages = response.totalPages || Math.ceil(totalCount / (filter.pageSize || 10));

      return {
        items: items,
        totalCount: totalCount,
        page: filter.page || 1,
        pageSize: filter.pageSize || 10,
        totalPages: totalPages
      };
    })
  );
}

 createRequest(request: any): Observable<any> {
  return this.http.post<any>(this.apiUrl, request).pipe(
    map(response => {
      return response.result || response;
    })
  );
}

  getRequestById(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<any>(url).pipe(
      map(response => {
        return response.result || response;
      })
    );
  }

  // ENDPOINT DE APROVAR - PATCH /api/Request/{id}/Approved
  approveRequest(id: string, rejected_By?: string): Observable<any> {
    const url = `${this.apiUrl}/${id}/Approved`;
    // Body pode ser vazio ou conter rejected_By (opcional)
    const body = rejected_By ? { rejected_By } : {};
    return this.http.patch<any>(url, body).pipe(
      map(response => response.result || response)
    );
  }

  // ENDPOINT DE REJEITAR - PATCH /api/Request/{id}/reject
  rejectApprovedRequest(id: string, reason: string, rejected_By?: string): Observable<any> {
  const url = `${this.apiUrl}/${id}/reject`; // Mesmo endpoint de rejeitar

  const body: any = { reason };
  if (rejected_By) {
    body.rejectedBy = rejected_By;
  }

  return this.http.patch<any>(url, body).pipe(
    map(response => response.result || response)
  );
}

  // Histórico por requestId
  getRequestHistory(requestId: string): Observable<any[]> {
    const url = `https://localhost:7151/api/RequestHistory/request/${requestId}`;

  return this.http.get<any>(url).pipe(
    map(response => {
      // A API retorna { message, data } - precisamos extrair o data
      if (response?.data && Array.isArray(response.data)) {
        return response.data; // Retorna o array de histórico
      }

      // Se veio como array direto
      if (Array.isArray(response)) {
        return response;
      }

      // Se veio como { result } (outro formato)
      if (response?.result && Array.isArray(response.result)) {
        return response.result;
      }

      // Se veio vazio ou formato diferente
      return [];
    }),
    catchError(error => {
      if (error.status === 404) {
        return of([]);
      }
      return of([]);
    })
  );
  }
}
