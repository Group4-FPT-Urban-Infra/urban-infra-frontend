import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'
import { AuthStore } from '../../core/auth/auth.store'

@Component({
  selector: 'app-citizen-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- SideNavBar (Desktop) -->
    <aside
      class="fixed top-0 left-0 z-40 hidden h-screen w-[280px] flex-col border-r border-[var(--color-outline-variant)] bg-[var(--color-surface)] py-6 shadow-sm md:flex"
    >
      <!-- Header -->
      <div class="mb-6 flex items-center gap-3 px-6 pb-4 border-b border-[var(--color-outline-variant)]">
        <img
          alt="Organization Logo"
          class="h-10 w-10 rounded-lg object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDn86R_e8YWOqkJO24jUChTDW7DwEUhCYwBQWK5fxoUovNVsCOvLcmWTGNtS6qojHXb36eReCATbrVvaG40KHSjWPOKdtoNmsAKS0f8eI_2K2YMRgigSPtzIRij9K3NbtbVXyUkq2ZxGepeY8BVIDXp9Sqx4NKWmUN87weiiApta2fKBLNIjAdDQuNKlU4sXFhfzwKxLhlBQDl65L0Qm7GHwBI_JpfucKJSOh7X0dRdHG2PU_uLTys"
        />
        <div>
          <h1 class="text-[20px] font-semibold text-[var(--color-on-surface)]" style="line-height: 28px;">
            Urban Infrastructure
          </h1>
          <p class="text-[12px] text-[var(--color-on-surface-variant)]" style="letter-spacing: 0.01em;">
            City Management Portal
          </p>
        </div>
      </div>

      <!-- CTA Button (Authenticated only) -->
      @if (authStore.isAuthenticated()) {
        <div class="px-6 mb-4">
          <a
            routerLink="/incident-reporting"
            class="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary-container)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary-container)] shadow-sm transition-opacity hover:opacity-90"
          >
            <span class="material-symbols-outlined text-[18px]">add</span>
            New Report
          </a>
        </div>
      }

      <!-- Navigation Tabs -->
      <nav class="flex flex-1 flex-col gap-1 overflow-y-auto px-2 text-[12px]">
        @if (authStore.isAuthenticated()) {
          <!-- Home Tab (Authenticated only) -->
          <a
            routerLink="/citizen/dashboard"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">dashboard</span>
            Home
          </a>
        }

        <!-- Map View Tab -->
        <a
          routerLink="/citizen/map"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined">map</span>
          Map View
        </a>

        <!-- Reports Tab -->
        <a
          routerLink="/citizen/reports"
          routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
          [routerLinkActiveOptions]="{ exact: true }"
          class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
        >
          <span class="material-symbols-outlined">assignment</span>
          Reports
        </a>

        <!-- Analytics Tab (Authenticated only) -->
        @if (authStore.isAuthenticated()) {
          <a
            routerLink="/reports-analytics"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">leaderboard</span>
            Analytics
          </a>
        }
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

        @if (authStore.isAuthenticated()) {
          <a
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-error)] transition-all hover:bg-[var(--color-error-container)]"
            (click)="logout()"
            role="button"
          >
            <span class="material-symbols-outlined">logout</span>
            Logout
          </a>
        } @else {
          <a
            routerLink="/login"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">login</span>
            Sign In
          </a>
        }
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
          <img
            alt="Organization Logo"
            class="h-10 w-10 rounded-lg object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDn86R_e8YWOqkJO24jUChTDW7DwEUhCYwBQWK5fxoUovNVsCOvLcmWTGNtS6qojHXb36eReCATbrVvaG40KHSjWPOKdtoNmsAKS0f8eI_2K2YMRgigSPtzIRij9K3NbtbVXyUkq2ZxGepeY8BVIDXp9Sqx4NKWmUN87weiiApta2fKBLNIjAdDQuNKlU4sXFhfzwKxLhlBQDl65L0Qm7GHwBI_JpfucKJSOh7X0dRdHG2PU_uLTys"
          />
          <div>
            <h1 class="text-[20px] font-semibold text-[var(--color-on-surface)]" style="line-height: 28px;">
              Urban Infrastructure
            </h1>
            <p class="text-[12px] text-[var(--color-on-surface-variant)]">City Management Portal</p>
          </div>
        </div>

        <!-- CTA Button (Authenticated only) -->
        @if (authStore.isAuthenticated()) {
          <div class="px-6 mb-4">
            <a
              routerLink="/incident-reporting"
              (click)="toggleMobileMenu()"
              class="flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary-container)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary-container)] shadow-sm transition-opacity hover:opacity-90"
            >
              <span class="material-symbols-outlined text-[18px]">add</span>
              New Report
            </a>
          </div>
        }

        <!-- Navigation -->
        <nav class="flex flex-1 flex-col gap-1 px-2 text-[12px]">
          @if (authStore.isAuthenticated()) {
            <a
              routerLink="/citizen/dashboard"
              routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
              [routerLinkActiveOptions]="{ exact: true }"
              (click)="toggleMobileMenu()"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
            >
              <span class="material-symbols-outlined">dashboard</span>
              Home
            </a>
          }

          <a
            routerLink="/citizen/map"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="toggleMobileMenu()"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">map</span>
            Map View
          </a>

          <a
            routerLink="/citizen/reports"
            routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
            [routerLinkActiveOptions]="{ exact: true }"
            (click)="toggleMobileMenu()"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">assignment</span>
            Reports
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

          @if (authStore.isAuthenticated()) {
            <a
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-error)] transition-all hover:bg-[var(--color-error-container)]"
              (click)="logout()"
              role="button"
            >
              <span class="material-symbols-outlined">logout</span>
              Logout
            </a>
          } @else {
            <a
              routerLink="/login"
              routerLinkActive="bg-[var(--color-secondary-container)] text-[var(--color-on-secondary-container)]"
              (click)="toggleMobileMenu()"
              class="flex items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
            >
              <span class="material-symbols-outlined">login</span>
              Sign In
            </a>
          }
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
export class CitizenSidebarComponent {
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
