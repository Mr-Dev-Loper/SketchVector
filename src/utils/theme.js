// Theme manager
export class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('theme') || 'dark';
    this.apply();
  }
  
  toggle() {
    this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    localStorage.setItem('theme', this.currentTheme);
    this.apply();
    return this.currentTheme;
  }
  
  setTheme(theme) {
    this.currentTheme = theme;
    localStorage.setItem('theme', this.currentTheme);
    this.apply();
  }
  
  apply() {
    document.documentElement.setAttribute('data-theme', this.currentTheme);
  }
  
  getTheme() {
    return this.currentTheme;
  }
}