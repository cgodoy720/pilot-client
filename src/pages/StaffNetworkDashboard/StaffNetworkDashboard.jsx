import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import LoadingCurtain from '../../components/LoadingCurtain/LoadingCurtain';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SendIcon from '@mui/icons-material/Send';
import BusinessIcon from '@mui/icons-material/Business';
import PeopleIcon from '@mui/icons-material/People';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import WorkIcon from '@mui/icons-material/Work';
import LinkIcon from '@mui/icons-material/Link';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import './StaffNetworkDashboard.css';

const API = import.meta.env.VITE_API_URL;

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  withdrawn: 'bg-gray-100 text-gray-600',
};

const SPECIFIC_ASK_LABELS = {
  job_referral: 'Job Referral',
  informational_interview: 'Informational Interview',
  demo_feedback: 'Demo Feedback',
  industry_advice: 'Industry Advice',
  introductory_call: 'Introductory Call',
  other: 'Other',
};

export default function StaffNetworkDashboard() {
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'activity' | 'network'

  // Intro requests state
  const [requests, setRequests] = useState([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [responseNotes, setResponseNotes] = useState('');
  const [isResponding, setIsResponding] = useState(false);

  // My Network tab state
  const [uploadFile, setUploadFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null); // { imported, matched, skipped, total } | { error }
  const [enrichStatus, setEnrichStatus] = useState(null); // { total, enriched, pending, isEnriching }
  const [isStartingEnrich, setIsStartingEnrich] = useState(false);

  // Builder activity state
  const [activitySummary, setActivitySummary] = useState({});
  const [companies, setCompanies] = useState([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [cohortFilter, setCohortFilter] = useState('');
  const [cohorts, setCohorts] = useState([]);

  // ── Fetch intro requests ────────────────────────────────────────────────────
  const fetchRequests = useCallback(async (status = statusFilter) => {
    setIsLoadingRequests(true);
    try {
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      const res = await fetch(`${API}/api/employment-engine/intro-requests?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setRequests(data.intro_requests);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRequests(false);
    }
  }, [token, statusFilter]);

  useEffect(() => {
    if (activeTab === 'requests') fetchRequests(statusFilter);
  }, [activeTab, statusFilter]);

  // ── Fetch builder activity ──────────────────────────────────────────────────
  const fetchActivity = useCallback(async () => {
    setIsLoadingActivity(true);
    try {
      const params = new URLSearchParams({ limit: 50 });
      if (cohortFilter) params.set('cohort', cohortFilter);
      const res = await fetch(`${API}/api/employment-engine/builder-activity?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setActivitySummary(data.summary);
      setCompanies(data.companies);

      // Collect unique cohorts for filter
      const allCohorts = new Set();
      data.companies.forEach(c =>
        (c.builders || []).forEach(b => { if (b.cohort) allCohorts.add(b.cohort); })
      );
      setCohorts([...allCohorts].sort());
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingActivity(false);
    }
  }, [token, cohortFilter]);

  useEffect(() => {
    if (activeTab === 'activity') fetchActivity();
  }, [activeTab, cohortFilter]);

  // ── My Network: enrich status ───────────────────────────────────────────────
  const fetchEnrichStatus = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/employment-engine/enrich-status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setEnrichStatus(data);
    } catch {
      // silent
    }
  }, [token]);

  // Fetch status when tab opens
  useEffect(() => {
    if (activeTab !== 'network') return;
    fetchEnrichStatus();
  }, [activeTab, token]);

  // Poll every 5s only while enrichment is actually running
  useEffect(() => {
    if (!enrichStatus?.isEnriching) return;
    const interval = setInterval(fetchEnrichStatus, 5000);
    return () => clearInterval(interval);
  }, [enrichStatus?.isEnriching, fetchEnrichStatus]);

  const handleUpload = async () => {
    if (!uploadFile) return;
    setIsUploading(true);
    setUploadResult(null);
    try {
      const form = new FormData();
      form.append('file', uploadFile);
      const res = await fetch(`${API}/api/employment-engine/import-linkedin`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });
      const data = await res.json();
      if (!res.ok) setUploadResult({ error: data.error || 'Upload failed' });
      else setUploadResult(data);
    } catch {
      setUploadResult({ error: 'Network error — please try again.' });
    } finally {
      setIsUploading(false);
      setUploadFile(null);
    }
  };

  const handleEnrich = async () => {
    const pendingCount = enrichStatus?.pending ?? '?';
    const confirmed = window.confirm(
      `This will enrich ${pendingCount} companies using the Claude AI API — it runs in the background and costs API credits.\n\nOnly run this after uploading new connections or when there are genuinely new companies to process.\n\nContinue?`
    );
    if (!confirmed) return;

    setIsStartingEnrich(true);
    try {
      const res = await fetch(`${API}/api/employment-engine/enrich-companies`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEnrichStatus(prev => ({ ...prev, ...data }));
    } catch {
      // silent
    } finally {
      setIsStartingEnrich(false);
    }
  };

  // ── Respond to a request ────────────────────────────────────────────────────
  const openResponse = (request) => {
    setSelectedRequest(request);
    setResponseNotes('');
    setShowResponseModal(true);
  };

  const handleRespond = async (status) => {
    setIsResponding(true);
    try {
      const res = await fetch(
        `${API}/api/employment-engine/intro-requests/${selectedRequest.intro_request_id}`,
        {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ status, staff_response_notes: responseNotes || undefined }),
        }
      );
      if (res.ok) {
        setShowResponseModal(false);
        fetchRequests(statusFilter);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsResponding(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="snd">
      {/* Page header */}
      <div className="snd__page-header">
        <h1 className="snd__page-title">Network Dashboard</h1>
        <p className="snd__page-subtitle">Manage intro requests and track builder hustle activity.</p>
      </div>

      {/* Tabs */}
      <div className="snd__tabs">
        <button
          className={`snd__tab ${activeTab === 'requests' ? 'snd__tab--active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <SendIcon fontSize="small" /> Intro Requests
          {pendingCount > 0 && <span className="snd__tab-badge">{pendingCount}</span>}
        </button>
        <button
          className={`snd__tab ${activeTab === 'activity' ? 'snd__tab--active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          <TrendingUpIcon fontSize="small" /> Builder Activity
        </button>
        <button
          className={`snd__tab ${activeTab === 'network' ? 'snd__tab--active' : ''}`}
          onClick={() => setActiveTab('network')}
        >
          <CloudUploadIcon fontSize="small" /> My Network
        </button>
      </div>

      {/* ── INTRO REQUESTS TAB ── */}
      {activeTab === 'requests' && (
        <div className="snd__content">
          {/* Status filter */}
          <div className="snd__status-filter">
            {['pending', 'approved', 'completed', 'declined', ''].map(s => (
              <button
                key={s || 'all'}
                className={`snd__filter-btn ${statusFilter === s ? 'snd__filter-btn--active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s === '' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {isLoadingRequests ? (
            <LoadingCurtain isLoading />
          ) : requests.length === 0 ? (
            <div className="snd__empty">
              <SendIcon style={{ fontSize: 48, color: '#ccc' }} />
              <p>No {statusFilter || ''} intro requests.</p>
            </div>
          ) : (
            <div className="snd__requests-list">
              {requests.map(req => (
                <Card key={req.intro_request_id} className="snd__request-card">
                  <CardContent className="snd__request-content">
                    <div className="snd__request-top">
                      <div className="snd__request-builder">
                        <div className="snd__builder-avatar">
                          {req.builder_name?.[0]}
                        </div>
                        <div>
                          <p className="snd__builder-name">{req.builder_name}</p>
                          <p className="snd__builder-email">{req.builder_email}</p>
                        </div>
                      </div>
                      <span className={`snd__status-badge ${STATUS_COLORS[req.status]}`}>
                        {req.status.charAt(0).toUpperCase() + req.status.slice(1)}
                      </span>
                    </div>

                    <div className="snd__request-target">
                      <BusinessIcon fontSize="small" />
                      <div>
                        <p className="snd__target-contact">{req.contact_name}</p>
                        {req.contact_company && (
                          <p className="snd__target-company">{req.contact_company} · {req.contact_title}</p>
                        )}
                      </div>
                    </div>

                    <div className="snd__request-ask">
                      <WorkIcon fontSize="small" />
                      <span>{SPECIFIC_ASK_LABELS[req.specific_ask]}</span>
                    </div>

                    {/* Expandable context */}
                    <details className="snd__request-details">
                      <summary className="snd__details-summary">View full request</summary>
                      <div className="snd__details-body">
                        <div className="snd__detail-section">
                          <p className="snd__detail-label">Why this company / contact</p>
                          <p className="snd__detail-text">{req.request_context}</p>
                        </div>
                        <div className="snd__detail-section">
                          <p className="snd__detail-label">How they've prepared</p>
                          <p className="snd__detail-text">{req.builder_preparation}</p>
                        </div>
                        {req.demo_url && (
                          <a
                            href={req.demo_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="snd__demo-link"
                          >
                            <LinkIcon fontSize="small" /> View Demo
                          </a>
                        )}
                      </div>
                    </details>

                    {req.staff_response_notes && (
                      <div className="snd__response-notes">
                        <strong>Your response:</strong> {req.staff_response_notes}
                      </div>
                    )}

                    {req.status === 'pending' && (
                      <div className="snd__request-actions">
                        <Button size="sm" onClick={() => openResponse(req)}>
                          Respond
                        </Button>
                      </div>
                    )}

                    {req.status === 'approved' && (
                      <div className="snd__request-actions">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedRequest(req);
                            setResponseNotes('');
                            handleRespond('completed');
                          }}
                        >
                          <DoneAllIcon fontSize="small" /> Mark Completed
                        </Button>
                      </div>
                    )}

                    <p className="snd__request-date">
                      Submitted {new Date(req.created_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── BUILDER ACTIVITY TAB ── */}
      {activeTab === 'activity' && (
        <div className="snd__content">
          {isLoadingActivity ? (
            <LoadingCurtain isLoading />
          ) : (
            <>
              {/* Summary stats */}
              <div className="snd__summary-cards">
                <Card className="snd__summary-card">
                  <CardContent className="snd__summary-content">
                    <p className="snd__summary-number">{activitySummary.builders_active || 0}</p>
                    <p className="snd__summary-label">Builders active</p>
                    <p className="snd__summary-period">last 60 days</p>
                  </CardContent>
                </Card>
                <Card className="snd__summary-card">
                  <CardContent className="snd__summary-content">
                    <p className="snd__summary-number">{activitySummary.companies_targeted || 0}</p>
                    <p className="snd__summary-label">Companies targeted</p>
                    <p className="snd__summary-period">last 60 days</p>
                  </CardContent>
                </Card>
                <Card className="snd__summary-card">
                  <CardContent className="snd__summary-content">
                    <p className="snd__summary-number">{activitySummary.total_touchpoints || 0}</p>
                    <p className="snd__summary-label">Total touchpoints</p>
                    <p className="snd__summary-period">last 60 days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Cohort filter */}
              {cohorts.length > 0 && (
                <div className="snd__cohort-filter">
                  <select
                    className="snd__cohort-select"
                    value={cohortFilter}
                    onChange={e => setCohortFilter(e.target.value)}
                  >
                    <option value="">All cohorts</option>
                    {cohorts.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}

              {companies.length === 0 ? (
                <div className="snd__empty">
                  <TrendingUpIcon style={{ fontSize: 48, color: '#ccc' }} />
                  <p>No builder activity in the last 60 days.</p>
                </div>
              ) : (
                <div className="snd__companies-list">
                  {companies.map((company, i) => (
                    <Card key={company.company} className="snd__company-card">
                      <CardContent className="snd__company-content">
                        <div className="snd__company-header">
                          <div className="snd__company-rank">#{i + 1}</div>
                          <div className="snd__company-info">
                            <p className="snd__company-name">{company.company}</p>
                            <div className="snd__company-stats">
                              <span>
                                <PeopleIcon fontSize="inherit" />
                                {company.active_builder_count} builder{company.active_builder_count !== '1' ? 's' : ''}
                              </span>
                              <span>{company.total_touchpoints} touchpoints</span>
                              <span>Last: {new Date(company.last_activity_date).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="snd__company-outcomes">
                            {parseInt(company.positive_responses) > 0 && (
                              <span className="snd__outcome-chip snd__outcome-chip--positive">
                                {company.positive_responses} positive
                              </span>
                            )}
                            {parseInt(company.interviews) > 0 && (
                              <span className="snd__outcome-chip snd__outcome-chip--interview">
                                {company.interviews} interview{company.interviews !== '1' ? 's' : ''}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Builder list */}
                        <div className="snd__builder-chips">
                          {(company.builders || []).map((b, j) => (
                            <span key={j} className="snd__builder-chip">
                              {b.builder_name}
                              {b.cohort && <span className="snd__chip-cohort">{b.cohort}</span>}
                            </span>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── MY NETWORK TAB ── */}
      {activeTab === 'network' && (
        <div className="snd__content">
          {/* Upload card */}
          <Card className="snd__network-card">
            <CardHeader>
              <CardTitle className="snd__network-card-title">
                <CloudUploadIcon fontSize="small" /> Upload LinkedIn Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="snd__network-instructions">
                To export: go to LinkedIn →{' '}
                <strong>Settings → Data privacy → Get a copy of your data</strong>, select
                <strong> Connections</strong>, and request the archive. LinkedIn will email you a
                download link (can take up to 24 hours). Unzip the archive, find{' '}
                <strong>Connections.csv</strong>, and upload it below.
              </p>

              <div className="snd__upload-row">
                <label className="snd__upload-label">
                  <input
                    type="file"
                    accept=".csv"
                    className="snd__upload-input"
                    onChange={e => { setUploadFile(e.target.files[0] || null); setUploadResult(null); }}
                  />
                  {uploadFile ? uploadFile.name : 'Choose CSV file…'}
                </label>
                <Button
                  disabled={!uploadFile || isUploading}
                  onClick={handleUpload}
                >
                  {isUploading ? 'Uploading…' : 'Upload'}
                </Button>
              </div>

              {uploadResult && !uploadResult.error && (
                <div className="snd__upload-success">
                  <CheckIcon fontSize="small" />
                  <strong>{uploadResult.imported}</strong> new contacts imported,&nbsp;
                  <strong>{uploadResult.matched}</strong> already in the network
                  {uploadResult.skipped > 0 && `, ${uploadResult.skipped} skipped`}.
                </div>
              )}
              {uploadResult?.error && (
                <div className="snd__upload-error">{uploadResult.error}</div>
              )}
            </CardContent>
          </Card>

          {/* Enrichment card */}
          <Card className="snd__network-card">
            <CardHeader>
              <CardTitle className="snd__network-card-title">
                <AutoAwesomeIcon fontSize="small" /> Company Enrichment
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="snd__network-instructions">
                Enrich company data (industry, size, stage) using AI so builders can filter
                the network by these dimensions.
              </p>

              {enrichStatus && (
                <div className="snd__enrich-progress">
                  <div className="snd__enrich-bar-wrap">
                    <div
                      className="snd__enrich-bar"
                      style={{ width: enrichStatus.total > 0 ? `${Math.round((enrichStatus.enriched / enrichStatus.total) * 100)}%` : '0%' }}
                    />
                  </div>
                  <p className="snd__enrich-label">
                    {enrichStatus.enriched} / {enrichStatus.total} companies enriched
                    {enrichStatus.isEnriching && <span className="snd__enrich-running"> · running…</span>}
                  </p>
                </div>
              )}

              <Button
                disabled={isStartingEnrich || enrichStatus?.isEnriching || enrichStatus?.pending === 0}
                onClick={handleEnrich}
              >
                {enrichStatus?.isEnriching
                  ? 'Enriching…'
                  : enrichStatus?.pending > 0
                    ? `Enrich ${enrichStatus.pending} new companies`
                    : 'All companies enriched'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ── RESPONSE MODAL ── */}
      <Dialog open={showResponseModal} onOpenChange={setShowResponseModal}>
        <DialogContent className="snd__response-modal">
          <DialogHeader>
            <DialogTitle>Respond to Intro Request</DialogTitle>
            {selectedRequest && (
              <p className="snd__modal-subtitle">
                {selectedRequest.builder_name} → {selectedRequest.contact_name}
              </p>
            )}
          </DialogHeader>

          <div className="snd__response-form">
            <div className="snd__form-field">
              <label className="snd__form-label">Response notes (optional)</label>
              <textarea
                className="snd__form-textarea"
                rows={3}
                placeholder="Add any context for the builder (timeline, what to expect, etc.)"
                value={responseNotes}
                onChange={e => setResponseNotes(e.target.value)}
              />
            </div>

            <div className="snd__response-actions">
              <Button
                variant="outline"
                className="snd__decline-btn"
                disabled={isResponding}
                onClick={() => handleRespond('declined')}
              >
                <CloseIcon fontSize="small" /> Decline
              </Button>
              <Button
                disabled={isResponding}
                onClick={() => handleRespond('approved')}
              >
                <CheckIcon fontSize="small" /> Approve & Make Intro
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
