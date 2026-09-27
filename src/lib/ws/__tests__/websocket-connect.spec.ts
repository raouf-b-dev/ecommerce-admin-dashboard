import { afterEach, describe, expect, it, vi } from 'vitest';

const { io } = vi.hoisted(() => ({
  io: vi.fn((...args: [string, Record<string, unknown>]) => {
    void args;
    return {
      on: vi.fn(),
      connected: true,
      removeAllListeners: vi.fn(),
      disconnect: vi.fn(),
    };
  }),
}));

vi.mock('socket.io-client', () => ({ io }));

vi.mock('@/lib/mock/is-mock-mode', () => ({
  isMockMode: () => false,
}));

import { webSocketService } from '@/lib/ws/websocket-service';

describe('WebSocketService connect options', () => {
  afterEach(() => {
    webSocketService.disconnect();
    io.mockClear();
  });

  it('passes the access token in handshake auth, not the URL query', () => {
    webSocketService.connect('access-jwt');

    expect(io).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        auth: { token: 'access-jwt' },
      }),
    );

    const options = io.mock.calls[0]?.[1];
    expect(options).toBeDefined();
    expect(options).not.toHaveProperty('query');
    expect(options).not.toHaveProperty('extraHeaders');
  });
});
