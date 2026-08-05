import { Component, signal } from '@angular/core'
import { RouterOutlet } from '@angular/router'
import { HeaderComponent } from './header.component'

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent],
  template: `
    <div
      class="flex min-h-screen flex-col"
      style="background-color: var(--color-background); color: var(--color-on-background);"
    >
      <!-- CivicShield Top NavBar -->
      <app-header></app-header>

      <!-- Page content -->
      <div class="flex-1">
        <router-outlet></router-outlet>
      </div>

      <!-- Footer -->
      <footer
        class="flex flex-col items-center justify-between gap-4 border-t px-6 py-4 md:flex-row"
        style="
          background-color: var(--color-surface-container-lowest);
          border-color: var(--color-outline-variant);
        "
      >
        <div class="text-sm font-bold text-[var(--color-on-surface)]">CivicShield</div>
        <div class="text-[11px] text-[var(--color-on-surface-variant)]">
          © 2024 Urban Infrastructure Management Bureau. All rights reserved.
        </div>
        <div class="flex gap-4 text-[11px]">
          <a
            href="#"
            class="text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-primary)]"
            >Privacy Policy</a
          >
          <a
            href="#"
            class="text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-primary)]"
            >Terms of Service</a
          >
          <a
            href="#"
            class="text-[var(--color-on-surface-variant)] transition-colors hover:text-[var(--color-primary)]"
            >Accessibility Statement</a
          >
        </div>
      </footer>
    </div>
  `,
})
export class AppLayoutComponent {
  readonly sidebarCollapsed = signal<boolean>(false)

  toggleSidebar(): void {
    this.sidebarCollapsed.update((val) => !val)
  }
}
