import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#04080f',
          color: '#f0d080',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '2rem',
          textAlign: 'center'
        }}>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '700', marginBottom: '1rem', color: '#f0d080' }}>
            Vietnam Journey
          </h2>
          <p style={{ color: '#e8e4d8', marginBottom: '1.5rem', maxWidth: '400px', lineHeight: '1.6' }}>
            Đã có sự cố kết nối tạm thời. Vui lòng làm mới trang để tiếp tục trải nghiệm.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.75rem',
              borderRadius: '9999px',
              border: 'none',
              background: 'linear-gradient(135deg, #f0d080 0%, #c9a84c 100%)',
              color: '#0b0f19',
              fontWeight: '600',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(201, 168, 76, 0.3)',
              transition: 'transform 0.2s'
            }}
          >
            Tải lại trang
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

