import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { map } from 'rxjs/operators';
import { CartService } from '../services/cart-service';
import { UserService } from '../services/user-service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <header class="nav">
      <a routerLink="/" class="brand">Boutique</a>
      <nav class="links">
        <a routerLink="/">Home</a>
        <a routerLink="/cart">Panier <span class="badge">{{ count$ | async }}</span></a>
        <a routerLink="/admin" *ngIf="admin$ | async">Administration</a>
        <a routerLink="/profile" *ngIf="connected$ | async">Profil</a>
        <a routerLink="/login" *ngIf="!(connected$ | async)">Connexion</a>
        <a routerLink="/signup" *ngIf="!(connected$ | async)">Inscription</a>
        <button type="button" class="logout" *ngIf="connected$ | async" (click)="logout()">Deconnexion</button>
        <button type="button" class="delete-self" *ngIf="connected$ | async" (click)="deleteAccount()">Supprimer mon compte</button>
      </nav>
    </header>
  `,
  styles: [`
    .nav{display:flex;justify-content:space-between;align-items:center;padding:.75rem 1rem;border-bottom:1px solid #eee}
    .links{display:flex;align-items:center}
    .links a{margin-left:1rem}
    .badge{margin-left:.35rem;padding:.1rem .45rem;border-radius:1rem;background:#4e73df;color:#fff;font-size:.8rem}
    .logout{margin-left:1rem;background:none;border:none;color:#007bff;cursor:pointer;padding:0;font:inherit}
    .logout:hover{text-decoration:underline}
    .delete-self{margin-left:1rem;border:1px solid #dc3545;background:#fff;color:#dc3545;padding:.25rem .6rem;border-radius:4px;cursor:pointer}
  `]
})
export class NavbarComponent {
  private cart = inject(CartService);
  private user = inject(UserService);
  private router = inject(Router);

  readonly count$ = this.cart.items$.pipe(map(list => list.length)); // Nombre d'articles dans le panier.
  readonly connected$ = this.user.isLoggedIn$;
  readonly admin$ = this.user.isAdmin$;

  logout(): void {
    this.user.logout().subscribe({
      next: () => this.router.navigate(['/']),
      error: err => {
        console.error('Erreur deconnexion', err);
        this.router.navigate(['/']);
      }
    });
  }

  deleteAccount(): void {
    if (!confirm('Supprimer definitivement votre compte ?')) return;
    this.user.deleteSelf().subscribe({
      next: () => this.router.navigate(['/']),
      error: err => console.error('Suppression impossible', err),
    });
  }
}
