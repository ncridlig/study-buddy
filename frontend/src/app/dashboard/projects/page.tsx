'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Alert,
  Grid,
  Container, // Added for better spacing control
  Fab,      // Added for the mobile action button
  Stack,    // Added for the empty state
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add'; // Icon for the FAB
import FolderOffIcon from '@mui/icons-material/FolderOff'; // Icon for the empty state
import Cookies from 'js-cookie';

import ProjectCard from '@/components/ProjectCard';
import CreateTopicModal from '@/components/CreateTopicModal';
import { Project } from '@/types';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
  const authToken = Cookies.get('access_token');

  // Fetch all projects when the component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/topic/topics/`, {
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data: Project[] = await response.json();
        setProjects(data);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [API_BASE_URL, authToken]);

  // This function is passed to the modal.
  const handleTopicCreated = (createdTopic: Project) => {
    setProjects(prevProjects => [createdTopic, ...prevProjects]);
    setSuccessMessage(`Successfully created topic: "${createdTopic.title}"`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  // Centered full-page loader
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Centered full-page error
  if (error) {
    return (
      <Container maxWidth="sm">
          <Alert severity="error" sx={{ mt: 4 }}>
              <Typography>Error fetching projects: {error}</Typography>
          </Alert>
      </Container>
    );
  }

  return (
    <>
      <Box sx={{ py: { xs: 3, md: 4 }, mt: 5, pt: 5 }}>
        <Container maxWidth="lg">
          {/* Responsive Header */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'flex-start', sm: 'center' }}
            spacing={2}
            mb={4}
          >
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Your Projects
            </Typography>
            {/* Button is hidden on mobile, replaced by FAB */}
            <Button
              variant="contained"
              color="primary"
              onClick={() => setIsModalOpen(true)}
              startIcon={<AddIcon />}
              sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
            >
              Create New Topic
            </Button>
          </Stack>

          {successMessage && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>{successMessage}</Alert>}

          <Grid container spacing={{ xs: 2, md: 3 }}>
            {projects.length > 0 ? (
              projects.map((project) => (
                // ✅ CORRECTED Grid item syntax for responsiveness
                <Grid size={{ xs: 12, md: 4, sm: 6 }}  key={project.id}>
                  <ProjectCard project={project} />
                </Grid>
              ))
            ) : (
              // Enhanced Empty State
              <Grid size={{xs: 12}}>
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{
                    border: '2px dashed',
                    borderColor: 'divider',
                    borderRadius: 2,
                    py: 8,
                    mt: 2
                  }}
                >
                  <FolderOffIcon sx={{ fontSize: 50, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No projects found
                  </Typography>
                  <Typography color="text.secondary">
                    Click &rsquo;Create New Topic&rsquo; to get started
                  </Typography>
                </Stack>
              </Grid>
            )}
          </Grid>
        </Container>
      </Box>

      {/* Floating Action Button for Mobile */}
      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setIsModalOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', sm: 'none' }, // Only show on mobile
        }}
      >
        <AddIcon />
      </Fab>

      {/* The modal component remains unchanged */}
      <CreateTopicModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTopicCreated={handleTopicCreated}
        apiBaseUrl={API_BASE_URL}
        authToken={authToken}
      />
    </>
  );
}