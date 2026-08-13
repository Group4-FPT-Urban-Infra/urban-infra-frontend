export interface EscalationRule {
  id: number;
  slaPolicyId: number;
  targetDepartmentId: number | null;
  targetRoleId: number | null;
  escalationLevel: number;
  overdueMinutes: number;
  notificationTitle: string | null;
  notificationTemplate: string | null;
  isActive: boolean;
}

export interface EscalationRuleView extends EscalationRule {
  slaPolicyName?: string;
  targetDepartmentName?: string;
  targetRoleName?: string;
}

export type CreateEscalationRuleDto = Omit<EscalationRule, 'id'>;
export type UpdateEscalationRuleDto = Partial<CreateEscalationRuleDto>;