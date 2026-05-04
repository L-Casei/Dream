import { Component, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AsyncPipe, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  private readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  initialMessage = '';
  isSettingsOpen = false;
  isDarkMode$ = this.themeService.isDarkMode$;
  showCookiePopup = this.getInitialCookiePopupState();

  startChat(): void {
    const message = this.initialMessage.trim();

    if (message) {
      this.router.navigate(['/chat'], {
        queryParams: { message }
      });
      return;
    }

    this.router.navigate(['/chat']);
  }

  toggleSettings(): void {
    this.isSettingsOpen = !this.isSettingsOpen;
  }

  toggleTheme(): void {
    this.themeService.toggleTheme();
  }

  acceptCookies(value: 'all' | 'necessary'): void {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('dream-cookie-choice', value);
    }

    this.showCookiePopup = false;
  }

  private getInitialCookiePopupState(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    return !localStorage.getItem('dream-cookie-choice');
  }
}
