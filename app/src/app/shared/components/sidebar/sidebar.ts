import { Component, HostListener } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent {
  isMobile = false;
  isOpen = false;

  menuItems = [
    { path: '/dashboard/home', icon: '🏠', label: 'Home' },
    { path: '/dashboard/catalog', icon: '📋', label: 'Catálogo' },
    { path: '/dashboard/cards', icon: '💳', label: 'Mis Tarjetas' },
    { path: '/dashboard/transactions', icon: '📊', label: 'Mis Transacciones' }
  ];

  constructor(private authService: AuthService, private router: Router) {
    this.checkScreenSize();
  }

  @HostListener('window:resize', [])
  checkScreenSize(): void {
    this.isMobile = window.innerWidth < 768;
    if (!this.isMobile) {
      this.isOpen = true;
    } else {
      this.isOpen = false;
    }
  }

  toggleSidebar(): void {
    this.isOpen = !this.isOpen;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
