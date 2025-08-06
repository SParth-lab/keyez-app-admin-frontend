import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/api';
import { loginUser } from '../utils/auth';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    username: 'admin', // Default admin credentials for testing
    password: 'admin123'
  });
  const [errors, setErrors] = useState({});
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiStatus, setApiStatus] = useState('checking'); // 'checking', 'online', 'offline'
  
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }
    
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // Clear login error
    if (loginError) {
      setLoginError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setLoginError('');

    try {
      console.log('Attempting login with:', { 
        username: formData.username,
        apiUrl: import.meta.env.VITE_API_URL || 'https://keyez-dev.descube.in/api'
      });
      
      const response = await authAPI.login(formData.username, formData.password);
      console.log('Login response:', response);
      
      if (response.user && response.user.username && response.token) {
        // Store user data
        loginUser(response.user, response.token);
        
        // Check if user is admin
        if (response.user.isAdmin) {
          navigate('/chat');
        } else {
          setLoginError('Admin access required');
        }
      } else {
        console.error('Invalid response structure:', response);
        setLoginError('Invalid login response');
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: error.config?.url
      });
      
      if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
        setLoginError('Unable to connect to server. Please check your internet connection.');
      } else {
        setLoginError(error.response?.data?.error || error.message || 'Login failed. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      height: '100vh',
      background: 'var(--wa-gray-bg)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif"
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        padding: '0 20px'
      }}>
        {/* Header */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            fontSize: '80px',
            marginBottom: '20px'
          }}>
            💬
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '28px',
            fontWeight: '300',
            color: 'var(--wa-text-primary)',
            marginBottom: '8px'
          }}>
            KeyezApp Admin
          </h1>
          <p style={{
            margin: 0,
            fontSize: '14px',
            color: 'var(--wa-text-muted)',
            marginBottom: '8px'
          }}>
            Sign in to access the admin panel
          </p>
        </div>

        {/* Login Form */}
        <div style={{
          background: 'var(--wa-panel-bg)',
          borderRadius: '8px',
          padding: '40px 32px',
          boxShadow: 'var(--shadow-panel)'
        }}>
          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--wa-text-primary)',
                marginBottom: '8px'
              }}>
                Username
              </label>
              <input
                name="username"
                type="text"
                autoComplete="username"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Enter your username"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.username ? '2px solid #e74c3c' : '1px solid var(--wa-border)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--wa-panel-bg)',
                  color: 'var(--wa-text-primary)'
                }}
                onFocus={(e) => {
                  if (!errors.username) {
                    e.target.style.borderColor = 'var(--wa-green)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.username) {
                    e.target.style.borderColor = 'var(--wa-border)';
                  }
                }}
              />
              {errors.username && (
                <div style={{
                  marginTop: '5px',
                  fontSize: '12px',
                  color: '#e74c3c'
                }}>
                  {errors.username}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: 'var(--wa-text-primary)',
                marginBottom: '8px'
              }}>
                Password
              </label>
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: errors.password ? '2px solid #e74c3c' : '1px solid var(--wa-border)',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  backgroundColor: 'var(--wa-panel-bg)',
                  color: 'var(--wa-text-primary)'
                }}
                onFocus={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = 'var(--wa-green)';
                  }
                }}
                onBlur={(e) => {
                  if (!errors.password) {
                    e.target.style.borderColor = 'var(--wa-border)';
                  }
                }}
              />
              {errors.password && (
                <div style={{
                  marginTop: '5px',
                  fontSize: '12px',
                  color: '#e74c3c'
                }}>
                  {errors.password}
                </div>
              )}
            </div>

            {/* Error Message */}
            {loginError && (
              <div style={{
                background: '#fff3cd',
                border: '1px solid #ffeaa7',
                borderRadius: '6px',
                padding: '12px',
                marginBottom: '20px',
                fontSize: '14px',
                color: '#856404'
              }}>
                <strong>⚠️ Error:</strong> {loginError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '14px',
                background: isLoading ? 'var(--wa-gray-dark)' : 'var(--wa-green)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = 'var(--wa-green-dark)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = 'var(--wa-green)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid white',
                    borderTop: '2px solid transparent',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          fontSize: '12px',
          color: 'var(--wa-text-muted)'
        }}>
          <div style={{ marginBottom: '8px' }}>
            KeyezApp Admin Panel • Secure Login
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoginPage;