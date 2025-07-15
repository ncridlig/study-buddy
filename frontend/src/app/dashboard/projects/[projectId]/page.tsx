/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Container, Typography, IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AlertColor } from '@mui/material/Alert';
import Cookies from 'js-cookie';
import { PdfFile, Question } from '@/types';
import { use } from 'react';

// Import all the necessary child components
import PdfManager from '@/components/PdfManager';
import QaDisplay from '@/components/QaDisplay';
import FeedbackAlert from '@/components/FeedbackAlert';
import ConfirmationDialog from '@/components/ConfirmationDialog';

// This interface matches the API response for a QA generation task
interface QaGenerationTask {
  id: string;
  topic: string;
  status: string; // e.g., 'PENDING', 'SUCCESS', 'FAILURE'
  result_file: string | null; // URL to a markdown file
}
interface TopicDetails {
    id: string;
    title: string;
    description: string;
}


// Helper function to parse Q&A from markdown text
const parseQaMarkdown = (markdown: string): Question[] => {
  if (!markdown) return [];
  const questions: Question[] = [];
  const blocks = markdown.trim().split(/\n\s*\n/);
  blocks.forEach((block, index) => {
    const qMatch = block.match(/\*\*Q:\*\*\s*(.*)/);
    const aMatch = block.match(/\*\*A:\*\*\s*(.*)/);
    if (qMatch && aMatch) {
      questions.push({
        id: `q-${index}-${Date.now()}`,
        q: qMatch[1].trim(),
        a: aMatch[1].trim(),
      });
    }
  });
  return questions;
};

export default function ProjectDetailPage({ params }: { params: any}) {
  // State for data and UI status
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false); // Now also represents an active task on the backend
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [projectName, setProjectName] = useState<string>('');
  // State for the feedback alert (snackbar)
  const [alertState, setAlertState] = useState<{ open: boolean; message: string; severity: AlertColor; }>({
    open: false, message: '', severity: 'success',
  });

  // State for the delete confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [fileIdToDelete, setFileIdToDelete] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  const { projectId } = use(params) as { projectId: string };

  // --- Data Fetching ---
  useEffect(() => {
    const authToken = Cookies.get('access_token');
        const fetchProjectDetails = async () => {
        if (!projectId) return;
        try {
            const response = await fetch(`${API_BASE_URL}/api/topic/topics/${projectId}/`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            });
            if (!response.ok) throw new Error('Failed to fetch project details.');
            const data: TopicDetails = await response.json();
            setProjectName(data.title);
        } catch (err: any) {
            console.error(err.message);
            setProjectName('Project Details'); // Set a fallback name on error
        }
    };
    const fetchFiles = async () => {
      if (!projectId) return;
      setLoadingFiles(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/topic/topics/${projectId}/files/`, { headers: { 'Authorization': `Bearer ${authToken}` } });
        if (!response.ok) throw new Error(`Failed to fetch files: ${response.statusText}`);
        const data: PdfFile[] = await response.json();
        setFiles(data);
      } catch (err: any) {
        setAlertState({ open: true, message: err.message, severity: 'error' });
      } finally {
        setLoadingFiles(false);
      }
    };

    const fetchQuestions = async () => {
        if (!projectId) return;
        if (questions.length === 0) setLoadingQuestions(true);
        try {
            const taskResponse = await fetch(`${API_BASE_URL}/api/result/qa/${projectId}`, { headers: { 'Authorization': `Bearer ${authToken}`, 'Content-Type': 'application/json', } });
            console.log("response", taskResponse)
            if (taskResponse.status === 404) { // No tasks found yet
                setIsGenerating(false);
                setQuestions([]);
                return;
            }
            if (!taskResponse.ok) throw new Error('Could not check QA status.');
            
            const allTasks: QaGenerationTask[] = await taskResponse.json();
            console.log("QAs", allTasks);
            // ✨ NEW: Check if any task is currently active
            const isTaskActive = allTasks.some(task => task.status === 'PENDING' || task.status === 'PROCESSING');
            setIsGenerating(isTaskActive);
            
            const relevantTasks = allTasks.filter(task => task.topic === projectId && task.result_file);
            const allQuestions = await Promise.all(
                relevantTasks.map(async (task) => {
                    const contentResponse = await fetch(task.result_file!, { headers: { 'Authorization': `Bearer ${authToken}` } });
                    if (!contentResponse.ok) return [];
                    const markdown = await contentResponse.text();
                    return parseQaMarkdown(markdown);
                })
            );
            setQuestions(allQuestions.flat());
        } catch (err: any) {
            // Avoid showing an error if it's just a 404 for no questions
            if (err.message !== 'Could not check QA status.') {
                setAlertState({ open: true, message: err.message, severity: 'error' });
            }
        } finally {
            setLoadingQuestions(false);
        }
    };

    fetchProjectDetails();
    fetchFiles();
    fetchQuestions();

    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(fetchQuestions, 10000);

    // Cleanup on component unmount
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };

  }, [params, API_BASE_URL, questions.length, projectId]);


  // --- Action Handlers ---
  const handleGenerateQuestions = async () => {
    // We keep the local `isGenerating` state for immediate feedback on the button
    setIsGenerating(true); 
    try {
      const authToken = Cookies.get('access_token');
      const response = await fetch(`${API_BASE_URL}/api/result/qa/${projectId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: projectId }),
      });

      // ✨ MODIFIED: Handle 409 Conflict as a 'warning' instead of an 'error'
      if (response.status === 409) {
        const errorData = await response.json();
        setAlertState({ 
          open: true, 
          message: errorData.detail || 'A generation task is already in progress. Results will appear here when ready.', 
          severity: 'warning' // Yellow banner
        });
      } else if (!response.ok) {
        // Handle other potential errors
        throw new Error('Failed to start question generation.');
      } else {
        // Handle success
        setAlertState({ open: true, message: 'Question generation started! Results will appear automatically.', severity: 'success' });
      }

    } catch (err: any) {
      setAlertState({ open: true, message: err.message, severity: 'error' });
      // If the API call failed, we should not be in a generating state
      setIsGenerating(false);
    } 
    // We no longer set `isGenerating` to false in a `finally` block,
    // as the polling mechanism will now be responsible for this.
  };

  const handleUploadClick = () => { fileInputRef.current?.click(); };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const authToken = Cookies.get('access_token');
      const response = await fetch(`${API_BASE_URL}/api/topic/topics/${projectId}/files/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData,
      });
      if (response.status !== 201) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'File upload failed');
      }
      const newFile: PdfFile = await response.json();
      setFiles(prevFiles => [...prevFiles, newFile]);
      setAlertState({ open: true, message: 'File uploaded successfully!', severity: 'success' });
    } catch (err: any) {
      setAlertState({ open: true, message: err.message, severity: 'error' });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDeleteClick = (fileId: string) => {
    setFileIdToDelete(fileId);
    setConfirmDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!fileIdToDelete) return;
    try {
      const authToken = Cookies.get('access_token');
      const response = await fetch(`${API_BASE_URL}/api/topic/topics/${projectId}/files/${fileIdToDelete}/`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${authToken}` },
      });
      if (response.status !== 204) throw new Error('Failed to delete the file.');
      setFiles(prevFiles => prevFiles.filter(file => file.id !== fileIdToDelete));
      setAlertState({ open: true, message: 'File deleted successfully.', severity: 'info' });
    } catch (err: any) {
      setAlertState({ open: true, message: err.message, severity: 'error' });
    } finally {
      setConfirmDialogOpen(false);
      setFileIdToDelete(null);
    }
  };

  const handleCloseAlert = () => { setAlertState({ ...alertState, open: false }); };
  const router = useRouter()
  // --- Render ---
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 64px)', mt: 5, pt: 5 }}>
      <FeedbackAlert
        open={alertState.open}
        message={alertState.message}
        severity={alertState.severity}
        onClose={handleCloseAlert}
      />
      <ConfirmationDialog
        open={confirmDialogOpen}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete File?"
        contentText="Are you sure you want to delete this file permanently? This action cannot be undone."
      />
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }}
        accept="application/pdf,.doc,.docx,.txt"
      />

      <Container maxWidth="xl" sx={{ py: { xs: 2, md: 4 }}}>
            <IconButton onClick={() => router.back()} aria-label="go back">
                <ArrowBackIcon />
            </IconButton>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', ml: 3 }}>
          {projectName || 'Loading Project...'}
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '300px 1fr' }, gap: { xs: 3, md: 4 } }}>
          {/* File Management Section */}
          <PdfManager
            files={files}
            onUpload={handleUploadClick}
            onDelete={handleDeleteClick}
            isLoading={loadingFiles}
            isUploading={isUploading}
          />

          {/* Q&A Display Section */}
          <QaDisplay
            questions={questions}
            onGenerate={handleGenerateQuestions}
            isLoading={loadingQuestions}
            isGenerating={isGenerating}
            fileCount={files.length}
          />
        </Box>
      </Container>
    </Box>
  );
}