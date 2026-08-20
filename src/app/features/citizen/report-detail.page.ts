import { CommonModule } from '@angular/common'
import { Component, OnInit, inject, signal } from '@angular/core'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { DashboardService, ReportDetailResponse } from '../../core/services/dashboard.service'
import { AppDatePipe } from '../../shared/pipes/app-date.pipe'

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, AppDatePipe],
  template: `
    <div class="min-h-screen bg-[var(--color-surface)] p-4 md:p-8">
      <button type="button" (click)="goBack()" class="mb-5 flex items-center gap-2 text-sm text-[var(--color-primary)]">
        <span class="material-symbols-outlined">arrow_back</span> My reports
      </button>
      @if (report(); as item) {
        <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p class="text-xs text-[var(--color-on-surface-variant)]">#{{ item.publicCode }}</p>
            <h1 class="text-3xl font-bold">{{ item.title }}</h1>
            <p class="mt-2 text-sm text-[var(--color-on-surface-variant)]">{{ item.addressText || item.area.name }}</p>
          </div>
          <button type="button" (click)="toggleUpvote()" class="rounded-full border border-[var(--color-primary)] px-4 py-2 text-sm text-[var(--color-primary)]">
            <span class="material-symbols-outlined align-middle text-base">thumb_up</span>
            {{ item.hasUpvoted ? 'Đã ủng hộ' : 'Chưa ủng hộ' }} · {{ item.upvoteCount }}
          </button>
        </div>

        <div class="grid gap-6 lg:grid-cols-3">
          <div class="space-y-6 lg:col-span-2">
            @if (item.attachments.length) {
              <div class="overflow-hidden rounded-xl bg-white p-2 shadow-sm">
                <img [src]="imageUrl(item.attachments[selectedImage()].fileUrl)" class="h-96 w-full rounded-lg object-cover" [alt]="item.title" />
                @if (item.attachments.length > 1) {
                  <div class="mt-2 flex gap-2 overflow-x-auto">
                    @for (image of item.attachments; track image.id; let index = $index) {
                      <button type="button" (click)="selectedImage.set(index)" class="h-20 w-24 shrink-0 overflow-hidden rounded-lg" [class.ring-2]="selectedImage() === index">
                        <img [src]="imageUrl(image.thumbnailUrl || image.fileUrl)" class="h-full w-full object-cover" />
                      </button>
                    }
                  </div>
                }
              </div>
            }
            <section class="rounded-xl bg-white p-6 shadow-sm">
              <h2 class="mb-3 text-lg font-semibold">Nội dung báo cáo</h2>
              <p class="whitespace-pre-line text-sm text-[var(--color-on-surface-variant)]">{{ item.description }}</p>
            </section>
            <section class="rounded-xl bg-white p-6 shadow-sm">
              <div class="mb-4 flex items-center justify-between">
                <h2 class="text-lg font-semibold">Các sự cố được tách từ báo cáo</h2>
                <span class="text-sm">{{ item.resolvedIssueCount }}/{{ item.issueCount }} đã hoàn thành</span>
              </div>
              <div class="space-y-3">
                @for (issue of item.issues; track issue.id) {
                  <a [routerLink]="['/citizen/reports', issue.id]" class="block rounded-lg border border-[var(--color-outline-variant)] p-4 hover:bg-[var(--color-surface-container)]">
                    <div class="flex items-start justify-between gap-3">
                      <div><p class="font-semibold">{{ issue.issueType.name }}</p><p class="text-xs text-[var(--color-on-surface-variant)]">#{{ issue.publicCode }} · {{ issue.currentDepartment?.name || 'Chưa định tuyến' }}</p></div>
                      <span class="rounded-full px-3 py-1 text-xs" [class]="getStatusBadgeClass(issue.status.code)">{{ issue.status.name }}</span>
                    </div>
                  </a>
                }
              </div>
            </section>
          </div>
          <aside class="space-y-4">
            <div class="overflow-hidden rounded-xl bg-white p-1 shadow-sm">
              <iframe [src]="mapUrl(item)" class="h-72 w-full border-0" title="Report location"></iframe>
              <a [href]="directionsUrl(item)" target="_blank" rel="noopener" class="block p-3 text-center text-sm text-[var(--color-primary)]">Get directions</a>
            </div>
            <div class="rounded-xl bg-white p-5 text-sm shadow-sm">
              <p><strong>Người báo:</strong> {{ item.reporterDisplayName }}</p>
              <p class="mt-2"><strong>Thời gian:</strong> {{ item.reportedAt | appDate:'medium' }}</p>
            </div>
          </aside>
        </div>
      } @else if (!loading()) {
        <p>Không tìm thấy báo cáo.</p>
      }
    </div>
  `,
})
export class ReportDetailComponent implements OnInit {
  private readonly service = inject(DashboardService)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly sanitizer = inject(DomSanitizer)
  report = signal<ReportDetailResponse | null>(null)
  loading = signal(true)
  selectedImage = signal(0)

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'))
    this.service.getReportById(id).subscribe({ next: (report) => { this.report.set(report); this.loading.set(false) }, error: () => this.loading.set(false) })
  }
  goBack(): void { void this.router.navigate(['/citizen/dashboard']) }
  imageUrl(path: string): string | null { return this.service.getImageUrl(path) }
  toggleUpvote(): void {
    const item = this.report(); if (!item) return
    const request = item.hasUpvoted ? this.service.removeReportUpvote(item.id) : this.service.upvoteReport(item.id)
    request.subscribe((vote) => this.report.update((value) => value ? { ...value, hasUpvoted: vote.hasUpvoted, upvoteCount: vote.upvoteCount } : value))
  }
  directionsUrl(item: ReportDetailResponse): string { return `https://www.google.com/maps/dir/?api=1&destination=${item.latitude},${item.longitude}` }
  mapUrl(item: ReportDetailResponse): SafeResourceUrl {
    const d = 0.004
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.openstreetmap.org/export/embed.html?bbox=${item.longitude-d}%2C${item.latitude-d}%2C${item.longitude+d}%2C${item.latitude+d}&layer=mapnik&marker=${item.latitude}%2C${item.longitude}`)
  }
  getStatusBadgeClass(statusCode?: string): string {
    const code = statusCode?.toUpperCase() || ''
    if (code === 'RESOLVED' || code === 'CLOSED') return 'bg-green-100 text-green-800 font-semibold'
    if (code === 'REQUEST_REOPEN') return 'bg-amber-100 text-amber-800 font-semibold'
    if (code === 'REJECTED') return 'bg-red-100 text-red-800 font-semibold'
    if (code === 'IN_PROGRESS' || code === 'ASSIGNED') return 'bg-blue-100 text-blue-800 font-semibold'
    return 'bg-gray-100 text-gray-800 font-semibold'
  }
}
