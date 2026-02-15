import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  async create(content: string, ticketId: string, authorId: string) {
    // Extract mentions from content (e.g., @username)
    const mentions = this.extractMentions(content);

    const comment = await this.prisma.comment.create({
      data: {
        content,
        ticketId,
        authorId,
        mentions,
      },
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
    });

    // Create notifications for mentioned users
    if (mentions.length > 0) {
      await this.createMentionNotifications(comment, mentions);
    }

    return comment;
  }

  async findByTicket(ticketId: string) {
    return this.prisma.comment.findMany({
      where: { ticketId },
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
    });
  }

  private extractMentions(content: string): string[] {
    const mentionRegex = /@(\w+)/g;
    const matches = content.matchAll(mentionRegex);
    return Array.from(matches, m => m[1]);
  }

  private async createMentionNotifications(comment: any, mentions: string[]) {
    // Find users by mentioned usernames
    const users = await this.prisma.user.findMany({
      where: {
        OR: mentions.map(name => ({ name: { contains: name, mode: 'insensitive' } })),
      },
    });

    // Create notifications
    const notifications = users.map(user => ({
      type: 'MENTION',
      userId: user.id,
      ticketId: comment.ticketId,
      commentId: comment.id,
      message: `${comment.author.name} mentioned you in a comment`,
    }));

    if (notifications.length > 0) {
      await this.prisma.notification.createMany({
        data: notifications,
      });
    }
  }
}
