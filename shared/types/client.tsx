export interface Client {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;  
  numberOfVisits?: number;
  agreeToTerms: boolean;
}
