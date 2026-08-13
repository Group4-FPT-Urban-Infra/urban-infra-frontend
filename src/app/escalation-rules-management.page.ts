import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { EscalationRulesStore } from './escalation-rules.store';
import { SpinnerComponent } from '../../../urban-infra-frontend-main/src/app/shared/ui/spinner'; // Sửa lại path ngắn gọn & chuẩn
import { EscalationRuleFormDialog } from './escalation-rule-form.dialog';
import { CreateEscalationRuleDto, EscalationRule, UpdateEscalationRuleDto } from './escalation-rules.types';

@Component({
  selector: 'app-escalation-rules-management-page',
  standalone: true,
  imports: [CommonModule, TranslatePipe, SpinnerComponent, EscalationRuleFormDialog],
  template: `
    <div class="p-4 sm:p-6 lg:p-8">
      <div class="sm:flex sm:items-center">
        <div class="sm:flex-auto">
          <h1 class="text-base font-semibold leading-6 text-slate-900 dark:text-white">
            {{ 'escalationRules.title' | translate }}
          </h1>
          <p class="mt-2 text-sm text-slate-700 dark:text-slate-300">
            {{ 'escalationRules.description' | translate }}
          </p>
        </div>
        <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            (click)="openForm()"
            type="button"
            class="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            {{ 'escalationRules.create' | translate }}
          </button>
        </div>
      </div>

      @if (store.loading()) {
        <div class="mt-8 flex justify-center">
          <app-spinner />
        </div>
      } @else if (store.error()) {
        <div class="mt-8 rounded-md bg-red-50 p-4">
          <p class="text-sm font-medium text-red-800">{{ store.error() }}</p>
        </div>
      } @else if (!store.rulesView().length) {
        <div class="mt-8 text-center">
          <h3 class="text-lg font-medium text-slate-900 dark:text-white">
            {{ 'escalationRules.emptyTitle' | translate }}
          </h3>
          <p class="mt-1 text-sm text-slate-500">
            {{ 'escalationRules.emptyDescription' | translate }}
          </p>
          <div class="mt-6">
            <button
              (click)="openForm()"
              type="button"
              class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              {{ 'escalationRules.create' | translate }}
            </button>
          </div>
        </div>
      } @else {
        <div class="mt-8 flow-root">
          <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table class="min-w-full divide-y divide-slate-300 dark:divide-slate-700">
                <thead>
                  <tr>
                    <th scope="col" class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold sm:pl-0">
                      {{ 'escalationRules.slaPolicy' | translate }}
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">
                      {{ 'escalationRules.overdueMinutes' | translate }}
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">
                      {{ 'escalationRules.escalationLevel' | translate }}
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">
                      {{ 'escalationRules.targetDepartment' | translate }}
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">
                      {{ 'escalationRules.targetRole' | translate }}
                    </th>
                    <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold">
                      {{ 'escalationRules.status' | translate }}
                    </th>
                    <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span class="sr-only">{{ 'common.actions' | translate }}</span>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
                  @for (rule of store.rulesView(); track rule.id) {
                    <tr>
                      <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium sm:pl-0">
                        {{ rule.slaPolicyName }}
                      </td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm">{{ rule.overdueMinutes }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm">{{ rule.escalationLevel }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm">{{ rule.targetDepartmentName }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm">{{ rule.targetRoleName }}</td>
                      <td class="whitespace-nowrap px-3 py-4 text-sm">
                        @if (rule.isActive) {
                          <span class="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900 dark:text-green-300">
                            {{ 'escalationRules.active' | translate }}
                          </span>
                        } @else {
                          <span class="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:bg-red-900 dark:text-red-300">
                            {{ 'escalationRules.inactive' | translate }}
                          </span>
                        }
                      </td>
                      <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button (click)="openForm(rule)" class="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300">
                          {{ 'common.edit' | translate }}
                        </button>
                        <button (click)="onDelete(rule.id)" class="ml-4 text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                          {{ 'common.delete' | translate }}
                        </button>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>

    <app-escalation-rule-form-dialog
      [visible]="isFormVisible"
      [rule]="selectedRule"
      [slaPolicies]="store.slaPolicies()"
      [departments]="store.departments()"
      [roles]="store.roles()"
      [saving]="store.saving()"
      (save)="onSave($event)"
      (closed)="closeForm()"
    />
  `,
})
export class EscalationRulesManagementPage implements OnInit {
  readonly store = inject(EscalationRulesStore);
  private readonly translate = inject(TranslateService);

  isFormVisible = false;
  selectedRule: EscalationRule | null = null;

  ngOnInit() {
    this.store.loadData();
  }

  openForm(rule: EscalationRule | null = null) {
    this.selectedRule = rule;
    this.isFormVisible = true;
  }

  closeForm() {
    this.isFormVisible = false;
    this.selectedRule = null;
  }

  onSave(dto: CreateEscalationRuleDto | UpdateEscalationRuleDto) {
    const operation = this.selectedRule
      ? this.store.updateRule(this.selectedRule.id, dto)
      : this.store.createRule(dto as CreateEscalationRuleDto);

    operation.subscribe(() => {
      this.closeForm();
    });
  }

  onDelete(id: number) {
    const confirmMsg = this.translate.instant('escalationRules.deleteConfirm');
    if (confirm(confirmMsg)) {
      this.store.deleteRule(id);
    }
  }
}