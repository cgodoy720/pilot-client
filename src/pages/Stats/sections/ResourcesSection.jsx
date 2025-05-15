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
  Divider
} from '@mui/material';
import { Search, Link as LinkIcon, VideoLibrary, MenuBook, Article } from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { fetchUserResources } from '../../../utils/statsApi';
import { formatDate } from '../../../utils/dateHelpers';

const ResourcesSection = () => {
  const { token } = useAuth();
  const [taskResources, setTaskResources] = useState([]);
  const [flattenedResources, setFlattenedResources] = useState([]);
  const [filteredResources, setFilteredResources] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
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
  }, [token]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredResources(flattenedResources);
    } else {
      const searchTermLower = searchTerm.toLowerCase();
      const filtered = flattenedResources.filter(resource => 
        (resource.title && resource.title.toLowerCase().includes(searchTermLower)) || 
        (resource.description && resource.description.toLowerCase().includes(searchTermLower)) ||
        (resource.task_title && resource.task_title.toLowerCase().includes(searchTermLower))
      );
      setFilteredResources(filtered);
    }
  }, [searchTerm, flattenedResources]);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
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
      <Box className="resources-section__search" sx={{ mb: 3 }}>
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search resources..."
          value={searchTerm}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {filteredResources.length === 0 ? (
        <Box className="resources-section__no-results" sx={{ p: 2 }}>
          <Card className="resources-section__empty-card">
            <CardContent>
              <Typography variant="h6" align="center">No Matching Resources</Typography>
              <Typography variant="body2" align="center" sx={{ mt: 1 }}>
                No resources match your search criteria. Try another search term.
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
                      <Box>
                        {resource.description && (
                          <Typography 
                            variant="body2" 
                            className="resources-section__resource-description"
                          >
                            {resource.description}
                          </Typography>
                        )}
                        <Typography 
                          variant="caption" 
                          className="resources-section__resource-task"
                        >
                          From: {resource.task_title} {resource.assigned_date ? `(${formatDate(new Date(resource.assigned_date))})` : ''}
                        </Typography>
                      </Box>
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