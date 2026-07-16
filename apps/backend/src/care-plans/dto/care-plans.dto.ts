import { Allow } from 'class-validator';

export class CreateCarePlanDto {
  @Allow() residentId!: string;
  @Allow() goals!: any[];
  @Allow() interventions!: any[];
  @Allow() status?: string;
}

export class UpdateCarePlanDto {
  @Allow() status!: string;
  @Allow() significantChangeFlag!: boolean;
}

export class DonReviewDto {
  @Allow() status!: string;
  @Allow() notes!: string;
}

export class ESignDto {
  @Allow() signatureToken!: string;
}

export class IdtAckDto {
  @Allow() notes!: string;
}
