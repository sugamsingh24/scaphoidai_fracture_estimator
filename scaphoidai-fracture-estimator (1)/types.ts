export enum Gender {
  Male = 'Male',
  Female = 'Female',
}

export enum InjuryMechanism {
  FallOnOutstretchedHand = 'Fall on outstretched hand (FOOSH)',
  DirectBlow = 'Direct blow to wrist',
  SportsInjury = 'Sports related injury',
  TrafficAccident = 'Traffic accident',
  Other = 'Other',
}

export interface PatientData {
  age: number;
  gender: Gender;
  injuryMechanism: InjuryMechanism;
  hoursSinceInjury: number;
  snuffboxTenderness: boolean;
  tubercleTenderness: boolean;
  thumbCompressionPain: boolean;
  ulnarDeviationPain: boolean;
  swelling: boolean;
  gripStrengthLoss: boolean;
}

export interface PredictionResult {
  probability: number;
  riskLevel: 'Low' | 'Moderate' | 'High';
  reasoning: string;
  recommendation: string;
  clinicalRuleReference?: string;
}
