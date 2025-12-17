import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService, AuthUser } from '../../services/user-service';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.scss']
})
export class AdminUsers {
  private userService = inject(UserService);
  private fb = inject(FormBuilder);

  users: AuthUser[] = [];
  me = this.userService.currentUser();
  editing: AuthUser | null = null;
  error = '';
  message = '';
  resetLoadingId: number | null = null;

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['customer', Validators.required],
    password: [''],
  });

  ngOnInit(): void {
    this.fetch();
  }

  save(): void {
    if (this.form.invalid) return;
    this.error = '';
    this.message = '';

    const payload = this.form.getRawValue();
    if (!payload.password) {
      delete (payload as any).password; // Ne pas envoyer de mot de passe vide (evite le 422 min:6).
    }
    const request = this.editing
      ? this.userService.updateUser(this.editing.id, payload)
      : this.userService.createUser(payload);

    request.subscribe({
      next: res => {
        this.message = this.editing ? 'Utilisateur mis a jour' : 'Utilisateur cree';
        this.upsertUser(res.user);
        this.resetForm();
      },
      error: err => {
        this.error = err?.error?.message ?? 'Operation impossible';
      },
    });
  }

  edit(user: AuthUser): void {
    this.editing = user;
    this.form.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
      password: '',
    });
  }

  resetForm(): void {
    this.editing = null;
    this.error = '';
    this.message = '';
    this.form.reset({
      name: '',
      email: '',
      role: 'customer',
      password: '',
    });
  }

  sendReset(user: AuthUser): void {
    this.resetLoadingId = user.id;
    this.message = '';
    this.error = '';

    this.userService.resetUserPassword(user.id).subscribe({
      next: res => {
        this.message = res?.message ?? 'Lien de reinitialisation envoye.';
      },
      error: err => {
        this.error = err?.error?.message ?? 'Envoi impossible';
      },
      complete: () => {
        this.resetLoadingId = null;
      },
    });
  }

  remove(id: number): void {
    if (!confirm('Supprimer ce compte ?')) return;
    this.userService.deleteUser(id).subscribe({
      next: () => {
        this.users = this.users.filter(user => user.id !== id);
        if (this.editing?.id === id) this.resetForm();
      },
      error: err => this.error = err?.error?.message ?? 'Suppression impossible',
    });
  }

  private fetch(): void {
    this.userService.listUsers().subscribe({
      next: list => this.users = list,
    });
  }

  private upsertUser(user: AuthUser): void {
    const idx = this.users.findIndex(u => u.id === user.id);
    if (idx === -1) {
      this.users = [user, ...this.users];
    } else {
      const clone = [...this.users];
      clone[idx] = user;
      this.users = clone;
    }
  }
}
