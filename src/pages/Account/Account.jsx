import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Badge } from '../../components/ui/badge';
import { CheckCircle2, AlertCircle, Github, ExternalLink, Lock, Code2 } from 'lucide-react';

function Account() {
  const { user, token, updateUser } = useAuth();
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
      checkGitHubConnection();
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (githubStatus === 'error') {
      setError('Failed to connect GitHub account. Please try again.');
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

      updateUser({
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        firstName: firstName.trim(),
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
    <div className="w-full h-full bg-[#EFEFEF] overflow-y-auto p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Success Message */}
        {message && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700">
            <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{message}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Account Information Section */}
        <Card className="bg-white border-[#C8C8C8]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#1E1E1E]">
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-[#666666]">
                  Email Address
                </Label>
                <p className="text-[#1E1E1E] font-medium py-2 border-b border-[#E3E3E3]">
                  {user?.email || 'Not specified'}
                </p>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-[#666666]">
                  Cohort
                </Label>
                <p className="text-[#1E1E1E] font-medium py-2 border-b border-[#E3E3E3]">
                  {user?.cohort || 'Not specified'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Personal Information Section */}
        <Card className="bg-white border-[#C8C8C8]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#1E1E1E]">
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveUserInfo} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-xs uppercase tracking-wider text-[#666666]">
                    First Name
                  </Label>
                  <Input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Enter your first name"
                    className="border-[#C8C8C8] focus:border-[#4242EA] focus:ring-[#4242EA]"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-xs uppercase tracking-wider text-[#666666]">
                    Last Name
                  </Label>
                  <Input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Enter your last name"
                    className="border-[#C8C8C8] focus:border-[#4242EA] focus:ring-[#4242EA]"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isSaving}
                className="bg-[#4242EA] hover:bg-[#3535C7] text-white"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* GitHub Integration Section */}
        <Card className="bg-white border-[#C8C8C8]">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-[#1E1E1E] flex items-center gap-2">
              <Github className="h-5 w-5" />
              GitHub Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {githubConnected ? (
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-4 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    {githubUser?.avatar_url ? (
                      <AvatarImage src={githubUser.avatar_url} alt="GitHub Avatar" />
                    ) : null}
                    <AvatarFallback className="bg-[#4242EA] text-white font-semibold">
                      GH
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-green-700">Connected to GitHub</h3>
                    <p className="text-[#1E1E1E] font-medium">@{githubUser?.username || 'username'}</p>
                    <p className="text-sm text-[#666666]">Your repositories are accessible for course projects</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleViewRepos}
                    disabled={isLoadingRepos}
                    className="bg-[#4242EA] hover:bg-[#3535C7] text-white"
                  >
                    {isLoadingRepos ? 'Loading...' : showRepos ? 'Hide Repos' : 'View Repos'}
                  </Button>
                  <Button 
                    onClick={handleDisconnectGitHub}
                    variant="outline"
                    className="border-[#C8C8C8] text-[#1E1E1E] hover:bg-[#EFEFEF]"
                  >
                    Disconnect
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-6 rounded-lg bg-[#EFEFEF] border border-[#C8C8C8]">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-[#1E1E1E] mb-2">
                      Connect Your GitHub Account
                    </h3>
                    <p className="text-[#666666]">
                      Connect your GitHub account to access your repositories for course projects and assignments.
                    </p>
                  </div>
                  <ul className="space-y-2">
                    {[
                      'Access to all your public and private repositories',
                      'Seamless project submission workflow',
                      'Enhanced learning experience with your actual code'
                    ].map((benefit, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm text-[#666666]">
                        <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                        {benefit}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    onClick={handleConnectGitHub}
                    disabled={isConnecting}
                    className="bg-[#4242EA] hover:bg-[#3535C7] text-white mt-2"
                  >
                    <Github className="h-4 w-4 mr-2" />
                    {isConnecting ? 'Connecting...' : 'Connect GitHub'}
                  </Button>
                </div>
              </div>
            )}

            {/* GitHub Repositories Section */}
            {githubConnected && showRepos && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-[#1E1E1E]">
                  Your GitHub Repositories ({githubRepos.length})
                </h3>
                {githubRepos.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {githubRepos.map(repo => (
                      <div 
                        key={repo.id} 
                        className="p-4 rounded-lg bg-[#EFEFEF] border border-[#C8C8C8] hover:border-[#4242EA] transition-all duration-200 hover:shadow-md"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">
                            <a 
                              href={repo.html_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-[#4242EA] hover:underline flex items-center gap-1"
                            >
                              {repo.name}
                              <ExternalLink className="h-3 w-3" />
                            </a>
                          </h4>
                          <div className="flex gap-1.5">
                            {repo.private && (
                              <Badge variant="destructive" className="text-xs bg-red-100 text-red-600 border-red-200">
                                <Lock className="h-3 w-3 mr-1" />
                                Private
                              </Badge>
                            )}
                            {repo.language && (
                              <Badge className="text-xs bg-[#4242EA]/10 text-[#4242EA] border-[#4242EA]/20">
                                <Code2 className="h-3 w-3 mr-1" />
                                {repo.language}
                              </Badge>
                            )}
                          </div>
                        </div>
                        {repo.description && (
                          <p className="text-sm text-[#666666] mb-3 line-clamp-2">
                            {repo.description}
                          </p>
                        )}
                        <div className="pt-2 border-t border-[#E3E3E3]">
                          <span className="text-xs text-[#666666]">
                            Updated {new Date(repo.updated_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-[#666666] italic py-8">
                    No repositories found.
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default Account;
