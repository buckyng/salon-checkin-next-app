export interface Client {
  id?: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;  
  numberOfVisits?: number;
  lastVisitRating?: number;
  agreeToTerms: boolean;
}
