import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div style={{ padding: 32, fontFamily: 'sans-serif', maxWidth: 720, margin: '40px auto' }}>
        <h2 style={{ color: '#dc2626' }}>Something went wrong</h2>
        <pre style={{ background: '#f1f5f9', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap' }}>{String(this.state.error?.message || this.state.error)}</pre>
        <button style={{ padding: '10px 18px', borderRadius: 8, border: 0, background: '#1d4ed8', color: '#fff', cursor: 'pointer' }}
          onClick={() => { Object.keys(localStorage).filter((k) => k.startsWith('stms_')).forEach((k) => localStorage.removeItem(k)); location.href = '/'; }}>
          Reset saved data and reload
        </button>
      </div>
    );
  }
}
