import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import LoadingCurtain from '../../components/LoadingCurtain/LoadingCurtain';
import SearchIcon from '@mui/icons-material/Search';
import PeopleIcon from '@mui/icons-material/People';
import SendIcon from '@mui/icons-material/Send';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import LinkIcon from '@mui/icons-material/Link';
import BusinessIcon from '@mui/icons-material/Business';
import WorkIcon from '@mui/icons-material/Work';
import './PathfinderNetwork.css';

const API = import.meta.env.VITE_API_URL;

const SPECIFIC_ASK_LABELS = {
  job_referral: 'Job Referral',
  informational_interview: 'Informational Interview',
  demo_feedback: 'Demo Feedback',
  industry_advice: 'Industry Advice',
  introductory_call: 'Introductory Call',
  other: 'Other',
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  withdrawn: 'bg-gray-100 text-gray-600',
};

const READINESS_ITEMS = [
  { key: 'researched_company', label: 'I have researched this company and understand what they do' },
  { key: 'demo_working', label: 'My demo is live and working' },
  { key: 'can_articulate_value', label: 'I can clearly articulate why I am a strong fit' },
  { key: 'available_this_week', label: 'I am available for a call or meeting this week' },
];

const emptyForm = {
  staff_user_id: '',
  specific_ask: '',
  request_context: '',
  builder_preparation: '',
  demo_url: '',
  readiness_checks: {
    researched_company: false,
    demo_working: false,
    can_articulate_value: false,
    available_this_week: false,
  },
};

export default function PathfinderNetwork() {
  const { token } = useAuth();

  // Tab state
  const [activeTab, setActiveTab] = useState('network'); // 'network' | 'my-requests'

  // Network view state
  const [contacts, setContacts] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);

  // Contact detail state
  const [selectedContact, setSelectedContact] = useState(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [existingRequest, setExistingRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // Intro request form state
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // My requests state
  const [myRequests, setMyRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(false);

  // ── Fetch contacts ──────────────────────────────────────────────────────────
  const fetchContacts = useCallback(async (page = 1, searchTerm = search) => {
    try {
      setIsLoadingContacts(true);
      const params = new URLSearchParams({ page, limit: 24 });
      if (searchTerm) params.set('search', searchTerm);
      const res = await fetch(`${API}/api/employment-engine/network?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load network');
      const data = await res.json();
      setContacts(data.contacts);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingContacts(false);
    }
  }, [token, search]);

  useEffect(() => { fetchContacts(1, search); }, [token, search]);

  // ── Fetch contact detail ────────────────────────────────────────────────────
  const openContact = async (contact) => {
    setSelectedContact(contact);
    setShowDetailModal(true);
    setIsLoadingDetail(true);
    try {
      const res = await fetch(`${API}/api/employment-engine/network/${contact.contact_id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSelectedContact(data.contact);
      setExistingRequest(data.existing_request);
    } catch {
      // keep the card data we already have
    } finally {
      setIsLoadingDetail(false);
    }
  };

  // ── Fetch my requests ───────────────────────────────────────────────────────
  const fetchMyRequests = useCallback(async () => {
    setIsLoadingRequests(true);
    try {
      const res = await fetch(`${API}/api/employment-engine/intro-requests`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMyRequests(data.intro_requests);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [token]);

  useEffect(() => {
    if (activeTab === 'my-requests') fetchMyRequests();
  }, [activeTab, fetchMyRequests]);

  // ── Search handling ─────────────────────────────────────────────────────────
  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  // ── Open request form ───────────────────────────────────────────────────────
  const openRequestForm = () => {
    setFormData({ ...emptyForm });
    setFormErrors([]);
    setSubmitSuccess(false);
    setShowRequestForm(true);
  };

  // ── Form handlers ───────────────────────────────────────────────────────────
  const handleFieldChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleReadinessChange = (key) => {
    setFormData(prev => ({
      ...prev,
      readiness_checks: { ...prev.readiness_checks, [key]: !prev.readiness_checks[key] },
    }));
  };

  // ── Submit intro request ────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors([]);
    try {
      const res = await fetch(`${API}/api/employment-engine/intro-requests`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, contact_id: selectedContact.contact_id }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFormErrors(data.details || [data.error]);
        return;
      }
      setSubmitSuccess(true);
      setExistingRequest(data.intro_request);
      setTimeout(() => {
        setShowRequestForm(false);
        setShowDetailModal(false);
      }, 1800);
    } catch {
      setFormErrors(['Something went wrong. Please try again.']);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Withdraw request ────────────────────────────────────────────────────────
  const handleWithdraw = async (requestId) => {
    try {
      await fetch(`${API}/api/employment-engine/intro-requests/${requestId}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'withdrawn' }),
      });
      fetchMyRequests();
    } catch (err) {
      console.error(err);
    }
  };

  const contextLen = formData.request_context.trim().length;
  const prepLen = formData.builder_preparation.trim().length;
  const allReady = Object.values(formData.readiness_checks).every(Boolean);

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="pf-network">
      {/* Tab bar */}
      <div className="pf-network__tabs">
        <button
          className={`pf-network__tab ${activeTab === 'network' ? 'pf-network__tab--active' : ''}`}
          onClick={() => setActiveTab('network')}
        >
          <PeopleIcon fontSize="small" /> Staff Network
        </button>
        <button
          className={`pf-network__tab ${activeTab === 'my-requests' ? 'pf-network__tab--active' : ''}`}
          onClick={() => setActiveTab('my-requests')}
        >
          <SendIcon fontSize="small" /> My Intro Requests
          {myRequests.filter(r => r.status === 'approved').length > 0 && (
            <span className="pf-network__badge">
              {myRequests.filter(r => r.status === 'approved').length}
            </span>
          )}
        </button>
      </div>

      {/* ── NETWORK TAB ── */}
      {activeTab === 'network' && (
        <div className="pf-network__content">
          <div className="pf-network__header">
            <div>
              <h1 className="pf-network__title">Staff Network</h1>
              <p className="pf-network__subtitle">
                Browse {pagination.total.toLocaleString()} contacts across the Pursuit staff network.
                Find a warm intro path to your target companies.
              </p>
            </div>
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="pf-network__search">
            <div className="pf-network__search-input-wrap">
              <SearchIcon className="pf-network__search-icon" />
              <input
                className="pf-network__search-input"
                placeholder="Search by name, title, or company..."
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
              />
            </div>
            <Button type="submit" variant="default">Search</Button>
            {search && (
              <Button type="button" variant="outline" onClick={() => { setSearch(''); setSearchInput(''); }}>
                Clear
              </Button>
            )}
          </form>

          {isLoadingContacts ? (
            <LoadingCurtain isLoading />
          ) : contacts.length === 0 ? (
            <div className="pf-network__empty">
              <PeopleIcon style={{ fontSize: 48, color: '#ccc' }} />
              <p>No contacts found{search ? ` for "${search}"` : ''}.</p>
            </div>
          ) : (
            <>
              <div className="pf-network__grid">
                {contacts.map(contact => (
                  <Card
                    key={contact.contact_id}
                    className="pf-network__card"
                    onClick={() => openContact(contact)}
                  >
                    <CardContent className="pf-network__card-content">
                      <div className="pf-network__card-avatar">
                        {(contact.first_name?.[0] || '?')}{(contact.last_name?.[0] || '')}
                      </div>
                      <div className="pf-network__card-info">
                        <p className="pf-network__card-name">{contact.full_name}</p>
                        {contact.current_title && (
                          <p className="pf-network__card-title">{contact.current_title}</p>
                        )}
                        {contact.current_company && (
                          <p className="pf-network__card-company">
                            <BusinessIcon fontSize="inherit" /> {contact.current_company}
                          </p>
                        )}
                      </div>
                      <div className="pf-network__card-footer">
                        <span className="pf-network__connections-badge">
                          <PeopleIcon fontSize="inherit" />
                          {contact.staff_connection_count} staff connection{contact.staff_connection_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="pf-network__pagination">
                  <Button
                    variant="outline"
                    disabled={pagination.page <= 1}
                    onClick={() => fetchContacts(pagination.page - 1)}
                  >
                    Previous
                  </Button>
                  <span className="pf-network__page-info">
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={pagination.page >= pagination.totalPages}
                    onClick={() => fetchContacts(pagination.page + 1)}
                  >
                    Next
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── MY REQUESTS TAB ── */}
      {activeTab === 'my-requests' && (
        <div className="pf-network__content">
          <div className="pf-network__header">
            <h1 className="pf-network__title">My Intro Requests</h1>
          </div>
          {isLoadingRequests ? (
            <LoadingCurtain isLoading />
          ) : myRequests.length === 0 ? (
            <div className="pf-network__empty">
              <SendIcon style={{ fontSize: 48, color: '#ccc' }} />
              <p>No intro requests yet. Browse the Staff Network to get started.</p>
              <Button onClick={() => setActiveTab('network')}>Browse Network</Button>
            </div>
          ) : (
            <div className="pf-network__requests-list">
              {myRequests.map(req => (
                <Card key={req.intro_request_id} className="pf-network__request-card">
                  <CardContent className="pf-network__request-content">
                    <div className="pf-network__request-header">
                      <div>
                        <p className="pf-network__request-contact">{req.contact_name}</p>
                        <p className="pf-network__request-company">{req.contact_company}</p>
                      </div>
                      <span className={`pf-network__status-badge ${STATUS_COLORS[req.status]}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>
                    <div className="pf-network__request-meta">
                      <span><WorkIcon fontSize="inherit" /> {SPECIFIC_ASK_LABELS[req.specific_ask]}</span>
                      <span>Via {req.staff_name}</span>
                      <span>{new Date(req.created_at).toLocaleDateString()}</span>
                    </div>
                    {req.staff_response_notes && (
                      <div className="pf-network__response-notes">
                        <strong>Staff response:</strong> {req.staff_response_notes}
                      </div>
                    )}
                    {req.status === 'pending' && (
                      <div className="pf-network__request-actions">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleWithdraw(req.intro_request_id)}
                        >
                          Withdraw
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── CONTACT DETAIL MODAL ── */}
      <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
        <DialogContent className="pf-network__detail-modal">
          {selectedContact && (
            <>
              <DialogHeader>
                <DialogTitle className="pf-network__detail-title">
                  <div className="pf-network__detail-avatar">
                    {(selectedContact.first_name?.[0] || '?')}{(selectedContact.last_name?.[0] || '')}
                  </div>
                  <div>
                    <p>{selectedContact.full_name}</p>
                    {selectedContact.current_title && (
                      <p className="pf-network__detail-subtitle">{selectedContact.current_title}</p>
                    )}
                  </div>
                </DialogTitle>
              </DialogHeader>

              {isLoadingDetail ? (
                <div className="pf-network__detail-loading">Loading...</div>
              ) : (
                <div className="pf-network__detail-body">
                  {selectedContact.current_company && (
                    <p className="pf-network__detail-company">
                      <BusinessIcon fontSize="small" /> {selectedContact.current_company}
                    </p>
                  )}
                  {selectedContact.linkedin_url && (
                    <a
                      href={selectedContact.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="pf-network__linkedin-link"
                    >
                      <LinkIcon fontSize="small" /> View LinkedIn Profile
                    </a>
                  )}

                  {/* Staff connections */}
                  <div className="pf-network__connections-section">
                    <h3 className="pf-network__connections-title">
                      <PeopleIcon fontSize="small" /> Staff Connections
                    </h3>
                    {(selectedContact.staff_connections || []).map((conn, i) => (
                      <div key={i} className="pf-network__connection-row">
                        <div className="pf-network__connection-avatar">
                          {conn.staff_name?.[0]}
                        </div>
                        <div>
                          <p className="pf-network__connection-name">{conn.staff_name}</p>
                          <p className="pf-network__connection-strength">{conn.relationship_strength}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTA */}
                  {existingRequest ? (
                    <div className="pf-network__existing-request">
                      <CheckCircleOutlineIcon color="success" />
                      <div>
                        <p className="font-semibold">Intro request {existingRequest.status}</p>
                        <p className="text-sm text-gray-500">
                          Submitted {new Date(existingRequest.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <Button className="w-full" onClick={openRequestForm}>
                      <SendIcon fontSize="small" /> Request an Intro
                    </Button>
                  )}
                </div>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── INTRO REQUEST FORM MODAL ── */}
      <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
        <DialogContent className="pf-network__form-modal">
          <DialogHeader>
            <DialogTitle>Request an Introduction</DialogTitle>
            {selectedContact && (
              <p className="pf-network__form-subtitle">
                to {selectedContact.full_name}
                {selectedContact.current_company ? ` at ${selectedContact.current_company}` : ''}
              </p>
            )}
          </DialogHeader>

          {submitSuccess ? (
            <div className="pf-network__success">
              <CheckCircleOutlineIcon style={{ fontSize: 48, color: '#22c55e' }} />
              <p className="font-semibold text-lg">Request submitted!</p>
              <p className="text-gray-500 text-sm">Your staff contact will be in touch soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="pf-network__form">
              {formErrors.length > 0 && (
                <div className="pf-network__form-errors">
                  {formErrors.map((e, i) => <p key={i}>{e}</p>)}
                </div>
              )}

              {/* Staff connection to request from */}
              <div className="pf-network__form-field">
                <label className="pf-network__form-label">Who should make this intro? *</label>
                <select
                  className="pf-network__form-select"
                  value={formData.staff_user_id}
                  onChange={e => handleFieldChange('staff_user_id', e.target.value)}
                  required
                >
                  <option value="">Select a staff member...</option>
                  {(selectedContact?.staff_connections || []).map(conn => (
                    <option key={conn.staff_user_id} value={conn.staff_user_id}>
                      {conn.staff_name} ({conn.relationship_strength})
                    </option>
                  ))}
                </select>
              </div>

              {/* Specific ask */}
              <div className="pf-network__form-field">
                <label className="pf-network__form-label">What are you asking for? *</label>
                <select
                  className="pf-network__form-select"
                  value={formData.specific_ask}
                  onChange={e => handleFieldChange('specific_ask', e.target.value)}
                  required
                >
                  <option value="">Select...</option>
                  {Object.entries(SPECIFIC_ASK_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Request context */}
              <div className="pf-network__form-field">
                <label className="pf-network__form-label">
                  Why this company / contact? *
                  <span className={`pf-network__char-count ${contextLen >= 100 ? 'pf-network__char-count--ok' : ''}`}>
                    {contextLen}/100 min
                  </span>
                </label>
                <textarea
                  className="pf-network__form-textarea"
                  rows={4}
                  placeholder="Explain your interest in this company and why this is the right person to connect with..."
                  value={formData.request_context}
                  onChange={e => handleFieldChange('request_context', e.target.value)}
                  required
                />
              </div>

              {/* Preparation */}
              <div className="pf-network__form-field">
                <label className="pf-network__form-label">
                  How have you prepared? *
                  <span className={`pf-network__char-count ${prepLen >= 80 ? 'pf-network__char-count--ok' : ''}`}>
                    {prepLen}/80 min
                  </span>
                </label>
                <textarea
                  className="pf-network__form-textarea"
                  rows={3}
                  placeholder="What research have you done? What have you built that's relevant? What do you know about their tech stack or business?"
                  value={formData.builder_preparation}
                  onChange={e => handleFieldChange('builder_preparation', e.target.value)}
                  required
                />
              </div>

              {/* Demo URL */}
              <div className="pf-network__form-field">
                <label className="pf-network__form-label">
                  <LinkIcon fontSize="inherit" /> Demo / project URL *
                </label>
                <input
                  className="pf-network__form-input"
                  type="url"
                  placeholder="https://..."
                  value={formData.demo_url}
                  onChange={e => handleFieldChange('demo_url', e.target.value)}
                  required
                />
              </div>

              {/* Readiness checklist */}
              <div className="pf-network__form-field">
                <label className="pf-network__form-label">Readiness checklist *</label>
                <p className="pf-network__form-hint">All items must be checked before submitting.</p>
                <div className="pf-network__checklist">
                  {READINESS_ITEMS.map(item => (
                    <label key={item.key} className="pf-network__check-item">
                      <input
                        type="checkbox"
                        checked={formData.readiness_checks[item.key]}
                        onChange={() => handleReadinessChange(item.key)}
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pf-network__form-actions">
                <Button type="button" variant="outline" onClick={() => setShowRequestForm(false)}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !formData.staff_user_id ||
                    !formData.specific_ask ||
                    contextLen < 100 ||
                    prepLen < 80 ||
                    !formData.demo_url ||
                    !allReady
                  }
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
