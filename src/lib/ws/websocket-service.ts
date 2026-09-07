import { io, type Socket } from 'socket.io-client';
import { isMockMode } from '@/lib/mock/is-mock-mode';
import type { NotificationEnvelope } from '@/lib/ws/notification-types';

type NotificationListener = (notification: NotificationEnvelope) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private listeners = new Set<NotificationListener>();
  private currentToken: string | null = null;

  constructor() {
    // Expose mock dispatcher in dev / mock mode for easy manual QA and testing
    if (
      typeof window !== 'undefined' &&
      (import.meta.env.DEV || isMockMode())
    ) {
      (
        window as unknown as {
          dispatchMockNotification: (
            payload: Partial<NotificationEnvelope>,
          ) => void;
        }
      ).dispatchMockNotification = (payload) => {
        this.dispatchMock(payload);
      };
    }
  }

  public subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  public dispatchMock(payload: Partial<NotificationEnvelope>): void {
    const envelope: NotificationEnvelope = {
      id: payload.id ?? `mock-${Date.now()}`,
      title: payload.title ?? 'System Notification',
      message: payload.message ?? '',
      type: payload.type ?? 'order.created',
      payload: payload.payload ?? {},
      createdAt: payload.createdAt ?? new Date().toISOString(),
    };

    this.listeners.forEach((listener) => {
      try {
        listener(envelope);
      } catch {
        // Listener errors should not break dispatch
      }
    });
  }

  public connect(token: string): void {
    if (isMockMode()) {
      // In MSW mock mode, real backend WebSocket is bypassed. Use dispatchMock / in-memory bus.
      return;
    }

    if (this.socket && this.currentToken === token && this.socket.connected) {
      return;
    }

    this.disconnect();
    this.currentToken = token;

    const baseUrl =
      import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

    this.socket = io(baseUrl, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    this.socket.on('notification', (rawPayload: unknown) => {
      if (rawPayload && typeof rawPayload === 'object') {
        const envelope = rawPayload as NotificationEnvelope;
        this.listeners.forEach((listener) => {
          try {
            listener(envelope);
          } catch {
            // Ignored
          }
        });
      }
    });
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.currentToken = null;
  }
}

export const webSocketService = new WebSocketService();
