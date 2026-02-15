import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class WebsocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets: Map<string, Socket> = new Map();

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.set(userId, client);
      console.log(`User ${userId} connected`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      this.userSockets.delete(userId);
      console.log(`User ${userId} disconnected`);
    }
  }

  @SubscribeMessage('joinTicket')
  handleJoinTicket(client: Socket, ticketId: string) {
    client.join(`ticket:${ticketId}`);
  }

  @SubscribeMessage('leaveTicket')
  handleLeaveTicket(client: Socket, ticketId: string) {
    client.leave(`ticket:${ticketId}`);
  }

  // Emit events to clients
  emitTicketUpdate(ticketId: string, data: any) {
    this.server.to(`ticket:${ticketId}`).emit('ticketUpdated', data);
  }

  emitNewComment(ticketId: string, comment: any) {
    this.server.to(`ticket:${ticketId}`).emit('newComment', comment);
  }

  emitNotification(userId: string, notification: any) {
    const socket = this.userSockets.get(userId);
    if (socket) {
      socket.emit('notification', notification);
    }
  }
}
