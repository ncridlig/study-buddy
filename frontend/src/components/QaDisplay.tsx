// src/components/QaDisplay.tsx
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Typography,
  Stack,
} from '@mui/material';
import { ExpandMore, AutoAwesome } from '@mui/icons-material';
import { Question } from '@/types';

interface QaDisplayProps {
  questions: Question[];
  onGenerate: () => void;
  isLoading: boolean;
  isGenerating: boolean;
  fileCount: number;
}

const QaDisplay = ({ questions, onGenerate, isLoading, isGenerating, fileCount }: QaDisplayProps) => {
  return (
    <Stack spacing={3}>
      <Card variant="outlined">
        <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h2">
              Generated Q&A
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Generate questions and answers based on your uploaded documents.
            </Typography>
          </Box>
          <Button
            variant="contained"
            color="secondary"
            startIcon={isGenerating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
            onClick={onGenerate}
            disabled={isGenerating || fileCount === 0}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {isGenerating ? 'Generating...' : 'Generate Q&A'}
          </Button>
        </CardContent>
      </Card>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
          <CircularProgress />
        </Box>
      ) : questions.length > 0 ? (
        <Box>
          {questions.map((q, index) => (
            <Accordion key={q.id} defaultExpanded={index === 0}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography sx={{ fontWeight: 'bold' }}>{q.q}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography color="text.secondary">{q.a}</Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ) : (
        <Card variant="outlined" sx={{ textAlign: 'center', p: { xs: 3, sm: 5 } }}>
            <AutoAwesome sx={{ fontSize: 50, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Ready to generate questions?
            </Typography>
            <Typography color="text.secondary">
              {fileCount > 0
                ? 'Click the "Generate Q&A" button to create questions and answers.'
                : 'Upload at least one document first, then you can generate your Q&A.'}
            </Typography>
        </Card>
      )}
    </Stack>
  );
};

export default QaDisplay;