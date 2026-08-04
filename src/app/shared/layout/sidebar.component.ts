import { Component, Input } from '@angular/core'
import { CommonModule } from '@angular/common'
import { RouterLink, RouterLinkActive } from '@angular/router'

interface NavMenuItem {
  label: string
  icon: string
  route: string
  badge?: string
}

interface NavSection {
  title: string
  items: NavMenuItem[]
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <aside
      [class.w-64]="!collapsed"
      [class.w-20]="collapsed"
      class="fixed inset-y-0 left-0 z-20 flex flex-col border-r border-slate-200 bg-slate-900 text-slate-300 pt-16 transition-all duration-300 dark:border-slate-800"
    >
      <!-- Navigation Menu Sections -->
      <div class="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        @for (section of menuSections; track section.title) {
          <div>
            @if (!collapsed && section.title) {
              <h3 class="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {{ section.title }}
              </h3>
            }
            <div class="mt-2 space-y-1">
              @for (item of section.items; track item.route) {
                <a
                  [routerLink]="item.route"
                  routerLinkActive="bg-amber-600/20 text-amber-400 font-semibold border-r-4 border-amber-500"
                  [routerLinkActiveOptions]="{ exact: item.route === '/' }"
                  class="group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white"
                  [title]="collapsed ? item.label : ''"
                >
                  <!-- SVG Icons -->
                  <span class="flex h-6 w-6 shrink-0 items-center justify-center text-slate-400 group-hover:text-amber-400">
                    <ng-container [ngSwitch]="item.icon">
                      <!-- Home Icon -->
                      <svg *ngSwitchCase="'home'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 00-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>

                      <!-- Public Map Icon -->
                      <svg *ngSwitchCase="'map'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>

                      <!-- Incident Reporting Icon -->
                      <svg *ngSwitchCase="'camera'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>

                      <!-- Resolution Workflow Icon -->
                      <svg *ngSwitchCase="'clipboard'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>

                      <!-- SLA Escalation Icon -->
                      <svg *ngSwitchCase="'bell'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                      </svg>

                      <!-- Reports & Analytics Icon -->
                      <svg *ngSwitchCase="'chart'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>

                      <!-- Profile Icon -->
                      <svg *ngSwitchCase="'user'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>

                      <!-- Admin Icon -->
                      <svg *ngSwitchCase="'cog'" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      </svg>
                    </ng-container>
                  </span>

                  <!-- Label -->
                  @if (!collapsed) {
                    <span class="flex-1 truncate">{{ item.label }}</span>
                    @if (item.badge) {
                      <span class="rounded bg-amber-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-amber-400">
                        {{ item.badge }}
                      </span>
                    }
                  }
                </a>
              }
            </div>
          </div>
        }
      </div>

      <!-- Footer Info -->
      @if (!collapsed) {
        <div class="border-t border-slate-800 p-4">
          <div class="rounded-xl bg-slate-800/60 p-3 text-xs">
            <p class="font-semibold text-white">Tổng đài Phản ánh Hạ tầng</p>
            <p class="mt-1 text-slate-400">Hotline 1022 - Tiếp nhận 24/7</p>
          </div>
        </div>
      }
    </aside>
  `,
})
export class SidebarComponent {
  @Input() collapsed = false

  readonly menuSections: NavSection[] = [
    {
      title: 'TỔNG QUAN',
      items: [
        { label: 'Trang chủ', icon: 'home', route: '/' },
        { label: 'Bản đồ Công khai', icon: 'map', route: '/public-map', badge: 'GIS' },
      ],
    },
    {
      title: 'BÁO CÁO CÔNG DÂN',
      items: [
        { label: 'Báo cáo Sự cố', icon: 'camera', route: '/incident-reporting' },
        { label: 'Hồ sơ Cá nhân', icon: 'user', route: '/profile' },
      ],
    },
    {
      title: 'XỬ LÝ NGHIỆP VỤ',
      items: [
        { label: 'Quy trình Định tuyến & Xử lý', icon: 'clipboard', route: '/resolution-workflow', badge: 'Chính' },
        { label: 'Cảnh báo SLA & Leo thang', icon: 'bell', route: '/sla-escalation' },
      ],
    },
    {
      title: 'QUẢN TRỊ & BÁO CÁO',
      items: [
        { label: 'Báo cáo & Thống kê', icon: 'chart', route: '/reports-analytics' },
        { label: 'Quản trị Hệ thống', icon: 'cog', route: '/admin' },
      ],
    },
  ]
}
