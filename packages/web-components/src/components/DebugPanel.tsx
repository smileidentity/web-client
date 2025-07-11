import { useState, useEffect } from 'preact/hooks';
import { logger } from '@/utils/logger.js';
import type { LogEntry } from '@/utils/logger.js';

interface DebugPanelProps {
  isVisible: boolean;
  onClose: () => void;
}

export const DebugPanel = ({ isVisible, onClose }: DebugPanelProps) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [levelFilter, setLevelFilter] = useState<string>('all');

  useEffect(() => {
    if (isVisible) {
      setLogs(logger.getLogs());
      const unsubscribe = logger.subscribe((newLogs: LogEntry[]) => {
        setLogs(newLogs);
      });
      return unsubscribe;
    }
    return undefined;
  }, [isVisible]);

  const filteredLogs = logs.filter(log => {
    const matchesText = filter === '' || 
      log.message.toLowerCase().includes(filter.toLowerCase()) ||
      log.source?.toLowerCase().includes(filter.toLowerCase());
    
    const matchesLevel = levelFilter === 'all' || log.level === levelFilter;
    
    return matchesText && matchesLevel;
  });

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.toLocaleTimeString()}.${date.getMilliseconds().toString().padStart(3, '0')}`;
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return '#ff4444';
      case 'warn': return '#ffaa00';
      case 'info': return '#0088ff';
      default: return '#666666';
    }
  };

  const copyLogsToClipboard = () => {
    const logText = filteredLogs.map(log => 
      `[${formatTimestamp(log.timestamp)}] [${log.level.toUpperCase()}] [${log.source || 'Debug'}] ${log.message}${log.data ? `\n${JSON.stringify(log.data, null, 2)}` : ''}`
    ).join('\n\n');
    
    navigator.clipboard?.writeText(logText).then(() => {
      // eslint-disable-next-line no-alert
      alert('Logs copied to clipboard!');
    }).catch(() => {
      // Fallback for iOS Safari which doesn't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = logText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      // eslint-disable-next-line no-alert
      alert('Logs copied to clipboard!');
    });
  };

  if (!isVisible) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      zIndex: 10000,
      display: 'flex',
      flexDirection: 'column',
      padding: '20px'
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid #eee',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <h3 style={{ margin: 0, fontSize: '18px' }}>Debug Logs ({filteredLogs.length})</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Filter logs..."
              value={filter}
              onChange={(e) => setFilter((e.target as HTMLInputElement).value)}
              style={{
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            />
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter((e.target as HTMLSelectElement).value)}
              style={{
                padding: '4px 8px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '12px'
              }}
            >
              <option value="all">All Levels</option>
              <option value="log">Log</option>
              <option value="info">Info</option>
              <option value="warn">Warn</option>
              <option value="error">Error</option>
            </select>
            <button
              onClick={copyLogsToClipboard}
              style={{
                padding: '4px 8px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Copy
            </button>
            <button
              onClick={() => logger.clearLogs()}
              style={{
                padding: '4px 8px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '4px 8px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Close
            </button>
          </div>
        </div>

        {/* Log content */}
        <div style={{
          flex: 1,
          overflow: 'auto',
          padding: '0',
          fontFamily: 'monospace',
          fontSize: '12px'
        }}>
          {filteredLogs.length === 0 ? (
            <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
              No logs found
            </div>
          ) : (
            filteredLogs.map((log, index) => (
              <div
                key={index}
                style={{
                  padding: '8px 16px',
                  borderBottom: '1px solid #f0f0f0',
                  backgroundColor: index % 2 === 0 ? '#fafafa' : 'white'
                }}
              >
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  alignItems: 'flex-start',
                  marginBottom: log.data ? '4px' : '0'
                }}>
                  <span style={{ color: '#999', minWidth: '80px' }}>
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span style={{
                    color: getLevelColor(log.level),
                    fontWeight: 'bold',
                    minWidth: '50px',
                    textTransform: 'uppercase'
                  }}>
                    {log.level}
                  </span>
                  <span style={{ color: '#0066cc', minWidth: '80px' }}>
                    [{log.source || 'Debug'}]
                  </span>
                  <span style={{ flex: 1 }}>
                    {log.message}
                  </span>
                </div>
                {log.data && (
                  <div style={{
                    marginLeft: '170px',
                    backgroundColor: '#f8f9fa',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    fontSize: '11px',
                    whiteSpace: 'pre-wrap',
                    overflow: 'auto'
                  }}>
                    {JSON.stringify(log.data, null, 2)}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
