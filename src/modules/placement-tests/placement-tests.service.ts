import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PlacementTest } from '../../shared/entities/placement-test.entity';

@Injectable()
export class PlacementTestsService {
  constructor(
    @InjectRepository(PlacementTest)
    private readonly repo: Repository<PlacementTest>,
  ) {}

  async create(data: Partial<PlacementTest>): Promise<PlacementTest> {
    const test = this.repo.create(data);
    return this.repo.save(test);
  }

  async findAll(leadId?: string): Promise<PlacementTest[]> {
    const query = this.repo.createQueryBuilder('test')
      .leftJoinAndSelect('test.lead', 'lead')
      .leftJoinAndSelect('test.examiner', 'examiner');

    if (leadId) {
      query.andWhere('lead.id = :leadId', { leadId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<PlacementTest> {
    const test = await this.repo.findOne({
      where: { id },
      relations: ['lead', 'examiner'],
    });

    if (!test) {
      throw new NotFoundException(`Placement test with ID ${id} not found`);
    }

    return test;
  }

  async update(id: string, data: Partial<PlacementTest>): Promise<PlacementTest> {
    const test = await this.findOne(id);
    Object.assign(test, data);
    return this.repo.save(test);
  }
}