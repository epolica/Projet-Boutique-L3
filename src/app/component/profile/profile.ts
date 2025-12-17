import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar';
import { UserService } from '../../services/user-service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class ProfileComponent {
  private user = inject(UserService);
  private fb = inject(FormBuilder);

  loadingProfile = false;
  loadingPassword = false;
  profileMessage = '';
  profileError = '';
  passwordMessage = '';
  passwordError = '';

  profileForm = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
  });

  passwordForm = this.fb.nonNullable.group({
    current_password: ['', Validators.required],
    new_password: ['', [Validators.required, Validators.minLength(6)]],
    new_password_confirmation: ['', [Validators.required]],
  });

  ngOnInit(): void {
    const current = this.user.currentUser();
    if (current) {
      this.profileForm.patchValue({ name: current.name, email: current.email });
    } else {
      this.user.me().subscribe({
        next: user => this.profileForm.patchValue({ name: user.name, email: user.email }),
      });
    }
  }

  saveProfile(): void {
    if (this.profileForm.invalid || this.loadingProfile) return;
    this.loadingProfile = true;
    this.profileMessage = '';
    this.profileError = '';

    this.user.updateMe(this.profileForm.getRawValue()).subscribe({
      next: res => {
        this.profileMessage = 'Profil mis a jour';
        this.user.me().subscribe(); // rafraichit localement si besoin.
      },
      error: err => {
        this.profileError = err?.error?.message ?? 'Mise a jour impossible';
      },
      complete: () => {
        this.loadingProfile = false;
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid || this.loadingPassword) return;
    this.loadingPassword = true;
    this.passwordMessage = '';
    this.passwordError = '';

    const payload = this.passwordForm.getRawValue();
    this.user.changePassword(payload).subscribe({
      next: res => {
        this.passwordMessage = res?.message ?? 'Mot de passe mis a jour';
        this.passwordForm.reset({
          current_password: '',
          new_password: '',
          new_password_confirmation: '',
        });
      },
      error: err => {
        this.passwordError = err?.error?.message ?? 'Changement impossible';
      },
      complete: () => {
        this.loadingPassword = false;
      },
    });
  }
}
