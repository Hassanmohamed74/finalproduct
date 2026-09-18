import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../../shared/entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly repo: Repository<Role>,
  ) {}

  async findAll(): Promise<Role[]> {
    // جلب الأدوار مع الصلاحيات الخاصة بكل دور
    return this.repo.find({ relations: ['permissions'] });
  }
  

  async findOne(id: string): Promise<Role> {
    return this.repo.findOne({ 
      where: { id },
      relations: ['permissions'] 
    });
  }
}