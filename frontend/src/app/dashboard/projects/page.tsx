/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react'; // Import useRef
import {
  Box,
  Typography,
  CircularProgress,
  Button,
  Alert,
  Grid,
  Container,
  Fab,
  Stack,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FolderOffIcon from '@mui/icons-material/FolderOff';
import Cookies from 'js-cookie';

// Assuming your components are in these paths, adjust if necessary
import ProjectCard from '@/components/ProjectCard';
import CreateTopicModal from '@/components/CreateTopicModal';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { Project } from '@/types';

export default function ProjectsPage() {
  // State for projects, loading, and errors
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for the "Create Topic" modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // State to manage the confirmation dialog for deletion
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [topicToDelete, setTopicToDelete] = useState<string | null>(null);
  
  // State to control the loading spinner in the dialog
  const [isDeleting, setIsDeleting] = useState(false);
  
  // ✅ Ref to store the timestamp of the last delete call for debouncing
  const lastDeleteTimestampRef = useRef(0);

  // API Configuration
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL!;
  const authToken = Cookies.get('access_token');

  // Effect to fetch all projects when the component mounts
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/topic/topics/`, {
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
      } catch (err: any) {
        setError(err.message);
        console.error("Failed to fetch projects:", err);
      } finally {
        setLoading(false);
      }
    };

    if (authToken) {
        fetchProjects();
    } else {
        setError("Authentication token not found. Please log in.");
        setLoading(false);
    }
  }, [API_BASE_URL, authToken]);

  // Callback for when a new topic is successfully created
  const handleTopicCreated = (createdTopic: Project) => {
    setProjects(prevProjects => [createdTopic, ...prevProjects]);
    setSuccessMessage(`Successfully created topic: "${createdTopic.title}"`);
    setTimeout(() => setSuccessMessage(null), 5000);
  };
  
  // --- Deletion Logic ---

  // This function just opens the dialog
  // const handleDeleteTopic = (topicId: string) => {
  //   setTopicToDelete(topicId);
  //   setIsConfirmOpen(true);
  // };

  // ✅ Delete handler with debouncing logic
  const handleConfirmDelete = async () => {
    const now = Date.now();
    // 1. Debounce check: If called within 5 seconds of the last call, ignore it.
    if (now - lastDeleteTimestampRef.current < 5000) {
      console.log("Delete call debounced. Ignoring.");
      // Close the dialog silently to prevent user confusion
      setIsConfirmOpen(false);
      setTopicToDelete(null);
      return;
    }
    
    // 2. Update the timestamp and proceed
    lastDeleteTimestampRef.current = now;
    
    if (!topicToDelete) return;

    setIsDeleting(true);

    const idBeingDeleted = topicToDelete;
    const topicTitle = projects.find(p => p.id === idBeingDeleted)?.title || 'the topic';

    try {
      const response = await fetch(`${API_BASE_URL}/api/topic/topics/${idBeingDeleted}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`,
        },
      });

      if (response.status === 204) {
        setProjects(prevProjects => prevProjects.filter(project => project.id !== idBeingDeleted));
        setSuccessMessage(`Successfully deleted topic: "${topicTitle}"`);
        setTimeout(() => setSuccessMessage(null), 5000);
      } else {
        const errorData = await response.json().catch(() => ({ detail: 'An unknown error occurred during deletion.' }));
        throw new Error(errorData.detail);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Failed to delete topic:", err);
    } finally {
      // 3. Always reset the UI state
      setIsDeleting(false);
      setIsConfirmOpen(false);
      setTopicToDelete(null);
    }
  };

  // --- Render Logic ---

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error) {
    return (
      <Container maxWidth="sm">
          <Alert severity="error" sx={{ mt: 4 }} onClose={() => setError(null)}>
              <Typography>Error: {error}</Typography>
          </Alert>
      </Container>
    );
  }

  return (
    <>
      <Box sx={{ py: { xs: 3, md: 4 }, mt: 5, pt: 5 }}>
        <Container maxWidth="lg">
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
                <Grid size={{xs:12, sm:6, md:4}} key={project.id}>
                  <ProjectCard 
                    project={project} 
                    // onDelete={handleDeleteTopic}
                  />
                </Grid>
              ))
            ) : (
              <Grid size={{xs:12}}>
                <Stack
                  alignItems="center"
                  justifyContent="center"
                  sx={{ border: '2px dashed', borderColor: 'divider', borderRadius: 2, py: 8, mt: 2 }}
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

      <Fab
        color="primary"
        aria-label="add"
        onClick={() => setIsModalOpen(true)}
        sx={{ position: 'fixed', bottom: 24, right: 24, display: { xs: 'flex', sm: 'none' } }}
      >
        <AddIcon />
      </Fab>

      <CreateTopicModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onTopicCreated={handleTopicCreated}
        apiBaseUrl={API_BASE_URL}
        authToken={authToken}
      />

      <ConfirmationDialog
        open={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Topic?"
        contentText="Are you sure you want to delete this topic? This action is permanent and cannot be undone."
        isConfirming={isDeleting}
      />
    </>
  );
}
