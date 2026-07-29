import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#04080f',
      color: '#e8e4d8',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '4rem', color: '#c9a84c', marginBottom: '1rem' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '2rem' }}>Không tìm thấy trang</h2>
      <p style={{ opacity: 0.8, marginBottom: '2rem' }}>Trang bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ bỏ.</p>
      <Link to="/" style={{
        padding: '12px 24px',
        background: 'linear-gradient(135deg, #c9a84c, #8a6e2a)',
        color: '#04080f',
        textDecoration: 'none',
        borderRadius: '8px',
        fontWeight: 'bold'
      }}>
        Về trang chủ
      </Link>
    </div>
  );
}
