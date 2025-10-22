export interface MedicationTime {
  id: string;
  time: string; // "HH:mm" format
  taken: boolean;
}

export interface Medication {
  id:string;
  name: string;
  dosage: string;
  times: MedicationTime[];
}

export type MedicationStatus = 'DUE' | 'OVERDUE' | 'TAKEN' | 'UPCOMING';

export interface User {
  name: string;
  avatarId: string;
}
