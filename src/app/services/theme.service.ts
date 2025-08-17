import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'breakThrough-theme';
  private readonly isDarkModeSubject = new BehaviorSubject<boolean>(false);

  // Observable that components can subscribe to for theme changes
  isDarkMode$ = this.isDarkModeSubject.asObservable();

  constructor() {
    this.initializeTheme();
  }

  private initializeTheme(): void {
    // Check localStorage for saved theme preference
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    
    // If no saved theme, check system preference
    const prefersDark = savedTheme 
      ? savedTheme === 'dark'
      : window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    this.setTheme(prefersDark, false); // Don't save during initialization
  }

  toggleTheme(): void {
    const newTheme = !this.isDarkModeSubject.value;
    this.setTheme(newTheme, true);
  }

  setTheme(isDark: boolean, save: boolean = true): void {
    this.isDarkModeSubject.next(isDark);
    
    // Apply theme to document body
    document.body.classList.toggle('dark', isDark);
    
    // Save to localStorage if requested
    if (save) {
      localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
    }
  }

  getCurrentTheme(): boolean {
    return this.isDarkModeSubject.value;
  }

  // Listen for system theme changes
  listenToSystemTheme(): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    mediaQuery.addEventListener('change', (e) => {
      // Only update if user hasn't manually set a preference
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      if (!savedTheme) {
        this.setTheme(e.matches, false);
      }
    });
  }
}
