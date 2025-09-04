import { setupSocket } from '@/lib/socket';
import { Server } from 'socket.io';

// Mock Server class
jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
  })),
}));

describe('Socket Setup', () => {
  let mockIo: jest.Mocked<Server>;
  let mockSocket: any;

  beforeEach(() => {
    mockIo = {
      on: jest.fn(),
      emit: jest.fn(),
    } as any;

    mockSocket = {
      id: 'test-socket-id',
      on: jest.fn(),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };

    // Mock the io.on callback to capture the connection handler
    mockIo.on.mockImplementation((event: string, callback: Function) => {
      if (event === 'connection') {
        // Simulate a socket connection
        callback(mockSocket);
      }
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should set up connection event handler', () => {
    setupSocket(mockIo);
    
    expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function));
  });

  it('should handle client connection', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    setupSocket(mockIo);
    
    expect(consoleSpy).toHaveBeenCalledWith('Client connected:', 'test-socket-id');
    consoleSpy.mockRestore();
  });

  it('should set up message event handler for socket', () => {
    setupSocket(mockIo);
    
    expect(mockSocket.on).toHaveBeenCalledWith('message', expect.any(Function));
  });

  it('should set up disconnect event handler for socket', () => {
    setupSocket(mockIo);
    
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function));
  });

  it('should echo messages back to sender', () => {
    setupSocket(mockIo);
    
    // Get the message handler
    const messageHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'message'
    )?.[1];
    
    // Simulate receiving a message
    const testMessage = {
      text: 'Hello World',
      senderId: 'user-123',
    };
    
    messageHandler(testMessage);
    
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Echo: Hello World',
      senderId: 'system',
      timestamp: expect.any(String),
    });
  });

  it('should handle client disconnect', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    
    setupSocket(mockIo);
    
    // Get the disconnect handler
    const disconnectHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'disconnect'
    )?.[1];
    
    // Simulate disconnect
    disconnectHandler();
    
    expect(consoleSpy).toHaveBeenCalledWith('Client disconnected:', 'test-socket-id');
    consoleSpy.mockRestore();
  });

  it('should send welcome message on connection', () => {
    setupSocket(mockIo);
    
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Welcome to WebSocket Echo Server!',
      senderId: 'system',
      timestamp: expect.any(String),
    });
  });

  it('should generate timestamp for echoed messages', () => {
    setupSocket(mockIo);
    
    const messageHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'message'
    )?.[1];
    
    const testMessage = {
      text: 'Test message',
      senderId: 'user-456',
    };
    
    messageHandler(testMessage);
    
    const emittedMessage = mockSocket.emit.mock.calls.find(
      ([event]) => event === 'message'
    )?.[1];
    
    expect(emittedMessage).toHaveProperty('timestamp');
    expect(new Date(emittedMessage.timestamp)).toBeInstanceOf(Date);
  });

  it('should handle empty message text', () => {
    setupSocket(mockIo);
    
    const messageHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'message'
    )?.[1];
    
    const testMessage = {
      text: '',
      senderId: 'user-789',
    };
    
    messageHandler(testMessage);
    
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Echo: ',
      senderId: 'system',
      timestamp: expect.any(String),
    });
  });
});