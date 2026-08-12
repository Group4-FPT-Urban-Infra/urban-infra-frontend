import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  OnInit,
  ViewChild,
  input,
  output,
  signal,
} from '@angular/core'
import * as L from 'leaflet'

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

@Component({
  selector: 'app-map-picker',
  template: `
    <div class="relative flex h-full w-full flex-col overflow-hidden rounded-xl" style="min-height: 300px;">
      <!-- Map Container -->
      <div #mapContainer class="map-container" style="flex: 1; min-height: 300px;"></div>

      <!-- Location Info Overlay -->
      @if (selectedLocation()) {
        <div
          class="absolute bottom-4 left-4 right-4 z-[1000] rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]/95 p-3 shadow-lg backdrop-blur-sm"
        >
          <div class="flex items-start gap-3">
            <div
              class="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-primary-container)]"
            >
              <span class="material-symbols-outlined text-xl text-[var(--color-on-primary-container)]">
                location_on
              </span>
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-sm font-medium text-[var(--color-on-surface)]">
                {{ selectedLocation()!.address || 'Location selected' }}
              </p>
              <p class="mt-0.5 text-xs text-[var(--color-on-surface-variant)]">
                {{ selectedLocation()!.latitude.toFixed(6) }}, {{ selectedLocation()!.longitude.toFixed(6) }}
              </p>
            </div>
            <button
              type="button"
              (click)="clearLocation()"
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] transition-colors hover:bg-[var(--color-error-container)] hover:text-[var(--color-on-error-container)]"
            >
              <span class="material-symbols-outlined text-lg">close</span>
            </button>
          </div>
        </div>
      }

      <!-- Instructions Overlay -->
      @if (!selectedLocation() && !isLoading()) {
        <div
          class="pointer-events-none absolute inset-x-4 top-4 z-[1000] rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]/90 p-3 text-center shadow-sm backdrop-blur-sm"
        >
          <p class="text-sm text-[var(--color-on-surface)]">
            Tap on the map to pin the incident location
          </p>
        </div>
      }

      <!-- Loading Overlay -->
      @if (isLoading()) {
        <div
          class="absolute inset-0 z-[1000] flex items-center justify-center bg-[var(--color-surface-container-lowest)]/80 backdrop-blur-sm"
        >
          <div class="flex flex-col items-center gap-2">
            <span class="material-symbols-outlined animate-spin text-4xl text-[var(--color-primary)]">
              progress_activity
            </span>
            <p class="text-sm text-[var(--color-on-surface-variant)]">{{ loadingMessage() }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      height: 100%;
      width: 100%;
    }

    .map-container {
      height: 100%;
      width: 100%;
      min-height: 300px;
    }

    :host ::ng-deep .leaflet-container {
      height: 100%;
      width: 100%;
      border-radius: inherit;
      background: var(--color-surface-dim);
    }

    :host ::ng-deep .leaflet-control-attribution {
      font-size: 10px;
      background: var(--color-surface-container-lowest);
      color: var(--color-on-surface-variant);
    }

    :host ::ng-deep .leaflet-control-zoom {
      border: none !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
    }

    :host ::ng-deep .leaflet-control-zoom a {
      background: var(--color-surface-container-lowest) !important;
      color: var(--color-on-surface) !important;
      border: none !important;
      width: 36px !important;
      height: 36px !important;
      line-height: 36px !important;
    }

    :host ::ng-deep .leaflet-control-zoom a:hover {
      background: var(--color-surface-container-high) !important;
    }

    :host ::ng-deep .custom-marker-icon {
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
    }
  `,
})
export class MapPickerComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mapContainer', { static: true }) mapContainer!: ElementRef<HTMLDivElement>

  readonly initialLocation = input<{ latitude: number; longitude: number } | null>(null)
  readonly locationSelected = output<{ latitude: number; longitude: number; address: string }>()
  readonly locationCleared = output<void>()

  selectedLocation = signal<{ latitude: number; longitude: number; address: string } | null>(null)
  isLoading = signal(false)
  loadingMessage = signal('Getting location...')

  private map!: L.Map
  private marker!: L.Marker
  private reverseGeocodeTimeout: ReturnType<typeof setTimeout> | null = null

  ngAfterViewInit(): void {
    this.initMap()
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove()
    }
    if (this.reverseGeocodeTimeout) {
      clearTimeout(this.reverseGeocodeTimeout)
    }
  }

  private initMap(): void {
    // Ensure container has dimensions
    const container = this.mapContainer.nativeElement
    if (!container || container.clientWidth === 0 || container.clientHeight === 0) {
      // Retry after a short delay if container has no dimensions yet
      setTimeout(() => this.initMap(), 100)
      return
    }

    // Default to Ho Chi Minh City
    const defaultLat = this.initialLocation()?.latitude || 10.7769
    const defaultLng = this.initialLocation()?.longitude || 106.7009

    this.map = L.map(container, {
      center: [defaultLat, defaultLng],
      zoom: 15,
      zoomControl: true,
    })

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(this.map)

    // If we have an initial location, place the marker
    if (this.initialLocation()) {
      this.placeMarker(defaultLat, defaultLng)
    }

    // Click handler for map
    this.map.on('click', (e: L.LeafletMouseEvent) => {
      this.onMapClick(e.latlng.lat, e.latlng.lng)
    })
  }

  private onMapClick(lat: number, lng: number): void {
    this.isLoading.set(true)
    this.loadingMessage.set('Getting address...')

    // Clear previous timeout
    if (this.reverseGeocodeTimeout) {
      clearTimeout(this.reverseGeocodeTimeout)
    }

    // Debounce reverse geocoding
    this.reverseGeocodeTimeout = setTimeout(() => {
      this.reverseGeocode(lat, lng)
    }, 300)
  }

  private async reverseGeocode(lat: number, lng: number): Promise<void> {
    try {
      // Use Nominatim for reverse geocoding (free, no API key needed)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'Accept-Language': 'en',
          },
        }
      )

      if (!response.ok) {
        throw new Error('Reverse geocoding failed')
      }

      const data = await response.json()

      // Build address string
      let address = ''
      if (data.address) {
        const parts: string[] = []
        if (data.address.road) parts.push(data.address.road)
        if (data.address.neighbourhood) parts.push(data.address.neighbourhood)
        if (data.address.suburb) parts.push(data.address.suburb)
        if (data.address.city || data.address.town || data.address.village) {
          parts.push(data.address.city || data.address.town || data.address.village)
        }
        if (data.address.state) parts.push(data.address.state)
        address = parts.length > 0 ? parts.join(', ') : data.display_name || ''
      }
      if (!address) {
        address = data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`
      }

      this.placeMarker(lat, lng, address)
      this.isLoading.set(false)
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      // Fallback to coordinates
      this.placeMarker(lat, lng, `${lat.toFixed(6)}, ${lng.toFixed(6)}`)
      this.isLoading.set(false)
    }
  }

  private placeMarker(lat: number, lng: number, address?: string): void {
    // Remove existing marker
    if (this.marker) {
      this.map.removeLayer(this.marker)
    }

    // Custom marker icon
    const customIcon = L.divIcon({
      html: `
        <div class="custom-marker-icon flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)] shadow-lg animate-bounce">
          <span class="material-symbols-outlined text-xl text-[var(--color-on-primary)]">location_on</span>
        </div>
      `,
      className: '',
      iconSize: [40, 40],
      iconAnchor: [20, 40],
      popupAnchor: [0, -40],
    })

    this.marker = L.marker([lat, lng], { icon: customIcon, draggable: true }).addTo(this.map)

    // Handle marker drag
    this.marker.on('dragend', () => {
      const pos = this.marker.getLatLng()
      this.onMapClick(pos.lat, pos.lng)
    })

    const location = {
      latitude: lat,
      longitude: lng,
      address: address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
    }

    this.selectedLocation.set(location)
    this.locationSelected.emit(location)
  }

  clearLocation(): void {
    if (this.marker) {
      this.map.removeLayer(this.marker)
    }
    this.selectedLocation.set(null)
    this.locationCleared.emit()
  }

  // Public method to center map on location
  centerOnLocation(lat: number, lng: number): void {
    if (this.map) {
      this.map.setView([lat, lng], 16)
      this.placeMarker(lat, lng)
    }
  }
}
