import React, { useEffect } from 'react';

interface DiscordCallbackProps {
  onAuthComplete: (user: any) => void;
  onError: (error: string) => void;
}

export const DiscordCallback: React.FC<DiscordCallbackProps> = ({ onAuthComplete, onError }) => {
  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');

      if (error) {
        onError('Discord authorization was denied or failed');
        return;
      }

      if (!code || !state) {
        onError('Invalid Discord callback parameters');
        return;
      }

      try {
        const response = await fetch('/api/auth/discord/callback', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code, state }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Discord login failed');
        }

        const data = await response.json();
        
        // Store auth token
        localStorage.setItem('auth_token', data.token);
        
        // Complete authentication
        onAuthComplete(data.user);

      } catch (err) {
        onError(err instanceof Error ? err.message : 'Discord login failed');
      }
    };

    handleCallback();
  }, [onAuthComplete, onError]);

  return (
    <div className="auth-container">
      <div className="cyber-window">
        <div className="cyber-titlebar">
          <div className="titlebar-buttons">
            <div className="cyber-button minimize"></div>
            <div className="cyber-button maximize"></div>
            <div className="cyber-button close"></div>
          </div>
          <div className="titlebar-title">Processing Discord Login...</div>
        </div>
        
        <div className="cyber-window-content">
          <div className="auth-form">
            <div className="loading-container">
              <div className="cyber-loading">
                <div className="loading-grid"></div>
                <div className="loading-text">
                  Authenticating with Discord...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
