import '@angular/compiler'
import { describe, it, expect } from 'vitest'
import { createEnvironmentInjector, runInInjectionContext } from '@angular/core'
import { ButtonComponent } from './button'

describe('ButtonComponent', () => {
  it('instantiates within injection context', () => {
    const injector = createEnvironmentInjector([], {} as any)
    const btn = runInInjectionContext(injector, () => new ButtonComponent())
    expect(btn).toBeTruthy()
    expect(btn.variant()).toBe('primary')
    expect(btn.size()).toBe('md')
    expect(btn.loading()).toBe(false)
    expect(btn.disabled()).toBe(false)
  })
})
