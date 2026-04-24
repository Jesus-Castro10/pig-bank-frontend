import { User } from './../../../model/user';
import { Component, HostListener, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-sidebar',
  standalone: false,
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.scss',
})
export class SidebarComponent implements OnInit {
  isMobile = false;
  isOpen = false;
  user$!: Observable<User | null>;
  isUserMenuOpen = false;

  menuItems = [
    { path: '/dashboard/home', icon: '🏠', label: 'Home' },
    { path: '/dashboard/catalog', icon: '📋', label: 'Catálogo' },
    { path: '/dashboard/cards', icon: '💳', label: 'Mis Tarjetas' }
  ];

  constructor(private authService: AuthService, private router: Router) {
    this.checkScreenSize();
  }

  ngOnInit(): void {
    this.user$ = this.authService.getCurrentUser();
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

  @HostListener('document:click', ['$event'])
  handleClickOutside(event: Event): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.user-info')) {
      this.isUserMenuOpen = false;
    }
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;

    this.isOpen = !this.isOpen;

    if (!this.isOpen) {
      this.isUserMenuOpen = false;
    }
  }

  goToProfile(): void {
    this.router.navigate(['/dashboard/profile']);
    this.isUserMenuOpen = false;
  }
}
