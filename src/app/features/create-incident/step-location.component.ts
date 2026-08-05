import { Component, EventEmitter, Output, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { IncidentStore } from './incident.store'

@Component({
  selector: 'app-step-location',
  imports: [FormsModule],
  template: `
    <div class="flex flex-col gap-6">
      <div class="mb-2">
        <h2 class="text-[20px] font-semibold leading-7 text-[var(--color-on-surface)]">
          Select Location
        </h2>
        <p class="mt-1 text-sm text-[var(--color-on-surface-variant)]">
          Pin the exact location of the incident on the map or use your current location.
        </p>
      </div>

      <!-- Map Container -->
      <div
        class="relative flex h-[300px] flex-col overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-dim)]"
      >
        @if (isLoadingLocation()) {
          <div class="flex flex-1 flex-col items-center justify-center gap-3">
            <span class="material-symbols-outlined animate-spin text-4xl text-[var(--color-primary)]">
              progress_activity
            </span>
            <p class="text-sm text-[var(--color-on-surface-variant)]">Getting your location...</p>
          </div>
        } @else if (store.location()) {
          <div class="flex flex-1 flex-col items-center justify-center gap-3 bg-[var(--color-surface-dim)]">
            <div
              class="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-primary-container)]"
            >
              <span class="material-symbols-outlined icon-filled text-2xl text-[var(--color-on-primary-container)]">
                location_on
              </span>
            </div>
            <p class="text-sm font-medium text-[var(--color-on-surface)]">
              {{ store.location()!.address || 'Location selected' }}
            </p>
            @if (store.location()!.latitude && store.location()!.longitude) {
              <p class="text-xs text-[var(--color-on-surface-variant)]">
                {{ store.location()!.latitude.toFixed(6) }}, {{ store.location()!.longitude.toFixed(6) }}
              </p>
            }
          </div>
        } @else {
          <div class="flex flex-1 flex-col items-center justify-center gap-4">
            <div
              class="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-container-high)]"
            >
              <span class="material-symbols-outlined text-4xl text-[var(--color-on-surface-variant)]">
                my_location
              </span>
            </div>
            <p class="text-sm text-[var(--color-on-surface-variant)]">
              Tap the button below to detect your current location
            </p>
          </div>
        }

        <!-- Map placeholder - Replace with actual map component (Leaflet/OpenLayers) -->
        <div
          class="pointer-events-none absolute inset-0 opacity-20"
          style="background-image: url('/civic_map_preview.jpg'); background-size: cover; background-position: center;"
        ></div>
      </div>

      <!-- Action Buttons -->
      <div class="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          (click)="getCurrentLocation()"
          [disabled]="isLoadingLocation()"
          class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)] disabled:opacity-60"
        >
          <span class="material-symbols-outlined text-xl">
            {{ isLoadingLocation() ? 'progress_activity' : 'my_location' }}
          </span>
          {{ isLoadingLocation() ? 'Detecting...' : 'Use Current Location' }}
        </button>
        <button
          type="button"
          (click)="openMapPicker()"
          class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)]"
        >
          <span class="material-symbols-outlined text-xl">edit_location</span>
          Pick on Map
        </button>
      </div>

      <!-- Manual Address Entry -->
      <div class="flex flex-col gap-2">
        <label
          class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]"
          for="address"
        >
          Or enter address manually
        </label>
        <div class="relative">
          <span
            class="material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-xl text-[var(--color-outline-variant)]"
          >
            location_on
          </span>
          <input
            id="address"
            type="text"
            [(ngModel)]="manualAddress"
            placeholder="123 Main Street, District..."
            class="w-full rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] py-[10px] pl-10 pr-4 text-sm text-[var(--color-on-surface)] placeholder:text-[var(--color-outline)] transition-all focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-fixed)]"
          />
        </div>
      </div>

      <!-- Continue Button -->
      <button
        type="button"
        (click)="proceed()"
        [disabled]="!store.canProceedFromLocation() && !manualAddress"
        class="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-on-primary-fixed-variant)] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Continue to Details
        <span class="material-symbols-outlined text-xl">arrow_forward</span>
      </button>
    </div>
  `,
})
export class StepLocationComponent {
  @Output() stepComplete = new EventEmitter<void>()

  protected readonly store = inject(IncidentStore)
  protected isLoadingLocation = signal(false)
  protected manualAddress = ''

  getCurrentLocation(): void {
    if (!navigator.geolocation) {
      console.error('Geolocation is not supported')
      return
    }

    this.isLoadingLocation.set(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        this.store.setLocation({
          latitude,
          longitude,
          address: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
        })
        this.isLoadingLocation.set(false)
      },
      () => {
        this.isLoadingLocation.set(false)
        this.store.setLocation({
          latitude: 10.7769,
          longitude: 106.7009,
          address: 'Ho Chi Minh City, Vietnam',
        })
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  openMapPicker(): void {
    this.store.setLocation({
      latitude: 10.7829,
      longitude: 106.7016,
      address: 'Nguyen Hue Walking Street, District 1, HCMC',
    })
  }

  proceed(): void {
    if (this.manualAddress && !this.store.location()) {
      this.store.setLocation({
        latitude: 0,
        longitude: 0,
        address: this.manualAddress,
      })
    }
    this.stepComplete.emit()
  }
}
