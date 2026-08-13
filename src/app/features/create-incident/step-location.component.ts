import { Component, EventEmitter, OnInit, Output, inject, signal } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MapPickerComponent } from '../../shared/components/map-picker/map-picker.component'
import { IncidentStore } from './incident.store'

@Component({
  selector: 'app-step-location',
  imports: [FormsModule, MapPickerComponent],
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

      <!-- Area Dropdown -->
      <div class="flex flex-col gap-1">
        <label
          class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]"
          for="area"
        >
          Area <span class="text-[var(--color-error)]">*</span>
        </label>
        <div class="relative">
          <select
            id="area"
            [(ngModel)]="selectedAreaId"
            (ngModelChange)="onAreaChange($event)"
            name="area"
            class="w-full cursor-pointer appearance-none rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] py-[10px] pl-4 pr-10 text-sm text-[var(--color-on-surface)] transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-fixed)]"
          >
            <option [ngValue]="null" disabled>Select area...</option>
            @for (area of store.areas(); track area.areaId) {
              <option [value]="area.areaId">{{ area.areaName }}</option>
            }
          </select>
          <span
            class="material-symbols-outlined pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[var(--color-on-surface-variant)]"
          >
            expand_more
          </span>
        </div>
      </div>

      <!-- Map Container -->
      <div
        class="relative overflow-hidden rounded-xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-dim)]"
        style="height: 350px;"
      >
        @if (isLoadingLocation()) {
          <div class="flex h-full w-full flex-col items-center justify-center gap-3">
            <span class="material-symbols-outlined animate-spin text-4xl text-[var(--color-primary)]">
              progress_activity
            </span>
            <p class="text-sm text-[var(--color-on-surface-variant)]">Getting your location...</p>
          </div>
        } @else {
          <app-map-picker
            [initialLocation]="store.location() ? { latitude: store.location()!.latitude, longitude: store.location()!.longitude } : null"
            (locationSelected)="onLocationSelected($event)"
            (locationCleared)="onLocationCleared()"
          />
        }
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
          (click)="centerToArea()"
          [disabled]="!selectedAreaId"
          class="flex flex-1 items-center justify-center gap-2 rounded-lg border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)] px-4 py-3 text-sm font-medium text-[var(--color-on-surface)] transition-colors hover:bg-[var(--color-surface-container)] disabled:opacity-60"
        >
          <span class="material-symbols-outlined text-xl">edit_location</span>
          Center to Area
        </button>
      </div>

      <!-- Manual Address Entry (Optional) -->
      <div class="flex flex-col gap-2">
        <label
          class="text-[12px] font-medium leading-4 tracking-wide text-[var(--color-on-surface)]"
          for="address"
        >
          Enter address (optional)
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

      <!-- Validation Error -->
      @if (showAreaError()) {
        <p class="text-xs text-[var(--color-error)]">
          Please select an area and pin a location on the map before continuing.
        </p>
      }

      <!-- Continue Button -->
      <button
        type="button"
        (click)="proceed()"
        class="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-[var(--color-on-primary)] shadow-sm transition-colors hover:bg-[var(--color-on-primary-fixed-variant)] disabled:opacity-60 disabled:cursor-not-allowed"
      >
        Continue to Details
        <span class="material-symbols-outlined text-xl">arrow_forward</span>
      </button>
    </div>
  `,
})
export class StepLocationComponent implements OnInit {
  @Output() stepComplete = new EventEmitter<void>()

  protected readonly store = inject(IncidentStore)
  protected isLoadingLocation = signal(false)
  protected manualAddress = ''
  protected selectedAreaId: number | null = null
  protected showAreaError = signal(false)

  ngOnInit(): void {
    this.selectedAreaId = this.store.details().areaId
    if (this.store.location()) {
      this.manualAddress = this.store.location()!.address || ''
    }
  }

  onAreaChange(areaId: number): void {
    this.selectedAreaId = areaId
    this.store.setAreaId(areaId)
    this.showAreaError.set(false)
  }

  onLocationSelected(location: { latitude: number; longitude: number; address: string }): void {
    this.store.setLocation(location)
    this.manualAddress = location.address
    this.showAreaError.set(false)
  }

  onLocationCleared(): void {
    // Optionally handle location cleared
  }

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

  centerToArea(): void {
    // This would typically use the area's centroid from the API
    // For now, we'll just show a placeholder message
    if (this.selectedAreaId) {
      const area = this.store.areas().find(a => a.areaId === this.selectedAreaId)
      if (area && area.areaType) {
        // Placeholder - in real implementation, use area centroid from API
        console.log('Center to area:', area.areaName)
      }
    }
  }

  proceed(): void {
    if (!this.selectedAreaId || !this.store.location() || this.store.location()!.latitude === 0) {
      this.showAreaError.set(true)
      return
    }

    this.store.setAreaId(this.selectedAreaId)

    if (this.manualAddress && this.store.location()!.address !== this.manualAddress) {
      this.store.setLocation({
        ...this.store.location()!,
        address: this.manualAddress,
      })
    }

    this.stepComplete.emit()
  }
}
