import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Branch } from './branch.entity';
import { StudentStatus } from '../../common/enums/student-status.enum';
import { StudentProfile } from './student-profile.entity';
import { StudentLevelHistory } from './student-level-history.entity';
import { Referral } from './referral.entity';

@Entity('students')
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 50, unique: true })
  student_number: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  current_level: string;

  @Column({ type: 'enum', enum: StudentStatus, default: StudentStatus.ACTIVE })
  status: StudentStatus;

  @Column({ type: 'date', nullable: true })
  enrollment_date: Date;

  @Column({ type: 'uuid', nullable: true })
  branch_id: string;

  @ManyToOne(() => Branch, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @Column({ type: 'uuid', nullable: true })
  placement_test_id: string;

  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @OneToOne(() => StudentProfile, (sp) => sp.student)
  profile: StudentProfile;

  @OneToMany(() => StudentLevelHistory, (slh) => slh.student)
  level_history: StudentLevelHistory[];

  @OneToMany(() => Referral, (r) => r.referrer_student)
  referrals_made: Referral[];

  @OneToMany(() => Referral, (r) => r.referred_student)
  referrals_received: Referral[];
}
