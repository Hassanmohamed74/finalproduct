import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../../shared/entities/student.entity';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private readonly repo: Repository<Student>,
  ) {}

  async findAll(filters: { search?: string; branchId?: string }): Promise<Student[]> {
    const query = this.repo.createQueryBuilder('student')
      .leftJoinAndSelect('student.branch', 'branch');

    if (filters.search) {
      query.andWhere(
        '(student.first_name ILIKE :search OR student.last_name ILIKE :search OR student.email ILIKE :search OR student.phone ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    if (filters.branchId) {
      query.andWhere('branch.id = :branchId', { branchId: filters.branchId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Student> {
    const student = await this.repo.findOne({
      where: { id },
      relations: ['branch', 'profile', 'level_history'], // الأسماء الصحيحة حسب الـ Entity
    });

    if (!student) {
      throw new NotFoundException(`Student with ID ${id} not found`);
    }

    return student;
  }
}