import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(this.getInitialIsDarkMode());
  private transitionTimeout?: ReturnType<typeof setTimeout>;
  isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    this.setTheme(this.isDarkMode.getValue());
  }

  setTheme(isDark: boolean): void {
    this.isDarkMode.next(isDark);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }

    if (typeof document === 'undefined') {
      return;
    }

    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');

    // Aplicar clase al body
    if (isDark) {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
  }

  public toggleTheme(): void {
    const current = this.isDarkMode.getValue();
    this.playThemeTransition();
    this.setTheme(!current);
  }

  private playThemeTransition(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.body.classList.remove('theme-switching');
    void document.body.offsetWidth;
    document.body.classList.add('theme-switching');

    clearTimeout(this.transitionTimeout);
    this.transitionTimeout = setTimeout(() => {
      document.body.classList.remove('theme-switching');
    }, 900);
  }

  private getInitialIsDarkMode(): boolean {
    if (typeof localStorage === 'undefined') {
      return false;
    }

    return localStorage.getItem('theme') === 'dark';
  }
}
