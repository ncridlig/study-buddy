/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState, useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import { AlertColor } from '@mui/material/Alert';
import Cookies from 'js-cookie';
import { PdfFile, Question } from '@/types';

// Import all the necessary child components
import PdfSidebar from '@/components/PdfSidebar';
import QaDisplay from '@/components/QaDisplay';
import FeedbackAlert from '@/components/FeedbackAlert';
import ConfirmationDialog from '@/components/ConfirmationDialog';

// This interface matches the API response for a QA generation task
interface QaGenerationTask {
  id: string;
  topic: string;
  status: string;
  result_file: string | null; // URL to a markdown file
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
  const [isGenerating, setIsGenerating] = useState(false); // State for generation status
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null); // Ref to hold the interval ID

  // State for the feedback alert (snackbar)
  const [alertState, setAlertState] = useState<{ open: boolean; message: string; severity: AlertColor; }>({
    open: false, message: '', severity: 'success',
  });

  // State for the delete confirmation dialog
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [fileIdToDelete, setFileIdToDelete] = useState<string | null>(null);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- Data Fetching ---
  useEffect(() => {
    const authToken = Cookies.get('access_token');

    const fetchFiles = async () => {
      if (!params.projectId) return;
      setLoadingFiles(true);
      try {
        const response = await fetch(`${API_BASE_URL}/topic/topics/${params.projectId}/files/`, { headers: { 'Authorization': `Bearer ${authToken}` } });
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
        if (!params.projectId) return;
        if (questions.length === 0) setLoadingQuestions(true);
        try {
            const taskResponse = await fetch(`${API_BASE_URL}/result/qa/`, { headers: { 'Authorization': `Bearer ${authToken}` } });
            if (!taskResponse.ok) throw new Error('Could not fetch QA tasks.');
            const allTasks: QaGenerationTask[] = await taskResponse.json();
            const relevantTasks = allTasks.filter(task => task.topic === params.projectId && task.result_file);
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
            setAlertState({ open: true, message: err.message, severity: 'error' });
        } finally {
            setLoadingQuestions(false);
        }
    };

    fetchFiles();
    fetchQuestions();

    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(fetchQuestions, 10000);

    // Cleanup on component unmount
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };

  // **FIX**: Use the entire `params` object in the dependency array.
  }, [params, API_BASE_URL, questions.length]);


  // --- Action Handlers ---
  const handleGenerateQuestions = async () => {
    setIsGenerating(true);
    try {
      const authToken = Cookies.get('access_token');
      const response = await fetch(`${API_BASE_URL}/result/qa/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ topic: params.projectId }),
      });

      if (response.status === 409) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'A generation task is already in progress for this topic.');
      }
      if (!response.ok) {
        throw new Error('Failed to start question generation.');
      }
      
      setAlertState({ open: true, message: 'Question generation started! Results will appear here automatically when ready.', severity: 'success' });

    } catch (err: any) {
      setAlertState({ open: true, message: err.message, severity: 'error' });
    } finally {
      setIsGenerating(false);
    }
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
      const response = await fetch(`${API_BASE_URL}/topic/topics/${params.projectId}/files/`, {
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
      const response = await fetch(`${API_BASE_URL}/topic/topics/${params.projectId}/files/${fileIdToDelete}/`, {
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

  // --- Render ---
  return (
    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, height: 'calc(100vh - 64px)' }}>
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

      <PdfSidebar
        files={files}
        onUpload={handleUploadClick}
        onDelete={handleDeleteClick}
        isLoading={loadingFiles}
        isUploading={isUploading}
      />

      <QaDisplay
        questions={questions}
        onGenerate={handleGenerateQuestions}
        isLoading={loadingQuestions}
        isGenerating={isGenerating}
      />
    </Box>
  );
}
