/**
 * RecoverPath - Core TypeScript Interfaces & Types
 */

export type UserRole = 'individual' | 'caregiver';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  sobrietyStartDate?: string; // ISO string
  primarySubstance?: string;
  linkedUserId?: string; // Links caregiver to individual or vice-versa
  linkedUserName?: string;
  consentScope: {
    shareStreak: boolean;
    shareEmergencyAlerts: boolean;
    shareSafetyPlan: boolean;
    shareCheckinStatus: boolean;
  };
}

export type CrisisFeeling = 
  | 'craving'
  | 'anxiety'
  | 'trigger'
  | 'emotional_distress'
  | 'just_used'
  | 'caregiver_emergency';

export interface CrisisInterventionRequest {
  safetyStatus: 'safe' | 'uncomfortable' | 'in_danger';
  feeling: CrisisFeeling;
  voiceNote?: string;
  locationContext?: string;
  timeOfDay?: string;
}

export interface CrisisInterventionResponse {
  id: string;
  timestamp: string;
  isHighRisk: boolean;
  groundingTitle: string;
  groundingText: string;
  actionSteps: string[];
  empathyNote: string;
  audioPromptText: string;
  contactNotified: boolean;
}

export type CaregiverSituation = 
  | 'seems_intoxicated'
  | 'experiencing_withdrawal'
  | 'intense_distress_craving'
  | 'found_paraphernalia'
  | 'communication_breakdown';

export interface CaregiverScriptRequest {
  situation: CaregiverSituation;
  relationship: string; // e.g. "Father", "Partner", "Sponsor", "Sibling"
  currentLocation?: string;
}

export interface CaregiverScriptResponse {
  id: string;
  situation: CaregiverSituation;
  openingLine: string;
  doSay: string[];
  avoidSaying: string[];
  escalationLine: string;
  closingLine: string;
  timestamp: string;
}

export interface SafetyPlan {
  id: string;
  userId: string;
  warningSigns: string[];
  copingStrategies: string[];
  safePlaces: string[];
  supportContacts: { name: string; relation: string; phone: string }[];
  reasonsToStaySober: string[];
  emergencyNotes: string;
  updatedAt: string;
}

export interface EducationArticle {
  id: string;
  title: string;
  category: 'understanding_sud' | 'relapse_prevention' | 'caregiver_support' | 'harm_reduction' | 'mat_treatment';
  readTime: string;
  summary: string;
  fullText: string;
  keyTakeaways: string[];
  source: string;
}

export interface HelpResource {
  id: string;
  name: string;
  type: 'hotline' | 'treatment_center' | 'support_group' | 'crisis_center';
  phone: string;
  address?: string;
  hours: string;
  description: string;
  isNational: boolean;
}

export interface CrisisAlertLog {
  id: string;
  individualId: string;
  individualName: string;
  caregiverId: string;
  feeling: string;
  safetyStatus: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface CrisisSession {
  id: string;
  userId: string;
  safetyStatus: string;
  triggerType: string;
  aiGroundingText: string;
  suggestedAction: string;
  contactNotified: boolean;
  timestamp: string;
}
