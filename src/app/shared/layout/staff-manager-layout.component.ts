import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { StaffManagerSidebarComponent } from '../components/staff-manager-sidebar.component'

@Component({
  selector: 'app-staff-manager-layout',
  standalone: true,
  imports: [RouterOutlet, StaffManagerSidebarComponent],
  template: `
    <div class="flex min-h-screen">
      <!-- Sidebar -->
      <app-staff-manager-sidebar></app-staff-manager-sidebar>

      <!-- Main Content -->
      <main class="flex-1 md:ml-[280px] min-h-screen">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class StaffManagerLayoutComponent {}
