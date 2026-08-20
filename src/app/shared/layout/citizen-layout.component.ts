import { Component } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { CitizenSidebarComponent } from '../components/citizen-sidebar.component'

@Component({
  selector: 'app-citizen-layout',
  standalone: true,
  imports: [RouterOutlet, CitizenSidebarComponent],
  template: `
    <div class="flex min-h-screen">
      <!-- Sidebar -->
      <app-citizen-sidebar></app-citizen-sidebar>

      <!-- Main Content -->
      <main class="flex-1 md:ml-[280px] min-h-screen">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
})
export class CitizenLayoutComponent {}
