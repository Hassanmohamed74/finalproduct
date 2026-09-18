import { IsUUID, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateFollowUpDto {
  @IsUUID()
  @IsNotEmpty()
  assigned_to: string;

  @IsNotEmpty()
  due_date: string;

  @IsOptional()
  @IsString()
  note?: string;
}
