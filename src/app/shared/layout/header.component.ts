import { Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterLink, RouterLinkActive } from '@angular/router'
import { AuthStore } from '../../core/auth/auth.store'
import { TranslateService } from '@ngx-translate/core'
import { NotificationService } from '../../core/services/notification.service'
import { NotificationItem } from '../../core/models/notification.model'

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  styles: [
    `
      .nav-link-active {
        color: var(--color-primary);
        border-bottom: 2px solid var(--color-primary);
        padding-bottom: 2px;
      }
    `,
  ],
  template: `
    <nav
      class="sticky top-0 z-50 flex w-full items-center justify-between border-b border-[var(--color-outline-variant)] bg-[var(--color-surface)]/80 px-6 py-2 backdrop-blur-xl shadow-sm"
    >
      <!-- Left: Brand + Search -->
      <div class="flex items-center gap-6">
        <!-- Brand -->
        <div class="flex items-center gap-2">
          <span
            class="material-symbols-outlined text-[var(--color-primary)]"
            style="font-variation-settings:'FILL' 1; font-size:28px"
            aria-hidden="true"
            >security</span
          >
          <span class="text-xl font-bold tracking-tight text-[var(--color-primary)]"
            >CivicShield</span
          >
        </div>

        <!-- Search (desktop) -->
        <div
          class="hidden items-center gap-2 rounded-full border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] px-4 py-1.5 transition-colors focus-within:border-[var(--color-primary)] md:flex"
        >
          <span
            class="material-symbols-outlined text-[20px] text-[var(--color-outline)]"
            aria-hidden="true"
            >search</span
          >
          <input
            type="text"
            placeholder="Search incidents..."
            class="w-56 border-none bg-transparent text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] focus:outline-none focus:ring-0"
          />
        </div>
      </div>

      <!-- Center: Nav links (desktop) - Dashboard Tabs -->
      <div class="hidden items-center gap-6 md:flex">

        @switch (getUserRole()) {
          @case ('DepartmentStaff') {
            <!-- Staff Dashboard -->
            <a
              routerLink="/staff/dashboard"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Staff Dashboard
            </a>
            <a
              routerLink="/staff/map"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Map View
            </a>
            <a
              routerLink="/staff/incidents"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Incidents
            </a>
          }
          @case ('DepartmentManager') {
            <!-- Staff Manager Dashboard -->
            <a
              routerLink="/staff-manager/dashboard"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Manager Dashboard
            </a>
            <a
              routerLink="/staff-manager/map"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Map View
            </a>
            <a
              routerLink="/staff-manager/incidents"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Incidents
            </a>
            <a
              routerLink="/staff-manager/sla-alert"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              SLA & Alert
            </a>
            <a
              routerLink="/staff-manager/staffs"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Staffs
            </a>
          }
          @case ('Admin') {
            <!-- Admin Dashboard -->
            <a
              routerLink="/admin"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Admin Dashboard
            </a>
          }
          @default {
            <!-- Citizen Dashboard (default) -->
            <a
              routerLink="/citizen/dashboard"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Dashboard
            </a>
            <a
              routerLink="/citizen/map"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Map View
            </a>
            <a
              routerLink="/citizen/reports"
              routerLinkActive="nav-link-active"
              [routerLinkActiveOptions]="{ exact: true }"
              class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
            >
              Incidents
            </a>
          }
        }

        @if (store.isAuthenticated()) {
          <a
            routerLink="/incident-reporting"
            routerLinkActive="nav-link-active"
            class="pb-1 text-sm text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-on-surface)]"
          >
            Report Issue
          </a>
        }
      </div>

      <!-- Right: Actions + Avatar -->
      <div class="flex items-center gap-2 relative">
        <!-- Notifications -->
        <div class="relative">
          <button
            (click)="toggleNotificationsDropdown()"
            class="relative rounded-full p-2 text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50 focus:outline-none"
            title="Notifications"
            type="button"
          >
            <span class="material-symbols-outlined text-[22px]" aria-hidden="true"
              >notifications</span
            >
            @if (unreadNotifications().length > 0) {
              <span
                class="absolute top-1 right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white shadow"
              >
                {{ unreadNotifications().length > 99 ? '99+' : unreadNotifications().length }}
              </span>
            }
          </button>

          <!-- Notifications Dropdown Panel -->
          @if (showDropdown()) {
            <div
              class="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] shadow-xl z-50 overflow-hidden"
            >
              <!-- Header -->
              <div class="flex items-center justify-between border-b border-[var(--color-outline-variant)] px-4 py-3 bg-[var(--color-surface-container)]">
                <div class="flex items-center gap-2">
                  <span class="font-semibold text-sm text-[var(--color-on-surface)]">Thông báo</span>
                  @if (unreadNotifications().length > 0) {
                    <span class="rounded-full bg-[var(--color-primary-container)] px-2 py-0.5 text-xs font-medium text-[var(--color-on-primary-container)]">
                      {{ unreadNotifications().length }} mới
                    </span>
                  }
                </div>
                @if (unreadNotifications().length > 0) {
                  <button
                    (click)="markAllAsRead()"
                    class="text-xs text-[var(--color-primary)] hover:underline font-medium"
                    type="button"
                  >
                    Đánh dấu tất cả đã đọc
                  </button>
                }
              </div>

              <!-- List -->
              <div class="max-h-80 overflow-y-auto divide-y divide-[var(--color-outline-variant)]/50">
                @if (unreadNotifications().length === 0) {
                  <div class="p-6 text-center text-sm text-[var(--color-on-surface-variant)]">
                    <span class="material-symbols-outlined text-3xl mb-1 text-[var(--color-outline)]">notifications_off</span>
                    <p>Không có thông báo chưa đọc</p>
                  </div>
                } @else {
                  @for (item of unreadNotifications(); track item.id) {
                    <div class="p-3 hover:bg-[var(--color-surface-variant)]/30 transition-colors flex gap-3 items-start group">
                      <div class="mt-0.5">
                        @if (item.notificationType === 'ESCALATION') {
                          <span class="material-symbols-outlined text-amber-500 text-xl">warning</span>
                        } @else if (item.notificationType === 'ASSIGNMENT') {
                          <span class="material-symbols-outlined text-blue-500 text-xl">assignment_ind</span>
                        } @else {
                          <span class="material-symbols-outlined text-emerald-500 text-xl">info</span>
                        }
                      </div>

                      <div class="flex-1 min-w-0">
                        <p class="text-xs font-semibold text-[var(--color-on-surface)] truncate">{{ item.title }}</p>
                        <p class="text-xs text-[var(--color-on-surface-variant)] mt-0.5 leading-snug line-clamp-2">{{ item.message }}</p>
                        <span class="text-[10px] text-[var(--color-outline)] mt-1 block">
                          {{ item.createdAt | date: 'short' }}
                        </span>
                      </div>

                      <button
                        (click)="markAsRead(item.id, $event)"
                        class="text-[var(--color-outline)] hover:text-[var(--color-primary)] p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Đánh dấu đã đọc"
                        type="button"
                      >
                        <span class="material-symbols-outlined text-base">check_circle</span>
                      </button>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>

        <!-- Help -->
        <button
          class="hidden rounded-full p-2 text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50 sm:block"
          title="Help"
          type="button"
        >
          <span class="material-symbols-outlined text-[22px]" aria-hidden="true"
            >help_outline</span
          >
        </button>

        <!-- Language Selector -->
        <select
          aria-label="Language"
          [value]="translate.getCurrentLang()"
          (change)="onLocaleChange($event)"
          class="hidden h-8 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] px-2 text-xs font-medium text-[var(--color-on-surface)] sm:block"
        >
          @for (l of locales; track l) {
            <option [value]="l">{{ l.toUpperCase() }}</option>
          }
        </select>

        <!-- Avatar + Logout -->
        <div class="flex items-center gap-2 border-l border-[var(--color-outline-variant)] pl-3 ml-1">
          @if (store.isAuthenticated()) {
            <div
              class="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full border border-[var(--color-outline-variant)]"
            >
              <div
                class="flex h-full w-full items-center justify-center bg-[var(--color-primary-fixed)] text-xs font-bold text-[var(--color-primary)]"
              >
                {{ getUserInitials() }}
              </div>
            </div>

            <div class="hidden text-left lg:block">
              <p class="text-xs font-semibold text-[var(--color-on-surface)]">
                {{ store.user()?.fullName || 'Admin User' }}
              </p>
            </div>

            <!-- Logout -->
            <button
              (click)="logout()"
              title="Logout"
              class="inline-flex h-8 items-center gap-1 rounded-lg border border-[var(--color-outline-variant)] px-2 text-xs text-[var(--color-on-surface-variant)] transition-colors hover:border-[var(--color-error)] hover:bg-[var(--color-error-container)] hover:text-[var(--color-on-error-container)]"
            >
              <span class="material-symbols-outlined text-[16px]" aria-hidden="true">logout</span>
              <span class="hidden sm:inline">Sign out</span>
            </button>
          } @else {
            <!-- Login/Register for guests -->
            <a
              routerLink="/login"
              class="inline-flex h-8 items-center gap-1 rounded-lg bg-[var(--color-primary)] px-4 text-xs font-medium text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary)]/90"
            >
              Sign In
            </a>
          }
        </div>

        <!-- Sidebar toggle (mobile) -->
        <button
          (click)="toggleSidebar.emit()"
          type="button"
          class="ml-1 rounded-lg p-2 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] md:hidden"
          title="Toggle menu"
        >
          <span class="material-symbols-outlined text-[22px]" aria-hidden="true">menu</span>
        </button>
      </div>
    </nav>
  `,
})
export class HeaderComponent implements OnInit {
  @Input() sidebarCollapsed = false
  @Output() toggleSidebar = new EventEmitter<void>()

  protected readonly store = inject(AuthStore)
  protected readonly translate = inject(TranslateService)
  private readonly notificationService = inject(NotificationService)
  private readonly router = inject(Router)
  private readonly elementRef = inject(ElementRef)

  protected readonly locales = ['en', 'vi']
  readonly unreadNotifications = signal<NotificationItem[]>([])
  readonly showDropdown = signal<boolean>(false)

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown.set(false)
    }
  }

  ngOnInit(): void {
    this.loadUnreadNotifications()
  }

  loadUnreadNotifications(): void {
    const userId = this.store.user()?.id
    this.notificationService.getUnreadNotifications(userId).subscribe({
      next: (items) => this.unreadNotifications.set(items || []),
      error: () => this.unreadNotifications.set([]),
    })
  }

  toggleNotificationsDropdown(): void {
    this.showDropdown.update((v) => !v)
  }

  markAsRead(id: number, event: Event): void {
    event.stopPropagation()
    const userId = this.store.user()?.id
    this.notificationService.markAsRead(id, userId).subscribe({
      next: () => {
        this.unreadNotifications.update((list) => list.filter((n) => n.id !== id))
      },
    })
  }

  markAllAsRead(): void {
    const userId = this.store.user()?.id
    this.notificationService.markAllAsRead(userId).subscribe({
      next: () => {
        this.unreadNotifications.set([])
      },
    })
  }

  getUserRole(): string {
    const user = this.store.user()
    if (!user) return 'Citizen'
    
    // Check roles array for role match
    if (user.roles.includes('DepartmentManager')) return 'DepartmentManager'
    if (user.roles.includes('DepartmentStaff')) return 'DepartmentStaff'
    if (user.roles.includes('Admin')) return 'Admin'
    
    return 'Citizen'
  }

  onLocaleChange(event: Event): void {
    const lang = (event.target as HTMLSelectElement).value
    this.translate.use(lang)
    localStorage.setItem('app.locale', lang)
    document.documentElement.lang = lang
  }

  getUserInitials(): string {
    const name = this.store.user()?.fullName || 'Admin User'
    return name
      .split(' ')
      .map((n: string) => n[0])
      .slice(-2)
      .join('')
      .toUpperCase()
  }

  logout(): void {
    this.store.logout()
    void this.router.navigate(['/login'])
  }

  goToDashboard(event: Event): void {
    event.preventDefault()
    if (this.store.isAdmin()) {
      void this.router.navigate(['/admin'])
    }
  }
}
