import { Box, Typography, Button, CircularProgress } from '@mui/material';
import QuestionCard from './QuestionCard';
import { Question } from '@/types';

interface QaDisplayProps {
  questions: Question[];
  onGenerate: () => void;
  isLoading: boolean;
  isGenerating: boolean;
}

export default function QaDisplay({ questions, onGenerate, isLoading, isGenerating }: QaDisplayProps) {
  return (
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
            No questions yet. Upload a PDF and click `Generate` below.
          </Typography>
        ) : (
          questions.map((qa) => <QuestionCard key={qa.id} question={qa} />)
        )}
      </Box>

      {/* Sticky bottom button */}
      <Box sx={{ textAlign: 'center', py: 2, borderTop: '1px solid #eee' }}>
        <Button
          variant="contained"
          size="large"
          onClick={onGenerate}
          disabled={isGenerating || isLoading} // Disable while generating
          startIcon={isGenerating ? <CircularProgress size={24} color="inherit" /> : null}
          sx={{ textTransform: 'none', minWidth: '200px' }}
        >
          {isGenerating ? 'Generating...' : 'Generate Questions'}
        </Button>
      </Box>
    </Box>
  );
}