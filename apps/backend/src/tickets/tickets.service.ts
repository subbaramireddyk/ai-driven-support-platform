import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AIService } from '../ai/ai.service';

@Injectable()
export class TicketsService {
  constructor(
    private prisma: PrismaService,
    private aiService: AIService,
  ) {}

  async create(
    title: string,
    description: string,
    requesterId: string,
    priority?: string,
    toolchain?: string,
  ) {
    // Analyze ticket with AI
    const aiAnalysis = await this.aiService.analyzeTicket(title, description);

    const ticket = await this.prisma.ticket.create({
      data: {
        title,
        description,
        requesterId,
        priority: priority || 'MEDIUM',
        toolchain,
        aiSuggestion: aiAnalysis.suggestion,
        selfServiceAvailable: aiAnalysis.selfServiceAvailable,
      },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    return ticket;
  }

  async findAll(filters?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
    requesterId?: string;
  }) {
    return this.prisma.ticket.findMany({
      where: {
        ...(filters?.status && { status: filters.status }),
        ...(filters?.priority && { priority: filters.priority }),
        ...(filters?.assigneeId && { assigneeId: filters.assigneeId }),
        ...(filters?.requesterId && { requesterId: filters.requesterId }),
      },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.ticket.findUnique({
      where: { id },
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                email: true,
                name: true,
                avatar: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });
  }

  async update(id: string, data: any) {
    return this.prisma.ticket.update({
      where: { id },
      data,
      include: {
        requester: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
        assignee: {
          select: {
            id: true,
            email: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return this.prisma.ticket.delete({
      where: { id },
    });
  }

  async getMetrics() {
    const totalTickets = await this.prisma.ticket.count();
    const openTickets = await this.prisma.ticket.count({
      where: { status: 'OPEN' },
    });
    const resolvedTickets = await this.prisma.ticket.count({
      where: { status: 'RESOLVED' },
    });
    const selfServiceTickets = await this.prisma.ticket.count({
      where: { selfServiceAvailable: true },
    });

    const aiDeflectionRate = totalTickets > 0 ? (selfServiceTickets / totalTickets) * 100 : 0;

    return {
      totalTickets,
      openTickets,
      resolvedTickets,
      aiDeflectionRate,
      averageResponseTime: 0, // Placeholder for now
    };
  }
}
