import { Component, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { HeaderComponent } from './header.component'
import { SidebarComponent } from './sidebar.component'

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, SidebarComponent],
  template: `
    <div class="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <!-- Header -->
      <app-header
        [sidebarCollapsed]="sidebarCollapsed()"
        (toggleSidebar)="toggleSidebar()"
      ></app-header>

      <div class="flex">
        <!-- Sidebar Navigation -->
        <app-sidebar [collapsed]="sidebarCollapsed()"></app-sidebar>

        <!-- Main Content Area -->
        <main
          [class.pl-64]="!sidebarCollapsed()"
          [class.pl-20]="sidebarCollapsed()"
          class="min-h-[calc(100vh-4rem)] flex-1 p-4 transition-all duration-300 sm:p-6 lg:p-8"
        >
          <div class="mx-auto max-w-7xl">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>
  `,
})
export class AppLayoutComponent {
  readonly sidebarCollapsed = signal<boolean>(false)

  toggleSidebar(): void {
    this.sidebarCollapsed.update((val) => !val)
  }
}
