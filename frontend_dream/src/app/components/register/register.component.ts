import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [AsyncPipe, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {

  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  isDarkMode$ = this.themeService.isDarkMode$;

  isSettingsOpen = false;

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  acceptTerms = false;

  showPassword = false;
  showConfirmPassword = false;

  errorMessage = '';

  get canSubmit(): boolean {
    return Boolean(
      this.name.trim() &&
      this.email.trim() &&
      this.password &&
      this.confirmPassword &&
      this.acceptTerms
    );
  }

  get passwordStrength(): 'Baja' | 'Media' | 'Alta' {
    const score = [
      this.password.length >= 8,
      /[A-Z]/.test(this.password),
      /[0-9]/.test(this.password),
      /[^A-Za-z0-9]/.test(this.password)
    ].filter(Boolean).length;

    if (score >= 3) {
      return 'Alta';
    }

    if (score >= 2) {
      return 'Media';
    }

    return 'Baja';
  }

  register(): void {
    const cleanName = this.name.trim();
    const cleanEmail = this.email.trim();

    if (!cleanName || !cleanEmail || !this.password || !this.confirmPassword) {
      this.errorMessage = 'Completa todos los campos.';
      return;
    }

    if (!this.isValidEmail(cleanEmail)) {
      this.errorMessage = 'Introduce un email valido.';
      return;
    }

    if (this.password.length < 6) {
      this.errorMessage = 'La contraseña debe tener al menos 6 caracteres.';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Las contraseñas no coinciden.';
      return;
    }

    if (!this.acceptTerms) {
      this.errorMessage = 'Debes aceptar los terminos para crear la cuenta.';
      return;
    }

    this.errorMessage = '';

    // De momento no hay backend de registro.
    // Cuando tengas AuthService, aqui ira la llamada real al backend.
    console.log('Register:', {
      name: cleanName,
      email: cleanEmail,
      password: this.password
    });

    this.router.navigate(['/chat']);
  }

  toggleSettings(): void {
    this.isSettingsOpen = !this.isSettingsOpen;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

}
