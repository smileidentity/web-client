export interface LogEntry {
  timestamp: number;
  level: 'log' | 'warn' | 'error' | 'info';
  message: string;
  data?: any;
  source?: string;
}

class Logger {
  private logs: LogEntry[] = [];

  private maxLogs = 500; // Keep last 500 logs

  private subscribers: ((logs: LogEntry[]) => void)[] = [];

  log(message: string, data?: any, source?: string) {
    this.addLog('log', message, data, source);
    // eslint-disable-next-line no-console
    console.log(`[${source || 'Debug'}] ${message}`, data);
  }

  warn(message: string, data?: any, source?: string) {
    this.addLog('warn', message, data, source);
    console.warn(`[${source || 'Debug'}] ${message}`, data);
  }

  error(message: string, data?: any, source?: string) {
    this.addLog('error', message, data, source);
    console.error(`[${source || 'Debug'}] ${message}`, data);
  }

  info(message: string, data?: any, source?: string) {
    this.addLog('info', message, data, source);
    console.info(`[${source || 'Debug'}] ${message}`, data);
  }

  private addLog(level: LogEntry['level'], message: string, data?: any, source?: string) {
    const entry: LogEntry = {
      timestamp: Date.now(),
      level,
      message,
      data: data ? this.serializeData(data) : undefined,
      source
    };

    this.logs.push(entry);
    
    // enforce max
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // notify subscribers
    this.subscribers.forEach(callback => callback(this.logs));
  }

  private serializeData(data: any): any {
    try {
      // handle circular references and non-serializable objects
      return JSON.parse(JSON.stringify(data, (_key, value) => {
        if (typeof value === 'function') return '[Function]';
        if (value instanceof HTMLElement) return `[HTMLElement: ${value.tagName}]`;
        if (value instanceof MediaStream) return `[MediaStream: ${value.id}]`;
        if (value instanceof MediaStreamTrack) return `[MediaStreamTrack: ${value.kind}]`;
        if (value instanceof Error) return `[Error: ${value.message}]`;
        return value;
      }));
    } catch (error) {
      return `[Unserializable: ${typeof data}]`;
    }
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    this.subscribers.forEach(callback => callback(this.logs));
  }

  subscribe(callback: (logs: LogEntry[]) => void) {
    this.subscribers.push(callback);
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  logEnvironmentInfo() {
    const { userAgent, platform } = navigator;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !/Chrome/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);
    const isFirefox = /Firefox/.test(userAgent);
    
    this.info('Environment Info', {
      userAgent,
      platform,
      isIOS,
      isSafari,
      isChrome,
      isFirefox,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      devicePixelRatio: window.devicePixelRatio,
      maxTouchPoints: navigator.maxTouchPoints,
      webkitSupported: 'webkitGetUserMedia' in navigator,
      getUserMediaSupported: 'getUserMedia' in navigator.mediaDevices,
      enumerateDevicesSupported: 'enumerateDevices' in navigator.mediaDevices
    }, 'Environment');
  }

  logVideoElementState(video: HTMLVideoElement | null, context: string) {
    if (!video) {
      this.warn(`Video element is null`, undefined, context);
      return;
    }

    this.info(`Video element state`, {
      videoWidth: video.videoWidth,
      videoHeight: video.videoHeight,
      clientWidth: video.clientWidth,
      clientHeight: video.clientHeight,
      readyState: video.readyState,
      networkState: video.networkState,
      currentTime: video.currentTime,
      duration: video.duration,
      paused: video.paused,
      ended: video.ended,
      srcObject: video.srcObject ? 'MediaStream present' : 'No srcObject',
      autoplay: video.autoplay,
      muted: video.muted,
      playsinline: video.hasAttribute('playsinline')
    }, context);
  }

  logMediaStreamState(stream: MediaStream | null, context: string) {
    if (!stream) {
      this.warn(`MediaStream is null`, undefined, context);
      return;
    }

    const tracks = stream.getVideoTracks();
    this.info(`MediaStream state`, {
      id: stream.id,
      active: stream.active,
      videoTracks: tracks.length,
      trackDetails: tracks.map(track => ({
        id: track.id,
        kind: track.kind,
        label: track.label,
        enabled: track.enabled,
        readyState: track.readyState,
        settings: track.getSettings()
      }))
    }, context);
  }
}

export const logger = new Logger();

logger.logEnvironmentInfo();
