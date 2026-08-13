import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { StaffSidebarComponent } from '../components/staff-sidebar.component'

@Component({
  selector: 'app-staff-layout',
  standalone: true,
  imports: [RouterOutlet, StaffSidebarComponent],
  template: `
    <div class="flex min-h-screen">
      <!-- Sidebar -->
      <app-staff-sidebar></app-staff-sidebar>

      <!-- Main Content -->
      <main class="flex-1 md:ml-[280px] min-h-screen">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class StaffLayoutComponent {}
