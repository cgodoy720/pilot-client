import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  CircularProgress, 
  Card, 
  CardContent,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  TextField,
  InputAdornment,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton
} from '@mui/material';
import { Search, Link as LinkIcon, VideoLibrary, MenuBook, Article, FilterList, Close } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { fetchUserResources } from '../../../utils/statsApi';
import { formatDate } from '../../../utils/dateHelpers';

const ResourcesSection = ({ cohortMonth }) => {
  const { token } = useAuth();
  const [taskResources, setTaskResources] = useState([]);
  const [flattenedResources, setFlattenedResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [resourceType, setResourceType] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        console.log('Cohort month:', cohortMonth);
        const resourcesData = await fetchUserResources(token);
        setTaskResources(resourcesData);
        
        // Flatten resources into a single array
        const flattened = [];
        resourcesData.forEach(task => {
          task.resources.forEach(resource => {
            flattened.push({
              ...resource,
              task_title: task.task_title,
              task_id: task.task_id,
              assigned_date: task.assigned_date
            });
          });
        });
        
        setFlattenedResources(flattened);
        setFilteredResources(flattened);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch resources:', err);
        setError('Failed to load resources. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadResources();
    }
  }, [token, cohortMonth]);

  useEffect(() => {
    let filtered = flattenedResources;
    
    // Apply search filter
    if (searchTerm.trim() !== '') {
      const searchTermLower = searchTerm.toLowerCase();
      filtered = filtered.filter(resource => 
        (resource.title && resource.title.toLowerCase().includes(searchTermLower)) || 
        (resource.description && resource.description.toLowerCase().includes(searchTermLower)) ||
        (resource.task_title && resource.task_title.toLowerCase().includes(searchTermLower))
      );
    }
    
    // Apply type filter
    if (resourceType !== 'all') {
      filtered = filtered.filter(resource => {
        const lowerType = (resource.type || '').toLowerCase();
        switch (resourceType) {
          case 'video':
            return lowerType.includes('video');
          case 'document':
            return lowerType.includes('book') || lowerType.includes('doc');
          case 'article':
            return lowerType.includes('article');
          case 'link':
            return !lowerType.includes('video') && !lowerType.includes('book') && 
                   !lowerType.includes('doc') && !lowerType.includes('article');
          default:
            return true;
        }
      });
    }
    
    setFilteredResources(filtered);
  }, [searchTerm, resourceType, flattenedResources]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleTypeChange = (event) => {
    setResourceType(event.target.value);
  };

  const getResourceIcon = (type) => {
    const lowerType = (type || '').toLowerCase();
    if (lowerType.includes('video')) return <VideoLibrary />;
    if (lowerType.includes('book') || lowerType.includes('doc')) return <MenuBook />;
    if (lowerType.includes('article')) return <Article />;
    return <LinkIcon />;
  };

  if (loading) {
    return (
      <Box className="resources-section__loading" sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="resources-section__error" sx={{ p: 2 }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  if (taskResources.length === 0) {
    return (
      <Box className="resources-section__empty" sx={{ p: 2 }}>
        <Card className="resources-section__empty-card">
          <CardContent>
            <Typography variant="h6" align="center">No Resources Found</Typography>
            <Typography variant="body2" align="center" sx={{ mt: 1 }}>
              There are no resources linked to your tasks yet.
            </Typography>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box className="resources-section" sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box className="resources-section__filters" mb={3} display="flex" flexWrap="wrap" gap={2}>
        <TextField
          placeholder="Search resources..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={handleSearchChange}
          className="resources-section__search"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search sx={{ color: 'var(--color-text-secondary)' }} />
              </InputAdornment>
            ),
            endAdornment: searchTerm && (
              <InputAdornment position="end">
                <IconButton 
                  size="small" 
                  onClick={() => setSearchTerm('')}
                  sx={{ color: 'var(--color-text-secondary)' }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </InputAdornment>
            )
          }}
          sx={{ flexGrow: 1, minWidth: '200px' }}
        />
        
        <FormControl size="small" sx={{ minWidth: '150px' }}>
          <InputLabel id="resource-type-label">Resource Type</InputLabel>
          <Select
            labelId="resource-type-label"
            value={resourceType}
            onChange={handleTypeChange}
            label="Resource Type"
            startAdornment={
              <InputAdornment position="start">
                <FilterList fontSize="small" sx={{ color: 'var(--color-text-secondary)', marginRight: '5px' }} />
              </InputAdornment>
            }
            sx={{
              '& .MuiSelect-icon': {
                color: 'var(--color-text-secondary)'
              }
            }}
          >
            <MenuItem value="all">All Resources</MenuItem>
            <MenuItem value="video">Videos</MenuItem>
            <MenuItem value="document">Documents</MenuItem>
            <MenuItem value="article">Articles</MenuItem>
            <MenuItem value="link">Other Links</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {filteredResources.length === 0 ? (
        <Box className="resources-section__no-results" sx={{ p: 2 }}>
          <Card className="resources-section__empty-card">
            <CardContent>
              <Typography variant="h6" align="center">No Matching Resources</Typography>
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                No resources match your filter criteria. Try adjusting your filters.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      ) : (
        <Box className="resources-section__list-container" sx={{ flex: 1, overflow: 'auto' }}>
          <List className="resources-section__list">
            {filteredResources.map((resource, index) => (
              <React.Fragment key={index}>
                {index > 0 && <Divider component="li" />}
                <ListItem 
                  component={Link} 
                  href={resource.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  underline="none"
                  className="resources-section__list-item"
                >
                  <ListItemIcon sx={{ minWidth: '40px', color: 'var(--color-text-secondary)' }}>
                    {getResourceIcon(resource.type)}
                  </ListItemIcon>
                  <ListItemText 
                    primary={
                      <Typography 
                        variant="subtitle1" 
                        className="resources-section__resource-title"
                      >
                        {resource.title || 'Unnamed Resource'}
                      </Typography>
                    }
                    secondary={
                      <Typography 
                        variant="body2" 
                        color="textSecondary"
                        component="span"
                      >
                        {resource.description && (
                          <Typography 
                            variant="body2" 
                            component="span"
                            className="resources-section__resource-description"
                            sx={{ display: 'block' }}
                          >
                            {resource.description}
                          </Typography>
                        )}
                        <Typography 
                          variant="caption" 
                          component="span"
                          className="resources-section__resource-task"
                          sx={{ display: 'block' }}
                        >
                          From: {resource.task_title} {resource.assigned_date ? `(${formatDate(new Date(resource.assigned_date))})` : ''}
                        </Typography>
                      </Typography>
                    }
                  />
                </ListItem>
              </React.Fragment>
            ))}
          </List>
        </Box>
      )}
    </Box>
  );
};

export default ResourcesSection; 