import { Controller, Get, Post, Put, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiBody, ApiParam } from '@nestjs/swagger';
import { PlacementTestsService } from './placement-tests.service';
import { PlacementTest } from '../../shared/entities/placement-test.entity';
import { Roles } from '../../common/decorators/roles.decorator';

@ApiTags('Placement Tests')
@ApiBearerAuth('JWT')
@Controller('placement-tests')
export class PlacementTestsController {
  constructor(private readonly service: PlacementTestsService) {}

  @Post()
  @Roles('super_admin', 'branch_manager', 'sales', 'academic')
  @ApiOperation({ summary: 'Schedule or submit a placement test slot/result' })
  @ApiBody({ 
    description: 'Placement test creation/scheduling payload',
    schema: {
      type: 'object',
      properties: {
        leadId: { type: 'string', example: '123e4567-e89b-12d3-a456-426614174000' },
        scheduled_date: { type: 'string', format: 'date-time', example: '2026-09-05T14:00:00Z' },
        status: { type: 'string', example: 'scheduled' },
        written_score: { type: 'number', example: 85 },
        oral_score: { type: 'number', example: 90 },
        assigned_level: { type: 'string', example: 'Intermediate' },
      },
      required: ['leadId']
    }
  })
  @ApiResponse({ status: 201, description: 'Placement test created successfully.' })
  async create(@Body() createData: Partial<PlacementTest>) {
    return this.service.create(createData);
  }

  @Get()
  @Roles('super_admin', 'branch_manager', 'sales', 'academic')
  @ApiOperation({ summary: 'Get all placement tests with optional lead filter' })
  @ApiQuery({ name: 'leadId', required: false, description: 'Filter placement tests by lead ID' })
  async findAll(@Query('leadId') leadId?: string) {
    return this.service.findAll(leadId);
  }

  @Get(':id')
  @Roles('super_admin', 'branch_manager', 'sales', 'academic')
  @ApiOperation({ summary: 'Get placement test details by id' })
  @ApiParam({ name: 'id', description: 'Placement Test UUID or ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiResponse({ status: 200, description: 'Returns placement test details.' })
  @ApiResponse({ status: 404, description: 'Placement test not found.' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Put(':id')
  @Roles('super_admin', 'academic')
  @ApiOperation({ summary: 'Update test scores, oral/written results, and final assigned level' })
  @ApiParam({ name: 'id', description: 'Placement Test UUID or ID', example: '123e4567-e89b-12d3-a456-426614174000' })
  @ApiBody({ 
    description: 'Placement test update payload',
    schema: {
      type: 'object',
      properties: {
        written_score: { type: 'number', example: 88 },
        oral_score: { type: 'number', example: 92 },
        assigned_level: { type: 'string', example: 'Upper-Intermediate' },
        status: { type: 'string', example: 'completed' },
      },
    }
  })
  @ApiResponse({ status: 200, description: 'Placement test updated successfully.' })
  @ApiResponse({ status: 404, description: 'Placement test not found.' })
  async update(@Param('id') id: string, @Body() updateData: Partial<PlacementTest>) {
    return this.service.update(id, updateData);
  }
}