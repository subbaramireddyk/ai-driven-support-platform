import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { TicketsService } from './tickets.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('tickets')
@UseGuards(JwtAuthGuard)
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

  @Post()
  async create(@Request() req, @Body() body: any) {
    return this.ticketsService.create(
      body.title,
      body.description,
      req.user.userId,
      body.priority,
      body.toolchain,
    );
  }

  @Get()
  async findAll(@Query() query: any) {
    return this.ticketsService.findAll(query);
  }

  @Get('metrics')
  async getMetrics() {
    return this.ticketsService.getMetrics();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.ticketsService.findOne(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) {
    return this.ticketsService.update(id, body);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.ticketsService.delete(id);
  }
}
