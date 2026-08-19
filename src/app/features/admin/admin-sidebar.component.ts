import { Component, Input, Output, EventEmitter, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'

interface NavItem {
  label: string
  icon: string
  route: string
  exact?: boolean
  badge?: string
}

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  styles: [
    `
      :host {
        display: contents;
      }
      nav.admin-sidebar::-webkit-scrollbar { width: 4px; }
      nav.admin-sidebar::-webkit-scrollbar-track { background: transparent; }
      nav.admin-sidebar::-webkit-scrollbar-thumb {
        background-color: var(--color-outline-variant);
        border-radius: 9999px;
      }
      .nav-active {
        background-color: var(--color-secondary-container);
        color: var(--color-on-secondary-container) !important;
        font-weight: 600;
        transform: translateX(2px);
        box-shadow: 0 1px 4px rgba(0,0,0,0.08);
      }
    `,
  ],
  template: `
    <nav
      class="admin-sidebar fixed inset-y-0 left-0 z-40 flex flex-col overflow-y-auto border-r transition-all duration-300"
      [style.width]="open() ? '280px' : '0px'"
      [style.opacity]="open() ? '1' : '0'"
      [style.visibility]="open() ? 'visible' : 'hidden'"
      style="
        background-color: var(--color-surface);
        border-color: var(--color-outline-variant);
        box-shadow: 2px 0 12px rgba(0,0,0,0.06);
        backdrop-filter: blur(12px);
      "
    >
      <!-- Brand -->
      <div class="flex items-center gap-3 px-6 py-6 mb-2">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
          style="
            background: linear-gradient(135deg, var(--color-primary), var(--color-primary-container));
            border-color: var(--color-outline-variant);
          "
        >
          <span
            class="material-symbols-outlined text-white"
            style="font-size:22px; font-variation-settings:'FILL' 1"
          >security</span>
        </div>
        <div>
          <p class="text-sm font-bold leading-tight" style="color: var(--color-on-surface)">Urban Infrastructure</p>
          <p class="text-[11px]" style="color: var(--color-on-surface-variant)">City Management Portal</p>
        </div>
      </div>

      <!-- New Report CTA -->
      <div class="px-4 mb-4">
        <button
          routerLink="/incident-reporting"
          class="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold shadow-sm transition-all hover:shadow-md active:scale-[0.98]"
          style="background-color: var(--color-primary-container); color: var(--color-on-primary-container)"
        >
          <span class="material-symbols-outlined" style="font-size:18px">add</span>
          New Report
        </button>
      </div>

      <!-- Nav Items -->
      <ul class="flex flex-1 flex-col gap-0.5 px-3 overflow-y-auto">
        @for (item of navItems; track item.route) {
          <li>
            <a
              [routerLink]="item.route"
              routerLinkActive="nav-active"
              [routerLinkActiveOptions]="{ exact: item.exact ?? false }"
              class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 hover:bg-[var(--color-surface-container-high)]"
              style="color: var(--color-on-surface-variant)"
            >
              <span
                class="material-symbols-outlined transition-transform duration-150 group-hover:translate-x-0.5"
                style="font-size:20px"
              >{{ item.icon }}</span>
              <span>{{ item.label }}</span>
              @if (item.badge) {
                <span
                  class="ml-auto rounded-full px-2 py-0.5 text-[10px] font-bold"
                  style="background-color: var(--color-error-container); color: var(--color-error)"
                >{{ item.badge }}</span>
              }
            </a>
          </li>
        }
      </ul>

      <!-- Footer Links -->
      <div
        class="mt-auto border-t px-3 pt-3 pb-2 flex flex-col gap-0.5"
        style="border-color: var(--color-outline-variant)"
      >
        <a
          href="#"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-[var(--color-surface-container-high)]"
          style="color: var(--color-on-surface-variant)"
        >
          <span class="material-symbols-outlined" style="font-size:20px">contact_support</span>
          Support
        </a>
      </div>

      <!-- Hotline Card -->
      <div class="mx-4 mb-5 mt-2 rounded-xl p-3" style="background-color: var(--color-surface-container)">
        <p class="text-xs font-semibold" style="color: var(--color-on-surface)">Tổng đài Phản ánh</p>
        <p class="text-[11px] mt-0.5" style="color: var(--color-on-surface-variant)">Hotline 1022 · 24/7</p>
      </div>
    </nav>
  `,
})
export class AdminSidebarComponent {
  readonly open = signal(true)

  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: 'dashboard', route: '/admin', exact: true },
    { label: 'Incidents', icon: 'report_problem', route: '/admin/incidents', exact: true },
    { label: 'SLAs', icon: 'timer', route: '/slas' },
    { label: 'Escalation Rules', icon: 'trending_up', route: '/escalation-rules' },
    { label: 'Areas', icon: 'location_on', route: '/areas' },
    { label: 'Departments', icon: 'account_balance', route: '/departments' },
    { label: 'Users', icon: 'group', route: '/users' },
    { label: 'Incident Category', icon: 'category', route: '/incident-categories' },
  ]

  toggle(): void {
    this.open.update((v) => !v)
  }
}
