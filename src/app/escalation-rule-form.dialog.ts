import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Department, Role, SlaPolicy } from '../app/admin.types';
import { CreateEscalationRuleDto, EscalationRule } from './escalation-rules.types';
import { SpinnerComponent } from '../../../urban-infra-frontend-main/src/app/shared/ui/spinner';

@Component({
  selector: 'app-escalation-rule-form-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe, SpinnerComponent],
  template: `
    @if (visible) {
      <div
        class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50"
        (click)="close()"
      >
        <div
          class="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-xl dark:bg-slate-800"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
            <h3 class="text-xl font-semibold text-slate-900 dark:text-white">
              {{
                (rule ? 'escalationRules.editTitle' : 'escalationRules.createTitle') | translate
              }}
            </h3>
            <button
              (click)="close()"
              class="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-900 dark:hover:bg-slate-600 dark:hover:text-white"
            >
              <span class="sr-only">{{ 'common.close' | translate }}</span>
              <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clip-rule="evenodd"
                ></path>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <form #form="ngForm" (ngSubmit)="onSubmit(form)" class="mt-6 space-y-6">
            <!-- SLA Policy -->
            <div>
              <label for="slaPolicyId" class="mb-2 block text-sm font-medium dark:text-white">
                {{ 'escalationRules.slaPolicy' | translate }}
              </label>
              <select
                id="slaPolicyId"
                name="slaPolicyId"
                [(ngModel)]="model.slaPolicyId"
                required
                class="block w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:placeholder-slate-400"
              >
                @for (policy of slaPolicies; track policy.id) {
                  <option [value]="policy.id">{{ policy.policyName }}</option>
                }
              </select>
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <!-- Overdue Minutes -->
              <div>
                <label for="overdueMinutes" class="mb-2 block text-sm font-medium dark:text-white">
                  {{ 'escalationRules.overdueMinutes' | translate }}
                </label>
                <input
                  type="number"
                  id="overdueMinutes"
                  name="overdueMinutes"
                  [(ngModel)]="model.overdueMinutes"
                  required
                  min="1"
                  class="block w-full rounded-lg border p-2.5 text-sm"
                />
              </div>

              <!-- Escalation Level -->
              <div>
                <label for="escalationLevel" class="mb-2 block text-sm font-medium dark:text-white">
                  {{ 'escalationRules.escalationLevel' | translate }}
                </label>
                <input
                  type="number"
                  id="escalationLevel"
                  name="escalationLevel"
                  [(ngModel)]="model.escalationLevel"
                  required
                  min="1"
                  class="block w-full rounded-lg border p-2.5 text-sm"
                />
              </div>
            </div>

            <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
              <!-- Target Department -->
              <div>
                <label for="targetDepartmentId" class="mb-2 block text-sm font-medium dark:text-white">
                  {{ 'escalationRules.targetDepartment' | translate }}
                </label>
                <select id="targetDepartmentId" name="targetDepartmentId" [(ngModel)]="model.targetDepartmentId" class="block w-full rounded-lg border p-2.5 text-sm">
                  <option [ngValue]="null">{{ 'common.none' | translate }}</option>
                  @for (dept of departments; track dept.id) {
                    <option [value]="dept.id">{{ dept.name }}</option>
                  }
                </select>
              </div>

              <!-- Target Role -->
              <div>
                <label for="targetRoleId" class="mb-2 block text-sm font-medium dark:text-white">
                  {{ 'escalationRules.targetRole' | translate }}
                </label>
                <select id="targetRoleId" name="targetRoleId" [(ngModel)]="model.targetRoleId" class="block w-full rounded-lg border p-2.5 text-sm">
                  <option [ngValue]="null">{{ 'common.none' | translate }}</option>
                  @for (role of roles; track role.id) {
                    <option [value]="role.id">{{ role.name }}</option>
                  }
                </select>
              </div>
            </div>

            <!-- Is Active -->
            <div class="flex items-center">
              <input id="isActive" name="isActive" type="checkbox" [(ngModel)]="model.isActive" class="h-4 w-4 rounded border-slate-300 bg-slate-100 text-blue-600 focus:ring-2 focus:ring-blue-500">
              <label for="isActive" class="ms-2 text-sm font-medium text-slate-900 dark:text-slate-300">{{ 'escalationRules.active' | translate }}</label>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3 border-t pt-4 dark:border-slate-700">
              <button (click)="close()" type="button" class="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-900 hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200 dark:border-slate-600 dark:text-white dark:hover:border-slate-600 dark:hover:bg-slate-700">
                {{ 'common.cancel' | translate }}
              </button>
              <button type="submit" [disabled]="form.invalid || saving" class="inline-flex items-center rounded-lg bg-blue-700 px-5 py-2.5 text-center text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:opacity-50">
                @if (saving) {
                  <app-spinner class="mr-2 h-4 w-4" />
                }
                {{ 'common.save' | translate }}
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
})
export class EscalationRuleFormDialog {
  @Input() visible = false;
  @Input() rule: EscalationRule | null = null;
  @Input() slaPolicies: SlaPolicy[] = [];
  @Input() departments: Department[] = [];
  @Input() roles: Role[] = [];
  @Input() saving = false;

  @Output() save = new EventEmitter<CreateEscalationRuleDto>();
  @Output() closed = new EventEmitter<void>();

  model: CreateEscalationRuleDto = this.getInitialModel();

  ngOnChanges(changes: SimpleChanges) {
    if (changes['rule'] || changes['visible']) {
      this.model = this.rule ? { ...this.rule } : this.getInitialModel();
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid) return;
    this.save.emit(this.model);
  }

  close() {
    this.closed.emit();
  }

  private getInitialModel(): CreateEscalationRuleDto {
    return {
      slaPolicyId: 0,
      overdueMinutes: 60,
      escalationLevel: 1,
      targetDepartmentId: null,
      targetRoleId: null,
      notificationTitle: '',
      notificationTemplate: '',
      isActive: true,
    };
  }
}