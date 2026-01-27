import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkMode = new BehaviorSubject<boolean>(true);
  isDarkMode$ = this.isDarkMode.asObservable();

  constructor() {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved) {
        this.setTheme(saved === 'dark');
      }
    }
  }

  setTheme(isDark: boolean): void {
    this.isDarkMode.next(isDark);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }


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
    this.setTheme(!current);
  }
}