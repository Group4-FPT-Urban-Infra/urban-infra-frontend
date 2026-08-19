import { Component, OnInit, computed, inject, signal, effect, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core'
import { CommonModule, NgStyle } from '@angular/common'
import { AdminSidebarComponent } from './admin-sidebar.component'
import { AuthStore } from '../../core/auth/auth.store'
import * as L from 'leaflet'
// @ts-ignore
import 'leaflet.heat'
import {
  AdminDashboardService,
  AdminKpiResponse,
  CategoryDistributionPoint,
  HeatmapDataPoint,
  HeatmapTimeframe,
  KpiItem,
  TrendDataPoint,
  TrendPeriod,
  AuditLogResponse,
} from './services/admin-dashboard.service'
import { IssueSummaryResponse, PagedResponse } from '../../core/services/dashboard.service'

interface KpiCard {
  label: string
  value: string
  icon: string
  trend: string
  trendUp: boolean | null
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
  issueId: number
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

import { Router } from '@angular/router'

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

      /* KPI skeleton shimmer */
      @keyframes shimmer {
        0%   { background-position: -400px 0; }
        100% { background-position: 400px 0; }
      }
      .skeleton {
        background: linear-gradient(
          90deg,
          var(--color-surface-container-low) 25%,
          var(--color-surface-container) 50%,
          var(--color-surface-container-low) 75%
        );
        background-size: 800px 100%;
        animation: shimmer 1.4s ease-in-out infinite;
        border-radius: 8px;
      }

      /* Fix Leaflet map sizing */
      :host ::ng-deep .leaflet-container {
        height: 100%;
        width: 100%;
      }
      :host ::ng-deep .leaflet-control-zoom {
        border: none;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      }
    `,
  ],
  template: `
    <!-- Outer wrapper: sidebar + main column -->
    <div class="flex min-h-screen overflow-hidden" style="background-color: var(--color-background)">

      <!-- Shared Admin Sidebar -->
      <app-admin-sidebar #sidebar></app-admin-sidebar>

      <!-- â”€â”€ Main Column â”€â”€ -->
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

          <!-- â”€â”€ KPI Section â”€â”€ -->
          <section class="mb-6">
            <!-- Section header -->
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center gap-2">
                <span class="material-symbols-outlined text-[20px]" style="color: var(--color-primary)">bar_chart_4_bars</span>
                <h3 class="text-base font-semibold" style="color: var(--color-on-surface)">Key Performance Indicators</h3>
                <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style="background-color: var(--color-primary-fixed); color: var(--color-primary)">Weekly</span>
              </div>
              <!-- Refresh button -->
              <button
                (click)="loadKpis()"
                [disabled]="kpiLoading()"
                class="flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-medium transition-all hover:bg-[var(--color-surface-container)] disabled:opacity-50"
                style="border-color: var(--color-outline-variant); color: var(--color-on-surface)"
              >
                <span class="material-symbols-outlined text-[14px]" [class.animate-spin]="kpiLoading()">refresh</span>
                Refresh
              </button>
            </div>

            <!-- Error banner -->
            @if (kpiError()) {
              <div class="mb-4 flex items-center gap-3 rounded-xl border px-4 py-3"
                style="background-color: var(--color-error-container); border-color: var(--color-error); color: var(--color-on-error-container)">
                <span class="material-symbols-outlined text-[18px]" style="color: var(--color-error)">error</span>
                <p class="text-sm font-medium">{{ kpiError() }}</p>
                <button (click)="loadKpis()" class="ml-auto text-xs font-semibold underline" style="color: var(--color-error)">Retry</button>
              </div>
            }

            <!-- 6 KPI Cards grid (2 cols mobile â†’ 3 cols md â†’ 6 cols lg) -->
            <div class="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">

              <!-- â”€â”€ Skeleton state â”€â”€ -->
              @if (kpiLoading()) {
                @for (s of [1,2,3,4,5,6]; track s) {
                  <div class="relative overflow-hidden rounded-2xl border p-5"
                    style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.4)">
                    <div class="skeleton mb-4 h-9 w-9 rounded-xl"></div>
                    <div class="skeleton mb-2 h-3 w-20 rounded"></div>
                    <div class="skeleton h-8 w-16 rounded"></div>
                    <div class="skeleton mt-3 h-6 w-14 rounded-full"></div>
                  </div>
                }
              }

              <!-- â”€â”€ Loaded state â”€â”€ -->
              @if (!kpiLoading() && !kpiError()) {
                @for (kpi of kpiCards(); track kpi.label) {
                  <div
                    class="relative overflow-hidden rounded-2xl border p-5 group cursor-default transition-shadow hover:shadow-md"
                    style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.4)"
                  >
                    <!-- Ambient glow -->
                    <div
                      class="absolute -right-4 -top-4 h-24 w-24 rounded-full blur-2xl transition-all duration-500 group-hover:scale-125 pointer-events-none"
                      [style]="kpi.bgGlow"
                    ></div>

                    <!-- Icon -->
                    <div class="relative z-10 flex h-10 w-10 items-center justify-center rounded-xl mb-4" [style]="kpi.iconBg">
                      <span class="material-symbols-outlined" [ngStyle]="getIconStyle(kpi.iconColor)">{{ kpi.icon }}</span>
                    </div>

                    <!-- Label -->
                    <p class="relative z-10 text-[10px] font-semibold uppercase tracking-widest mb-1 truncate"
                      style="color: var(--color-on-surface-variant)">{{ kpi.label }}</p>

                    <!-- Value -->
                    <h4 class="relative z-10 text-3xl font-bold tracking-tight leading-none"
                      style="color: var(--color-on-surface)">{{ kpi.value }}</h4>

                    <!-- Trend badge -->
                    <div class="relative z-10 mt-3">
                      <span
                        class="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
                        [style]="kpi.trendColor"
                      >
                        <span class="material-symbols-outlined text-[12px]">
                          {{ kpi.trendUp === true ? 'trending_up' : kpi.trendUp === false ? 'trending_down' : 'trending_flat' }}
                        </span>
                        {{ kpi.trend }}
                      </span>
                    </div>
                  </div>
                }
              }

            </div>
          </section>

          <!-- â”€â”€ Bento Grid â”€â”€ -->
          <div class="grid grid-cols-1 gap-6 md:grid-cols-12">

            <!-- Incident Density Map (col-span-8) -->
            <div
              class="md:col-span-8 flex flex-col rounded-2xl border"
              style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.4)"
            >
              <!-- Header -->
              <div class="flex items-center justify-between p-6 pb-4">
                <h3 class="flex items-center gap-2 text-base font-semibold" style="color: var(--color-on-surface)">
                  <span class="material-symbols-outlined" style="color: var(--color-secondary); font-size:20px">map</span>
                  Incident Density Map
                  @if (heatmapLoading()) {
                    <span class="h-4 w-4 rounded-full border-2 border-[var(--color-secondary)] border-t-transparent animate-spin inline-block"></span>
                  }
                </h3>
                <div class="flex gap-1 rounded-lg border p-1" style="background-color: var(--color-surface-container-low); border-color: var(--color-outline-variant)">
                  <button
                    (click)="selectTimeframe('24h')"
                    class="rounded-lg px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--color-surface-container)]"
                    [style]="selectedTimeframe() === '24h' ? 'background-color: var(--color-secondary); color: var(--color-on-secondary)' : 'color: var(--color-on-surface-variant)'"
                  >24h</button>
                  <button
                    (click)="selectTimeframe('7d')"
                    class="rounded-lg px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--color-surface-container)]"
                    [style]="selectedTimeframe() === '7d' ? 'background-color: var(--color-secondary); color: var(--color-on-secondary)' : 'color: var(--color-on-surface-variant)'"
                  >7d</button>
                  <button
                    (click)="selectTimeframe('30d')"
                    class="rounded-lg px-3 py-1 text-xs font-medium transition-colors hover:bg-[var(--color-surface-container)]"
                    [style]="selectedTimeframe() === '30d' ? 'background-color: var(--color-secondary); color: var(--color-on-secondary)' : 'color: var(--color-on-surface-variant)'"
                  >30d</button>
                </div>
              </div>

              <!-- Map area -->
              <!-- Map area -->
              <div class="relative flex-1 overflow-hidden h-[400px] z-0" style="background-color: var(--color-surface-container-low)">
                <!-- Heatmap Container -->
                <div #heatmapContainer class="h-full w-full"></div>

                <!-- Legend -->
                <div
                  class="absolute bottom-4 left-4 flex flex-col gap-1.5 rounded-xl border p-3 text-xs z-[1000]"
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
                @if (categoriesLoading()) {
                  <span class="h-4 w-4 rounded-full border-2 border-[var(--color-tertiary)] border-t-transparent animate-spin inline-block"></span>
                }
              </h3>

              @if (categoriesError()) {
                <div class="flex items-center gap-2 rounded-xl border px-3 py-2 mb-4 text-sm"
                  style="background-color: var(--color-error-container); border-color: var(--color-error); color: var(--color-on-error-container)">
                  <span class="material-symbols-outlined text-[16px]" style="color:var(--color-error)">error</span>
                  {{ categoriesError() }}
                </div>
              }

              <div class="flex flex-1 flex-col items-center justify-center">
                <!-- Donut chart -->
                <div class="relative h-44 w-44 rounded-full shadow-inner overflow-hidden transition-all duration-700"
                     [style.background]="categoriesLoading() ? 'var(--color-surface-container)' : donutChartGradient()">
                  <div
                    class="absolute inset-4 flex flex-col items-center justify-center rounded-full"
                    style="background-color: var(--color-surface)"
                  >
                    <span class="text-3xl font-bold" style="color: var(--color-on-surface)">
                      @if (categoriesLoading()) {
                        ...
                      } @else {
                        {{ totalCategoriesCount() }}
                      }
                    </span>
                    <span class="text-[10px] font-semibold uppercase tracking-widest" style="color: var(--color-on-surface-variant)">Total</span>
                  </div>
                </div>

                <!-- Legend -->
                <div class="mt-8 w-full space-y-3">
                  @if (categoriesLoading()) {
                    @for (i of [1,2,3]; track i) {
                      <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2.5 w-1/2">
                          <div class="h-3 w-3 rounded-sm skeleton"></div>
                          <div class="h-4 w-full skeleton rounded"></div>
                        </div>
                        <div class="h-4 w-8 skeleton rounded"></div>
                      </div>
                    }
                  } @else {
                    @for (cat of mappedCategories(); track cat.label) {
                      <div class="flex items-center justify-between group">
                        <div class="flex items-center gap-2.5">
                          <div class="h-3 w-3 rounded-sm" [style]="'background-color:' + cat.color"></div>
                          <span class="text-sm font-medium" style="color: var(--color-on-surface)">{{ cat.label }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                          <!-- Bar background -->
                          <div class="w-20 h-1.5 rounded-full overflow-hidden" style="background-color: var(--color-surface-container)">
                            <!-- Bar fill -->
                            <div class="h-full rounded-full transition-all duration-700"
                                 [style]="'width:' + cat.pct + '%; background-color:' + cat.color"></div>
                          </div>
                          <span class="text-xs font-semibold w-10 text-right" style="color: var(--color-on-surface-variant)">{{ cat.pct }}%</span>
                        </div>
                      </div>
                    }
                    @if (mappedCategories().length === 0) {
                      <div class="text-center text-sm" style="color: var(--color-on-surface-variant)">No data available</div>
                    }
                  }
                </div>
              </div>
            </div>

            <!-- Incident Trends (col-span-8) -->
            <div
              class="md:col-span-8 rounded-2xl border p-6"
              style="background-color: var(--color-surface); border-color: rgba(195,198,215,0.4)"
            >
              <!-- Header + Period Selector -->
              <div class="mb-5 flex items-center justify-between">
                <h3 class="flex items-center gap-2 text-base font-semibold" style="color: var(--color-on-surface)">
                  <span class="material-symbols-outlined" style="color: var(--color-primary); font-size:20px">ssid_chart</span>
                  Incident Trends
                  @if (trendsLoading()) {
                    <span class="h-4 w-4 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin inline-block"></span>
                  }
                </h3>
                <!-- Period buttons -->
                <div class="flex gap-1">
                  @for (opt of trendPeriodOptions; track opt.value) {
                    <button
                      (click)="selectTrendPeriod(opt.value)"
                      class="rounded-lg px-3 py-1 text-xs font-semibold transition-colors"
                      [style]="selectedPeriod() === opt.value
                        ? 'background-color: var(--color-primary); color: white'
                        : 'color: var(--color-on-surface-variant); background: transparent'"
                    >{{ opt.label }}</button>
                  }
                </div>
              </div>

              <!-- Error -->
              @if (trendsError()) {
                <div class="flex items-center gap-2 rounded-xl border px-3 py-2 mb-4 text-sm"
                  style="background-color: var(--color-error-container); border-color: var(--color-error); color: var(--color-on-error-container)">
                  <span class="material-symbols-outlined text-[16px]" style="color:var(--color-error)">error</span>
                  {{ trendsError() }}
                  <button (click)="loadTrends()" class="ml-auto text-xs font-semibold underline" style="color:var(--color-error)">Retry</button>
                </div>
              }

              <!-- Chart area -->
              <div class="relative h-60 w-full">
                <!-- Grid lines -->
                <div class="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  @for (line of [0,1,2,3,4]; track line) {
                    <div class="w-full h-px" style="background-color: rgba(195,198,215,0.35)"></div>
                  }
                </div>

                <!-- Y-axis labels (dynamic: 0 â†’ maxVal rounded up nicely) -->
                <div class="absolute left-0 inset-y-0 flex flex-col justify-between pb-6 text-[10px] font-medium pr-2" style="color: var(--color-on-surface-variant)">
                  @for (lbl of yAxisLabels(); track lbl) {
                    <span>{{ lbl }}</span>
                  }
                </div>

                <!-- Skeleton bars -->
                @if (trendsLoading()) {
                  <div class="absolute inset-0 flex items-end pl-8 pb-6 gap-1.5">
                    @for (s of skeletonBars(); track s.i) {
                      <div class="skeleton flex-1 rounded-t-lg" [style]="'height:' + s.h + '%'"></div>
                    }
                  </div>
                }

                <!-- Real bars -->
                @if (!trendsLoading()) {
                  <div class="absolute inset-0 flex items-end pl-8 pb-6 gap-1.5">
                    @for (bar of chartBars(); track bar.label; let i = $index) {
                      <div class="relative flex h-full flex-1 flex-col justify-end items-center group">
                        <div
                          class="bar-hover w-full rounded-t-lg transition-all duration-500 cursor-pointer"
                          [style]="'height:' + bar.heightPct + '%; background-color:' + (bar.isMax ? 'var(--color-primary)' : 'var(--color-primary-fixed)') + '; box-shadow:' + (bar.isMax ? '0 0 18px rgba(0,74,198,0.4)' : 'none')"
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
                }
              </div>

              <!-- X-axis labels -->
              @if (!trendsLoading()) {
                <div class="flex pl-8 mt-2 text-[11px] font-medium overflow-hidden" style="color: var(--color-on-surface-variant)">
                  @for (bar of chartBars(); track bar.label) {
                    <span
                      class="flex-1 text-center truncate"
                      [style]="bar.isMax ? 'color: var(--color-primary); font-weight:700' : ''"
                    >{{ bar.label }}</span>
                  }
                </div>
              }
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
                @if (activityLoading()) {
                  <div class="flex justify-center items-center h-full">
                    <span class="h-6 w-6 rounded-full border-2 border-[var(--color-primary)] border-t-transparent animate-spin inline-block"></span>
                  </div>
                } @else if (activityError()) {
                  <p class="text-sm text-red-500 text-center mt-4">{{ activityError() }}</p>
                } @else {
                  @for (item of mappedActivities(); track item.time; let last = $last) {
                    <div class="relative flex gap-3 pb-5 pl-5 ml-2" [class.border-l-2]="!last" style="border-color: var(--color-surface-container-highest)">
                      <div
                        class="absolute -left-[10px] top-0 flex h-5 w-5 items-center justify-center rounded-full border-2"
                        [style]="'background-color:' + item.ringColor + '; border-color: var(--color-surface)'"
                      >
                        <div class="h-2 w-2 rounded-full" [style]="'background-color:' + item.dotColor"></div>
                      </div>
                      <div>
                        <p class="text-sm leading-snug" style="color: var(--color-on-surface)" [innerHTML]="item.title"></p>
                        <p class="mt-0.5 text-[11px]" style="color: var(--color-on-surface-variant)">{{ item.time }} Â· {{ item.subtitle }}</p>
                      </div>
                    </div>
                  }
                }
              </div>
            </div>



          </div><!-- /bento grid -->
        </main>


      </div><!-- /main column -->
    </div>
  `,
})
export class AdminDashboardPage implements OnInit, AfterViewInit, OnDestroy {
  protected readonly store = inject(AuthStore)
  private readonly adminDashService = inject(AdminDashboardService)
  private readonly router = inject(Router)

  navigateToDetail(issueId: number): void {
    void this.router.navigate(['/admin/incidents', issueId])
  }

  @ViewChild('heatmapContainer', { static: false }) heatmapContainer!: ElementRef<HTMLDivElement>
  private map: L.Map | null = null
  private heatLayer: any = null

  // â”€â”€ KPI State (Signals) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly kpiData    = signal<AdminKpiResponse | null>(null)
  readonly kpiLoading = signal(true)
  readonly kpiError   = signal<string | null>(null)

  // Allow use of Math in template
  protected readonly Math = Math

  constructor() {
    effect(() => {
      const data = this.heatmapData()
      if (this.map && data) {
        this.renderHeatmap(data)
      }
    })
  }

  ngOnInit(): void {
    this.loadKpis()
    this.loadTrends()
    this.loadCategoryDistribution()
    this.loadHeatmap()
    this.loadRecentIssues()
    this.loadSystemActivity()
  }

  loadKpis(): void {
    this.kpiLoading.set(true)
    this.kpiError.set(null)
    this.adminDashService.getAdminKpis().subscribe({
      next: (res) => {
        if (res.success) {
          this.kpiData.set(res.data)
        } else {
          this.kpiError.set(res.message ?? 'Failed to load KPIs.')
        }
        this.kpiLoading.set(false)
      },
      error: (err) => {
        this.kpiError.set('KhÃ´ng thá»ƒ káº¿t ná»‘i Ä‘áº¿n server. Vui lÃ²ng thá»­ láº¡i.')
        this.kpiLoading.set(false)
        console.error('[AdminDashboard] KPI load error:', err)
      },
    })
  }

  // â”€â”€ Helper: map KpiItem â†’ trend display â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  private formatTrend(item: KpiItem): string {
    if (item.trendPercent === null || item.trendPercent === undefined) return 'N/A'
    const abs = Math.abs(item.trendPercent)
    if (item.trendDirection === 'stable' || abs === 0) return 'Stable'
    return `${item.trendDirection === 'up' ? '+' : '-'}${abs}%`
  }

  private trendColor(item: KpiItem, type: 'positive' | 'negative' | 'neutral'): string {
    // For KPIs where UP is good (users, resolved, new) use green/blue
    // For KPIs where UP is bad (open incidents, critical) use red
    if (item.trendDirection === 'stable') {
      return 'background-color: var(--color-surface-container-high); color: var(--color-on-surface-variant)'
    }
    const isUp = item.trendDirection === 'up'
    if (type === 'negative') {
      // more = worse  (open incidents, critical)
      return isUp
        ? 'background-color: var(--color-error-container); color: var(--color-error)'
        : 'background-color: rgba(0,108,73,0.12); color: var(--color-secondary)'
    }
    // more = better (users, resolved, new today)
    return isUp
      ? 'background-color: var(--color-secondary-container); color: var(--color-secondary)'
      : 'background-color: var(--color-error-container); color: var(--color-error)'
  }

  // â”€â”€ Computed KPI Cards â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly kpiCards = computed((): KpiCard[] => {
    const d = this.kpiData()
    if (!d) return []
    return [
      {
        label: 'Total Users',
        value: d.totalUsers.value.toLocaleString(),
        icon: 'group',
        trend: this.formatTrend(d.totalUsers),
        trendUp: d.totalUsers.trendDirection === 'up'
          ? true : d.totalUsers.trendDirection === 'down' ? false : null,
        trendColor: this.trendColor(d.totalUsers, 'positive'),
        bgGlow: 'background: rgba(0,74,198,0.08)',
        iconBg: 'background-color: rgba(0,74,198,0.12)',
        iconColor: 'var(--color-primary)',
      },
      {
        label: 'Open Incidents',
        value: d.openIncidents.value.toLocaleString(),
        icon: 'report',
        trend: this.formatTrend(d.openIncidents),
        trendUp: d.openIncidents.trendDirection === 'up'
          ? true : d.openIncidents.trendDirection === 'down' ? false : null,
        trendColor: this.trendColor(d.openIncidents, 'negative'),
        bgGlow: 'background: rgba(186,26,26,0.07)',
        iconBg: 'background-color: rgba(186,26,26,0.12)',
        iconColor: 'var(--color-error)',
      },
      {
        label: 'Active Depts',
        value: d.activeDepartments.value.toLocaleString(),
        icon: 'domain',
        trend: this.formatTrend(d.activeDepartments),
        trendUp: d.activeDepartments.trendDirection === 'up'
          ? true : d.activeDepartments.trendDirection === 'down' ? false : null,
        trendColor: this.trendColor(d.activeDepartments, 'neutral'),
        bgGlow: 'background: rgba(120,75,0,0.07)',
        iconBg: 'background-color: rgba(120,75,0,0.12)',
        iconColor: 'var(--color-tertiary)',
      },
      {
        label: 'Resolved / Week',
        value: d.resolvedThisWeek.value.toLocaleString(),
        icon: 'check_circle',
        trend: this.formatTrend(d.resolvedThisWeek),
        trendUp: d.resolvedThisWeek.trendDirection === 'up'
          ? true : d.resolvedThisWeek.trendDirection === 'down' ? false : null,
        trendColor: this.trendColor(d.resolvedThisWeek, 'positive'),
        bgGlow: 'background: rgba(0,108,73,0.07)',
        iconBg: 'background-color: rgba(0,108,73,0.12)',
        iconColor: 'var(--color-secondary)',
      },
      {
        label: 'New Today',
        value: d.newToday.value.toLocaleString(),
        icon: 'add_circle',
        trend: this.formatTrend(d.newToday),
        trendUp: d.newToday.trendDirection === 'up'
          ? true : d.newToday.trendDirection === 'down' ? false : null,
        trendColor: this.trendColor(d.newToday, 'neutral'),
        bgGlow: 'background: rgba(0,74,198,0.06)',
        iconBg: 'background-color: rgba(0,74,198,0.1)',
        iconColor: 'var(--color-primary)',
      },
      {
        label: 'Critical',
        value: d.criticalIncidents.value.toLocaleString(),
        icon: 'warning',
        trend: this.formatTrend(d.criticalIncidents),
        trendUp: d.criticalIncidents.trendDirection === 'up'
          ? true : d.criticalIncidents.trendDirection === 'down' ? false : null,
        trendColor: this.trendColor(d.criticalIncidents, 'negative'),
        bgGlow: 'background: rgba(186,26,26,0.1)',
        iconBg: 'background-color: rgba(186,26,26,0.15)',
        iconColor: 'var(--color-error)',
      },
    ]
  })

  getIconStyle(color: string): Record<string, string> {
    return {
      color: color,
      'font-size': '20px',
      'font-variation-settings': "'FILL' 1",
    }
  }

  // â”€â”€ Category Distribution State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly categoryDistribution = signal<CategoryDistributionPoint[]>([])
  readonly categoriesLoading    = signal(true)
  readonly categoriesError      = signal<string | null>(null)

  loadCategoryDistribution(): void {
    this.categoriesLoading.set(true)
    this.categoriesError.set(null)
    this.adminDashService.getCategoryDistribution().subscribe({
      next: (res) => {
        this.categoryDistribution.set(res.success ? (res.data ?? []) : [])
        if (!res.success) this.categoriesError.set(res.message ?? 'Failed to load category distribution.')
        this.categoriesLoading.set(false)
      },
      error: () => {
        this.categoriesError.set('KhÃ´ng thá»ƒ táº£i phÃ¢n bá»• danh má»¥c.')
        this.categoriesLoading.set(false)
      }
    })
  }

  readonly totalCategoriesCount = computed(() => {
    return this.categoryDistribution().reduce((sum, item) => sum + item.count, 0)
  })

  readonly mappedCategories = computed(() => {
    const raw = this.categoryDistribution()
    const colors = [
      'var(--color-primary)',
      'var(--color-secondary)',
      'var(--color-tertiary)',
      'var(--color-error)',
      'var(--color-outline)',
      '#6b7280', // fallback gray
      '#8b5cf6', // purple
      '#10b981', // emerald
    ]
    return raw.map((item, index) => ({
      label: item.category,
      pct: item.percentage,
      count: item.count,
      color: colors[index % colors.length]
    }))
  })

  readonly donutChartGradient = computed(() => {
    const cats = this.mappedCategories()
    if (cats.length === 0) return 'var(--color-surface-container)'

    let gradientString = 'conic-gradient('
    let currentPct = 0

    cats.forEach((cat, index) => {
      const start = currentPct
      const end = currentPct + cat.pct
      gradientString += `${cat.color} ${start}%, ${cat.color} ${end}%`
      if (index < cats.length - 1) {
        gradientString += ', '
      }
      currentPct = end
    })

    gradientString += ')'
    return gradientString
  })

  // â”€â”€ Incident Trends State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly selectedPeriod  = signal<TrendPeriod>('ThisWeek')
  readonly trendsData      = signal<TrendDataPoint[]>([])
  readonly trendsLoading   = signal(true)
  readonly trendsError     = signal<string | null>(null)

  readonly trendPeriodOptions: { label: string; value: TrendPeriod }[] = [
    { label: 'Week',  value: 'ThisWeek'  },
    { label: 'Month', value: 'ThisMonth' },
    { label: 'Year',  value: 'ThisYear'  },
  ]

  selectTrendPeriod(period: TrendPeriod): void {
    this.selectedPeriod.set(period)
    this.loadTrends()
  }

  loadTrends(): void {
    this.trendsLoading.set(true)
    this.trendsError.set(null)
    this.adminDashService.getIncidentTrends(this.selectedPeriod()).subscribe({
      next: (res) => {
        this.trendsData.set(res.success ? (res.data ?? []) : [])
        if (!res.success) this.trendsError.set(res.message ?? 'Failed to load trends.')
        this.trendsLoading.set(false)
      },
      error: () => {
        this.trendsError.set('KhÃ´ng thá»ƒ táº£i biá»ƒu Ä‘á»“. Vui lÃ²ng thá»­ láº¡i.')
        this.trendsLoading.set(false)
      },
    })
  }

  /** Skeleton bars vá»›i chiá»u cao ngáº«u nhiÃªn Ä‘á»ƒ trÃ´ng tá»± nhiÃªn hÆ¡n */
  readonly skeletonBars = computed(() => {
    const count = this.selectedPeriod() === 'ThisWeek' ? 7
      : this.selectedPeriod() === 'ThisYear' ? 12 : 31
    const heights = [30, 50, 40, 65, 45, 55, 35, 60, 42, 48, 38, 55,
                     28, 43, 52, 36, 47, 62, 33, 58, 41, 46, 39, 54,
                     29, 44, 53, 37, 49, 61, 32]
    return Array.from({ length: count }, (_, i) => ({ i, h: heights[i % heights.length] }))
  })

  /** Y-axis labels: 0 á»Ÿ dÆ°á»›i cÃ¹ng â†’ maxVal á»Ÿ trÃªn cÃ¹ng, chia 5 bÆ°á»›c */
  readonly yAxisLabels = computed((): string[] => {
    const data = this.trendsData()
    const maxRaw = data.length ? Math.max(...data.map(d => d.value)) : 50
    const step = Math.ceil(maxRaw / 4) || 1
    const maxVal = step * 4
    return [maxVal, step * 3, step * 2, step, 0].map(v => v.toString())
  })

  /** Chart bars: map TrendDataPoint â†’ { label, value, heightPct, isMax } */
  readonly chartBars = computed(() => {
    const data = this.trendsData()
    if (!data.length) return []
    const maxVal = Math.max(...data.map(d => d.value))
    const step = Math.ceil(maxVal / 4) || 1
    const chartMax = step * 4 || 1
    return data.map(d => ({
      label: d.label,
      value: d.value,
      heightPct: Math.round((d.value / chartMax) * 90), // max bar = 90% height
      isMax: d.value === maxVal && maxVal > 0,
    }))
  })

  // â”€â”€ System Activity State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly activityData    = signal<AuditLogResponse[]>([])
  readonly activityLoading = signal(true)
  readonly activityError   = signal<string | null>(null)

  loadSystemActivity(): void {
    this.activityLoading.set(true)
    this.activityError.set(null)
    this.adminDashService.getSystemActivity(5).subscribe({
      next: (res) => {
        this.activityData.set(res.success ? (res.data ?? []) : [])
        if (!res.success) this.activityError.set(res.message ?? 'Failed to load activity.')
        this.activityLoading.set(false)
      },
      error: () => {
        this.activityError.set('KhÃ´ng thá»ƒ táº£i lá»‹ch sá»­ hoáº¡t Ä‘á»™ng.')
        this.activityLoading.set(false)
      }
    })
  }

  readonly mappedActivities = computed((): ActivityItem[] => {
    const data = this.activityData()
    
    const getTimeAgo = (dateStr: string) => {
      const diffMs = new Date().getTime() - new Date(dateStr).getTime()
      const diffMins = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMins / 60)
      const diffDays = Math.floor(diffHours / 24)
      if (diffMins < 1) return 'Just now'
      if (diffMins < 60) return `${diffMins} mins ago`
      if (diffHours < 24) return `${diffHours} hrs ago`
      return `${diffDays} days ago`
    }

    return data.map((log, index) => {
      let dotColor = 'var(--color-primary)'
      let ringColor = 'var(--color-primary-fixed)'

      if (log.type === 'error' || log.type === 'critical') {
        dotColor = 'var(--color-error)'
        ringColor = 'var(--color-error-container)'
      } else if (log.type === 'success' || log.type === 'resolved') {
        dotColor = 'var(--color-secondary)'
        ringColor = 'var(--color-secondary-container)'
      } else if (log.type === 'warning' || log.type === 'escalated') {
        dotColor = 'var(--color-tertiary)'
        ringColor = 'rgba(120,75,0,0.12)'
      } else if (log.type === 'info') {
        dotColor = 'var(--color-outline)'
        ringColor = 'var(--color-surface-container-high)'
      }

      return {
        title: log.title,
        subtitle: log.subtitle,
        time: getTimeAgo(log.timestamp),
        dotColor,
        ringColor,
        isLast: index === data.length - 1
      }
    })
  })


  // â”€â”€ Recent Issues State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly recentIssuesLoading = signal(true)
  readonly recentIssuesError   = signal<string | null>(null)
  readonly recentIssuesData    = signal<PagedResponse<IssueSummaryResponse> | null>(null)
  readonly currentPage         = signal(1)

  loadRecentIssues(page: number = 1): void {
    this.currentPage.set(page)
    this.recentIssuesLoading.set(true)
    this.recentIssuesError.set(null)
    this.adminDashService.getRecentIssues(page).subscribe({
      next: (res) => {
        this.recentIssuesData.set(res.success ? res.data : null)
        if (!res.success) this.recentIssuesError.set(res.message ?? 'Failed to load issues.')
        this.recentIssuesLoading.set(false)
      },
      error: () => {
        this.recentIssuesError.set('KhÃ´ng thá»ƒ táº£i danh sÃ¡ch sá»± cá»‘.')
        this.recentIssuesLoading.set(false)
      }
    })
  }

  readonly mappedRecentIssues = computed((): ReportRow[] => {
    const data = this.recentIssuesData()
    if (!data || !data.items) return []
    
    return data.items.map(issue => {
      // Map Priority Color
      let priorityColor = 'var(--color-primary)'
      let priorityEmoji = 'ðŸŸ¢'
      switch (issue.priority?.code?.toUpperCase()) {
        case 'CRITICAL':
          priorityColor = 'var(--color-error)'
          priorityEmoji = 'ðŸ”´'
          break
        case 'HIGH':
          priorityColor = 'var(--color-tertiary)'
          priorityEmoji = 'ðŸŸ¡'
          break
      }

      // Map Status Color
      let statusColor = 'var(--color-on-surface-variant)'
      let statusBg = 'var(--color-surface-container)'
      const st = issue.status?.code?.toUpperCase() || ''
      if (st.includes('RESOLVED') || st.includes('CLOSED')) {
        statusColor = 'var(--color-secondary)'
        statusBg = 'rgba(0,108,73,0.12)'
      } else if (st.includes('PROGRESS') || st.includes('ESCALATED')) {
        statusColor = 'var(--color-tertiary)'
        statusBg = 'rgba(120,75,0,0.12)'
      } else if (st.includes('NEW') || st.includes('OPEN')) {
        statusColor = 'var(--color-primary)'
        statusBg = 'rgba(0,74,198,0.12)'
      }

      // Map Category Color
      let catColor = 'var(--color-outline)'
      const cat = issue.issueType?.name?.toUpperCase() || ''
      if (cat.includes('INFRASTRUCTURE') || cat.includes('Háº  Táº¦NG')) catColor = 'var(--color-primary)'
      else if (cat.includes('SAFETY') || cat.includes('AN TOÃ€N')) catColor = 'var(--color-error)'
      else if (cat.includes('TRAFFIC') || cat.includes('GIAO THÃ”NG') || cat.includes('UTILITIES') || cat.includes('TIá»†N ÃCH')) catColor = 'var(--color-tertiary)'
      else if (cat.includes('ENVIRONMENT') || cat.includes('MÃ”I TRÆ¯á»œNG')) catColor = 'var(--color-secondary)'

      return {
        id: issue.publicCode || `#IR-${issue.id}`,
        issueId: issue.id,
        title: issue.title,
        category: issue.issueType?.name || 'N/A',
        categoryColor: catColor,
        district: issue.area?.name || 'N/A',
        status: issue.status?.name || 'N/A',
        statusColor,
        statusBg,
        priority: `${priorityEmoji} ${issue.priority?.name || 'N/A'}`,
        priorityColor,
        assignedTo: 'N/A', // Since IssueSummaryResponse does not have AssignedTo, map to N/A
        createdAt: new Date(issue.reportedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
      }
    })
  })

  changePage(newPage: number): void {
    if (newPage < 1) return
    const data = this.recentIssuesData()
    if (data && newPage > data.totalPages) return
    this.loadRecentIssues(newPage)
  }

  getPaginationPages(): number[] {
    const data = this.recentIssuesData()
    if (!data || data.totalPages === 0) return [1]
    
    const pages = []
    let start = Math.max(1, this.currentPage() - 2)
    let end = Math.min(data.totalPages, start + 4)
    
    // Adjust start if we are near the end
    if (end - start < 4) {
      start = Math.max(1, end - 4)
    }

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }
    return pages
  }

  // â”€â”€ Heatmap State â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  readonly heatmapData       = signal<HeatmapDataPoint[]>([])
  readonly heatmapLoading    = signal(true)
  readonly heatmapError      = signal<string | null>(null)
  readonly selectedTimeframe = signal<HeatmapTimeframe>('7d')

  selectTimeframe(tf: HeatmapTimeframe): void {
    this.selectedTimeframe.set(tf)
    this.loadHeatmap()
  }

  loadHeatmap(): void {
    this.heatmapLoading.set(true)
    this.heatmapError.set(null)
    this.adminDashService.getIncidentHeatmap(this.selectedTimeframe()).subscribe({
      next: (res) => {
        this.heatmapData.set(res.success ? (res.data ?? []) : [])
        if (!res.success) this.heatmapError.set(res.message ?? 'Failed to load heatmap.')
        this.heatmapLoading.set(false)
      },
      error: () => {
        this.heatmapError.set('KhÃ´ng thá»ƒ táº£i dá»¯ liá»‡u báº£n Ä‘á»“ nhiá»‡t.')
        this.heatmapLoading.set(false)
      }
    })
  }

  ngAfterViewInit() {
    setTimeout(() => this.initMap(), 100)
  }

  ngOnDestroy() {
    if (this.map) {
      this.map.remove()
    }
  }

  private initMap() {
    if (!this.heatmapContainer?.nativeElement) return

    this.map = L.map(this.heatmapContainer.nativeElement, {
      center: [20.9599, 107.0448], // Default center around Ha Long
      zoom: 12,
      zoomControl: true,
      attributionControl: false
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
    }).addTo(this.map)

    if (this.heatmapData().length > 0) {
      this.renderHeatmap(this.heatmapData())
    }
  }

  private renderHeatmap(data: HeatmapDataPoint[]) {
    if (!this.map) return

    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer)
    }

    const heatPoints: [number, number, number][] = []

    // Map specific districts/cities in Quang Ninh to realistic coordinates
    const districtCoordsMap: Record<string, {lat: number, lng: number}> = {
      'HL': { lat: 20.9599, lng: 107.0448 }, // Ha Long
      'BC': { lat: 20.9582, lng: 107.0142 }, // Bai Chay
      'CP': { lat: 21.0167, lng: 107.3167 }, // Cam Pha
      'UB': { lat: 21.0333, lng: 106.7833 }, // Uong Bi
      'MC': { lat: 21.5333, lng: 107.9667 }, // Mong Cai
      'DT': { lat: 21.0500, lng: 106.5333 }, // Dong Trieu
      'QY': { lat: 20.9333, lng: 106.8000 }, // Quang Yen
      'HG': { lat: 20.9515, lng: 107.0825 }, // Hon Gai
    }
    
    // Default fallback coordinate
    const defaultCoord = { lat: 20.9599, lng: 107.0448 }

    data.forEach((item) => {
      // Find coordinate by district ID or name, fallback to default
      let baseCoord = districtCoordsMap[item.districtId]
      
      if (!baseCoord) {
        // Simple search by name if ID doesn't match
        if (item.districtName.includes('Háº¡ Long')) baseCoord = districtCoordsMap['HL']
        else if (item.districtName.includes('BÃ£i ChÃ¡y')) baseCoord = districtCoordsMap['BC']
        else if (item.districtName.includes('Cáº©m Pháº£')) baseCoord = districtCoordsMap['CP']
        else if (item.districtName.includes('UÃ´ng BÃ­')) baseCoord = districtCoordsMap['UB']
        else if (item.districtName.includes('MÃ³ng CÃ¡i')) baseCoord = districtCoordsMap['MC']
        else baseCoord = defaultCoord
      }
      
      let intensityMultiplier = 1
      if (item.severity.toUpperCase() === 'CRITICAL') intensityMultiplier = 3
      else if (item.severity.toUpperCase() === 'HIGH') intensityMultiplier = 2

      // Generate random points around the base coordinate to form a cluster
      for (let i = 0; i < item.count; i++) {
        // Spread radius depends on the district scale, usually ~0.02 degrees (~2km)
        const lat = baseCoord.lat + (Math.random() - 0.5) * 0.02
        const lng = baseCoord.lng + (Math.random() - 0.5) * 0.02
        // intensity range from 0.1 to 1.0 based on severity
        heatPoints.push([lat, lng, 0.4 * intensityMultiplier])
      }
    })

    // Create heat layer with vibrant colors
    this.heatLayer = (L as any).heatLayer(heatPoints, {
      radius: 20,
      blur: 15,
      maxZoom: 14,
      max: 1.0,
      gradient: {
        0.4: '#004ac6',   // Medium (var(--color-primary))
        0.7: '#784b00',   // High (var(--color-tertiary))
        1.0: '#ba1a1a'    // Critical (var(--color-error))
      }
    }).addTo(this.map)
  }
}

