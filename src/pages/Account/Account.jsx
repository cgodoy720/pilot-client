import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '../../components/ui/avatar';
import { Textarea } from '../../components/ui/textarea';
import { CheckCircle2, AlertCircle, Github, ArrowRight, RefreshCw, User, Sparkles, Save, Linkedin, Undo2 } from 'lucide-react';
import Swal from 'sweetalert2';

function Account() {
  const { user, token, updateUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // User info state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Lookbook profile state
  const [lookbookPhoto, setLookbookPhoto] = useState(null);
  const [lookbookBio, setLookbookBio] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [originalBio, setOriginalBio] = useState('');
  const [originalLinkedinUrl, setOriginalLinkedinUrl] = useState('');
  const [originalGithubUrl, setOriginalGithubUrl] = useState('');
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isEnhancingBio, setIsEnhancingBio] = useState(false);
  const [hasLookbookProfile, setHasLookbookProfile] = useState(false);
  const [preEnhanceBio, setPreEnhanceBio] = useState(null); // For undo functionality

  // GitHub integration state
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUser, setGithubUser] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || user.first_name || '');
      setLastName(user.lastName || user.last_name || '');
      checkGitHubConnection();
      fetchLookbookProfile();
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

  const fetchLookbookProfile = async () => {
    setIsLoadingProfile(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/lookbook-profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data && Object.keys(data.data).length > 0) {
          setHasLookbookProfile(true);
          if (data.data.photo_url) {
            setLookbookPhoto(data.data.photo_url);
          }
          const bio = data.data.bio || '';
          const linkedin = data.data.linkedin_url || '';
          const github = data.data.github_url || '';
          
          setLookbookBio(bio);
          setOriginalBio(bio);
          setLinkedinUrl(linkedin);
          setOriginalLinkedinUrl(linkedin);
          setGithubUrl(github);
          setOriginalGithubUrl(github);
        } else {
          setHasLookbookProfile(false);
        }
      }
    } catch (err) {
      console.error('Error fetching lookbook profile:', err);
    } finally {
      setIsLoadingProfile(false);
    }
  };

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

  const handleSaveLookbookProfile = async () => {
    setIsSavingProfile(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/lookbook-profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          bio: lookbookBio,
          linkedin_url: linkedinUrl,
          github_url: githubUrl
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setOriginalBio(lookbookBio);
      setOriginalLinkedinUrl(linkedinUrl);
      setOriginalGithubUrl(githubUrl);
      setMessage('Profile updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving lookbook profile:', err);
      setError(err.message || 'Failed to save profile. Please try again.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleEnhanceBio = async () => {
    if (!lookbookBio.trim()) {
      setError('Please write something in your bio first.');
      return;
    }

    setIsEnhancingBio(true);
    setError('');
    setMessage('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/enhance-bio`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bio: lookbookBio })
      });

      if (!response.ok) {
        throw new Error('Failed to enhance bio');
      }

      const data = await response.json();
      if (data.success && data.enhanced) {
        setPreEnhanceBio(lookbookBio); // Save for undo
        setLookbookBio(data.enhanced);
        setMessage('Bio enhanced! Click "Undo" to restore your original.');
        setTimeout(() => setMessage(''), 5000);
      }
    } catch (err) {
      console.error('Error enhancing bio:', err);
      setError('Failed to enhance bio. Please try again.');
    } finally {
      setIsEnhancingBio(false);
    }
  };

  const handleUndoEnhance = () => {
    if (preEnhanceBio !== null) {
      setLookbookBio(preEnhanceBio);
      setPreEnhanceBio(null);
      setMessage('Bio restored to your original version.');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handleUpdatePassword = async () => {
    const { value: formValues } = await Swal.fire({
      title: 'Change Password',
      html: `
        <div style="text-align: left; margin-bottom: 8px;">
          <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 4px; color: #1E1E1E;">Current Password</label>
          <input type="password" id="swal-current-password" class="swal2-input" placeholder="Enter current password" style="margin: 0; width: 100%;">
        </div>
        <div style="text-align: left; margin-bottom: 8px; margin-top: 16px;">
          <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 4px; color: #1E1E1E;">New Password</label>
          <input type="password" id="swal-new-password" class="swal2-input" placeholder="Enter new password" style="margin: 0; width: 100%;">
        </div>
        <div style="text-align: left; margin-top: 16px;">
          <label style="display: block; font-size: 14px; font-weight: 500; margin-bottom: 4px; color: #1E1E1E;">Confirm New Password</label>
          <input type="password" id="swal-confirm-password" class="swal2-input" placeholder="Confirm new password" style="margin: 0; width: 100%;">
        </div>
        <p style="font-size: 12px; color: #666666; margin-top: 16px; text-align: left;">
          Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.
        </p>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Update Password',
      confirmButtonColor: '#4242EA',
      cancelButtonColor: '#C8C8C8',
      preConfirm: () => {
        const currentPassword = document.getElementById('swal-current-password').value;
        const newPassword = document.getElementById('swal-new-password').value;
        const confirmPassword = document.getElementById('swal-confirm-password').value;

        if (!currentPassword) {
          Swal.showValidationMessage('Please enter your current password');
          return false;
        }
        if (!newPassword) {
          Swal.showValidationMessage('Please enter a new password');
          return false;
        }
        if (newPassword !== confirmPassword) {
          Swal.showValidationMessage('New passwords do not match');
          return false;
        }
        if (newPassword.length < 8) {
          Swal.showValidationMessage('Password must be at least 8 characters');
          return false;
        }

        return { currentPassword, newPassword };
      }
    });

    if (formValues) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/change-password`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            currentPassword: formValues.currentPassword,
            newPassword: formValues.newPassword
          })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to change password');
        }

        Swal.fire({
          icon: 'success',
          title: 'Password Updated',
          text: 'Your password has been changed successfully.',
          confirmButtonColor: '#4242EA'
        });
      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.message || 'Failed to change password. Please try again.',
          confirmButtonColor: '#4242EA'
        });
      }
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

  // Get user's display name
  const displayName = firstName || user?.firstName || user?.first_name || 'User';
  
  // Get user roles for access badges
  const getUserRoles = () => {
    const roles = [];
    if (user?.role) {
      roles.push(user.role.charAt(0).toUpperCase() + user.role.slice(1));
    }
    return roles;
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    const first = (firstName || user?.firstName || user?.first_name || '')[0] || '';
    const last = (lastName || user?.lastName || user?.last_name || '')[0] || '';
    return (first + last).toUpperCase() || 'U';
  };

  // Check if lookbook profile has unsaved changes
  const profileHasChanges = 
    lookbookBio !== originalBio || 
    linkedinUrl !== originalLinkedinUrl || 
    githubUrl !== originalGithubUrl;

  return (
    <div className="w-full h-full bg-[#EFEFEF] overflow-y-auto">
      {/* Messages */}
      {(message || error) && (
        <div className="px-10 pt-4">
          {message && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 mb-4">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{message}</span>
            </div>
          )}
          {error && (
            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 mb-4">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Header - matching Dashboard style */}
      <div className="flex items-center h-[45px] px-10 mb-4 border-b border-[#C8C8C8]">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            {lookbookPhoto ? (
              <AvatarImage src={lookbookPhoto} alt="Profile" />
            ) : githubUser?.avatar_url ? (
              <AvatarImage src={githubUser.avatar_url} alt="Profile" />
            ) : null}
            <AvatarFallback className="bg-[#4242EA] text-white text-sm font-medium">
              {getInitials()}
            </AvatarFallback>
          </Avatar>
          <h1 
            className="font-normal text-2xl leading-[44px] tracking-[0.005em]"
            style={{
              background: 'linear-gradient(90deg, #1E1E1E 0%, #4242EA 55.29%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text'
            }}
          >
            {displayName}'s Profile
          </h1>
        </div>
      </div>

      {/* Three-Column Layout */}
      <div className="px-10 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-0">
          
          {/* LEFT COLUMN - Account */}
          <div className="space-y-6 pr-6 lg:border-r lg:border-[#C8C8C8]">
            <div className="flex items-baseline justify-between">
              <h2 className="text-2xl font-semibold text-[#1E1E1E]">Account</h2>
              <span className="text-sm text-[#666666]">{user?.email}</span>
            </div>

            {/* Login Info */}
            <div>
              <h3 className="text-sm font-semibold text-[#1E1E1E] mb-4">Login info</h3>
              <form onSubmit={handleSaveUserInfo} className="space-y-4">
                <div>
                  <Input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="First name"
                    className="border-0 border-b border-[#C8C8C8] rounded-none bg-transparent px-0 focus:ring-0 focus:border-[#4242EA] text-[#1E1E1E]"
                  />
                </div>
                <div>
                  <Input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Last name"
                    className="border-0 border-b border-[#C8C8C8] rounded-none bg-transparent px-0 focus:ring-0 focus:border-[#4242EA] text-[#1E1E1E]"
                  />
                </div>

                {/* Password field */}
                <div 
                  className="flex items-center justify-between border-b border-[#C8C8C8] pb-2 cursor-pointer hover:bg-[#F5F5F5] -mx-2 px-2 rounded transition-colors"
                  onClick={handleUpdatePassword}
                >
                  <span className="text-[#1E1E1E]">••••••••••••••••</span>
                  <Button 
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs border-[#C8C8C8] text-[#1E1E1E] hover:bg-[#EFEFEF]"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleUpdatePassword();
                    }}
                  >
                    Update Password
                  </Button>
                </div>
                <p className="text-xs text-[#999999]">Click to change your password</p>

                {/* Save button - hidden, auto-saves or add explicit save */}
                {(firstName !== (user?.firstName || user?.first_name || '') || 
                  lastName !== (user?.lastName || user?.last_name || '')) && (
                  <Button 
                    type="submit"
                    disabled={isSaving}
                    size="sm"
                    className="bg-[#4242EA] hover:bg-[#3535C7] text-white"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                )}
              </form>
            </div>

            {/* Access Section */}
            <div>
              <h3 className="text-sm font-semibold text-[#1E1E1E] mb-4">Access</h3>
              <div className="flex flex-wrap gap-2 mb-4">
                {getUserRoles().map((role, index) => (
                  <Badge 
                    key={index}
                    className="bg-[#1E1E1E] text-white hover:bg-[#333333] rounded-full px-4 py-1"
                  >
                    {role}
                  </Badge>
                ))}
                {user?.cohort && (
                  <Badge 
                    variant="outline"
                    className="border-[#4242EA] text-[#4242EA] rounded-full px-4 py-1"
                  >
                    {user.cohort}
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* MIDDLE COLUMN - Personal */}
          <div className="space-y-6 px-6 lg:border-r lg:border-[#C8C8C8]">
            <h2 className="text-2xl font-semibold text-[#1E1E1E]">Personal</h2>
            
            {/* Profile Photo */}
            <div className="flex justify-center">
              <div className="relative w-full max-w-[280px]">
                <div className="aspect-[3/4] w-full bg-[#E3E3E3] rounded-lg overflow-hidden">
                {isLoadingProfile ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <RefreshCw className="h-8 w-8 text-[#999999] animate-spin" />
                  </div>
                ) : lookbookPhoto ? (
                  <img 
                    src={lookbookPhoto} 
                    alt="Profile" 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#999999]">
                    <User className="h-16 w-16 mb-2" />
                    <span className="text-sm">No photo uploaded</span>
                  </div>
                )}
              </div>
                {/* Refresh button */}
                <button 
                  onClick={fetchLookbookProfile}
                  className="absolute bottom-3 right-3 p-2 bg-white/90 rounded-full shadow-sm hover:bg-white transition-colors border border-[#E3E3E3]"
                  title="Refresh profile"
                >
                  <RefreshCw className={`h-4 w-4 text-[#666666] ${isLoadingProfile ? 'animate-spin' : ''}`} />
                </button>
              </div>
            </div>

            {/* Lookbook Profile Section */}
            {hasLookbookProfile ? (
              <div className="space-y-4">
                {/* Bio */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-[#1E1E1E]">Bio</h3>
                    {profileHasChanges && (
                      <span className="text-xs text-[#4242EA]">Unsaved changes</span>
                    )}
                  </div>
                  <Textarea
                    value={lookbookBio}
                    onChange={(e) => setLookbookBio(e.target.value)}
                    placeholder="Write a brief professional bio about yourself..."
                    className="min-h-[100px] border-[#C8C8C8] focus:border-[#4242EA] focus:ring-[#4242EA] resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={handleEnhanceBio}
                      disabled={isEnhancingBio || !lookbookBio.trim()}
                      variant="outline"
                      size="sm"
                      className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA]/5"
                    >
                      {isEnhancingBio ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Enhance with AI
                        </>
                      )}
                    </Button>
                    {preEnhanceBio !== null && (
                      <Button
                        onClick={handleUndoEnhance}
                        variant="outline"
                        size="sm"
                        className="border-[#C8C8C8] text-[#666666] hover:bg-[#EFEFEF]"
                      >
                        <Undo2 className="h-4 w-4 mr-2" />
                        Undo
                      </Button>
                    )}
                  </div>
                </div>

                {/* LinkedIn URL */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#1E1E1E]">LinkedIn</h3>
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-4 w-4 text-[#0A66C2]" />
                    <Input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="border-[#C8C8C8] focus:border-[#4242EA] focus:ring-[#4242EA]"
                    />
                  </div>
                </div>

                {/* GitHub URL */}
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-[#1E1E1E]">GitHub</h3>
                  <div className="flex items-center gap-2">
                    <Github className="h-4 w-4 text-[#1E1E1E]" />
                    <Input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username"
                      className="border-[#C8C8C8] focus:border-[#4242EA] focus:ring-[#4242EA]"
                    />
                  </div>
                </div>

                {/* Save Button */}
                {profileHasChanges && (
                  <Button
                    onClick={handleSaveLookbookProfile}
                    disabled={isSavingProfile}
                    className="bg-[#4242EA] hover:bg-[#3535C7] text-white"
                  >
                    {isSavingProfile ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Profile
                      </>
                    )}
                  </Button>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-[#FFF9E6] border border-[#F5D76E] text-[#8B7355]">
                <p className="text-sm">
                  Your Lookbook profile hasn't been set up yet. Please contact an admin to create your profile, then you can edit your bio and links here.
                </p>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN - Integrations */}
          <div className="space-y-6 pl-6">
            <h2 className="text-2xl font-semibold text-[#1E1E1E]">Integrations</h2>
            
            {/* External Apps */}
            <div>
              <h3 className="text-sm font-semibold text-[#1E1E1E] mb-4">External Apps</h3>
              
              {/* GitHub */}
              <div className="flex items-center justify-between py-3 border-b border-[#E3E3E3]">
                <div className="flex items-center gap-3">
                  <Github className="h-5 w-5 text-[#1E1E1E]" />
                  <span className="text-[#1E1E1E] font-medium">GitHub</span>
                </div>
                {githubConnected ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-[#666666]">@{githubUser?.username}</span>
                    <Button
                      onClick={handleDisconnectGitHub}
                      variant="outline"
                      size="sm"
                      className="border-[#C8C8C8] text-[#666666] hover:bg-[#EFEFEF] rounded-full px-4"
                    >
                      Disconnect
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleConnectGitHub}
                    disabled={isConnecting}
                    variant="outline"
                    size="sm"
                    className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA]/5 rounded-full px-4"
                  >
                    {isConnecting ? 'Connecting...' : 'Connect'}
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
              </div>

              {/* Slack */}
              <div className="flex items-center justify-between py-3 border-b border-[#E3E3E3]">
                <div className="flex items-center gap-3">
                  <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#4242EA"/>
                  </svg>
                  <span className="text-[#1E1E1E] font-medium">Slack</span>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  className="bg-[#4242EA] hover:bg-[#3535C7] text-white rounded-full px-4"
                >
                  Connect
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>

            {/* Pursuit Lookbook */}
            <div>
              <h3 className="text-sm font-semibold text-[#1E1E1E] mb-4">Pursuit Lookbook</h3>
              <p className="text-sm text-[#666666]">
                Your professional profile is managed through the Pursuit Lookbook platform.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default Account;
