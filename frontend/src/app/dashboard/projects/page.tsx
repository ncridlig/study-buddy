'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Alert,
} from '@mui/material';
import { Grid } from '@mui/material';;
import Cookies from 'js-cookie';

// Import the components you have
import ProjectCard from '@/components/ProjectCard'; // Your card component
import CreateTopicModal from '@/components/CreateTopicModal'; // The modal from the previous step

// Import the shared type definition
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
  // It runs after a new topic is successfully created.
  const handleTopicCreated = (createdTopic: Project) => {
    setProjects(prevProjects => [createdTopic, ...prevProjects]);
    setSuccessMessage(`Successfully created topic: "${createdTopic.title}"`);
    // Hide the success message after 5 seconds
    setTimeout(() => setSuccessMessage(null), 5000);
  };

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" sx={{ p: 7 }}>Error fetching projects: {error}</Typography>;
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 5 }, mt: 5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Your Projects
        </Typography>
        <Button variant="contained" color="primary" onClick={() => setIsModalOpen(true)}>
          Create New Topic
        </Button>
      </Box>

      {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

      <Grid container spacing={3}>
        {projects.length > 0 ? (
          projects.map((project) => (
            // The Grid item provides spacing and responsive layout for each card
            <Grid size={{ xs: 12, md: 4, sm: 6 }} key={project.id}>
            {/* <Grid item  size={{xs={12} sm={6} md={4}}} > */}
              <ProjectCard project={project} />
            </Grid>
          ))
        ) : (
          <Grid size={{xs: 12}}>
            <Typography sx={{ p: 2, m: 2 }}>
              No projects found. Click `Create New Topic`` to get started.
            </Typography>
          </Grid>
        )}
      </Grid>
      
      {/* The modal component is rendered here but is only visible when isModalOpen is true */}
      <CreateTopicModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTopicCreated={handleTopicCreated}
        apiBaseUrl={API_BASE_URL}
        authToken={authToken}
      />
    </Box>
  );
}