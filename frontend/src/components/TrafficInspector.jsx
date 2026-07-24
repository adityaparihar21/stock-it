import React from 'react';

const TrafficInspector = ({ logs, clearLogs }) => {
  return (
    <div className="glass-card terminal-card">
      <div className="terminal-header">
        <div className="terminal-controls">
          <span className="control close"></span>
          <span className="control minimize"></span>
          <span className="control expand"></span>
        </div>
        <span className="terminal-title">
          <i className="fa-solid fa-terminal"></i> stock-it REST API Inspector
        </span>
        <button className="btn-dark-sm" onClick={clearLogs}>
          <i className="fa-solid fa-trash"></i> Clear Logs
        </button>
      </div>
      <div className="terminal-body">
        <pre>
          <code>
            {logs.length === 0 ? (
              `// Awaiting live API interactions...\n// Perform actions above (create, edit, delete, or load sample data) to inspect real-time HTTP traffic.`
            ) : (
              logs.map((log, index) => {
                const statusColor =
                  log.status >= 200 && log.status < 300 ? '#10b981' : '#ef4444';
                const methodColor =
                  log.method === 'GET'
                    ? '#60a5fa'
                    : log.method === 'POST'
                    ? '#34d399'
                    : log.method === 'PUT'
                    ? '#fbbf24'
                    : '#f87171';

                return (
                  <React.Fragment key={index}>
                    <span style={{ color: '#94a3b8' }}>[{log.timestamp}]</span>{' '}
                    <span style={{ color: methodColor, fontWeight: 'bold' }}>{log.method}</span>{' '}
                    <span style={{ color: '#cbd5e1' }}>{log.url}</span>{' '}
                    -{' '}
                    <span style={{ color: statusColor, fontWeight: 'bold' }}>
                      Status {log.status}
                    </span>
                    {'\n'}
                    {log.request && (
                      <>
                        <span style={{ color: '#64748b' }}>&rarr; Payload:</span>{' '}
                        <span style={{ color: '#f1f5f9' }}>
                          {JSON.stringify(log.request, null, 2)}
                        </span>
                        {'\n'}
                      </>
                    )}
                    <span style={{ color: '#64748b' }}>&larr; Response:</span>{' '}
                    <span style={{ color: '#38bdf8' }}>
                      {JSON.stringify(log.response, null, 2)}
                    </span>
                    {'\n\n'}
                    {index < logs.length - 1 && (
                      <span style={{ color: '#334155' }}>
                        --------------------------------------------------{'\n\n'}
                      </span>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </code>
        </pre>
      </div>
    </div>
  );
};

export default TrafficInspector;
