import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Link,
  TextField,
  Typography,
  Chip,
  Alert,
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';
import { pebbleService, type ProspectInput, type Profile } from '../services/pebbleApi';
import toast from 'react-hot-toast';

const Pebble: React.FC = () => {
  const [contactId, setContactId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastContactId, setLastContactId] = useState<string>('');

  const handleRequestResearch = async () => {
    const id = contactId.trim() || `p-${Date.now()}`;
    setLastContactId(id);
    const prospects: ProspectInput[] = [{
      id,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      organization: organization.trim(),
    }];

    setLoading(true);
    setError(null);
    setProfile(null);

    try {
      const res = await pebbleService.requestResearch({
        contact_ids: [id],
        prospects,
      });
      if (res.data.status === 'completed') {
        const profileRes = await pebbleService.getProfile(id);
        setProfile(profileRes.data.profile || null);
        toast.success('Research completed');
      } else {
        toast.success('Research queued');
      }
    } catch (err: any) {
      const msg = err.response?.data?.detail || err.message || 'Pebble request failed';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Pebble — Prospect Research
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Request research for a prospect. Pebble enriches from ProPublica 990, SEC, FEC.
      </Typography>

      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 2 }}>
            <TextField
              label="Contact ID"
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              placeholder="Optional"
              size="small"
            />
            <TextField
              label="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              size="small"
            />
            <TextField
              label="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              size="small"
            />
            <TextField
              label="Organization"
              value={organization}
              onChange={(e) => setOrganization(e.target.value)}
              size="small"
              sx={{ minWidth: 200 }}
            />
          </Box>
          <Button
            variant="contained"
            startIcon={loading ? <CircularProgress size={16} /> : <SearchIcon />}
            onClick={handleRequestResearch}
            disabled={loading || (!firstName && !lastName && !organization)}
          >
            {loading ? 'Researching...' : 'Request Research'}
          </Button>
        </CardContent>
      </Card>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {profile && (
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Profile
              {profile.partial && (
                <Chip label="Partial" size="small" color="warning" sx={{ ml: 1 }} />
              )}
            </Typography>
            {profile.summary && (
              <Typography variant="body1" sx={{ mb: 2 }}>
                {profile.summary}
              </Typography>
            )}
            <Typography variant="subtitle2" gutterBottom>
              Claims ({profile.claims.length})
            </Typography>
            {profile.claims.map((c, i) => (
              <Box key={i} sx={{ mb: 1, pl: 1, borderLeft: 2, borderColor: 'divider' }}>
                <Typography variant="body2">{c.text}</Typography>
                <Link href={c.source_url} target="_blank" rel="noopener" variant="caption">
                  Source
                </Link>
                <Chip label={c.confidence} size="small" sx={{ ml: 1 }} />
                <Button
                  size="small"
                  onClick={() => pebbleService.submitFeedback(`${lastContactId}-claim-${i}`, true).then(() => toast.success('Thanks!'))}
                  sx={{ ml: 1 }}
                >
                  ✓ Correct
                </Button>
                <Button
                  size="small"
                  color="error"
                  onClick={() => pebbleService.submitFeedback(`${lastContactId}-claim-${i}`, false).then(() => toast.success('Noted'))}
                  sx={{ ml: 0.5 }}
                >
                  ✗ Incorrect
                </Button>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Pebble;
