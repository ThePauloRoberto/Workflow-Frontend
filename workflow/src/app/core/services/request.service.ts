import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';
import { RequestFilter } from '../models/utils/Request-filter';
import { PaginatedResponse } from '../models/utils/PaginatedResponse';

@Injectable({
  providedIn: 'root',
})
export class RequestService {
  private apiUrl = `https://localhost:7151/api/Request`;

  constructor(private http: HttpClient) {}

  getRequests(filter: RequestFilter = {}): Observable<PaginatedResponse<any>> {
    let params = new HttpParams();

    if (filter.status) params = params.set('Status', filter.status);
    if (filter.category) params = params.set('Category', filter.category);
    if (filter.priority) params = params.set('Priority', filter.priority);
    if (filter.search) params = params.set('Search', filter.search);
    if (filter.createdBy) params = params.set('CreatedBy', filter.createdBy);

    if (filter.page) params = params.set('Page', filter.page.toString());
    if (filter.pageSize)
      params = params.set('PageSize', filter.pageSize.toString());

    if (filter.orderBy) {
      const orderByMap: { [key: string]: string } = {
        created_at: 'Created_at',
        title: 'Title',
        priority: 'Priority',
        status: 'Status',
      };

      const orderByFormatted = orderByMap[filter.orderBy] || filter.orderBy;
      params = params.set('OrderBy', orderByFormatted);
    }

    if (filter.orderDirection) {
      params = params.set('OrderDirection', filter.orderDirection);
    }
    return this.http
      .get<any>(this.apiUrl, {
        params,
        withCredentials: true,
      })
      .pipe(
        map((response) => {
          const items = response.result || response.items || response || [];
          const totalCount = response.totalCount || items.length;
          const totalPages =
            response.totalPages ||
            Math.ceil(totalCount / (filter.pageSize || 10));

          return {
            items: items,
            totalCount: totalCount,
            page: filter.page || 1,
            pageSize: filter.pageSize || 10,
            totalPages: totalPages,
          };
        }),
      );
  }

  createRequest(request: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, request).pipe(
      map((response) => {
        return response.result || response;
      }),
    );
  }

  getRequestById(id: string): Observable<any> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<any>(url).pipe(
      map((response) => {
        return response.result || response;
      }),
    );
  }

  approveRequest(id: string, rejected_By?: string): Observable<any> {
    const url = `${this.apiUrl}/${id}/Approved`;
    const body = rejected_By ? { rejected_By } : {};
    return this.http
      .patch<any>(url, body)
      .pipe(map((response) => response.result || response));
  }

  rejectApprovedRequest(
    id: string,
    reason: string,
    rejected_By?: string,
  ): Observable<any> {
    const url = `${this.apiUrl}/${id}/reject`;
    const body: any = { reason };
    if (rejected_By) {
      body.rejectedBy = rejected_By;
    }

    return this.http
      .patch<any>(url, body)
      .pipe(map((response) => response.result || response));
  }

  getRequestHistory(requestId: string): Observable<any[]> {
    const url = `https://localhost:7151/api/RequestHistory/request/${requestId}`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        if (response?.data && Array.isArray(response.data)) {
          return response.data;
        }

        if (Array.isArray(response)) {
          return response;
        }

        if (response?.result && Array.isArray(response.result)) {
          return response.result;
        }

        return [];
      }),
      catchError((error) => {
        if (error.status === 404) {
          return of([]);
        }
        return of([]);
      }),
    );
  }
}
