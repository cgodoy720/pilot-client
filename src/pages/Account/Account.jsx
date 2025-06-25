import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import './Account.css';

function Account() {
  const { user, token, updateUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // User info state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // GitHub integration state
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [githubRepos, setGithubRepos] = useState([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const [showRepos, setShowRepos] = useState(false);

  useEffect(() => {
    if (user) {
      // Handle both camelCase and snake_case field names
      setFirstName(user.firstName || user.first_name || '');
      setLastName(user.lastName || user.last_name || '');
      checkGitHubConnection();
    }
  }, [user]);

  // Handle GitHub OAuth callback
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const githubStatus = urlParams.get('github');
    
    if (githubStatus === 'success') {
      setMessage('GitHub account connected successfully!');
      setTimeout(() => setMessage(''), 3000);
      checkGitHubConnection(); // Refresh connection status
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (githubStatus === 'error') {
      setError('Failed to connect GitHub account. Please try again.');
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const checkGitHubConnection = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/github/status`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGithubConnected(data.connected);
        if (data.connected) {
          setGithubUser({
            username: data.username,
            avatar_url: data.avatar_url
          });
        } else {
          setGithubRepos([]);
          setShowRepos(false);
        }
      }
    } catch (err) {
      console.error('Error checking GitHub connection:', err);
    }
  };

  const handleSaveUserInfo = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          first_name: firstName.trim(),
          last_name: lastName.trim()
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update user information');
      }

      const data = await response.json();
      
      // Update the user state with the new information
      updateUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        firstName: firstName.trim(), // Also update camelCase version if it exists
        lastName: lastName.trim()
      });

      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error updating user info:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleConnectGitHub = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/github/auth`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        // Redirect to GitHub OAuth URL
        window.location.href = data.authUrl;
      } else {
        throw new Error('Failed to initiate GitHub OAuth');
      }
    } catch (err) {
      console.error('Error connecting to GitHub:', err);
      setError('Failed to connect to GitHub. Please try again.');
      setIsConnecting(false);
    }
  };

  const handleDisconnectGitHub = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/github/disconnect`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setGithubConnected(false);
        setGithubUser(null);
        setGithubRepos([]);
        setShowRepos(false);
        setMessage('GitHub account disconnected successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to disconnect GitHub account');
      }
    } catch (err) {
      console.error('Error disconnecting from GitHub:', err);
      setError('Failed to disconnect from GitHub. Please try again.');
    }
  };

  const handleViewRepos = async () => {
    if (showRepos) {
      setShowRepos(false);
      return;
    }

    setIsLoadingRepos(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/github/repos`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setGithubRepos(data.repos);
        setShowRepos(true);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch repositories');
      }
    } catch (err) {
      console.error('Error fetching GitHub repos:', err);
      setError(err.message || 'Failed to fetch repositories. Please try again.');
    } finally {
      setIsLoadingRepos(false);
    }
  };

  return (
    <div className="account">
      <div className="account__container">
        <h1 className="account__title">Account Settings</h1>

        {/* Messages */}
        {message && <div className="account__message account__message--success">{message}</div>}
        {error && <div className="account__message account__message--error">{error}</div>}

        {/* User Information Section */}
        <div className="account__section">
          <h2 className="account__section-title">Personal Information</h2>
          <form onSubmit={handleSaveUserInfo} className="account__form">
            <div className="account__form-row">
              <div className="account__form-group">
                <label htmlFor="firstName" className="account__label">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="account__input"
                  placeholder="Enter your first name"
                />
              </div>
              <div className="account__form-group">
                <label htmlFor="lastName" className="account__label">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="account__input"
                  placeholder="Enter your last name"
                />
              </div>
            </div>
            
            <div className="account__form-row">
              <div className="account__form-group">
                <label htmlFor="email" className="account__label">Email Address</label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  className="account__input account__input--readonly"
                  readOnly
                />
              </div>
              <div className="account__form-group">
                <label htmlFor="cohort" className="account__label">Cohort</label>
                <input
                  type="text"
                  id="cohort"
                  value={user?.cohort || ''}
                  className="account__input account__input--readonly"
                  readOnly
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="account__button account__button--primary"
              disabled={isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        </div>

        {/* GitHub Integration Section */}
        <div className="account__section">
          <h2 className="account__section-title">GitHub Integration</h2>
          <div className="account__github">
            {githubConnected ? (
              <div className="account__github-connected">
                <div className="account__github-info">
                  <div className="account__github-avatar">
                    {githubUser?.avatar_url ? (
                      <img src={githubUser.avatar_url} alt="GitHub Avatar" />
                    ) : (
                      <div className="account__github-avatar-placeholder">GH</div>
                    )}
                  </div>
                  <div className="account__github-details">
                    <h3>Connected to GitHub</h3>
                    <p>@{githubUser?.username || 'username'}</p>
                    <small>Your repositories are accessible for course projects</small>
                  </div>
                </div>
                <div className="account__github-actions">
                  <button 
                    onClick={handleViewRepos}
                    className="account__button account__button--primary"
                    disabled={isLoadingRepos}
                  >
                    {isLoadingRepos ? 'Loading...' : showRepos ? 'Hide Repos' : 'View Repos'}
                  </button>
                  <button 
                    onClick={handleDisconnectGitHub}
                    className="account__button account__button--secondary"
                  >
                    Disconnect
                  </button>
                </div>
              </div>
            ) : (
              <div className="account__github-disconnected">
                <div className="account__github-prompt">
                  <h3>Connect Your GitHub Account</h3>
                  <p>Connect your GitHub account to access your repositories for course projects and assignments.</p>
                  <ul className="account__github-benefits">
                    <li>Access to all your public and private repositories</li>
                    <li>Seamless project submission workflow</li>
                    <li>Enhanced learning experience with your actual code</li>
                  </ul>
                </div>
                <button 
                  onClick={handleConnectGitHub}
                  className="account__button account__button--primary"
                  disabled={isConnecting}
                >
                  {isConnecting ? 'Connecting...' : 'Connect GitHub'}
                </button>
              </div>
            )}
          </div>

          {/* GitHub Repositories Section */}
          {githubConnected && showRepos && (
            <div className="account__repos-section">
              <h3 className="account__repos-title">Your GitHub Repositories ({githubRepos.length})</h3>
              {githubRepos.length > 0 ? (
                <div className="account__repos-grid">
                  {githubRepos.map(repo => (
                    <div key={repo.id} className="account__repo-card">
                      <div className="account__repo-header">
                        <h4 className="account__repo-name">
                          <a href={repo.html_url} target="_blank" rel="noopener noreferrer">
                            {repo.name}
                          </a>
                        </h4>
                        <div className="account__repo-badges">
                          {repo.private && <span className="account__repo-badge account__repo-badge--private">Private</span>}
                          {repo.language && <span className="account__repo-badge account__repo-badge--language">{repo.language}</span>}
                        </div>
                      </div>
                      {repo.description && (
                        <p className="account__repo-description">{repo.description}</p>
                      )}
                      <div className="account__repo-meta">
                        <span className="account__repo-date">
                          Updated {new Date(repo.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="account__repos-empty">No repositories found.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Account; 