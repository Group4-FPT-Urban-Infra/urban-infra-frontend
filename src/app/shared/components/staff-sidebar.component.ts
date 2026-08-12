import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { AuthStore } from '../../core/auth/auth.store'

@Component({
  selector: 'app-staff-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- SideNavBar (Desktop) -->
    <aside
      class="fixed top-0 left-0 z-40 hidden h-screen w-[280px] flex-col border-r border-[var(--color-outline-variant)] bg-[var(--color-surface)] py-6 shadow-sm md:flex"
    >
      <!-- Header -->
      <div class="mb-6 flex items-center gap-3 px-6 pb-4 border-b border-[var(--color-outline-variant)]">
        <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-container)]">
          <span class="material-symbols-outlined text-[var(--color-on-primary-container)]" style="font-variation-settings:'FILL' 1; font-size: 24px;">
            location_city
          </span>
        </div>
        <div>
          <h1 class="text-[20px] font-semibold text-[var(--color-on-surface)]" style="line-height: 28px;">
            Urban Infrastructure
          </h1>
          <p class="text-[12px] text-[var(--color-on-surface-variant)]" style="letter-spacing: 0.01em;">
            City Management Portal
          </p>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="px-6 mb-4">
        <button
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-primary)]/90"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          New Report
        </button>
      </div>

      <!-- Navigation Tabs -->
      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-2 text-[12px]">
        <!-- Home Tab -->
        <a
          routerLink="/staff/dashboard"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined">dashboard</span>
          Home
        </a>

        <!-- Map View Tab -->
        <a
          routerLink="/staff/map"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined">map</span>
          Map View
        </a>

        <!-- Incidents Tab -->
        <a
          routerLink="/staff/incidents"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined">assignment</span>
          Incidents
        </a>

        <!-- Analytics Tab -->
        <a
          routerLink="/staff/analytics"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined">leaderboard</span>
          Analytics
        </a>

        <!-- Departments Tab -->
        <a
          routerLink="/staff/departments"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined">account_balance</span>
          Departments
        </a>

        <!-- Settings Tab -->
        <a
          routerLink="/staff/settings"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined">settings</span>
          Settings
        </a>
      </nav>

      <!-- Footer Tabs -->
      <div class="mt-auto flex flex-col gap-1 border-t border-[var(--color-outline-variant)] px-2 pt-4 pb-4">
        <a
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          href="#"
        >
          <span class="material-symbols-outlined">contact_support</span>
          Support
        </a>

        <a
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-error)] transition-all hover:bg-[var(--color-error-container)]"
          (click)="logout()"
          role="button"
        >
          <span class="material-symbols-outlined">logout</span>
          Logout
        </a>
      </div>
    </aside>

    <!-- Mobile Sidebar (Overlay) -->
    <aside
      class="fixed inset-0 z-50 flex md:hidden"
      [class.hidden]="!mobileMenuOpen"
    >
      <!-- Backdrop -->
      <div
        class="absolute inset-0 bg-black/50"
        (click)="toggleMobileMenu()"
      ></div>

      <!-- Menu Panel -->
      <div
        class="relative flex w-[280px] flex-col bg-[var(--color-surface)] h-full"
      >
        <!-- Header -->
        <div class="mb-6 flex items-center gap-3 px-6 pb-4 border-b border-[var(--color-outline-variant)]">
          <div class="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-container)]">
            <span class="material-symbols-outlined text-[var(--color-on-primary-container)]" style="font-variation-settings:'FILL' 1; font-size: 24px;">
              location_city
            </span>
          </div>
          <div>
            <h1 class="text-[20px] font-semibold text-[var(--color-on-surface)]" style="line-height: 28px;">
              Urban Infrastructure
            </h1>
            <p class="text-[12px] text-[var(--color-on-surface-variant)]">City Management Portal</p>
          </div>
        </div>

        <!-- CTA Button -->
        <div class="px-6 mb-4">
          <button
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-primary)]/90"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
            New Report
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex flex-1 flex-col gap-1 px-2 text-[12px]">
          <a
            routerLink="/staff/dashboard"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="toggleMobileMenu()"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">dashboard</span>
            Home
          </a>

          <a
            routerLink="/staff/map"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="toggleMobileMenu()"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">map</span>
            Map View
          </a>

          <a
            routerLink="/staff/incidents"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="toggleMobileMenu()"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">assignment</span>
            Incidents
          </a>
        </nav>

        <!-- Footer -->
        <div class="flex flex-col gap-1 border-t border-[var(--color-outline-variant)] px-2 pt-4 pb-4">
          <a
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
            href="#"
          >
            <span class="material-symbols-outlined">contact_support</span>
            Support
          </a>

          <a
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-error)] transition-all hover:bg-[var(--color-error-container)]"
            (click)="logout()"
            role="button"
          >
            <span class="material-symbols-outlined">logout</span>
            Logout
          </a>
        </div>
      </div>
    </aside>
  `,
  styles: [
    `
      :host {
        display: contents;
      }

      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }

      a[routerLinkActive="bg-[var(--color-secondary-container)]"] {
        font-weight: 500;
      }
    `,
  ],
})
export class StaffSidebarComponent {
  protected readonly authStore = inject(AuthStore)
  mobileMenuOpen = false

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false
  }

  logout(): void {
    this.authStore.logout()
    this.closeMobileMenu()
  }
}
