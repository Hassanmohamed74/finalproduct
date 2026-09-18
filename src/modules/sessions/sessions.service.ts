import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from '../../shared/entities/session.entity';

@Injectable()
export class SessionsService {
  constructor(
    @InjectRepository(Session)
    private readonly repo: Repository<Session>,
  ) {}

  async create(data: Partial<Session>): Promise<Session> {
    const session = this.repo.create(data);
    return this.repo.save(session);
  }

  async findAll(groupId?: string): Promise<Session[]> {
    const query = this.repo.createQueryBuilder('session')
      .leftJoinAndSelect('session.group', 'group');

    if (groupId) {
      query.andWhere('group.id = :groupId', { groupId });
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Session> {
    const session = await this.repo.findOne({
      where: { id },
      // جلب المجموعة وسجلات الحضور الخاصة بالجلسة بناءً على متطلبات القسم 4.5.3 و 4.5.4
      relations: ['group', 'attendances', 'teacher'],
    });

    if (!session) {
      throw new NotFoundException(`Session with ID ${id} not found`);
    }

    return session;
  }

  async update(id: string, data: Partial<Session>): Promise<Session> {
    const session = await this.findOne(id);
    Object.assign(session, data);
    return this.repo.save(session);
  }

  async remove(id: string): Promise<void> {
    const session = await this.findOne(id);
    await this.repo.remove(session);
  }
}