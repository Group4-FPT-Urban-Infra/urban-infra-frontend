import { Component, inject, OnInit, signal } from '@angular/core'
import { CommonModule } from '@angular/common'
import { ActivatedRoute, Router, RouterLink } from '@angular/router'
import { FormsModule } from '@angular/forms'
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { forkJoin } from 'rxjs'
import { DashboardService } from '../../core/services/dashboard.service'
import { AuthStore } from '../../core/auth/auth.store'
import type { IssueDetailResponse, IssueTimelineItemResponse } from '../../core/services/dashboard.service'

@Component({
  selector: 'app-incident-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="min-h-screen bg-[var(--color-background)] px-4 py-6 md:px-8">
      <!-- Header -->
      <header
        class="sticky top-0 z-50 mb-6 flex w-full items-center justify-between bg-[var(--color-surface)]/70 px-4 py-2 shadow-sm backdrop-blur-md md:px-6"
      >
        <div class="flex items-center gap-3">
          <button
            class="flex items-center justify-center rounded-full p-2 text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50"
            (click)="goBack()"
          >
            <span class="material-symbols-outlined">arrow_back</span>
          </button>
          <div class="text-[20px] font-semibold text-[var(--color-primary)]" style="line-height: 28px;">
            CivicShield
          </div>
        </div>
        <div class="flex items-center gap-3">
          <button class="flex items-center justify-center rounded-full p-2 text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50">
            <span class="material-symbols-outlined">share</span>
          </button>
          <button class="flex items-center justify-center rounded-full p-2 text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-surface-variant)]/50">
            <span class="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </header>

      @if (isLoading()) {
        <div class="flex items-center justify-center py-20">
          <span class="material-symbols-outlined animate-spin text-4xl text-[var(--color-primary)]">
            progress_activity
          </span>
        </div>
      } @else if (issue()) {
        <!-- Header Section: Title & Badges -->
        <div class="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div class="flex-1">
            <h1 class="mb-2 text-[36px] font-bold text-[var(--color-on-surface)]" style="letter-spacing: -0.02em; line-height: 44px;">
              {{ issue()!.title }}
            </h1>
            <p class="mb-4 flex items-center gap-2 text-[16px] text-[var(--color-on-surface-variant)]">
              <span class="material-symbols-outlined text-[18px]">location_on</span>
              {{ issue()!.area.name }}
            </p>
            <div class="flex flex-wrap gap-2">
              <span
                class="inline-flex items-center gap-1 rounded-full bg-[#FEF3C7] px-3 py-1 text-[11px] font-medium text-[#92400E]"
              >
                <span class="material-symbols-outlined mr-1 text-[14px]">sync</span>
                {{ issue()!.status.name }}
              </span>
              <span
                class="inline-flex items-center gap-1 rounded-full bg-[#FEE2E2] px-3 py-1 text-[11px] font-medium text-[#991B1B]"
              >
                <span class="material-symbols-outlined mr-1 text-[14px]">warning</span>
                {{ issue()!.priority.name }}
              </span>
              <span
                class="inline-flex items-center gap-1 rounded-full bg-[var(--color-surface-container)] px-3 py-1 text-[11px] font-medium text-[var(--color-on-surface-variant)]"
              >
                <span class="material-symbols-outlined mr-1 text-[14px]">category</span>
                {{ issue()!.issueType.name }}
              </span>
              <button
                type="button"
                class="inline-flex items-center gap-1 rounded-full border border-[var(--color-primary)]/30 px-3 py-1 text-[11px] font-medium text-[var(--color-primary)] hover:bg-[var(--color-primary)]/10"
                (click)="toggleUpvote()"
              >
                <span class="material-symbols-outlined text-[14px]">thumb_up</span>
                {{ issue()!.hasUpvoted ? 'Bỏ ủng hộ' : 'Ủng hộ' }} ({{ issue()!.upvoteCount }})
              </button>
            </div>
          </div>
          <!-- SLA Countdown Box -->
          <div
            class="flex min-w-[150px] flex-col items-center justify-center rounded-xl border border-[var(--color-outline-variant)]/30 bg-white/70 p-4 shadow-[0px_4px_20px_rgba(0,0,0,0.05)] backdrop-blur-xl"
          >
            <span
              class="mb-1 text-[12px] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)]"
            >
              SLA Target
            </span>
            <span class="text-[28px] font-semibold text-[var(--color-primary)]" style="line-height: 36px;">
              3 Days
            </span>
            <span class="mt-1 text-[11px] text-[var(--color-on-surface-variant)]">Remaining</span>
          </div>
        </div>

        <!-- Bento Grid Layout -->
        <div class="grid grid-cols-1 gap-6 md:grid-cols-12">
          <!-- Main Content Area -->
          <div class="flex flex-col gap-6 md:col-span-8">
            <!-- Image Gallery -->
            <div
              class="overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] p-1 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
            >
              <div class="group relative h-[300px] w-full overflow-hidden rounded-lg md:h-[400px]">
                @if (selectedImageUrl()) {
                  <img
                    [src]="selectedImageUrl()"
                    [alt]="issue()!.title"
                    class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                } @else {
                  <div class="flex h-full w-full items-center justify-center bg-[var(--color-surface-variant)]">
                    <span class="material-symbols-outlined text-6xl text-[var(--color-outline)]">report</span>
                  </div>
                }
                <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div class="absolute bottom-4 left-4 flex gap-2">
                  <span
                    class="flex items-center gap-1 rounded-full bg-black/60 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm"
                  >
                    <span class="material-symbols-outlined text-[14px]">image</span>
                    {{ selectedImageIndex() + 1 }} of {{ issue()!.attachments.length }}
                  </span>
                </div>
              </div>
              <!-- Thumbnail Strip -->
              @if (issue()!.attachments.length > 1) {
                <div class="flex gap-2 overflow-x-auto p-2">
                  @for (image of issue()!.attachments; track image.id; let index = $index) {
                    <button type="button" class="h-24 w-28 shrink-0 overflow-hidden rounded-lg"
                      [class.border-2]="selectedImageIndex() === index"
                      [class.border-[var(--color-primary)]]="selectedImageIndex() === index"
                      (click)="selectImage(index)">
                      <img [src]="getImageUrl(image.thumbnailUrl || image.fileUrl)" [alt]="issue()!.title" class="h-full w-full object-cover" />
                    </button>
                  }
                </div>
              }
            </div>

            <!-- Description & Details -->
            <div
              class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
            >
              <h2 class="mb-4 text-[18px] font-semibold text-[var(--color-on-surface)]">Description</h2>
              <p class="mb-6 leading-relaxed text-[14px] text-[var(--color-on-surface-variant)]">
                {{ issue()!.description || 'No description provided.' }}
              </p>
              <div class="grid grid-cols-2 gap-4 border-t border-[var(--color-outline-variant)]/30 pt-4">
                <div>
                  <span class="mb-1 block text-[11px] text-[var(--color-outline)]">Assigned Department</span>
                  <span class="flex items-center gap-2 text-[14px] font-medium text-[var(--color-on-surface)]">
                    <span class="material-symbols-outlined text-[16px] text-[var(--color-primary)]">engineering</span>
                    {{ issue()!.currentDepartment?.name || 'Chưa định tuyến' }}
                  </span>
                </div>
                <div>
                  <span class="mb-1 block text-[11px] text-[var(--color-outline)]">Submitter</span>
                  <span class="flex items-center gap-2 text-[14px] font-medium text-[var(--color-on-surface)]">
                    <span class="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-surface-container-high)] text-[10px] font-bold">CS</span>
                    {{ issue()!.reporterDisplayName }}
                  </span>
                </div>
                <div>
                  <span class="mb-1 block text-[11px] text-[var(--color-outline)]">Reported Date</span>
                  <span class="text-[14px] font-medium text-[var(--color-on-surface)]">
                    {{ formatDate(issue()!.reportedAt) }}
                  </span>
                </div>
                <div>
                  <span class="mb-1 block text-[11px] text-[var(--color-outline)]">Reference ID</span>
                  <span class="text-[14px] font-medium text-[var(--color-on-surface)]">
                    #{{ issue()!.publicCode }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Comment API chưa thuộc domain hiện tại; ẩn khỏi UI cho đến khi có contract chính thức. -->
            @if (false) {
            <!-- Comments & Interaction Section -->
            <div
              class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
            >
              <div class="mb-6 flex items-center justify-between">
                <h2 class="text-[18px] font-semibold text-[var(--color-on-surface)]">Community Discussion</h2>
                <button
                  class="flex items-center gap-2 rounded-full border border-[var(--color-outline-variant)]/50 bg-[var(--color-surface-container)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container-high)]"
                >
                  <span class="material-symbols-outlined text-[18px]">thumb_up</span>
                  <span>Upvote ({{ issue()!.upvoteCount }})</span>
                </button>
              </div>

              <!-- Comment Input -->
              @if (authStore.isAuthenticated()) {
                <div class="mb-6 flex gap-4">
                  <div
                    class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[14px] font-bold text-[var(--color-primary)]"
                  >
                    {{ getUserInitials() }}
                  </div>
                  <div class="flex-1">
                    <textarea
                      class="w-full resize-none rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] p-3 text-[14px] text-[var(--color-on-surface)] transition-all focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)] focus:outline-none"
                      placeholder="Add an update or comment..."
                      rows="3"
                      [(ngModel)]="newComment"
                    ></textarea>
                    <div class="mt-2 flex justify-end">
                      <button
                        class="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-[12px] font-medium text-[var(--color-on-primary)] transition-colors hover:bg-[var(--color-primary)]/90"
                        (click)="submitComment()"
                      >
                        Post Comment
                      </button>
                    </div>
                  </div>
                </div>
              } @else {
                <div class="mb-6 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container)] p-4 text-center">
                  <p class="text-[14px] text-[var(--color-on-surface-variant)]">
                    <a routerLink="/login" class="text-[var(--color-primary)] hover:underline">Sign in</a> to join the discussion
                  </p>
                </div>
              }

              <!-- Comment List -->
              <div class="space-y-4">
                <div class="flex gap-4">
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-container-high)] text-[12px] font-bold text-[var(--color-on-surface-variant)]"
                  >
                    PW
                  </div>
                  <div class="flex-1 rounded-lg border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] p-4">
                    <div class="mb-1 flex items-start justify-between">
                      <span class="text-[12px] font-bold text-[var(--color-on-surface)]">Public Works Admin</span>
                      <span class="text-[11px] text-[var(--color-outline)]">2 hours ago</span>
                    </div>
                    <p class="text-[14px] text-[var(--color-on-surface-variant)]">
                      A crew has been dispatched to assess the damage. Temporary patching will be applied by end of day,
                      with permanent repairs scheduled for next week.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            }
          </div>

          <!-- Sidebar Content -->
          <div class="flex flex-col gap-6 md:col-span-4">
            <!-- Location Map Snippet -->
            <div
              class="flex h-[300px] flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] p-1 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
            >
              <div class="relative h-full w-full flex-1 overflow-hidden rounded-t-lg bg-[var(--color-surface-variant)]">
                <iframe class="h-full w-full border-0" [src]="mapEmbedUrl()" title="Incident location map"></iframe>
                <div class="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span class="material-symbols-outlined text-[40px] text-[var(--color-error)] drop-shadow-md"
                    >location_on</span
                  >
                </div>
              </div>
              <div
                class="flex items-center justify-between rounded-b-lg border-t border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-low)] p-4"
              >
                <span class="text-[12px] text-[var(--color-on-surface-variant)]">{{ issue()!.area.name }}</span>
                <a [href]="directionsUrl()" target="_blank" rel="noopener noreferrer"
                  class="text-[12px] font-medium text-[var(--color-primary)] hover:underline">
                  Get Directions
                </a>
              </div>
            </div>

            <!-- Processing Timeline / History -->
            <div
              class="rounded-xl border border-[var(--color-outline-variant)]/30 bg-[var(--color-surface-container-lowest)] p-6 shadow-[0px_4px_20px_rgba(0,0,0,0.05)]"
            >
              <h2 class="mb-6 text-[18px] font-semibold text-[var(--color-on-surface)]">Status History</h2>
              <div class="relative space-y-6 pl-6 before:absolute before:top-2 before:bottom-2 before:left-[11px] before:w-[2px] before:bg-[var(--color-outline-variant)]/50 before:content-['']">
                @for (event of timeline(); track event.id) {
                  <div class="relative">
                    <div class="absolute -left-[30px] z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-surface-container-lowest)] bg-[var(--color-primary-fixed)]">
                      <span class="material-symbols-outlined text-[12px]">history</span>
                    </div>
                    <div class="flex flex-col">
                      <span class="text-[12px] font-bold text-[var(--color-on-surface)]">{{ event.toStatus?.name || event.updateType }}</span>
                      <span class="mb-1 text-[11px] text-[var(--color-outline)]">{{ formatDate(event.createdAt) }}</span>
                      @if (event.note) { <span class="text-[14px] text-[var(--color-on-surface-variant)]">{{ event.note }}</span> }
                    </div>
                  </div>
                }
                @if (timeline().length === 0) {
                <!-- Timeline Item: Current -->
                <div class="relative">
                  <div
                    class="absolute -left-[30px] z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-surface-container-lowest)] bg-[#FEF3C7]"
                  >
                    <span class="material-symbols-outlined text-[12px]">sync</span>
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[12px] font-bold text-[var(--color-on-surface)]">In Progress</span>
                    <span class="mb-1 text-[11px] text-[var(--color-outline)]">Today, 10:30 AM</span>
                    <span class="text-[14px] text-[var(--color-on-surface-variant)]">Crew dispatched for initial assessment.</span>
                  </div>
                </div>
                }
                <!-- Timeline Item: Past -->
                <div class="relative">
                  <div
                    class="absolute -left-[30px] z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-surface-container-lowest)] bg-[var(--color-surface-container-high)]"
                  >
                    <span class="material-symbols-outlined text-[12px] text-[var(--color-on-surface-variant)]"
                      >assignment_turned_in</span
                    >
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[12px] font-bold text-[var(--color-on-surface)]">Assigned</span>
                    <span class="mb-1 text-[11px] text-[var(--color-outline)]">{{ formatDate(issue()!.reportedAt) }}</span>
                    <span class="text-[14px] text-[var(--color-on-surface-variant)]">Assigned to Dept. of Public Works.</span>
                  </div>
                </div>
                <!-- Timeline Item: Past -->
                <div class="relative">
                  <div
                    class="absolute -left-[30px] z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 border-[var(--color-surface-container-lowest)] bg-[var(--color-surface-container-high)]"
                  >
                    <span class="material-symbols-outlined text-[12px] text-[var(--color-on-surface-variant)]"
                      >check_circle</span
                    >
                  </div>
                  <div class="flex flex-col">
                    <span class="text-[12px] font-bold text-[var(--color-on-surface)]">Report Submitted</span>
                    <span class="mb-1 text-[11px] text-[var(--color-outline)]">{{ formatDate(issue()!.reportedAt) }}</span>
                    <span class="text-[14px] text-[var(--color-on-surface-variant)]">Report received via Citizen Portal.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="flex flex-col items-center justify-center py-20 text-[var(--color-on-surface-variant)]">
          <span class="material-symbols-outlined text-4xl">error</span>
          <p class="mt-4 text-lg">Issue not found</p>
          <a routerLink="/citizen/reports" class="mt-4 text-[var(--color-primary)] hover:underline">
            Back to Reports
          </a>
        </div>
      }
    </div>
  `,
  styles: [
    `
      .material-symbols-outlined {
        font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
      }
    `,
  ],
})
export class IncidentDetailComponent implements OnInit {
  protected readonly authStore = inject(AuthStore)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  private readonly dashboardService = inject(DashboardService)
  private readonly sanitizer = inject(DomSanitizer)

  issue = signal<IssueDetailResponse | null>(null)
  timeline = signal<IssueTimelineItemResponse[]>([])
  selectedImageIndex = signal(0)
  isLoading = signal(true)
  newComment = ''

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')
    if (id) {
      this.loadIssue(+id)
    }
  }

  private loadIssue(id: number): void {
    this.isLoading.set(true)
    forkJoin({
      issue: this.dashboardService.getIssueById(id),
      timeline: this.dashboardService.getTimeline(id),
    }).subscribe({
      next: ({ issue, timeline }) => {
        this.issue.set(issue)
        this.timeline.set(timeline)
        this.selectedImageIndex.set(0)
        this.isLoading.set(false)
      },
      error: () => {
        this.issue.set(null)
        this.timeline.set([])
        this.isLoading.set(false)
      },
    })
  }

  goBack(): void {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      void this.router.navigate(['/citizen/reports'])
    }
  }

  formatDate(date: string): string {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  formatTimeAgo(date: string): string {
    return this.dashboardService.formatTimeAgo(date)
  }

  getImageUrl(relativePath: string | null | undefined): string | null {
    return this.dashboardService.getImageUrl(relativePath)
  }

  selectedImageUrl(): string | null {
    const current = this.issue()
    if (!current) return null
    const attachment = current.attachments[this.selectedImageIndex()]
    return this.getImageUrl(attachment?.fileUrl || current.thumbnailUrl)
  }

  selectImage(index: number): void {
    this.selectedImageIndex.set(index)
  }

  toggleUpvote(): void {
    const current = this.issue()
    if (!current) return
    if (!this.authStore.isAuthenticated()) {
      void this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } })
      return
    }

    const request = current.hasUpvoted
      ? this.dashboardService.removeUpvote(current.id)
      : this.dashboardService.upvoteIssue(current.id)
    request.subscribe({
      next: (result) => this.issue.update((value) => value
        ? { ...value, hasUpvoted: result.hasUpvoted, upvoteCount: result.upvoteCount }
        : value),
    })
  }

  directionsUrl(): string {
    const current = this.issue()
    return current
      ? `https://www.google.com/maps/dir/?api=1&destination=${current.latitude},${current.longitude}`
      : 'https://www.google.com/maps'
  }

  mapEmbedUrl(): SafeResourceUrl {
    const current = this.issue()
    if (!current) return this.sanitizer.bypassSecurityTrustResourceUrl('about:blank')
    const delta = 0.004
    const url = `https://www.openstreetmap.org/export/embed.html?bbox=${current.longitude - delta}%2C${current.latitude - delta}%2C${current.longitude + delta}%2C${current.latitude + delta}&layer=mapnik&marker=${current.latitude}%2C${current.longitude}`
    return this.sanitizer.bypassSecurityTrustResourceUrl(url)
  }

  getUserInitials(): string {
    const name = this.authStore.user()?.fullName || 'User'
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(-2)
      .join('')
      .toUpperCase()
  }

  submitComment(): void {
    if (this.newComment.trim()) {
      // TODO: Implement comment submission
      console.log('Submitting comment:', this.newComment)
      this.newComment = ''
    }
  }
}
