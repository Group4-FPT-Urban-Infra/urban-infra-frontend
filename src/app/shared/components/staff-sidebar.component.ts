import { Component, inject } from '@angular/core'
import { CommonModule } from '@angular/common'
import { Router, RouterLink, RouterLinkActive } from '@angular/router'
import { AuthStore } from '../../core/auth/auth.store'

@Component({
  selector: 'app-staff-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <!-- 
      Sidebar is hidden on mobile (screens smaller than 'md') and becomes a fixed column on larger screens.
      This works with the 'md:ml-[280px]' class in the StaffLayoutComponent.
      A full mobile-first responsive sidebar with a hamburger menu can be implemented later.
    -->
    <aside
      class="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-[280px] z-10 bg-white dark:bg-gray-800 border-r dark:border-gray-700"
    >
      <div class="flex h-full flex-col">
        <!-- Logo -->
        <div class="flex h-16 shrink-0 items-center border-b px-6 dark:border-gray-700">
          <a routerLink="/" class="flex items-center gap-2 text-lg font-semibold text-gray-800 dark:text-white">
            <span class="material-symbols-outlined text-blue-600 dark:text-blue-400">apartment</span>
            <span>Urban Infra</span>
          </a>
        </div>

        <!-- Navigation -->
        <nav class="flex-1 space-y-1 overflow-y-auto p-4">
          <a
            routerLink="/staff/dashboard"
            routerLinkActive="bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
            [routerLinkActiveOptions]="{ exact: true }"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span class="material-symbols-outlined">dashboard</span>
            <span>Dashboard</span>
          </a>
          <a
            routerLink="/staff/map"
            routerLinkActive="bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span class="material-symbols-outlined">map</span>
            <span>Map</span>
          </a>
          <a
            routerLink="/staff/incidents"
            routerLinkActive="bg-gray-100 text-blue-600 dark:bg-gray-700 dark:text-blue-400"
            class="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          >
            <span class="material-symbols-outlined">assignment</span>
            <span>Incidents</span>
          </a>
        </nav>

        <!-- User/Logout section -->
        <div class="mt-auto border-t p-4 dark:border-gray-700">
          <div class="flex items-center gap-3">
            <div class="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
              <span class="material-symbols-outlined text-gray-500 dark:text-gray-400">person</span>
            </div>
            @if (authStore.user(); as user) {
            <div class="flex-1 overflow-hidden">
              <p class="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{{ user.fullName }}</p>
              <p class="text-xs text-gray-500 dark:text-gray-400">{{ user.roles.join(', ') }}</p>
            </div>
            }
            <button (click)="logout()" title="Logout" class="ml-auto text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-500">
              <span class="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  `,
})
export class StaffSidebarComponent {
  readonly authStore = inject(AuthStore)
  private readonly router = inject(Router)

  logout(): void {
    this.authStore.logout()
    this.router.navigate(['/login'])
  }
}