import { Component, ViewChild } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { StaffSidebarComponent } from '../components/staff-sidebar.component'

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [RouterOutlet, StaffSidebarComponent],
  template: `
    <div class="flex min-h-screen">
      <!-- Sidebar -->
      <app-staff-sidebar #sidebar></app-staff-sidebar>

      <!-- Main Content -->
      <main class="flex-1 md:ml-[280px] min-h-screen">
        <!-- Mobile Header -->
        <header
          class="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-[var(--color-outline-variant)] bg-[var(--color-surface)] px-4 md:hidden"
        >
          <button
            (click)="sidebar.toggleMobileMenu()"
            class="flex h-10 w-10 items-center justify-center rounded-lg text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-container-high)]"
          >
            <span class="material-symbols-outlined">menu</span>
          </button>
          <div class="flex items-center gap-2">
            <span
              class="material-symbols-outlined text-[var(--color-primary)]"
              style="font-variation-settings:'FILL' 1;"
            >
              location_city
            </span>
            <span class="font-semibold text-[var(--color-on-surface)]">Urban Infrastructure</span>
          </div>
        </header>

        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [
    `
      .material-symbols-outlined {
        font-variation-settings:
          'FILL' 0,
          'wght' 400,
          'GRAD' 0,
          'opsz' 24;
      }
    `,
  ],
})
export class StaffLayoutComponent {
  @ViewChild('sidebar') sidebar!: StaffSidebarComponent
}
