import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Student } from '../../shared/entities/student.entity';
import { StudentProfile } from '../../shared/entities/student-profile.entity';
import { StudentLevelHistory } from '../../shared/entities/student-level-history.entity';
import { Referral } from '../../shared/entities/referral.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [TypeOrmModule.forFeature([Student, StudentProfile, StudentLevelHistory, Referral])],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
