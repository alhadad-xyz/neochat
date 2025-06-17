/**
 * Generic EventEmitter implementation for SDK events
 */
export class EventEmitter<EventMap extends Record<string, any>> {
  private listeners: { [K in keyof EventMap]?: Array<(data: EventMap[K]) => void> } = {};

  /**
   * Subscribe to an event
   */
  on<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event]!.push(callback);
  }

  /**
   * Unsubscribe from an event
   */
  off<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): void {
    if (!this.listeners[event]) return;
    
    const index = this.listeners[event]!.indexOf(callback);
    if (index > -1) {
      this.listeners[event]!.splice(index, 1);
    }
  }

  /**
   * Emit an event
   */
  emit<K extends keyof EventMap>(event: K, data: EventMap[K]): void {
    if (!this.listeners[event]) return;
    
    this.listeners[event]!.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${String(event)}:`, error);
      }
    });
  }

  /**
   * Subscribe to an event only once
   */
  once<K extends keyof EventMap>(event: K, callback: (data: EventMap[K]) => void): void {
    const onceCallback = (data: EventMap[K]) => {
      callback(data);
      this.off(event, onceCallback);
    };
    this.on(event, onceCallback);
  }

  /**
   * Remove all listeners for a specific event or all events
   */
  removeAllListeners<K extends keyof EventMap>(event?: K): void {
    if (event) {
      delete this.listeners[event];
    } else {
      this.listeners = {};
    }
  }

  /**
   * Get number of listeners for an event
   */
  listenerCount<K extends keyof EventMap>(event: K): number {
    return this.listeners[event]?.length || 0;
  }

  /**
   * Get all events that have listeners
   */
  eventNames(): Array<keyof EventMap> {
    return Object.keys(this.listeners) as Array<keyof EventMap>;
  }
} 