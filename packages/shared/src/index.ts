export enum UserRole {
  USER = 'USER',
  SUPPORT = 'SUPPORT',
  ADMIN = 'ADMIN',
}

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING = 'WAITING',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum ToolchainType {
  AWS = 'AWS',
  AZURE = 'AZURE',
  GITHUB = 'GITHUB',
  JIRA = 'JIRA',
  HARNESS = 'HARNESS',
  SONARQUBE = 'SONARQUBE',
}

export enum NotificationType {
  MENTION = 'MENTION',
  ASSIGNMENT = 'ASSIGNMENT',
  STATUS_CHANGE = 'STATUS_CHANGE',
  NEW_COMMENT = 'NEW_COMMENT',
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  toolchain?: ToolchainType;
  requesterId: string;
  assigneeId?: string;
  aiSuggestion?: string;
  selfServiceAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Comment {
  id: string;
  content: string;
  ticketId: string;
  authorId: string;
  mentions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  type: NotificationType;
  userId: string;
  ticketId?: string;
  commentId?: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface CreateTicketDto {
  title: string;
  description: string;
  priority?: TicketPriority;
  toolchain?: ToolchainType;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  status?: TicketStatus;
  priority?: TicketPriority;
  assigneeId?: string;
}

export interface CreateCommentDto {
  content: string;
  ticketId: string;
}

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface AIAnalysisResult {
  intent: string;
  entities: Record<string, any>;
  selfServiceAvailable: boolean;
  suggestion?: string;
  documentationLinks?: string[];
}

export interface TicketMetrics {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  aiDeflectionRate: number;
  averageResponseTime: number;
}
