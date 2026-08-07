import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { TranslatePipe } from '@ngx-translate/core'
import * as L from 'leaflet'
import { CardComponent } from '../../shared/ui/card'
import { PublicMapService } from './public-map.service'
import type { Incident, IncidentSeverity } from './public-map.types'

/** Trung tâm bản đồ mặc định: Hà Nội. */
const DEFAULT_CENTER: L.LatLngTuple = [21.0278, 105.8342]
const DEFAULT_ZOOM = 13

const SEVERITY_COLOR: Record<IncidentSeverity, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#ef4444',
}

@Component({
  selector: 'app-public-map-page',
  imports: [CardComponent, TranslatePipe],
  template: `
    <section class="flex flex-col gap-4">
      <div>
        <h1 class="text-3xl font-bold">{{ 'publicMap.title' | translate }}</h1>
        <p class="mt-2 text-gray-500">{{ 'publicMap.tagline' | translate }}</p>
      </div>

      <app-card>
        <div class="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-4 text-sm dark:border-gray-800">
          <div class="flex items-center gap-4">
            @for (item of legend; track item.severity) {
              <span class="flex items-center gap-1.5">
                <span class="h-2.5 w-2.5 rounded-full" [style.background]="item.color"></span>
                {{ item.label | translate }}
              </span>
            }
          </div>
          <span class="text-gray-500">
            {{ 'publicMap.lastUpdated' | translate }}: {{ lastUpdated() || '—' }}
            ({{ incidents().length }} {{ 'publicMap.incidents' | translate }})
          </span>
        </div>

        <div #mapContainer class="h-[65vh] min-h-[420px] w-full rounded-b-xl"></div>
      </app-card>
    </section>
  `,
})
export class PublicMapPage implements AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true })
  private readonly mapContainer!: ElementRef<HTMLDivElement>

  private readonly service = inject(PublicMapService)
  private map?: L.Map
  private markersLayer?: L.LayerGroup

  protected readonly legend = [
    { severity: 'high' as const, color: SEVERITY_COLOR.high, label: 'publicMap.severity.high' },
    { severity: 'medium' as const, color: SEVERITY_COLOR.medium, label: 'publicMap.severity.medium' },
    { severity: 'low' as const, color: SEVERITY_COLOR.low, label: 'publicMap.severity.low' },
  ]

  /** Danh sách sự cố, tự cập nhật theo chu kỳ polling của PublicMapService. */
  protected readonly incidents = toSignal(this.service.incidents$, {
    initialValue: [] as Incident[],
  })
  protected readonly lastUpdated = signal('')

  constructor() {
    // Chạy lại mỗi khi `incidents` đổi (mỗi lần poll) để vẽ lại marker trên bản đồ.
    effect(() => {
      const incidents = this.incidents()
      this.renderMarkers(incidents)
      if (incidents.length) {
        this.lastUpdated.set(new Date().toLocaleTimeString())
      }
    })
  }

  ngAfterViewInit(): void {
    this.map = L.map(this.mapContainer.nativeElement).setView(DEFAULT_CENTER, DEFAULT_ZOOM)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(this.map)
    this.markersLayer = L.layerGroup().addTo(this.map)
    this.renderMarkers(this.incidents())
  }

  ngOnDestroy(): void {
    this.map?.remove()
  }

  private renderMarkers(incidents: Incident[]): void {
    if (!this.markersLayer) return
    this.markersLayer.clearLayers()
    for (const incident of incidents) {
      L.circleMarker([incident.lat, incident.lng], {
        radius: 9,
        weight: 2,
        color: '#ffffff',
        fillColor: SEVERITY_COLOR[incident.severity],
        fillOpacity: 0.9,
      })
        .bindPopup(
          `<strong>${escapeHtml(incident.title)}</strong><br/>${escapeHtml(incident.category)}`,
        )
        .addTo(this.markersLayer)
    }
  }
}

/** Sự cố lấy từ báo cáo công dân nên escape trước khi bơm vào popup HTML của Leaflet. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
