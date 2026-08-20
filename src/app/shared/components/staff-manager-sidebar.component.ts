import { Component, ElementRef, HostListener, OnDestroy, OnInit, inject, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router'
import { filter } from 'rxjs/operators'
import { AuthStore } from '../../core/auth/auth.store'
import { NotificationService } from '../../core/services/notification.service'
import { NotificationItem } from '../../core/models/notification.model'
import { AppDatePipe } from '../pipes/app-date.pipe'

@Component({
  selector: 'app-staff-manager-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, AppDatePipe],
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

      <!-- Notifications Bell -->
      <div class="mb-2 px-4">
        <div class="relative">
          <button
            (click)="toggleNotificationsDropdown()"
            class="relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[var(--color-on-surface-variant)] transition-all hover:bg-[var(--color-surface-container-high)]"
            title="Notifications"
            type="button"
          >
            <span class="material-symbols-outlined text-[18px]">notifications</span>
            <span class="text-[12px]">Notifications</span>
            @if (unreadNotifications().length > 0) {
              <span class="absolute left-6 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] font-bold text-white shadow">
                {{ unreadNotifications().length > 99 ? '99+' : unreadNotifications().length }}
              </span>
            }
          </button>

          @if (showDropdown()) {
            <div class="absolute left-0 right-0 top-full mt-1 z-50 rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] shadow-xl overflow-hidden">
              <div class="flex items-center justify-between border-b border-[var(--color-outline-variant)] px-3 py-2 bg-[var(--color-surface-container)]">
                <span class="text-xs font-semibold text-[var(--color-on-surface)]">Thông báo</span>
                <div class="flex items-center gap-1">
                  <button (click)="openNotificationModal()" class="p-1 rounded-full text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]/50 transition-colors" title="Xem tất cả" type="button">
                    <span class="material-symbols-outlined text-sm">open_in_new</span>
                  </button>
                  @if (unreadNotifications().length > 0) {
                    <button (click)="markAllAsRead()" class="text-[10px] text-[var(--color-primary)] hover:underline font-medium">Đánh dấu tất cả đã đọc</button>
                  }
                </div>
              </div>
              <div class="max-h-60 overflow-y-auto">
                @if (unreadNotifications().length === 0) {
                  <div class="p-4 text-center text-xs text-[var(--color-on-surface-variant)]">
                    <span class="material-symbols-outlined text-2xl mb-1 text-[var(--color-outline)]">notifications_off</span>
                    <p>Không có thông báo chưa đọc</p>
                  </div>
                } @else {
                  @for (item of unreadNotifications(); track item.id) {
                    <div (click)="openNotification(item)" class="cursor-pointer px-3 py-2.5 hover:bg-[var(--color-surface-variant)]/30 transition-colors flex gap-2 items-start group border-b border-[var(--color-outline-variant)]/30 last:border-b-0">
                      <div class="mt-0.5 shrink-0">
                        @if (item.notificationType === 'ESCALATION') {
                          <span class="material-symbols-outlined text-amber-500 text-base">warning</span>
                        } @else if (item.notificationType === 'ASSIGNMENT') {
                          <span class="material-symbols-outlined text-blue-500 text-base">assignment_ind</span>
                        } @else {
                          <span class="material-symbols-outlined text-emerald-500 text-base">info</span>
                        }
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="text-[11px] font-semibold text-[var(--color-on-surface)] truncate">{{ item.title }}</p>
                        <p class="text-[10px] text-[var(--color-on-surface-variant)] mt-0.5 leading-snug line-clamp-2">{{ item.message }}</p>
                        <span class="text-[9px] text-[var(--color-outline)] mt-0.5 block">{{ item.createdAt | appDate: 'short' }}</span>
                      </div>
                      <button (click)="markAsRead(item.id, $event)" class="shrink-0 text-[var(--color-outline)] hover:text-[var(--color-primary)] p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <span class="material-symbols-outlined text-sm">check_circle</span>
                      </button>
                    </div>
                  }
                }
              </div>
            </div>
          }
        </div>
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
            <div
              class="flex h-6 w-6 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-primary-container)]"
            >
              @if (authStore.user(); as user) {
                <span class="text-[10px] font-bold text-[var(--color-on-primary-container)]">{{
                  getInitials(user.fullName)
                }}</span>
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

    <!-- Notifications Full Modal -->
    @if (showNotificationModal()) {
      <div class="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" (click)="closeNotificationModal()">
        <div class="relative flex flex-col w-full max-w-lg max-h-[80vh] rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface)] shadow-2xl overflow-hidden" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between border-b border-[var(--color-outline-variant)] px-5 py-4 bg-[var(--color-surface-container)] shrink-0">
            <div class="flex items-center gap-3">
              <span class="material-symbols-outlined text-[var(--color-primary)] text-2xl">notifications</span>
              <div>
                <h2 class="text-base font-semibold text-[var(--color-on-surface)]">Thông báo</h2>
                <p class="text-xs text-[var(--color-on-surface-variant)] mt-0.5">{{ modalNotifications().length }} thông báo</p>
              </div>
            </div>
            <div class="flex items-center gap-2">
              @if (unreadNotifications().length > 0) {
                <button (click)="markAllAsRead()" class="text-xs text-[var(--color-primary)] hover:underline font-medium">Đánh dấu tất cả đã đọc</button>
              }
              <button (click)="closeNotificationModal()" class="p-1.5 rounded-full text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-variant)]/50 transition-colors" type="button">
                <span class="material-symbols-outlined text-xl">close</span>
              </button>
            </div>
          </div>

          <div class="flex items-center gap-1 px-4 py-2 border-b border-[var(--color-outline-variant)]/50 shrink-0 bg-[var(--color-surface)]">
            <button (click)="onFilterChange('all')" class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              [class.bg-[var(--color-primary-container)]]="notificationFilter() === 'all'"
              [class.text-[var(--color-on-primary-container)]]="notificationFilter() === 'all'"
              [class.text-[var(--color-on-surface-variant)]]="notificationFilter() !== 'all'">
              Tất cả
            </button>
            <button (click)="onFilterChange('unread')" class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              [class.bg-[var(--color-primary-container)]]="notificationFilter() === 'unread'"
              [class.text-[var(--color-on-primary-container)]]="notificationFilter() === 'unread'"
              [class.text-[var(--color-on-surface-variant)]]="notificationFilter() !== 'unread'">
              Chưa đọc
            </button>
            <button (click)="onFilterChange('read')" class="px-3 py-1 rounded-full text-xs font-medium transition-colors"
              [class.bg-[var(--color-primary-container)]]="notificationFilter() === 'read'"
              [class.text-[var(--color-on-primary-container)]]="notificationFilter() === 'read'"
              [class.text-[var(--color-on-surface-variant)]]="notificationFilter() !== 'read'">
              Đã đọc
            </button>
          </div>

          <div class="flex-1 overflow-y-auto">
            @if (modalNotifications().length === 0) {
              <div class="flex flex-col items-center justify-center py-16 text-center">
                <span class="material-symbols-outlined text-5xl mb-3 text-[var(--color-outline)]">notifications_off</span>
                <p class="text-sm font-medium text-[var(--color-on-surface-variant)]">Không có thông báo</p>
                <p class="text-xs text-[var(--color-outline)] mt-1">
                  @if (notificationFilter() === 'unread') { Chưa có thông báo chưa đọc }
                  @else if (notificationFilter() === 'read') { Chưa có thông báo đã đọc }
                  @else { Danh sách thông báo trống }
                </p>
              </div>
            } @else {
              @for (item of modalNotifications(); track item.id) {
                <div (click)="openNotification(item)" class="cursor-pointer p-4 hover:bg-[var(--color-surface-variant)]/30 transition-colors flex gap-3 items-start group border-b border-[var(--color-outline-variant)]/30"
                  [class.opacity-50]="item.isRead">
                  <div class="mt-0.5 shrink-0">
                    @if (item.notificationType === 'ESCALATION') {
                      <span class="material-symbols-outlined text-amber-500 text-xl">warning</span>
                    } @else if (item.notificationType === 'ASSIGNMENT') {
                      <span class="material-symbols-outlined text-blue-500 text-xl">assignment_ind</span>
                    } @else {
                      <span class="material-symbols-outlined text-emerald-500 text-xl">info</span>
                    }
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-sm font-semibold text-[var(--color-on-surface)] truncate">{{ item.title }}</p>
                    <p class="text-xs text-[var(--color-on-surface-variant)] mt-0.5 leading-snug line-clamp-2">{{ item.message }}</p>
                    <div class="flex items-center gap-2 mt-1.5">
                      <span class="text-[10px] text-[var(--color-outline)]">{{ item.createdAt | appDate: 'short' }}</span>
                      @if (item.isRead) {
                        <span class="text-[10px] text-[var(--color-outline)] flex items-center gap-0.5">
                          <span class="material-symbols-outlined text-[10px]">check_circle</span> Đã đọc
                        </span>
                      }
                    </div>
                  </div>
                  <button (click)="markAsRead(item.id, $event)" class="shrink-0 text-[var(--color-outline)] hover:text-[var(--color-primary)] p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" title="Đánh dấu đã đọc" type="button">
                    <span class="material-symbols-outlined text-lg">check_circle</span>
                  </button>
                </div>
              }
            }
          </div>
        </div>
      </div>
    }
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
export class StaffManagerSidebarComponent implements OnInit, OnDestroy {
  protected readonly authStore = inject(AuthStore)
  private readonly notificationService = inject(NotificationService)
  private readonly elementRef = inject(ElementRef)
  private readonly router = inject(Router)
  private subscription: any
  mobileMenuOpen = false

  currentDisplayRole = ''

  readonly unreadNotifications = signal<NotificationItem[]>([])
  readonly modalNotifications = signal<NotificationItem[]>([])
  readonly showDropdown = signal<boolean>(false)
  readonly showNotificationModal = signal<boolean>(false)
  readonly notificationFilter = signal<'all' | 'unread' | 'read'>('all')

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.showDropdown.set(false)
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.showNotificationModal.set(false)
  }

  ngOnInit(): void {
    this.initDisplayRole()
    if (this.authStore.isAuthenticated()) {
      this.loadUnreadNotifications()
    }

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

  loadUnreadNotifications(): void {
    const userId = this.authStore.user()?.id
    this.notificationService.getUnreadNotifications(userId).subscribe({
      next: (items) => this.unreadNotifications.set(items || []),
      error: () => this.unreadNotifications.set([]),
    })
  }

  loadModalNotifications(filter: 'all' | 'unread' | 'read'): void {
    const userId = this.authStore.user()?.id
    if (filter === 'unread') {
      this.notificationService.getUnreadNotifications(userId).subscribe({
        next: (items) => this.modalNotifications.set(items || []),
        error: () => this.modalNotifications.set([]),
      })
    } else if (filter === 'read') {
      this.notificationService.getReadNotifications(userId).subscribe({
        next: (items) => this.modalNotifications.set(items || []),
        error: () => this.modalNotifications.set([]),
      })
    } else {
      this.notificationService.getAllNotifications(userId).subscribe({
        next: (items) => this.modalNotifications.set(items || []),
        error: () => this.modalNotifications.set([]),
      })
    }
  }

  toggleNotificationsDropdown(): void {
    this.showDropdown.update((v) => !v)
  }

  markAsRead(id: number, event: Event): void {
    event.stopPropagation()
    const userId = this.authStore.user()?.id
    this.notificationService.markAsRead(id, userId).subscribe({
      next: () => {
        this.unreadNotifications.update((list) => list.filter((n) => n.id !== id))
        this.modalNotifications.update((list) => list.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
      },
    })
  }

  openNotification(item: NotificationItem): void {
    const userId = this.authStore.user()?.id
    this.notificationService.markAsRead(item.id, userId).subscribe({
      next: () => {
        this.unreadNotifications.update((list) => list.filter((n) => n.id !== item.id))
        this.modalNotifications.update((list) => list.map((n) => (n.id === item.id ? { ...n, isRead: true } : n)))
      },
    })
    this.showDropdown.set(false)
    this.showNotificationModal.set(false)
    if (item.issueId) void this.router.navigate(['/citizen/reports', item.issueId])
  }

  openNotificationModal(): void {
    this.showNotificationModal.set(true)
    this.showDropdown.set(false)
    this.loadModalNotifications('all')
  }

  onFilterChange(filter: 'all' | 'unread' | 'read'): void {
    this.notificationFilter.set(filter)
    this.loadModalNotifications(filter)
  }

  closeNotificationModal(): void {
    this.showNotificationModal.set(false)
  }

  markAllAsRead(): void {
    const userId = this.authStore.user()?.id
    this.notificationService.markAllAsRead(userId).subscribe({
      next: () => {
        this.unreadNotifications.set([])
        this.modalNotifications.update((list) => list.map((n) => ({ ...n, isRead: true })))
      },
    })
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

  getInitials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase()
  }
}
