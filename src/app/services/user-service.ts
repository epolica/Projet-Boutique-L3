import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { finalize, map, tap } from 'rxjs/operators';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: string;
}

interface AuthResponse {
  user: AuthUser;
  token: string;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private readonly base = 'http://127.0.0.1:8000/api';
  private readonly tokenKey = 'token';
  private readonly userKey = 'auth_user';
  private readonly state$ = new BehaviorSubject<AuthState>(this.readState());

  readonly authStatus$ = this.state$.asObservable(); // Flux pour suivre l'etat d'authentification.
  readonly user$ = this.authStatus$.pipe(map(state => state.user));
  readonly isLoggedIn$ = this.authStatus$.pipe(map(state => !!state.token));
  readonly isAdmin$ = this.authStatus$.pipe(map(state => state.user?.role === 'admin'));
  readonly usersEndpoint = `${this.base}/users`;

  register(payload: { name: string; email: string; password: string; password_confirmation: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, payload);
  }

  login(credentials: { email: string; password: string }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, credentials).pipe(
      tap(response => this.setState(response))
    );
  }

  me(): Observable<AuthResponse['user']> {
    return this.http.get<{ user: AuthResponse['user'] }>(`${this.base}/me`).pipe(
      tap(({ user }) => this.setState({ user, token: this.state$.value.token })),
      map(({ user }) => user)
    );
  }

  updateMe(payload: Partial<{ name: string; email: string }>): Observable<{ user: AuthUser }> {
    return this.http.put<{ user: AuthUser }>(`${this.base}/me`, payload).pipe(
      tap(res => this.setState({ user: res.user, token: this.state$.value.token }))
    );
  }

  changePassword(payload: { current_password: string; new_password: string; new_password_confirmation: string }): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/me/password`, payload);
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/logout`, {}).pipe(
      finalize(() => this.setState(null))
    );
  }

  deleteSelf(): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/me`).pipe(
      finalize(() => this.setState(null))
    );
  }

  requestPasswordReset(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.base}/auth/password/forgot`, { email });
  }

  resetPassword(payload: { token: string; email: string; password: string; password_confirmation: string }): Observable<{ message: string }> {
    // Utilise le token envoye par email pour definir un nouveau mot de passe.
    return this.http.post<{ message: string }>(`${this.base}/auth/password/reset`, payload);
  }

  listUsers(): Observable<AuthUser[]> {
    return this.http.get<AuthUser[]>(this.usersEndpoint);
  }

  createUser(payload: { name: string; email: string; role: string; password?: string }): Observable<{ user: AuthUser }> {
    const body = { ...payload };
    if (!body.password) {
      delete (body as any).password; // Evite de passer une chaine vide qui ferait echouer la validation min:6.
    }
    return this.http.get<{ user: AuthUser }>(this.usersEndpoint);
  }

  updateUser(id: number, payload: Partial<{ name: string; email: string; role: string; password: string }>): Observable<{ user: AuthUser }> {
    const body = { ...payload };
    if (!body.password) {
      delete (body as any).password; // Ne pas envoyer de mot de passe vide.
    }
    return this.http.put<{ user: AuthUser }>(`${this.usersEndpoint}/${id}`, body);
  }

  resetUserPassword(id: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.usersEndpoint}/${id}/password/reset`, {});
  }

  deleteUser(id: number): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.base}/users/${id}`);
  }

  isLoggedIn(): boolean {
    return !!this.state$.value.token;
  }

  currentUser(): AuthUser | null {
    return this.state$.value.user;
  }

  private readState(): AuthState {
    const token = localStorage.getItem(this.tokenKey);
    const userRaw = localStorage.getItem(this.userKey);
    return {
      token,
      user: userRaw ? JSON.parse(userRaw) as AuthUser : null,
    };
  }

  private setState(payload: AuthResponse | AuthState | null): void {
    const nextState: AuthState = payload
      ? { token: payload.token ?? null, user: payload.user ?? null }
      : { token: null, user: null };

    if (nextState.token) {
      localStorage.setItem(this.tokenKey, nextState.token);
    } else {
      localStorage.removeItem(this.tokenKey);
    }

    if (nextState.user) {
      localStorage.setItem(this.userKey, JSON.stringify(nextState.user));
    } else {
      localStorage.removeItem(this.userKey);
    }

    this.state$.next(nextState);
  }
}
