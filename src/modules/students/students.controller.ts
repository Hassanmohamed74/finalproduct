import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { StudentsService } from './students.service';

@ApiTags('Students')
@ApiBearerAuth('JWT')
@Controller('students')
export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all students with search and filters' })
  @ApiQuery({ name: 'search', required: false, description: 'Search by name, email, or phone' })
  @ApiQuery({ name: 'branchId', required: false, description: 'Filter by branch' })
  async findAll(
    @Query('search') search?: string,
    @Query('branchId') branchId?: string,
  ) {
    return this.service.findAll({ search, branchId });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student profile by id with full history (payments, attendance, levels)' })
  @ApiResponse({ status: 200, description: 'Returns student profile details.' })
  @ApiResponse({ status: 404, description: 'Student not found.' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }
}