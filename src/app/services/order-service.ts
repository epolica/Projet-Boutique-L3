import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthUser } from './user-service';

interface OrderPayload {
  items: { product_id: number; qty: number; unit_price: number }[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class OrderService {
  private http = inject(HttpClient);
  private readonly base = 'http://127.0.0.1:8000/api';

  create(payload: OrderPayload): Observable<any> {
    return this.http.post(`${this.base}/orders`, payload);
  }

  listAll(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/orders`);
  }

  listMine(): Observable<any[]> {
    return this.http.get<any[]>(`${this.base}/orders/me`);
  }
}
