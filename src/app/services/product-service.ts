import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from './category-service';

export interface Product {
  id: number;
  name: string;
  title: string;
  description: string | null;
  price: number;
  stock: number;
  image: string | null;
  category_id: number | null;
  categories?: Category[];
}

type ProductPayload = Omit<Partial<Product>, 'categories'> & { categories?: number[] };

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private readonly base = 'http://127.0.0.1:8000/api';

  list(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/products`);
  }

  getAll(): Observable<Product[]> {
    return this.list();
  }

  getByCategory(id: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.base}/categories/${id}/products`);
  }

  get(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.base}/products/${id}`);
  }

  create(dto: ProductPayload): Observable<Product> {
    return this.http.post<Product>(`${this.base}/products`, dto);
  }

  update(id: number, dto: ProductPayload): Observable<Product> {
    return this.http.put<Product>(`${this.base}/products/${id}`, dto);
  }

  remove(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/products/${id}`);
  }
}
