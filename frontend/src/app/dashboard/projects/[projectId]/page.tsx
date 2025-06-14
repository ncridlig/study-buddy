'use client';

import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  Paper,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const initialPDFs = ['Lecture 1.pdf', 'Notes 2.pdf'];

const mockQuestions = [
  { q: 'What is the function of mitochondria?', a: 'They produce energy (ATP).' },
  { q: 'Define photosynthesis.', a: 'The process by which plants convert light into energy.' },
];

export default function ProjectDetailPage() {
  const [pdfFiles, setPdfFiles] = useState(initialPDFs);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [questions, setQuestions] = useState(mockQuestions);

  const handleUpload = () => {
    const newName = `PDF ${pdfFiles.length + 1}.pdf`;
    setPdfFiles([...pdfFiles, newName]);
  };

  const handleDelete = (index: number) => {
    setPdfFiles(pdfFiles.filter((_, i) => i !== index));
  };

  const handleGenerateQuestions = () => {
    console.log('Generating questions...');
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 280,
          borderRight: '1px solid #ddd',
          p: 2,
          m: 3,
          overflowY: 'auto',
        }}
      >
        <Typography variant="h6" gutterBottom>
          Uploaded PDFs
        </Typography>

        <List>
          {pdfFiles.map((name, index) => (
            <ListItem
              key={name}
              secondaryAction={
                <IconButton edge="end" onClick={() => handleDelete(index)}>
                  <DeleteIcon />
                </IconButton>
              }
            >
              <ListItemText primary={name} />
            </ListItem>
          ))}
        </List>

        <Button
          fullWidth
          variant="outlined"
          startIcon={<UploadFileIcon />}
          sx={{ mt: 2 }}
          onClick={handleUpload}
        >
          Upload PDF
        </Button>
      </Box>

      {/* Main content */}
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          p: 3,
          height: '100%',
        }}
      >
        {/* Scrollable Q&A list */}
        <Box sx={{ overflowY: 'auto', flexGrow: 1, mb: 2 }}>
          <Typography variant="h5" fontWeight="bold" gutterBottom>
            Generated Questions
          </Typography>

          {questions.length === 0 ? (
            <Typography variant="body1" color="text.secondary">
              No questions yet. Click &quot;Generate Questions&quot; below.
            </Typography>
          ) : (
            questions.map((qa, idx) => (
              <Paper key={idx} sx={{ mb: 2, p: 2 }}>
                <Typography variant="subtitle1"><strong>Q:</strong> {qa.q}</Typography>
                <Typography variant="body2"><strong>A:</strong> {qa.a}</Typography>
              </Paper>
            ))
          )}
        </Box>

        {/* Sticky bottom button */}
        <Box sx={{ textAlign: 'center', py: 2, borderTop: '1px solid #eee' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerateQuestions}
            sx={{ textTransform: 'none' }}
          >
            Generate Questions
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
