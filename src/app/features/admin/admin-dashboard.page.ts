import { Component, inject } from '@angular/core'
import { CommonModule, NgStyle } from '@angular/common'
import { AdminSidebarComponent } from './admin-sidebar.component'
import { AuthStore } from '../../core/auth/auth.store'

interface KpiCard {
  label: string
  value: string
  icon: string
  trend: string
  trendUp: boolean
  trendColor: string
  bgGlow: string
  iconBg: string
  iconColor: string
}

interface ActivityItem {
  title: string
  subtitle: string
  time: string
  dotColor: string
  ringColor: string
  isLast?: boolean
}

interface ReportRow {
  id: string
  title: string
  category: string
  categoryColor: string
  district: string
  status: string
  statusColor: string
  statusBg: string
  priority: string
  priorityColor: string
  assignedTo: string
  createdAt: string
}

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, NgStyle, AdminSidebarComponent],
  styles: [
    `
      .heatmap-pulse {
        animation: pulse-ring 3s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
      }
      @keyframes pulse-ring {
        0% {
          transform: scale(0.8);
          box-shadow: 0 0 0 0 rgba(186, 26, 26, 0.7);
        }
        70% {
          transform: scale(1);
          box-shadow: 0 0 0 15px rgba(186, 26, 26, 0);
        }
        100% {
          transform: scale(0.8);
          box-shadow: 0 0 0 0 rgba(186, 26, 26, 0);
        }
      }

      .pie-chart {
        background: conic-gradient(
          #004ac6 0% 45%,
          #784b00 45% 75%,
          #ba1a1a 75% 90%,
          #e0e3e5 90% 100%
        );
        border-radius: 50%;
      }

      .bar-hover:hover {
        filter: brightness(1.1);
        transform: scaleY(1.02);
        transform-origin: bottom;
      }

      .sidebar-link-active {
        background-color: var(--color-secondary-container);
        color: var(--color-on-secondary-container);
        font-weight: 600;
      }

      nav.sidebar::-webkit-scrollbar {
        width: 4px;
      }
      nav.sidebar::-webkit-scrollbar-track {
        background: transparent;
      }
      nav.sidebar::-webkit-scrollbar-thumb {
        background-color: var(--color-outline-variant);
        border-radius: 9999px;
      }
    `,
  ],
  template: `
    <!-- Outer wrapper: sidebar + main column -->
    <div class="flex min-h-screen overflow-hidden" style="background-color: var(--color-background)">

      <!-- Shared Admin Sidebar -->
      <app-admin-sidebar #sidebar></app-admin-sidebar>

      <!-- ── Main Column ── -->
      <div
        class="flex flex-1 flex-col transition-all duration-300 min-w-0"
        [style.margin-left]="sidebar.open() ? '280px' : '0px'"
      >


        <!-- Scrollable content -->
        <main class="flex-1 overflow-y-auto p-4 md:p-8 pb-16">
          <!-- Page Title Row -->
          <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 class="text-2xl font-bold tracking-tight" style="color: var(--color-on-surface)">
                System Overview
              </h2>
              <p class="mt-1 text-sm" style="color: var(--color-on-surface-variant)">
                Real-time metrics and geographic analysis.
              </p>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-container)]"
                style="border-color: var(--color-outline-variant); color: var(--color-on-surface)"
              >
                <span class="material-symbols-outlined text-[16px]">download</span> Export
              </button>
              <button
                class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-colors hover:bg-[var(--color-surface-variant)]"
                style="background-color: var(--color-surface-container-high); color: var(--color-on-surface)"
              >
                <span class="material-symbols-outlined text-[16px]">filter_list</span> Filter
              </button>
            </div>
          </div>

          <!-- ── Bento Grid ── -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-12">

            <!-- KPI Cards -->
            @for (kpi of kpiCards; track kpi.label) {
              <div
                class="relative overflow-hidden rounded-2xl border p-6 md:col-span-4 group"
                style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.4)"
              >
                <!-- Ambient glow -->
                <div
                  class="absolute -right-6 -top-6 h-28 w-28 rounded-full blur-2xl transition-all duration-500 group-hover:scale-125"
                  [style]="kpi.bgGlow"
                ></div>

                <div class="relative z-10 flex items-start justify-between mb-5">
                  <div class="flex h-11 w-11 items-center justify-center rounded-xl" [style]="kpi.iconBg">
                    <span class="material-symbols-outlined" [ngStyle]="getIconStyle(kpi.iconColor)">{{ kpi.icon }}</span>
                  </div>
                  <span
                    class="flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold"
                    [style]="kpi.trendColor"
                  >
                    <span class="material-symbols-outlined text-[12px]">{{ kpi.trendUp ? 'trending_up' : 'trending_flat' }}</span>
                    {{ kpi.trend }}
                  </span>
                </div>

                <div class="relative z-10">
                  <p class="text-[11px] font-semibold uppercase tracking-widest mb-1" style="color: var(--color-on-surface-variant)">
                    {{ kpi.label }}
                  </p>
                  <h3 class="text-4xl font-bold tracking-tight" style="color: var(--color-on-surface)">{{ kpi.value }}</h3>
                </div>
              </div>
            }

            <!-- Incident Density Map (col-span-8) -->
            <div
              class="md:col-span-8 flex flex-col overflow-hidden rounded-2xl border"
              style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.4); height: 420px"
            >
              <div
                class="flex items-center justify-between border-b px-5 py-4"
                style="border-color: rgba(195,198,215,0.4)"
              >
                <h3 class="flex items-center gap-2 text-base font-semibold" style="color: var(--color-on-surface)">
                  <span class="material-symbols-outlined" style="color: var(--color-primary); font-size:20px">map</span>
                  Incident Density Map
                </h3>
                <div class="flex gap-1.5">
                  <button
                    class="rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
                    style="background-color: var(--color-primary); color: white"
                  >24h</button>
                  <button
                    class="rounded-lg px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--color-surface-container)]"
                    style="color: var(--color-on-surface-variant)"
                  >7d</button>
                  <button
                    class="rounded-lg px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--color-surface-container)]"
                    style="color: var(--color-on-surface-variant)"
                  >30d</button>
                </div>
              </div>

              <!-- Map area -->
              <div class="relative flex-1 overflow-hidden" style="background-color: var(--color-surface-container-low)">
                <!-- Grid lines simulating a map -->
                <div class="absolute inset-0 opacity-30"
                  style="background-image: linear-gradient(var(--color-outline-variant) 1px, transparent 1px), linear-gradient(90deg, var(--color-outline-variant) 1px, transparent 1px); background-size: 40px 40px">
                </div>

                <!-- District blocks -->
                <div class="absolute" style="top:15%; left:10%; width:35%; height:30%; background: rgba(195,198,215,0.3); border-radius:4px; border: 1px solid var(--color-outline-variant)"></div>
                <div class="absolute" style="top:15%; left:50%; width:40%; height:25%; background: rgba(195,198,215,0.2); border-radius:4px; border: 1px solid var(--color-outline-variant)"></div>
                <div class="absolute" style="top:50%; left:20%; width:30%; height:35%; background: rgba(195,198,215,0.25); border-radius:4px; border: 1px solid var(--color-outline-variant)"></div>
                <div class="absolute" style="top:50%; left:55%; width:35%; height:30%; background: rgba(195,198,215,0.15); border-radius:4px; border: 1px solid var(--color-outline-variant)"></div>

                <!-- Heatmap clusters -->
                <!-- Critical cluster (red) -->
                <div class="heatmap-pulse absolute rounded-full" style="top:28%; left:40%; width:56px; height:56px; background: rgba(186,26,26,0.35); filter: blur(10px)"></div>
                <div class="absolute rounded-full border-2 border-white shadow-lg" style="top:32%; left:44%; width:16px; height:16px; background: var(--color-error); box-shadow: 0 0 12px rgba(186,26,26,0.8)"></div>
                <div class="absolute rounded-lg px-2 py-0.5 text-[10px] font-bold text-white" style="top:22%; left:42%; background: var(--color-error)">CRITICAL ×8</div>

                <!-- Moderate cluster (amber) -->
                <div class="absolute rounded-full" style="top:55%; left:22%; width:64px; height:64px; background: rgba(120,75,0,0.25); filter: blur(12px)"></div>
                <div class="absolute rounded-full border-2 border-white shadow-md" style="top:59%; left:27%; width:12px; height:12px; background: var(--color-tertiary)"></div>
                <div class="absolute rounded-lg px-2 py-0.5 text-[10px] font-bold text-white" style="top:50%; left:24%; background: var(--color-tertiary)">HIGH ×5</div>

                <!-- Low cluster (blue) -->
                <div class="absolute rounded-full" style="top:18%; left:68%; width:80px; height:80px; background: rgba(0,74,198,0.15); filter: blur(16px)"></div>
                <div class="absolute rounded-full border-2 border-white shadow-md" style="top:23%; left:72%; width:14px; height:14px; background: var(--color-primary)"></div>
                <div class="absolute rounded-lg px-2 py-0.5 text-[10px] font-bold text-white" style="top:17%; left:68%; background: var(--color-primary)">MED ×3</div>

                <!-- District labels -->
                <div class="absolute text-[10px] font-semibold" style="top:22%; left:16%; color: var(--color-on-surface-variant)">Quận 1</div>
                <div class="absolute text-[10px] font-semibold" style="top:22%; left:56%; color: var(--color-on-surface-variant)">Quận 3</div>
                <div class="absolute text-[10px] font-semibold" style="top:58%; left:24%; color: var(--color-on-surface-variant)">Quận 5</div>
                <div class="absolute text-[10px] font-semibold" style="top:56%; left:60%; color: var(--color-on-surface-variant)">Quận 7</div>

                <!-- Map Controls -->
                <div
                  class="absolute bottom-4 right-4 flex flex-col overflow-hidden rounded-xl border shadow-sm"
                  style="background-color: var(--color-surface); border-color: var(--color-outline-variant)"
                >
                  <button
                    class="flex h-9 w-9 items-center justify-center transition-colors hover:bg-[var(--color-surface-container)]"
                    style="color: var(--color-on-surface)"
                  >
                    <span class="material-symbols-outlined text-[18px]">add</span>
                  </button>
                  <div class="h-px" style="background-color: var(--color-outline-variant)"></div>
                  <button
                    class="flex h-9 w-9 items-center justify-center transition-colors hover:bg-[var(--color-surface-container)]"
                    style="color: var(--color-on-surface)"
                  >
                    <span class="material-symbols-outlined text-[18px]">remove</span>
                  </button>
                </div>

                <!-- Legend -->
                <div
                  class="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-xl border p-3 text-xs"
                  style="background-color: var(--color-surface); border-color: var(--color-outline-variant)"
                >
                  <div class="flex items-center gap-2">
                    <div class="h-2.5 w-2.5 rounded-full" style="background-color: var(--color-error)"></div>
                    <span style="color: var(--color-on-surface)">Critical</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="h-2.5 w-2.5 rounded-full" style="background-color: var(--color-tertiary)"></div>
                    <span style="color: var(--color-on-surface)">High</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="h-2.5 w-2.5 rounded-full" style="background-color: var(--color-primary)"></div>
                    <span style="color: var(--color-on-surface)">Medium</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Category Distribution (col-span-4) -->
            <div
              class="md:col-span-4 flex flex-col rounded-2xl border p-6"
              style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.4)"
            >
              <h3 class="flex items-center gap-2 text-base font-semibold mb-6" style="color: var(--color-on-surface)">
                <span class="material-symbols-outlined" style="color: var(--color-tertiary); font-size:20px">pie_chart</span>
                Category Distribution
              </h3>

              <div class="flex flex-1 flex-col items-center justify-center">
                <!-- Donut chart -->
                <div class="pie-chart relative h-44 w-44 shadow-inner">
                  <div
                    class="absolute inset-4 flex flex-col items-center justify-center rounded-full"
                    style="background-color: var(--color-surface)"
                  >
                    <span class="text-3xl font-bold" style="color: var(--color-on-surface)">342</span>
                    <span class="text-[10px] font-semibold uppercase tracking-widest" style="color: var(--color-on-surface-variant)">Total</span>
                  </div>
                </div>

                <!-- Legend -->
                <div class="mt-8 w-full space-y-3">
                  @for (cat of categories; track cat.label) {
                    <div class="flex items-center justify-between">
                      <div class="flex items-center gap-2.5">
                        <div class="h-3 w-3 rounded-sm" [style]="'background-color:' + cat.color"></div>
                        <span class="text-sm" style="color: var(--color-on-surface)">{{ cat.label }}</span>
                      </div>
                      <div class="flex items-center gap-2">
                        <div
                          class="h-1.5 rounded-full"
                          [style]="'width:' + (cat.pct * 0.8) + 'px; background-color:' + cat.color + '60'"
                        ></div>
                        <span class="text-xs font-semibold" style="color: var(--color-on-surface-variant)">{{ cat.pct }}%</span>
                      </div>
                    </div>
                  }
                </div>
              </div>
            </div>

            <!-- Incident Trends (col-span-8) -->
            <div
              class="md:col-span-8 rounded-2xl border p-6"
              style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.4)"
            >
              <div class="mb-6 flex items-center justify-between">
                <h3 class="flex items-center gap-2 text-base font-semibold" style="color: var(--color-on-surface)">
                  <span class="material-symbols-outlined" style="color: var(--color-primary); font-size:20px">ssid_chart</span>
                  Incident Trends
                </h3>
                <select
                  class="rounded-xl border px-3 py-1.5 text-sm font-medium focus:outline-none focus:ring-2"
                  style="
                    background-color: var(--color-surface-container-low);
                    border-color: var(--color-outline-variant);
                    color: var(--color-on-surface);
                    --tw-ring-color: var(--color-primary)
                  "
                >
                  <option>This Week</option>
                  <option>This Month</option>
                  <option>This Year</option>
                </select>
              </div>

              <!-- Chart -->
              <div class="relative h-60 w-full">
                <!-- Grid lines -->
                <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  @for (line of [0,1,2,3,4]; track line) {
                    <div class="w-full h-px" style="background-color: rgba(195,198,215,0.35)"></div>
                  }
                </div>

                <!-- Y-axis labels -->
                <div class="absolute left-0 inset-y-0 flex flex-col justify-between pb-6 text-[10px] font-medium pr-2" style="color: var(--color-on-surface-variant)">
                  <span>50</span><span>40</span><span>30</span><span>20</span><span>10</span><span>0</span>
                </div>

                <!-- Bars -->
                <div class="absolute inset-0 flex items-end pl-8 pb-6 gap-3">
                  @for (bar of chartBars; track bar.day) {
                    <div class="relative flex flex-1 flex-col items-center group">
                      <div
                        class="bar-hover w-full rounded-t-lg transition-all duration-200 cursor-pointer"
                        [style]="'height:' + bar.heightPct + '%; background-color: ' + (bar.active ? 'var(--color-primary)' : 'var(--color-primary-fixed)') + '; box-shadow:' + (bar.active ? '0 0 18px rgba(0,74,198,0.4)' : 'none')"
                      >
                        <!-- Tooltip -->
                        <div
                          class="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg px-2 py-1 text-[11px] font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                          style="background-color: var(--color-inverse-surface)"
                        >{{ bar.value }}</div>
                      </div>
                    </div>
                  }
                </div>
              </div>

              <!-- X-axis labels -->
              <div class="flex justify-around pl-8 mt-2 text-[11px] font-medium" style="color: var(--color-on-surface-variant)">
                @for (bar of chartBars; track bar.day) {
                  <span [style]="bar.active ? 'color: var(--color-primary); font-weight:700' : ''">{{ bar.day }}</span>
                }
              </div>
            </div>

            <!-- System Activity (col-span-4) -->
            <div
              class="md:col-span-4 flex flex-col rounded-2xl border p-6"
              style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.4)"
            >
              <div class="mb-5 flex items-center justify-between">
                <h3 class="flex items-center gap-2 text-base font-semibold" style="color: var(--color-on-surface)">
                  <span class="material-symbols-outlined" style="color: var(--color-secondary); font-size:20px">history</span>
                  System Activity
                </h3>
                <a
                  href="#"
                  class="text-xs font-semibold transition-colors hover:underline"
                  style="color: var(--color-primary)"
                >View All</a>
              </div>

              <div class="flex flex-col gap-0 flex-1 overflow-y-auto pr-1">
                @for (item of activityItems; track item.time; let last = $last) {
                  <div class="relative flex gap-3 pb-5 pl-5 ml-2" [class.border-l-2]="!last" style="border-color: var(--color-surface-container-highest)">
                    <div
                      class="absolute -left-[10px] top-0 flex h-5 w-5 items-center justify-center rounded-full border-2"
                      [style]="'background-color:' + item.ringColor + '; border-color: var(--color-surface)'"
                    >
                      <div class="h-2 w-2 rounded-full" [style]="'background-color:' + item.dotColor"></div>
                    </div>
                    <div>
                      <p class="text-sm leading-snug" style="color: var(--color-on-surface)" [innerHTML]="item.title"></p>
                      <p class="mt-0.5 text-[11px]" style="color: var(--color-on-surface-variant)">{{ item.time }} · {{ item.subtitle }}</p>
                    </div>
                  </div>
                }
              </div>
            </div>

            <!-- Recent Reports Table (col-span-12) -->
            <div
              class="md:col-span-12 rounded-2xl border overflow-hidden"
              style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.4)"
            >
              <div class="flex items-center justify-between px-6 py-4 border-b" style="border-color: rgba(195,198,215,0.4)">
                <h3 class="flex items-center gap-2 text-base font-semibold" style="color: var(--color-on-surface)">
                  <span class="material-symbols-outlined" style="color: var(--color-primary); font-size:20px">assignment</span>
                  Recent Incident Reports
                </h3>
                <div class="flex items-center gap-2">
                  <div
                    class="hidden md:flex items-center gap-2 rounded-xl border px-3 py-1.5"
                    style="border-color: var(--color-outline-variant); background-color: var(--color-surface-container)"
                  >
                    <span class="material-symbols-outlined text-[16px]" style="color: var(--color-outline)">search</span>
                    <input
                      type="text"
                      placeholder="Search reports..."
                      class="border-none bg-transparent text-sm focus:outline-none focus:ring-0 w-36"
                      style="color: var(--color-on-surface)"
                    />
                  </div>
                  <button
                    class="rounded-xl px-3 py-1.5 text-sm font-medium transition-colors hover:bg-[var(--color-surface-container)]"
                    style="border: 1px solid var(--color-outline-variant); color: var(--color-on-surface)"
                  >
                    <span class="material-symbols-outlined text-[16px] align-middle">tune</span>
                  </button>
                </div>
              </div>

              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b text-left" style="border-color: rgba(195,198,215,0.4); background-color: var(--color-surface-container-low)">
                      <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">ID</th>
                      <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">Title</th>
                      <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">Category</th>
                      <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">District</th>
                      <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">Status</th>
                      <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">Priority</th>
                      <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">Assigned To</th>
                      <th class="px-6 py-3 text-[11px] font-semibold uppercase tracking-wider" style="color: var(--color-on-surface-variant)">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of reportRows; track row.id; let even = $even) {
                      <tr
                        class="border-b transition-colors hover:bg-[var(--color-surface-container-low)] cursor-pointer"
                        [style]="even ? 'background-color: var(--color-surface)' : 'background-color: var(--color-surface-container-lowest)'"
                        style="border-color: rgba(195,198,215,0.25)"
                      >
                        <td class="px-6 py-4 text-xs font-mono font-semibold" style="color: var(--color-primary)">{{ row.id }}</td>
                        <td class="px-6 py-4 font-medium max-w-[200px] truncate" style="color: var(--color-on-surface)">{{ row.title }}</td>
                        <td class="px-6 py-4">
                          <span
                            class="rounded-full px-2.5 py-1 text-xs font-semibold"
                            [style]="'background-color:' + row.categoryColor + '20; color:' + row.categoryColor"
                          >{{ row.category }}</span>
                        </td>
                        <td class="px-6 py-4 text-xs" style="color: var(--color-on-surface-variant)">{{ row.district }}</td>
                        <td class="px-6 py-4">
                          <span
                            class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold w-fit"
                            [style]="'background-color:' + row.statusBg + '; color:' + row.statusColor"
                          >
                            <span class="h-1.5 w-1.5 rounded-full" [style]="'background-color:' + row.statusColor"></span>
                            {{ row.status }}
                          </span>
                        </td>
                        <td class="px-6 py-4">
                          <span
                            class="rounded-full px-2.5 py-1 text-xs font-bold"
                            [style]="'color:' + row.priorityColor"
                          >{{ row.priority }}</span>
                        </td>
                        <td class="px-6 py-4 text-xs" style="color: var(--color-on-surface)">{{ row.assignedTo }}</td>
                        <td class="px-6 py-4 text-xs" style="color: var(--color-on-surface-variant)">{{ row.createdAt }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>

              <!-- Pagination -->
              <div
                class="flex items-center justify-between px-6 py-4 border-t"
                style="border-color: rgba(195,198,215,0.4)"
              >
                <p class="text-xs" style="color: var(--color-on-surface-variant)">Showing 1–8 of 342 results</p>
                <div class="flex gap-1">
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors hover:bg-[var(--color-surface-container)]"
                    style="border-color: var(--color-outline-variant); color: var(--color-on-surface-variant)"
                  >
                    <span class="material-symbols-outlined text-[16px]">chevron_left</span>
                  </button>
                  @for (pg of [1,2,3]; track pg) {
                    <button
                      class="flex h-8 w-8 items-center justify-center rounded-lg border text-xs font-semibold transition-colors"
                      [style]="pg === 1
                        ? 'background-color: var(--color-primary); border-color: var(--color-primary); color: white'
                        : 'border-color: var(--color-outline-variant); color: var(--color-on-surface); background: transparent'"
                    >{{ pg }}</button>
                  }
                  <button
                    class="flex h-8 w-8 items-center justify-center rounded-lg border text-xs transition-colors hover:bg-[var(--color-surface-container)]"
                    style="border-color: var(--color-outline-variant); color: var(--color-on-surface-variant)"
                  >
                    <span class="material-symbols-outlined text-[16px]">chevron_right</span>
                  </button>
                </div>
              </div>
            </div>

          </div><!-- /bento grid -->
        </main>

        <!-- Footer -->
        <footer
          class="flex flex-col items-center justify-between gap-4 border-t px-6 py-4 md:flex-row shrink-0"
          style="background-color: var(--color-surface-container-lowest); border-color: var(--color-outline-variant)"
        >
          <div class="text-sm font-bold" style="color: var(--color-on-surface)">Urban Infrastructure</div>
          <div class="text-[11px]" style="color: var(--color-on-surface-variant)">
            © 2024 Urban Infrastructure Management Bureau. All rights reserved.
          </div>
          <div class="flex gap-4 text-[11px]">
            <a href="#" class="transition-colors hover:text-[var(--color-primary)]" style="color: var(--color-on-surface-variant)">Privacy Policy</a>
            <a href="#" class="transition-colors hover:text-[var(--color-primary)]" style="color: var(--color-on-surface-variant)">Terms of Service</a>
            <a href="#" class="transition-colors hover:text-[var(--color-primary)]" style="color: var(--color-on-surface-variant)">Accessibility</a>
          </div>
        </footer>
      </div><!-- /main column -->
    </div>
  `,
})
export class AdminDashboardPage {
  protected readonly store = inject(AuthStore)

  getIconStyle(color: string): Record<string, string> {
    return {
      color: color,
      'font-size': '22px',
      'font-variation-settings': "'FILL' 1",
    }
  }

  readonly kpiCards: KpiCard[] = [
    {
      label: 'Total Active Users',
      value: '14,208',
      icon: 'group',
      trend: '+12%',
      trendUp: true,
      trendColor: 'background-color: var(--color-secondary-container); color: var(--color-secondary)',
      bgGlow: 'background: rgba(0,74,198,0.08)',
      iconBg: 'background-color: rgba(0,74,198,0.12)',
      iconColor: 'var(--color-primary)',
    },
    {
      label: 'Open Incidents',
      value: '342',
      icon: 'report',
      trend: '+5%',
      trendUp: true,
      trendColor: 'background-color: var(--color-error-container); color: var(--color-error)',
      bgGlow: 'background: rgba(186,26,26,0.07)',
      iconBg: 'background-color: rgba(186,26,26,0.12)',
      iconColor: 'var(--color-error)',
    },
    {
      label: 'Active Departments',
      value: '18',
      icon: 'domain',
      trend: 'Stable',
      trendUp: false,
      trendColor: 'background-color: var(--color-surface-container-high); color: var(--color-on-surface-variant)',
      bgGlow: 'background: rgba(120,75,0,0.07)',
      iconBg: 'background-color: rgba(120,75,0,0.12)',
      iconColor: 'var(--color-tertiary)',
    },
  ]

  readonly categories = [
    { label: 'Infrastructure', color: 'var(--color-primary)', pct: 45 },
    { label: 'Public Safety', color: 'var(--color-tertiary)', pct: 30 },
    { label: 'Utilities', color: 'var(--color-error)', pct: 15 },
    { label: 'Other', color: 'var(--color-surface-variant)', pct: 10 },
  ]

  readonly chartBars = [
    { day: 'Mon', value: 12, heightPct: 24, active: false },
    { day: 'Tue', value: 18, heightPct: 36, active: false },
    { day: 'Wed', value: 14, heightPct: 28, active: false },
    { day: 'Thu', value: 26, heightPct: 52, active: false },
    { day: 'Fri', value: 34, heightPct: 68, active: true },
    { day: 'Sat', value: 22, heightPct: 44, active: false },
    { day: 'Sun', value: 16, heightPct: 32, active: false },
  ]

  readonly activityItems: ActivityItem[] = [
    {
      title: '<span style="font-weight:600">Critical Incident</span> logged in Sector 4',
      subtitle: 'System Auto-Alert',
      time: '2 mins ago',
      dotColor: 'var(--color-error)',
      ringColor: 'var(--color-error-container)',
    },
    {
      title: '<span style="font-weight:600">Dept. of Transportation</span> updated status',
      subtitle: 'User: J. Smith',
      time: '45 mins ago',
      dotColor: 'var(--color-primary)',
      ringColor: 'var(--color-primary-fixed)',
    },
    {
      title: '<span style="font-weight:600">3 new reports</span> submitted from District 5',
      subtitle: 'Citizen Portal',
      time: '1 hr ago',
      dotColor: 'var(--color-secondary)',
      ringColor: 'var(--color-secondary-container)',
    },
    {
      title: 'Weekly backup completed successfully',
      subtitle: 'System',
      time: '3 hrs ago',
      dotColor: 'var(--color-outline)',
      ringColor: 'var(--color-surface-container-high)',
      isLast: true,
    },
  ]

  readonly reportRows: ReportRow[] = [
    {
      id: '#IR-2847',
      title: 'Pothole on Nguyễn Huệ Boulevard',
      category: 'Infrastructure',
      categoryColor: 'var(--color-primary)',
      district: 'Quận 1',
      status: 'In Progress',
      statusColor: 'var(--color-tertiary)',
      statusBg: 'rgba(120,75,0,0.12)',
      priority: '🔴 Critical',
      priorityColor: 'var(--color-error)',
      assignedTo: 'Dept. Transport',
      createdAt: '10 Aug 2026',
    },
    {
      id: '#IR-2846',
      title: 'Broken streetlight — Lê Lợi St.',
      category: 'Utilities',
      categoryColor: 'var(--color-tertiary)',
      district: 'Quận 1',
      status: 'Pending',
      statusColor: 'var(--color-on-surface-variant)',
      statusBg: 'var(--color-surface-container)',
      priority: '🟡 High',
      priorityColor: 'var(--color-tertiary)',
      assignedTo: 'Power Dept.',
      createdAt: '10 Aug 2026',
    },
    {
      id: '#IR-2845',
      title: 'Flooding on Trần Hưng Đạo',
      category: 'Public Safety',
      categoryColor: 'var(--color-error)',
      district: 'Quận 5',
      status: 'Escalated',
      statusColor: 'var(--color-error)',
      statusBg: 'var(--color-error-container)',
      priority: '🔴 Critical',
      priorityColor: 'var(--color-error)',
      assignedTo: 'Emergency Svcs',
      createdAt: '09 Aug 2026',
    },
    {
      id: '#IR-2844',
      title: 'Sidewalk damage near Ben Thanh',
      category: 'Infrastructure',
      categoryColor: 'var(--color-primary)',
      district: 'Quận 1',
      status: 'Resolved',
      statusColor: 'var(--color-secondary)',
      statusBg: 'rgba(0,108,73,0.12)',
      priority: '🟢 Low',
      priorityColor: 'var(--color-secondary)',
      assignedTo: 'Works Dept.',
      createdAt: '09 Aug 2026',
    },
    {
      id: '#IR-2843',
      title: 'Graffiti on public building',
      category: 'Other',
      categoryColor: 'var(--color-outline)',
      district: 'Quận 3',
      status: 'Pending',
      statusColor: 'var(--color-on-surface-variant)',
      statusBg: 'var(--color-surface-container)',
      priority: '🟢 Low',
      priorityColor: 'var(--color-secondary)',
      assignedTo: 'Urban Mgmt.',
      createdAt: '08 Aug 2026',
    },
    {
      id: '#IR-2842',
      title: 'Gas leak reported — Đinh Tiên Hoàng',
      category: 'Utilities',
      categoryColor: 'var(--color-tertiary)',
      district: 'Quận Bình Thạnh',
      status: 'Escalated',
      statusColor: 'var(--color-error)',
      statusBg: 'var(--color-error-container)',
      priority: '🔴 Critical',
      priorityColor: 'var(--color-error)',
      assignedTo: 'Gas Authority',
      createdAt: '08 Aug 2026',
    },
    {
      id: '#IR-2841',
      title: 'Traffic signal malfunction',
      category: 'Infrastructure',
      categoryColor: 'var(--color-primary)',
      district: 'Quận 7',
      status: 'In Progress',
      statusColor: 'var(--color-tertiary)',
      statusBg: 'rgba(120,75,0,0.12)',
      priority: '🟡 High',
      priorityColor: 'var(--color-tertiary)',
      assignedTo: 'Dept. Transport',
      createdAt: '07 Aug 2026',
    },
    {
      id: '#IR-2840',
      title: 'Damaged playground equipment',
      category: 'Public Safety',
      categoryColor: 'var(--color-error)',
      district: 'Quận Gò Vấp',
      status: 'Resolved',
      statusColor: 'var(--color-secondary)',
      statusBg: 'rgba(0,108,73,0.12)',
      priority: '🟡 High',
      priorityColor: 'var(--color-tertiary)',
      assignedTo: 'Parks Dept.',
      createdAt: '07 Aug 2026',
    },
  ]
}
