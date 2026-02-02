import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Badge } from '../../components/ui/badge';
import { Separator } from '../../components/ui/separator';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { CheckCircle, Upload, Users, Search, Eye } from 'lucide-react';

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

  // Preview modal states
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [previewContent, setPreviewContent] = useState('');
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState('');
  const [previewTitle, setPreviewTitle] = useState('');
  const [previewFileType, setPreviewFileType] = useState(''); // 'pdf', 'image', 'text'

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/builders`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load builders');
      }

      const data = await response.json();
      // Handle both array and object response formats
      const buildersList = data.builders || data;
      // Sort users alphabetically (already sorted by backend, but keeping for safety)
      const sorted = buildersList.sort((a, b) => {
        const nameA = `${a.first_name} ${a.last_name}`.toLowerCase();
        const nameB = `${b.first_name} ${b.last_name}`.toLowerCase();
        return nameA.localeCompare(nameB);
      });
      setUsers(sorted);
    } catch (error) {
      setError(error.message || 'Failed to load builders');
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

  const openPreviewModal = async (documentType) => {
    if (!documents[documentType]) return;

    setPreviewLoading(true);
    setPreviewError('');
    const fileName = documents[documentType].name;
    setPreviewTitle(fileName);
    setIsPreviewModalOpen(true);

    try {
      const url = documents[documentType].url;
      const fullUrl = url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`;

      // Check file type based on filename, not URL
      const isImage = fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i);
      const isPdf = fileName.match(/\.pdf$/i);
      const isDoc = fileName.match(/\.(doc|docx)$/i);

      if (isImage) {
        // For images, use the URL directly
        setPreviewFileType('image');
        setPreviewContent(fullUrl);
      } else if (isPdf) {
        // For PDFs, use the URL directly for iframe
        setPreviewFileType('pdf');
        setPreviewContent(fullUrl);
      } else if (isDoc) {
        // For DOC/DOCX, show message that preview isn't available
        setPreviewFileType('unsupported');
        setPreviewError('Preview not available for Word documents. Please use "Open in new tab" to download.');
        setPreviewContent('');
      } else {
        // For text files, try to fetch as text
        setPreviewFileType('text');
        const response = await fetch(fullUrl);
        if (!response.ok) {
          throw new Error('Failed to load document content');
        }
        const text = await response.text();
        setPreviewContent(text);
      }
    } catch (error) {
      setPreviewError(error.message || 'Failed to load document');
      setPreviewContent('');
    } finally {
      setPreviewLoading(false);
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4242EA] to-[#8b5cf6] bg-clip-text text-transparent">
            Admin Payments View
          </h1>
          <p className="text-gray-600 mt-1">
            Upload and manage signed Good Job Agreements for Builders
          </p>
        </div>
      </div>

      {/* Alerts Section */}
      {(message || error) && (
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="max-w-7xl mx-auto space-y-3">
            {message && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">{message}</AlertDescription>
              </Alert>
            )}
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      )}

      {/* Main Content - Fixed viewport height like Performance page */}
      <div className="flex overflow-hidden" style={{ height: 'calc(100vh - 140px)' }}>
        {/* Left Panel - User Selection (Fixed Header + Scrollable List) */}
        <div className="flex-1 flex flex-col bg-white border-r border-gray-200 overflow-hidden">
          {/* Fixed Header */}
          <div className="flex-shrink-0 border-b border-gray-200 bg-gray-50/50">
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
                <Users className="h-5 w-5 text-[#4242EA]" />
                Select Builder
              </h2>
              <p className="text-sm text-gray-600">Choose a builder to manage their documents</p>
            </div>

            {/* Fixed Search Bar */}
            <div className="px-6 pb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 h-10"
                />
              </div>
            </div>
          </div>

          {/* Scrollable User List - Only this area scrolls */}
          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6">
              {isLoadingUsers ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4242EA] mx-auto mb-2"></div>
                  <p className="text-gray-500">Loading users...</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-sm">No users found</p>
                    </div>
                  ) : (
                    filteredUsers.map(user => (
                      <div
                        key={user.user_id}
                        className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                          selectedUser?.user_id === user.user_id
                            ? 'border-[#4242EA] bg-gradient-to-r from-[#4242EA]/5 to-[#8b5cf6]/5 shadow-lg ring-1 ring-[#4242EA]/20'
                            : 'border-gray-200 bg-white hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedUser(user)}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${
                            selectedUser?.user_id === user.user_id ? 'bg-[#4242EA]' : 'bg-gray-300'
                          }`}></div>
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-600">{user.email}</div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Upload Section (Fixed) */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50/50">
            <h2 className="text-xl font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <Upload className="h-5 w-5 text-[#4242EA]" />
              {selectedUser ? `${selectedUser.first_name} ${selectedUser.last_name}` : 'Document Management'}
            </h2>
            {selectedUser && (
              <p className="text-sm text-gray-600">Upload and manage signed agreements</p>
            )}
          </div>

          <div className="flex-1 p-6 overflow-hidden">
            {!selectedUser ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="max-w-md">
                  <div className="w-20 h-20 bg-gradient-to-br from-[#4242EA]/10 to-[#8b5cf6]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Upload className="h-10 w-10 text-[#4242EA]" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to get started</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Select a builder from the left panel to upload and manage their signed Good Job Agreement.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-w-2xl mx-auto space-y-6">
                {documents.goodJobAgreement ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      </div>
                      <div className="flex-1 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-green-800">Document Uploaded</span>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openPreviewModal('goodJobAgreement')}
                              className="h-8 px-3 text-xs border-green-300 text-green-700 hover:bg-green-50"
                            >
                              <Eye className="h-3 w-3 mr-1.5" />
                              Preview
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                            {documents.goodJobAgreement.name}
                          </Badge>
                        </div>
                        <div className="text-sm text-green-700">
                          Uploaded {new Date(documents.goodJobAgreement.uploadedAt).toLocaleString()}
                        </div>
                        <div className="text-xs text-green-600 italic bg-green-100/50 p-2 rounded">
                          Uploading a new file will replace the existing document
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                          <Upload className="h-5 w-5 text-amber-600" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-amber-800 mb-1">No document uploaded</h3>
                        <p className="text-sm text-amber-700">Upload the signed Good Job Agreement for this builder.</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <div className="text-center">
                    <Input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          handleFileUpload(file);
                        }
                      }}
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                    />
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                      size="lg"
                      className="bg-[#4242EA] hover:bg-[#3535C7] text-white px-8 py-3 h-12"
                    >
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          {documents.goodJobAgreement ? 'Replace Document' : 'Upload Signed Agreement'}
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-gray-500 mt-3">
                      Accepts PDF, DOC, DOCX, and TXT files up to 10MB
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Document Preview Modal */}
      <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>{previewTitle}</DialogTitle>
            <DialogDescription>
              Preview of the uploaded document
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 overflow-auto">
            {previewLoading ? (
              <div className="flex items-center justify-center p-8">
                <div className="text-center">Loading document...</div>
              </div>
            ) : previewError ? (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{previewError}</AlertDescription>
              </Alert>
            ) : (
              <>
                {previewFileType === 'image' && previewContent ? (
                  <div className="flex justify-center">
                    <img src={previewContent} alt={previewTitle} className="max-w-full max-h-96 object-contain" />
                  </div>
                ) : previewFileType === 'pdf' && previewContent ? (
                  <div className="flex justify-center">
                    <iframe src={previewContent} className="w-full h-96" title={previewTitle} />
                  </div>
                ) : previewFileType === 'text' && previewContent ? (
                  <pre className="bg-gray-50 p-4 rounded-lg text-sm overflow-auto max-h-96 whitespace-pre-wrap">{previewContent}</pre>
                ) : null}
              </>
            )}
          </div>
          <div className="flex justify-center pt-4">
            <Button
              asChild
              variant="outline"
              className="border-[#4242EA] text-[#4242EA] hover:bg-[#4242EA] hover:text-white"
            >
              <a
                href={(() => {
                  const doc = documents.goodJobAgreement;
                  if (!doc) return '#';
                  const url = doc.url;
                  return url.startsWith('http') ? url : `${import.meta.env.VITE_API_URL}${url}`;
                })()}
                target="_blank"
                rel="noopener noreferrer"
              >
                Open in new tab
              </a>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PaymentAdmin;

