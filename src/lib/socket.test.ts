import { setupSocket } from './socket'

// Mock Server class
const mockSocket = {
  id: 'test-socket-id',
  on: jest.fn(),
  emit: jest.fn(),
  disconnect: jest.fn(),
  join: jest.fn(),
  leave: jest.fn(),
  broadcast: {
    emit: jest.fn(),
  },
}

const mockIo = {
  on: jest.fn(),
  to: jest.fn(() => mockIo),
  emit: jest.fn(),
}

describe('Socket Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  test('should setup socket connection handler', () => {
    setupSocket(mockIo as any)
    
    expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function))
  })

  test('should handle client connection', () => {
    setupSocket(mockIo as any)
    
    const connectionCallback = mockIo.on.mock.calls[0][1]
    connectionCallback(mockSocket)
    
    expect(mockSocket.on).toHaveBeenCalledWith('message', expect.any(Function))
    expect(mockSocket.on).toHaveBeenCalledWith('disconnect', expect.any(Function))
  })

  test('should log client connection', () => {
    const consoleSpy = jest.spyOn(console, 'log')
    
    setupSocket(mockIo as any)
    
    const connectionCallback = mockIo.on.mock.calls[0][1]
    connectionCallback(mockSocket)
    
    expect(consoleSpy).toHaveBeenCalledWith('Client connected:', mockSocket.id)
    
    consoleSpy.mockRestore()
  })

  test('should handle message event and echo back', () => {
    setupSocket(mockIo as any)
    
    const connectionCallback = mockIo.on.mock.calls[0][1]
    connectionCallback(mockSocket)
    
    const messageCallback = mockSocket.on.mock.calls.find(
      ([event]) => event === 'message'
    )?.[1]
    
    const testMessage = {
      text: 'Hello World',
      senderId: 'user123',
    }
    
    if (messageCallback) {
      messageCallback(testMessage)
    }
    
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Echo: Hello World',
      senderId: 'system',
      timestamp: expect.any(String),
    })
  })

  test('should handle client disconnect', () => {
    const consoleSpy = jest.spyOn(console, 'log')
    
    setupSocket(mockIo as any)
    
    const connectionCallback = mockIo.on.mock.calls[0][1]
    connectionCallback(mockSocket)
    
    const disconnectCallback = mockSocket.on.mock.calls.find(
      ([event]) => event === 'disconnect'
    )?.[1]
    
    if (disconnectCallback) {
      disconnectCallback()
    }
    
    expect(consoleSpy).toHaveBeenCalledWith('Client disconnected:', mockSocket.id)
    
    consoleSpy.mockRestore()
  })

  test('should send welcome message on connection', () => {
    setupSocket(mockIo as any)
    
    const connectionCallback = mockIo.on.mock.calls[0][1]
    connectionCallback(mockSocket)
    
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Welcome to WebSocket Echo Server!',
      senderId: 'system',
      timestamp: expect.any(String),
    })
  })

  test('should handle message with empty text', () => {
    setupSocket(mockIo as any)
    
    const connectionCallback = mockIo.on.mock.calls[0][1]
    connectionCallback(mockSocket)
    
    const messageCallback = mockSocket.on.mock.calls.find(
      ([event]) => event === 'message'
    )?.[1]
    
    const testMessage = {
      text: '',
      senderId: 'user123',
    }
    
    if (messageCallback) {
      messageCallback(testMessage)
    }
    
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Echo: ',
      senderId: 'system',
      timestamp: expect.any(String),
    })
  })

  test('should handle message with special characters', () => {
    setupSocket(mockIo as any)
    
    const connectionCallback = mockIo.on.mock.calls[0][1]
    connectionCallback(mockSocket)
    
    const messageCallback = mockSocket.on.mock.calls.find(
      ([event]) => event === 'message'
    )?.[1]
    
    const testMessage = {
      text: 'Hello 🌟 World!',
      senderId: 'user123',
    }
    
    if (messageCallback) {
      messageCallback(testMessage)
    }
    
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Echo: Hello 🌟 World!',
      senderId: 'system',
      timestamp: expect.any(String),
    })
  })

  test('should handle message with long text', () => {
    setupSocket(mockIo as any)
    
    const connectionCallback = mockIo.on.mock.calls[0][1]
    connectionCallback(mockSocket)
    
    const messageCallback = mockSocket.on.mock.calls.find(
      ([event]) => event === 'message'
    )?.[1]
    
    const longText = 'a'.repeat(1000)
    const testMessage = {
      text: longText,
      senderId: 'user123',
    }
    
    if (messageCallback) {
      messageCallback(testMessage)
    }
    
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: `Echo: ${longText}`,
      senderId: 'system',
      timestamp: expect.any(String),
    })
  })

  test('should handle message without senderId', () => {
    setupSocket(mockIo as any)
    
    const connectionCallback = mockIo.on.mock.calls[0][1]
    connectionCallback(mockSocket)
    
    const messageCallback = mockSocket.on.mock.calls.find(
      ([event]) => event === 'message'
    )?.[1]
    
    const testMessage = {
      text: 'Hello World',
      senderId: '',
    }
    
    if (messageCallback) {
      messageCallback(testMessage)
    }
    
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Echo: Hello World',
      senderId: 'system',
      timestamp: expect.any(String),
    })
  })

  test('should handle multiple messages from same client', () => {
    setupSocket(mockIo as any)
    
    const connectionCallback = mockIo.on.mock.calls[0][1]
    connectionCallback(mockSocket)
    
    const messageCallback = mockSocket.on.mock.calls.find(
      ([event]) => event === 'message'
    )?.[1]
    
    if (messageCallback) {
      messageCallback({ text: 'Message 1', senderId: 'user123' })
      messageCallback({ text: 'Message 2', senderId: 'user123' })
      messageCallback({ text: 'Message 3', senderId: 'user123' })
    }
    
    expect(mockSocket.emit).toHaveBeenCalledTimes(4) // 3 messages + 1 welcome message
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Echo: Message 1',
      senderId: 'system',
      timestamp: expect.any(String),
    })
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Echo: Message 2',
      senderId: 'system',
      timestamp: expect.any(String),
    })
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Echo: Message 3',
      senderId: 'system',
      timestamp: expect.any(String),
    })
  })

  test('should generate timestamps correctly', () => {
    const mockDate = new Date('2024-01-01T12:00:00.000Z')
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate)
    
    setupSocket(mockIo as any)
    
    const connectionCallback = mockIo.on.mock.calls[0][1]
    connectionCallback(mockSocket)
    
    const messageCallback = mockSocket.on.mock.calls.find(
      ([event]) => event === 'message'
    )?.[1]
    
    if (messageCallback) {
      messageCallback({ text: 'Test', senderId: 'user123' })
    }
    
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Echo: Test',
      senderId: 'system',
      timestamp: '2024-01-01T12:00:00.000Z',
    })
    
    jest.restoreAllMocks()
  })

  test('should setup socket without errors', () => {
    expect(() => {
      setupSocket(mockIo as any)
    }).not.toThrow()
  })

  test('should handle multiple connections', () => {
    setupSocket(mockIo as any)
    
    const connectionCallback = mockIo.on.mock.calls[0][1]
    
    // Simulate multiple connections
    const socket1 = { ...mockSocket, id: 'socket-1' }
    const socket2 = { ...mockSocket, id: 'socket-2' }
    
    connectionCallback(socket1)
    connectionCallback(socket2)
    
    expect(socket1.emit).toHaveBeenCalledWith('message', {
      text: 'Welcome to WebSocket Echo Server!',
      senderId: 'system',
      timestamp: expect.any(String),
    })
    
    expect(socket2.emit).toHaveBeenCalledWith('message', {
      text: 'Welcome to WebSocket Echo Server!',
      senderId: 'system',
      timestamp: expect.any(String),
    })
  })
})