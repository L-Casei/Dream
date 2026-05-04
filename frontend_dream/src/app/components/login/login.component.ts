import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [AsyncPipe, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {

  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  isDarkMode$ = this.themeService.isDarkMode$;

  isSettingsOpen = false;
  email = '';
  password = '';
  rememberSession = true;
  showPassword = false;

  errorMessage = '';

  login(): void {
    const cleanEmail = this.email.trim();

    if (!cleanEmail || !this.password) {
      this.errorMessage = 'Introduce tu email y contraseña.';
      return;
    }

    if (!this.isValidEmail(cleanEmail)) {
      this.errorMessage = 'Introduce un email válido.';
      return;
    }

    this.errorMessage = '';

    // De momento no hay backend de auth.
    // Cuando tengas AuthService, aquí llamarás al login real.
    console.log('Login:', {
      email: cleanEmail,
      password: this.password,
      rememberSession: this.rememberSession
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

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

}