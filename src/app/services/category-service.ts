import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private readonly base = 'http://127.0.0.1:8000/api';

  list(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.base}/categories`);
  }

  create(data: { name: string }): Observable<Category> {
    return this.http.post<Category>(`${this.base}/categories`, data);
  }

  update(id: number, data: { name: string }): Observable<Category> {
    return this.http.put<Category>(`${this.base}/categories/${id}`, data);
  }

  remove(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/categories/${id}`);
  }
}
