import { Component, OnDestroy, OnInit, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router'
import { filter } from 'rxjs/operators'
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
      <a
        routerLink="/"
        class="mb-6 flex items-center gap-3 border-b border-[var(--color-outline-variant)] px-6 pb-4"
      >
        <img
          alt="Organization Logo"
          class="h-10 w-10 rounded-lg object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuDn86R_e8YWOqkJO24jUChTDW7DwEUhCYwBQWK5fxoUovNVsCOvLcmWTGNtS6qojHXb36eReCATbrVvaG40KHSjWPOKdtoNmsAKS0f8eI_2K2YMRgigSPtzIRij9K3NbtbVXyUkq2ZxGepeY8BVIDXp9Sqx4NKWmUN87weiiApta2fKBLNIjAdDQuNKlU4sXFhfzwKxLhlBQDl65L0Qm7GHwBI_JpfucKJSOh7X0dRdHG2PU_uLTys"
        />
        <div>
          <h1
            class="text-[20px] font-semibold text-[var(--color-on-surface)]"
            style="line-height: 28px;"
          >
            Urban Infrastructure
          </h1>
          <p
            class="text-[12px] text-[var(--color-on-surface-variant)]"
            style="letter-spacing: 0.01em;"
          >
            City Management Portal
          </p>
        </div>
      </a>

      <!-- CTA Button (Authenticated only) -->
      @if (authStore.isAuthenticated()) {
        <div class="mb-4 px-6">
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
      </nav>

      <!-- Footer Tabs -->
      <div
        class="mt-auto flex flex-col gap-1 border-t border-[var(--color-outline-variant)] px-2 pt-4 pb-4"
      >
        <!-- Role Switcher (for multi-role users) -->
        @if (authStore.isAuthenticated() && hasMultipleRoles()) {
          <div class="rounded-lg px-3 py-2">
            <select
              aria-label="Switch Role"
              [value]="getCurrentDisplayRole()"
              (change)="onRoleChange($event)"
              class="h-8 w-full cursor-pointer rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] px-2 text-xs font-medium text-[var(--color-on-surface)]"
            >
              @for (role of getUserRoles(); track role) {
                <option [value]="role">{{ getRoleDisplayName(role) }}</option>
              }
            </select>
          </div>
        }

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
    <aside class="fixed inset-0 z-50 flex md:hidden" [class.hidden]="!mobileMenuOpen">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50" (click)="toggleMobileMenu()"></div>

      <!-- Menu Panel -->
      <div class="relative flex h-full w-[280px] flex-col bg-[var(--color-surface)]">
        <!-- Header -->
        <div
          class="mb-6 flex items-center gap-3 border-b border-[var(--color-outline-variant)] px-6 pb-4"
        >
          <img
            alt="Organization Logo"
            class="h-10 w-10 rounded-lg object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDn86R_e8YWOqkJO24jUChTDW7DwEUhCYwBQWK5fxoUovNVsCOvLcmWTGNtS6qojHXb36eReCATbrVvaG40KHSjWPOKdtoNmsAKS0f8eI_2K2YMRgigSPtzIRij9K3NbtbVXyUkq2ZxGepeY8BVIDXp9Sqx4NKWmUN87weiiApta2fKBLNIjAdDQuNKlU4sXFhfzwKxLhlBQDl65L0Qm7GHwBI_JpfucKJSOh7X0dRdHG2PU_uLTys"
          />
          <div>
            <h1
              class="text-[20px] font-semibold text-[var(--color-on-surface)]"
              style="line-height: 28px;"
            >
              Urban Infrastructure
            </h1>
            <p class="text-[12px] text-[var(--color-on-surface-variant)]">City Management Portal</p>
          </div>
        </div>

        <!-- CTA Button (Authenticated only) -->
        @if (authStore.isAuthenticated()) {
          <div class="mb-4 px-6">
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
        <div
          class="flex flex-col gap-1 border-t border-[var(--color-outline-variant)] px-2 pt-4 pb-4"
        >
          <!-- Role Switcher (for multi-role users) -->
          @if (authStore.isAuthenticated() && hasMultipleRoles()) {
            <div class="px-3 py-2">
              <select
                aria-label="Switch Role"
                [value]="getCurrentDisplayRole()"
                (change)="onRoleChange($event)"
                class="h-8 w-full cursor-pointer rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-high)] px-2 text-xs font-medium text-[var(--color-on-surface)]"
              >
                @for (role of getUserRoles(); track role) {
                  <option [value]="role">{{ getRoleDisplayName(role) }}</option>
                }
              </select>
            </div>
          }

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
export class CitizenSidebarComponent implements OnInit, OnDestroy {
  protected readonly authStore = inject(AuthStore)
  private readonly router = inject(Router)
  private subscription: any
  mobileMenuOpen = false

  currentDisplayRole = ''

  ngOnInit(): void {
    this.initDisplayRole()

    // Listen to router events to update role on navigation
    this.subscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        this.updateRoleFromUrl()
      })
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe()
    }
  }

  private updateRoleFromUrl(): void {
    const url = this.router.url.toLowerCase()

    if (url.includes('citizen')) {
      this.currentDisplayRole = 'Citizen'
    } else if (url.includes('/admin')) {
      this.currentDisplayRole = 'Admin'
    } else if (url.includes('/staff-manager') || url.includes('/department-manager')) {
      this.currentDisplayRole = 'DepartmentManager'
    } else if (url.includes('/staff')) {
      this.currentDisplayRole = 'DepartmentStaff'
    }
  }

  private initDisplayRole(): void {
    const url = this.router.url.toLowerCase()

    if (url.includes('citizen')) {
      this.currentDisplayRole = 'Citizen'
    } else if (url.includes('/admin')) {
      this.currentDisplayRole = 'Admin'
    } else if (url.includes('/staff-manager') || url.includes('/department-manager')) {
      this.currentDisplayRole = 'DepartmentManager'
    } else if (url.includes('/staff')) {
      this.currentDisplayRole = 'DepartmentStaff'
    } else {
      const user = this.authStore.user()
      if (!user) return

      if (user.roles.includes('Admin')) {
        this.currentDisplayRole = 'Admin'
      } else if (user.roles.includes('DepartmentManager')) {
        this.currentDisplayRole = 'DepartmentManager'
      } else if (user.roles.includes('DepartmentStaff')) {
        this.currentDisplayRole = 'DepartmentStaff'
      } else {
        this.currentDisplayRole = 'Citizen'
      }
    }
  }

  hasMultipleRoles(): boolean {
    const user = this.authStore.user()
    if (!user) return false
    return user.roles.length > 1
  }

  getUserRoles(): string[] {
    const user = this.authStore.user()
    if (!user) return []

    const priorityOrder = ['Admin', 'DepartmentManager', 'DepartmentStaff', 'Citizen']
    return priorityOrder.filter((role) => user.roles.includes(role))
  }

  getCurrentDisplayRole(): string {
    return this.currentDisplayRole
  }

  getRoleDisplayName(role: string): string {
    const roleNames: Record<string, string> = {
      Admin: 'Quản trị viên',
      DepartmentManager: 'Trưởng phòng',
      DepartmentStaff: 'Nhân viên',
      Citizen: 'Công dân',
    }
    return roleNames[role] || role
  }

  onRoleChange(event: Event): void {
    const newRole = (event.target as HTMLSelectElement).value
    this.currentDisplayRole = newRole
    this.navigateToDashboard(newRole)
  }

  private navigateToDashboard(role: string): void {
    switch (role) {
      case 'Admin':
        void this.router.navigate(['/admin'])
        break
      case 'DepartmentManager':
        void this.router.navigate(['/staff-manager/dashboard'])
        break
      case 'DepartmentStaff':
        void this.router.navigate(['/staff/dashboard'])
        break
      case 'Citizen':
      default:
        void this.router.navigate(['/citizen/dashboard'])
        break
    }
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false
  }

  logout(): void {
    this.authStore.logout()
    this.router.navigate(['/'])
  }
}
