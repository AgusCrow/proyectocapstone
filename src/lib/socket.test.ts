import { setupSocket } from './socket'
import { Server } from 'socket.io'

// Mock socket.io
jest.mock('socket.io', () => ({
  Server: jest.fn().mockImplementation(() => ({
    on: jest.fn(),
    emit: jest.fn(),
  })),
}))

describe('Socket setup', () => {
  let mockIo: any
  let mockSocket: any

  beforeEach(() => {
    mockSocket = {
      id: 'test-socket-id',
      on: jest.fn(),
      emit: jest.fn(),
    }
    
    mockIo = {
      on: jest.fn((event, callback) => {
        if (event === 'connection') {
          callback(mockSocket)
        }
      }),
      emit: jest.fn(),
    }
  })

  test('should setup socket connection handler', () => {
    setupSocket(mockIo)
    
    expect(mockIo.on).toHaveBeenCalledWith('connection', expect.any(Function))
  })

  test('should handle client connection', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    
    setupSocket(mockIo)
    
    expect(consoleSpy).toHaveBeenCalledWith('Client connected:', 'test-socket-id')
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Welcome to WebSocket Echo Server!',
      senderId: 'system',
      timestamp: expect.any(String),
    })
    
    consoleSpy.mockRestore()
  })

  test('should handle message events', () => {
    setupSocket(mockIo)
    
    // Get the message handler
    const messageHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'message'
    )?.[1]
    
    expect(messageHandler).toBeDefined()
    
    // Simulate message event
    const testMessage = { text: 'Hello World', senderId: 'user123' }
    messageHandler(testMessage)
    
    expect(mockSocket.emit).toHaveBeenCalledWith('message', {
      text: 'Echo: Hello World',
      senderId: 'system',
      timestamp: expect.any(String),
    })
  })

  test('should handle disconnect events', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})
    
    setupSocket(mockIo)
    
    // Get the disconnect handler
    const disconnectHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'disconnect'
    )?.[1]
    
    expect(disconnectHandler).toBeDefined()
    
    // Simulate disconnect event
    disconnectHandler()
    
    expect(consoleSpy).toHaveBeenCalledWith('Client disconnected:', 'test-socket-id')
    
    consoleSpy.mockRestore()
  })

  test('should setup all required event handlers', () => {
    setupSocket(mockIo)
    
    const eventHandlers = mockSocket.on.mock.calls.map(([event]) => event)
    
    expect(eventHandlers).toContain('message')
    expect(eventHandlers).toContain('disconnect')
  })

  test('should generate timestamp for messages', () => {
    setupSocket(mockIo)
    
    // Get the message handler
    const messageHandler = mockSocket.on.mock.calls.find(
      ([event]) => event === 'message'
    )?.[1]
    
    messageHandler({ text: 'test', senderId: 'user123' })
    
    const call = mockSocket.emit.mock.calls.find(
      ([event]) => event === 'message'
    )
    
    expect(call).toBeDefined()
    const messageData = call[1]
    expect(messageData.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/)
  })
})