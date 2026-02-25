import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import LoadingCurtain from '../../components/LoadingCurtain/LoadingCurtain';
import WorkIcon from '@mui/icons-material/Work';
import SearchIcon from '@mui/icons-material/Search';
import BusinessIcon from '@mui/icons-material/Business';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import FavoriteIcon from '@mui/icons-material/Favorite';
import PersonIcon from '@mui/icons-material/Person';
import './PathfinderJobs.css';

const API = import.meta.env.VITE_API_URL;

const EXPERIENCE_LEVELS = [
  { value: '', label: 'All levels' },
  { value: 'entry', label: 'Entry level' },
  { value: 'mid', label: 'Mid level' },
  { value: 'senior', label: 'Senior' },
];

export default function PathfinderJobs() {
  const { token } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [interestedIds, setInterestedIds] = useState(new Set());

  const fetchJobs = useCallback(async (page = 1, searchTerm = search, level = experienceLevel) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      if (searchTerm) params.set('search', searchTerm);
      if (level) params.set('experience_level', level);
      const res = await fetch(`${API}/api/employment-engine/jobs?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to load jobs');
      const data = await res.json();
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [token, search, experienceLevel]);

  useEffect(() => { fetchJobs(1, search, experienceLevel); }, [token, search, experienceLevel]);

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleInterest = async (jobId) => {
    if (interestedIds.has(jobId)) return; // already marked
    try {
      const res = await fetch(`${API}/api/employment-engine/jobs/${jobId}/interest`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setInterestedIds(prev => new Set([...prev, jobId]));
        setJobs(prev =>
          prev.map(j =>
            j.id === jobId
              ? { ...j, builder_interest_count: j.builder_interest_count + 1 }
              : j
          )
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="pf-jobs">
      <div className="pf-jobs__content">
        {/* Header */}
        <div className="pf-jobs__header">
          <div>
            <h1 className="pf-jobs__title">Jobs Feed</h1>
            <p className="pf-jobs__subtitle">
              Opportunities sourced directly by the Pursuit staff network.
              {pagination.total > 0 && ` ${pagination.total} open roles.`}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="pf-jobs__filters">
          <form onSubmit={handleSearch} className="pf-jobs__search">
            <div className="pf-jobs__search-wrap">
              <SearchIcon className="pf-jobs__search-icon" />
              <input
                className="pf-jobs__search-input"
                placeholder="Search by title, company, or description..."
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

          <div className="pf-jobs__level-filter">
            {EXPERIENCE_LEVELS.map(lvl => (
              <button
                key={lvl.value}
                className={`pf-jobs__level-btn ${experienceLevel === lvl.value ? 'pf-jobs__level-btn--active' : ''}`}
                onClick={() => setExperienceLevel(lvl.value)}
              >
                {lvl.label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <LoadingCurtain isLoading />
        ) : jobs.length === 0 ? (
          <div className="pf-jobs__empty">
            <WorkIcon style={{ fontSize: 48, color: '#ccc' }} />
            <p>No job postings found{search ? ` for "${search}"` : ''}.</p>
            <p className="pf-jobs__empty-hint">Check back soon — staff add new roles regularly.</p>
          </div>
        ) : (
          <>
            <div className="pf-jobs__list">
              {jobs.map(job => (
                <Card key={job.id} className="pf-jobs__card">
                  <CardContent className="pf-jobs__card-content">
                    <div className="pf-jobs__card-main">
                      <div className="pf-jobs__card-icon">
                        <WorkIcon />
                      </div>
                      <div className="pf-jobs__card-info">
                        <p className="pf-jobs__job-title">{job.job_title}</p>
                        <p className="pf-jobs__company">
                          <BusinessIcon fontSize="inherit" /> {job.company_name}
                        </p>
                        <div className="pf-jobs__meta">
                          {job.experience_level && (
                            <span className="pf-jobs__tag">{job.experience_level}</span>
                          )}
                          {job.salary_range && (
                            <span className="pf-jobs__tag">{job.salary_range}</span>
                          )}
                          <span className="pf-jobs__posted-by">
                            <PersonIcon fontSize="inherit" /> via {job.posted_by_name}
                          </span>
                          <span className="pf-jobs__date">
                            {new Date(job.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {job.notes && (
                          <p className="pf-jobs__notes">{job.notes}</p>
                        )}
                      </div>
                    </div>

                    <div className="pf-jobs__card-actions">
                      <button
                        className={`pf-jobs__interest-btn ${interestedIds.has(job.id) ? 'pf-jobs__interest-btn--active' : ''}`}
                        onClick={() => handleInterest(job.id)}
                        title={interestedIds.has(job.id) ? 'Marked as interested' : 'Mark as interested'}
                      >
                        {interestedIds.has(job.id)
                          ? <FavoriteIcon fontSize="small" />
                          : <FavoriteBorderIcon fontSize="small" />
                        }
                        <span>{job.builder_interest_count}</span>
                      </button>

                      {job.job_url && (
                        <a
                          href={job.job_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pf-jobs__apply-link"
                        >
                          View role <OpenInNewIcon fontSize="inherit" />
                        </a>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {pagination.totalPages > 1 && (
              <div className="pf-jobs__pagination">
                <Button
                  variant="outline"
                  disabled={pagination.page <= 1}
                  onClick={() => fetchJobs(pagination.page - 1)}
                >
                  Previous
                </Button>
                <span className="pf-jobs__page-info">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => fetchJobs(pagination.page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
