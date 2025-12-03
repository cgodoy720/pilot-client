import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import './PaymentAdmin.css';

const PaymentAdmin = () => {
  const { token } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [documents, setDocuments] = useState({});
  
  const fileInputRef = useRef(null);

  // Load users on component mount
  useEffect(() => {
    loadUsers();
  }, []);

  // Load documents when user is selected
  useEffect(() => {
    if (selectedUser) {
      loadUserDocuments(selectedUser.user_id);
    } else {
      setDocuments({});
    }
  }, [selectedUser]);

  const loadUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load users');
      }

      const data = await response.json();
      // Sort users alphabetically
      const sorted = data.sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setUsers(sorted);
    } catch (error) {
      setError(error.message || 'Failed to load users');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const loadUserDocuments = async (userId) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/admin/documents/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load documents');
      }

      const data = await response.json();
      setDocuments(data.documents || {});
    } catch (error) {
      setError(error.message || 'Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;
    if (!selectedUser) {
      setError('Please select a user first');
      return;
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      setError('Please upload only PDF, DOC, DOCX, or TXT files.');
      return;
    }

    // Validate file size (10MB limit)
    const maxFileSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxFileSize) {
      setError('File size too large. Please upload files smaller than 10MB.');
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', 'goodJobAgreement');
      formData.append('userId', selectedUser.user_id.toString());

      const url = `${import.meta.env.VITE_API_URL}/api/payment/admin/upload-document`;
      console.log('🔍 Uploading to:', url);
      console.log('🔍 API URL:', import.meta.env.VITE_API_URL);
      console.log('🔍 Full URL check:', new URL(url).href);
      
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData,
        cache: 'no-store'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload document');
      }

      const result = await response.json();
      
      // Reload documents
      await loadUserDocuments(selectedUser.user_id);

      setMessage(`Document uploaded successfully for ${result.user.name}!`);
      setTimeout(() => setMessage(''), 5000);

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      setError(error.message || 'Failed to upload document');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers = users.filter(user => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    const email = (user.email || '').toLowerCase();
    const search = searchTerm.toLowerCase();
    return fullName.includes(search) || email.includes(search);
  });

  return (
    <div className="payment-admin">
      <div className="payment-admin__container">
        <div className="payment-admin__header">
          <h1 className="payment-admin__title">Admin Payments View</h1>
          <p className="payment-admin__subtitle">Upload and manage signed Good Job Agreements for Fellows</p>
        </div>

        {message && <div className="payment-admin__message payment-admin__message--success">{message}</div>}
        {error && <div className="payment-admin__message payment-admin__message--error">{error}</div>}

        <div className="payment-admin__content">
          {/* User Selection */}
          <div className="payment-admin__section">
            <h2 className="payment-admin__section-title">Select Fellow</h2>
            <div className="payment-admin__search">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="payment-admin__search-input"
              />
            </div>
            
            {isLoadingUsers ? (
              <div className="payment-admin__loading">Loading users...</div>
            ) : (
              <div className="payment-admin__user-list">
                {filteredUsers.length === 0 ? (
                  <div className="payment-admin__empty">No users found</div>
                ) : (
                  filteredUsers.map(user => (
                    <div
                      key={user.user_id}
                      className={`payment-admin__user-item ${selectedUser?.user_id === user.user_id ? 'payment-admin__user-item--selected' : ''}`}
                      onClick={() => setSelectedUser(user)}
                    >
                      <div className="payment-admin__user-name">
                        {user.first_name} {user.last_name}
                      </div>
                      <div className="payment-admin__user-email">{user.email}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Document Upload Section */}
          {selectedUser && (
            <div className="payment-admin__section">
              <h2 className="payment-admin__section-title">
                Upload Signed Good Job Agreement for {selectedUser.first_name} {selectedUser.last_name}
              </h2>
              
              {documents.goodJobAgreement ? (
                <div className="payment-admin__existing-doc">
                  <div className="payment-admin__existing-doc-header">
                    <span className="payment-admin__existing-doc-label">Current Document:</span>
                    <span className="payment-admin__existing-doc-name">{documents.goodJobAgreement.name}</span>
                  </div>
                  <div className="payment-admin__existing-doc-date">
                    Uploaded: {new Date(documents.goodJobAgreement.uploadedAt).toLocaleString()}
                  </div>
                  <p className="payment-admin__existing-doc-note">Uploading a new file will replace the existing document.</p>
                </div>
              ) : (
                <div className="payment-admin__no-doc">
                  <p>No signed agreement on file for this Fellow.</p>
                </div>
              )}

              <div className="payment-admin__upload">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileUpload(file);
                    }
                  }}
                  accept=".pdf,.doc,.docx,.txt"
                  style={{ display: 'none' }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isLoading}
                  className="payment-admin__button payment-admin__button--primary"
                >
                  {isLoading ? 'Uploading...' : documents.goodJobAgreement ? 'Replace Document' : 'Upload Signed Agreement'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentAdmin;

