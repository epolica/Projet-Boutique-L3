import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user-service';
import { NavbarComponent } from '../../navbar/navbar';

function matchPassword(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password')?.value;
  const confirm = control.get('confirm')?.value;
  return password && confirm && password !== confirm ? { mismatch: true } : null;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './signup.html',
  styleUrls: ['./signup.scss']
})
export class SignupComponent {
  private fb = inject(FormBuilder);
  private user = inject(UserService);
  private router = inject(Router);

  error = '';
  loading = false;
  resetLoading = false;
  resetMessage = '';
  resetError = '';

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    passwords: this.fb.nonNullable.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required],
    }, { validators: matchPassword }),
  });

  resetForm = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
  });

  get f() {
    return this.form.controls;
  }

  get pw() {
    return this.form.controls.passwords;
  }

  get resetEmail() {
    return this.resetForm.controls.email;
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const value = this.form.getRawValue();
    const payload = {
      name: value.name,
      email: value.email,
      password: value.passwords.password,
      password_confirmation: value.passwords.confirm,
    };

    this.user.register(payload).subscribe({
      next: () => this.router.navigate(['/login']),
      error: err => {
        console.log('REGISTER ERROR', err.status, err.error);
        this.error = err.error?.errors
          ? Object.values(err.error.errors).flat().join(' ')
        : err.error?.message ?? 'Inscription refusee';
      },
    });
  }

  sendResetLink(): void {
    if (this.resetForm.invalid || this.resetLoading) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.resetLoading = true;
    this.resetMessage = '';
    this.resetError = '';

    const email = this.resetForm.controls.email.value;

    this.user.requestPasswordReset(email).subscribe({
      next: res => {
        this.resetMessage = res?.message ?? 'Si ce compte existe, un email a ete envoye.';
      },
      error: err => {
        this.resetError = err?.error?.message ?? 'Impossible denvoyer le lien.';
      },
      complete: () => {
        this.resetLoading = false;
      },
    });
  }
}
