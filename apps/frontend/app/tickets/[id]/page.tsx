'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ticketsAPI, commentsAPI } from '@/lib/api';
import { socketService } from '@/lib/socket';

const STATUS_OPTIONS = ['OPEN', 'IN_PROGRESS', 'WAITING', 'RESOLVED', 'CLOSED'];

export default function TicketDetailPage() {
  const router = useRouter();
  const params = useParams();
  const ticketId = params.id as string;
  
  const [ticket, setTicket] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      router.push('/login');
      return;
    }
    setUser(JSON.parse(userData));
    loadTicket();

    // Set up WebSocket
    const socket = socketService.connect(JSON.parse(userData).id);
    socketService.joinTicket(ticketId);

    socketService.on('newComment', (comment) => {
      setTicket((prev: any) => ({
        ...prev,
        comments: [...(prev?.comments || []), comment],
      }));
    });

    socketService.on('ticketUpdated', (updatedTicket) => {
      setTicket((prev: any) => ({ ...prev, ...updatedTicket }));
    });

    return () => {
      socketService.leaveTicket(ticketId);
      socketService.off('newComment');
      socketService.off('ticketUpdated');
    };
  }, [ticketId]);

  const loadTicket = async () => {
    try {
      const response = await ticketsAPI.getOne(ticketId);
      setTicket(response.data);
    } catch (error) {
      console.error('Failed to load ticket:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const response = await ticketsAPI.update(ticketId, { status: newStatus });
      setTicket(response.data);
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmitting(true);
    try {
      await commentsAPI.create({
        content: commentText,
        ticketId,
      });
      setCommentText('');
      loadTicket();
    } catch (error) {
      console.error('Failed to create comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Ticket not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Ticket Details</h1>
          <Link href="/dashboard">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <CardTitle className="text-2xl mb-2">{ticket.title}</CardTitle>
                    <div className="flex gap-2 mb-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        ticket.status === 'OPEN'
                          ? 'bg-blue-100 text-blue-800'
                          : ticket.status === 'IN_PROGRESS'
                          ? 'bg-yellow-100 text-yellow-800'
                          : ticket.status === 'RESOLVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {ticket.status}
                      </span>
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                        {ticket.priority}
                      </span>
                      {ticket.toolchain && (
                        <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                          {ticket.toolchain}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
                </div>

                {ticket.selfServiceAvailable && ticket.aiSuggestion && (
                  <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-900 mb-2">
                      🤖 AI Suggestion - Self-Service Available
                    </h4>
                    <p className="text-green-800 text-sm">{ticket.aiSuggestion}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Comments */}
            <Card>
              <CardHeader>
                <CardTitle>Comments ({ticket.comments?.length || 0})</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {ticket.comments?.map((comment: any) => (
                  <div key={comment.id} className="border-b pb-4 last:border-0">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-medium">
                        {comment.author.name[0].toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{comment.author.name}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {(!ticket.comments || ticket.comments.length === 0) && (
                  <p className="text-gray-500 text-center py-8">
                    No comments yet. Be the first to comment!
                  </p>
                )}

                <form onSubmit={handleCommentSubmit} className="mt-6">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Add a comment... (Use @username to mention someone)"
                    rows={4}
                  />
                  <div className="mt-2 flex justify-end">
                    <Button type="submit" disabled={submitting || !commentText.trim()}>
                      {submitting ? 'Posting...' : 'Post Comment'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <select
                    value={ticket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    className="mt-1 w-full h-10 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Created By</label>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-medium">
                      {ticket.requester.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm">{ticket.requester.name}</span>
                  </div>
                </div>

                {ticket.assignee && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Assigned To</label>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-green-600 text-white flex items-center justify-center text-xs font-medium">
                        {ticket.assignee.name[0].toUpperCase()}
                      </div>
                      <span className="text-sm">{ticket.assignee.name}</span>
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <p className="mt-1 text-sm">
                    {new Date(ticket.createdAt).toLocaleString()}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Last Updated</label>
                  <p className="mt-1 text-sm">
                    {new Date(ticket.updatedAt).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
