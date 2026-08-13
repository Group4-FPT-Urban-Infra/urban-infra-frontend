import { computed, inject, Injectable, signal } from '@angular/core';
import { catchError, forkJoin, map, of, tap } from 'rxjs';
import { EscalationRulesService } from './escalation-rules.service';
import { CreateEscalationRuleDto, EscalationRule, UpdateEscalationRuleDto } from './escalation-rules.types';
import { SlaPoliciesService } from '../app/sla-policies.service';
import { DepartmentsService } from '../app/departments.service';
import { RolesService } from '../app/roles.service';
import { Department, Role, SlaPolicy } from '../app/admin.types';
import { ApiError } from '../app/core/http/api-error';

interface EscalationRulesState {
  rules: EscalationRule[];
  slaPolicies: SlaPolicy[];
  departments: Department[];
  roles: Role[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

@Injectable({ providedIn: 'root' })
export class EscalationRulesStore {
  private readonly escalationRulesService = inject(EscalationRulesService);
  private readonly slaPoliciesService = inject(SlaPoliciesService);
  private readonly departmentsService = inject(DepartmentsService);
  private readonly rolesService = inject(RolesService);

  private readonly state = signal<EscalationRulesState>({
    rules: [],
    slaPolicies: [],
    departments: [],
    roles: [],
    loading: true,
    saving: false,
    error: null,
  });

  // --- Selectors ---
  readonly rules = computed(() => this.state().rules);
  readonly slaPolicies = computed(() => this.state().slaPolicies);
  readonly departments = computed(() => this.state().departments);
  readonly roles = computed(() => this.state().roles);
  readonly loading = computed(() => this.state().loading);
  readonly saving = computed(() => this.state().saving);
  readonly error = computed(() => this.state().error);

  readonly rulesView = computed(() => {
    const rules = this.rules();
    const slaPoliciesMap = new Map(this.slaPolicies().map((p) => [p.id, p.policyName]));
    const departmentsMap = new Map(this.departments().map((d) => [d.id, d.name]));
    const rolesMap = new Map(this.roles().map((r) => [r.id, r.name]));

    return rules.map((rule) => ({
      ...rule,
      slaPolicyName: slaPoliciesMap.get(rule.slaPolicyId) ?? 'N/A',
      targetDepartmentName: rule.targetDepartmentId ? departmentsMap.get(rule.targetDepartmentId) ?? 'N/A' : '-',
      targetRoleName: rule.targetRoleId ? rolesMap.get(rule.targetRoleId) ?? 'N/A' : '-',
    }));
  });

  // --- Actions ---
  loadData() {
    this.state.update((s) => ({ ...s, loading: true, error: null }));

    forkJoin({
      rules: this.escalationRulesService.getEscalationRules(),
      slaPolicies: this.slaPoliciesService.getSlaPolicies(),
      departments: this.departmentsService.getDepartments(),
      roles: this.rolesService.getRoles(),
    })
      .pipe(
        catchError((err: ApiError) => {
          this.state.update((s) => ({ ...s, error: err.message, loading: false }));
          return of(null);
        }),
      )
      .subscribe((data) => {
        if (data) {
          this.state.update((s) => ({ ...s, ...data, loading: false }));
        }
      });
  }

  createRule(dto: CreateEscalationRuleDto) {
    this.state.update((s) => ({ ...s, saving: true, error: null }));
    return this.escalationRulesService.createEscalationRule(dto).pipe(
      tap((newRule) => {
        this.state.update((s) => ({ ...s, rules: [...s.rules, newRule], saving: false }));
      }),
      catchError((err: ApiError) => {
        this.state.update((s) => ({ ...s, error: err.message, saving: false }));
        throw err;
      }),
    );
  }

  updateRule(id: number, dto: UpdateEscalationRuleDto) {
    this.state.update((s) => ({ ...s, saving: true, error: null }));
    return this.escalationRulesService.updateEscalationRule(id, dto).pipe(
      tap((updatedRule) => {
        this.state.update((s) => ({
          ...s,
          rules: s.rules.map((r) => (r.id === id ? updatedRule : r)),
          saving: false,
        }));
      }),
      catchError((err: ApiError) => {
        this.state.update((s) => ({ ...s, error: err.message, saving: false }));
        throw err;
      }),
    );
  }

  deleteRule(id: number) {
    // Optimistic update can be done here if desired
    return this.escalationRulesService.deleteEscalationRule(id).pipe(tap(() => this.loadData()));
  }
}