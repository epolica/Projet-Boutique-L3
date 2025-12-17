// services/cart-service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl?: string;
  qty: number;
}

@Injectable({ providedIn:'root' })
export class CartService {
  private storageKey = 'cart_items';
  private couponKey = 'cart_coupon';

  private _items$ = new BehaviorSubject<CartItem[]>(this.readItems());
  private _coupon$ = new BehaviorSubject<{ code: string | null; rate: number }>(this.readCoupon());

  readonly items$ = this._items$.asObservable();
  readonly coupon$ = this._coupon$.asObservable();

  readonly subtotal$ = this.items$.pipe(
    map(items => items.reduce((s, it) => s + it.price * it.qty, 0)) // Somme sans remise.
  );

  readonly total$ = combineLatest([this.subtotal$, this.coupon$]).pipe(
    map(([subtotal, coupon]) => subtotal - subtotal * (coupon.rate || 0)) // Remise appliquee si coupon.
  );

  get snapshot() { return this._items$.value; }
  private get couponSnapshot() { return this._coupon$.value; }

  add(p: { id:number; name:string; price:number; imageUrl?:string }, qty = 1) {
    const items = [...this.snapshot];
    const i = items.findIndex(x => x.id === p.id);
    if (i >= 0) items[i] = { ...items[i], qty: items[i].qty + qty };
    else items.push({ ...p, qty });
    this._items$.next(items);
    this.persistItems();
  }

  updateQty(id: number, qty: number) {
    const items = this.snapshot.map(it => it.id === id ? { ...it, qty: Math.max(1, qty) } : it);
    this._items$.next(items);
    this.persistItems(); // Sauvegarde immediate dans localStorage.
  }

  remove(id: number) {
    this._items$.next(this.snapshot.filter(it => it.id !== id));
    this.persistItems(); // MàJ du stockage apres suppression.
  }

  clear() {
    this._items$.next([]);
    this.persistItems(); // Reset le storage.
  }

  applyCoupon(code: string): boolean {
    const normalized = code.trim().toLowerCase();
    if (normalized === 'noel2025') { // Coupon fixe autorisé : 99% de remise si code exact.
      const coupon = { code: 'noel2025', rate: 0.99 };
      this._coupon$.next(coupon);
      this.persistCoupon();
      return true;
    }
    return false;
  }

  couponValue() {
    return this.couponSnapshot;
  }

  toOrderPayload() {
    const subtotal = this.snapshot.reduce((s, it) => s + it.price * it.qty, 0);
    const discount = subtotal * (this.couponSnapshot.rate || 0);
    const total = subtotal - discount;
    return {
      items: this.snapshot.map(it => ({
        product_id: it.id,
        qty: it.qty,
        unit_price: it.price
      })),
      total,
      coupon: this.couponSnapshot.code,
      discount
    };
  }

  private readItems(): CartItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      return raw ? JSON.parse(raw) as CartItem[] : []; // Rechargement du panier depuis localStorage.
    } catch {
      return [];
    }
  }

  private readCoupon(): { code: string | null; rate: number } {
    try {
      const raw = localStorage.getItem(this.couponKey);
      if (!raw) return { code: null, rate: 0 };
      const parsed = JSON.parse(raw);
      return { code: parsed.code ?? null, rate: parsed.rate ?? 0 }; // Reprise du coupon éventuel.
    } catch {
      return { code: null, rate: 0 };
    }
  }

  private persistItems() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.snapshot)); // Sauvegarde du panier en local.
  }

  private persistCoupon() {
    localStorage.setItem(this.couponKey, JSON.stringify(this.couponSnapshot)); // Sauvegarde du coupon actif.
  }
}
