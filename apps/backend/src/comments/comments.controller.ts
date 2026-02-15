import { Controller, Post, Get, Body, Param, UseGuards, Request } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('comments')
@UseGuards(JwtAuthGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  async create(@Request() req, @Body() body: { content: string; ticketId: string }) {
    return this.commentsService.create(body.content, body.ticketId, req.user.userId);
  }

  @Get('ticket/:ticketId')
  async findByTicket(@Param('ticketId') ticketId: string) {
    return this.commentsService.findByTicket(ticketId);
  }
}
