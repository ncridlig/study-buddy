'use client';

import { useState, useEffect } from 'react';
import { Box, Typography, Grid, CircularProgress } from '@mui/material';

// Import the new ProjectCard component
import ProjectCard from '@/components/ProjectCard'; // Adjust the import path as needed

// Define the project data structure
interface Project {
  id: string;
  title: string;
  description: string;
}

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const authToken = localStorage.getItem('authToken'); // Get your auth token
        console.log("auth", authToken)
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
  }, [API_BASE_URL]);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', p: 10 }}><CircularProgress /></Box>;
  }

  if (error) {
    return <Typography color="error" sx={{ p: 7 }}>Error: {error}</Typography>;
  }

  return (
    <Box sx={{ p: 3, m: 7 }}>
      <Typography variant="h4" gutterBottom>
        Your Projects
      </Typography>

      <Grid container spacing={2}>
        {projects.length > 0 ? (
          // Map over the projects and render a ProjectCard for each one
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          <Typography sx={{ p: 2, m: 2 }}>No projects found.</Typography>
        )}
      </Grid>
    </Box>
  );
}