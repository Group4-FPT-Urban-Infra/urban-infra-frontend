import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { AuthStore } from '../../core/auth/auth.store'

@Component({
  selector: 'app-staff-manager-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- SideNavBar (Desktop) -->
    <aside
      class="fixed top-0 left-0 z-40 hidden h-screen w-[280px] flex-col border-r border-[var(--color-outline-variant)] bg-[var(--color-surface)] py-6 shadow-sm md:flex"
    >
      <!-- Header -->
      <div
        class="mb-6 flex items-center gap-3 border-b border-[var(--color-outline-variant)] px-6 pb-4"
      >
        <div
          class="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-container)]"
        >
          <span
            class="material-symbols-outlined text-[var(--color-on-primary-container)]"
            style="font-variation-settings:'FILL' 1; font-size: 24px;"
          >
            location_city
          </span>
        </div>
        <div>
          <a routerLink="/" class="block">
            <h1
              class="text-[20px] font-semibold text-[var(--color-on-surface)]"
              style="line-height: 28px;"
            >
              Urban Infrastructure
            </h1>
          </a>
          <p
            class="text-[12px] text-[var(--color-on-surface-variant)]"
            style="letter-spacing: 0.01em;"
          >
            City Management Portal
          </p>
        </div>
      </div>

      <!-- CTA Button -->
      <div class="mb-4 px-6">
        <button
          class="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary-container)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary-container)] shadow-sm transition-opacity hover:opacity-90"
        >
          <span class="material-symbols-outlined text-[18px]">add</span>
          New Report
        </button>
      </div>

      <!-- Navigation Tabs -->
      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-2 text-[12px]">
        <!-- Home Tab -->
        <a
          routerLink="/staff-manager/dashboard"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined">dashboard</span>
          Home
        </a>

        <!-- Map View Tab -->
        <a
          routerLink="/staff-manager/map"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined">map</span>
          Map View
        </a>

        <!-- Incidents Tab -->
        <a
          routerLink="/staff-manager/incidents"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined">assignment</span>
          Incidents
        </a>

        <!-- SLA & Alert Tab -->
        <a
          routerLink="/staff-manager/sla-alert"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined">warning</span>
          SLA & Alert
        </a>

        <!-- Staffs Tab -->
        <a
          routerLink="/staff-manager/staffs"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined">group</span>
          Staffs
        </a>
      </nav>

      <!-- Footer Tabs -->
      <div
        class="mt-auto flex flex-col gap-1 border-t border-[var(--color-outline-variant)] px-2 pt-4 pb-4"
      >
        <a
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          href="#"
        >
          <span class="material-symbols-outlined">contact_support</span>
          Support
        </a>

        <a
          routerLink="/staff-manager/profile"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <div class="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-container)]">
            @if (authStore.user(); as user) {
              <span class="text-[10px] font-bold text-[var(--color-on-primary-container)]">{{ getInitials(user.fullName) }}</span>
            }
          </div>
          <span class="min-w-0 flex-1 truncate text-[12px]">
            {{ authStore.user()?.fullName ?? 'User Info' }}
          </span>
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
    <aside class="fixed inset-0 z-50 flex md:hidden" [class.hidden]="!mobileMenuOpen">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" (click)="toggleMobileMenu()"></div>

      <!-- Menu Panel -->
      <div class="relative flex h-full w-[280px] flex-col bg-[var(--color-surface)]">
        <!-- Header -->
        <div
          class="mb-6 flex items-center gap-3 border-b border-[var(--color-outline-variant)] px-6 pb-4"
        >
          <div
            class="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-primary-container)]"
          >
            <span
              class="material-symbols-outlined text-[var(--color-on-primary-container)]"
              style="font-variation-settings:'FILL' 1; font-size: 24px;"
            >
              location_city
            </span>
          </div>
          <div>
            <a routerLink="/" class="block">
              <h1
                class="text-[20px] font-semibold text-[var(--color-on-surface)]"
                style="line-height: 28px;"
              >
                Urban Infrastructure
              </h1>
            </a>
            <p class="text-[12px] text-[var(--color-on-surface-variant)]">City Management Portal</p>
          </div>
        </div>

        <!-- CTA Button -->
        <div class="mb-4 px-6">
          <button
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary-container)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary-container)] shadow-sm transition-opacity hover:opacity-90"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
            New Report
          </button>
        </div>

        <!-- Navigation -->
        <nav class="flex flex-1 flex-col gap-1 px-2 text-[12px]">
          <a
            routerLink="/staff-manager/dashboard"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="toggleMobileMenu()"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">dashboard</span>
            Home
          </a>

          <a
            routerLink="/staff-manager/map"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="toggleMobileMenu()"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">map</span>
            Map View
          </a>

          <a
            routerLink="/staff-manager/incidents"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="toggleMobileMenu()"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">assignment</span>
            Incidents
          </a>

          <a
            routerLink="/staff-manager/sla-alert"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="toggleMobileMenu()"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">warning</span>
            SLA & Alert
          </a>

          <a
            routerLink="/staff-manager/staffs"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="toggleMobileMenu()"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">group</span>
            Staffs
          </a>
        </nav>

        <!-- Footer -->
        <div
          class="flex flex-col gap-1 border-t border-[var(--color-outline-variant)] px-2 pt-4 pb-4"
        >
          <a
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
            href="#"
          >
            <span class="material-symbols-outlined">contact_support</span>
            Support
          </a>

          <a
            routerLink="/staff-manager/profile"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="toggleMobileMenu()"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <div class="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-container)]">
              @if (authStore.user(); as user) {
                <span class="text-[10px] font-bold text-[var(--color-on-primary-container)]">{{ getInitials(user.fullName) }}</span>
              }
            </div>
            <span class="min-w-0 flex-1 truncate text-[12px]">
              {{ authStore.user()?.fullName ?? 'User Info' }}
            </span>
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
        font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 24;
      }

      a[routerLinkActive='bg-[var(--color-secondary-container)]'] {
        font-weight: 500;
      }
    `,
  ],
})
export class StaffManagerSidebarComponent {
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

  getInitials(name: string): string {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }
}
