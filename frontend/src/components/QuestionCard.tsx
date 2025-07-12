import { Paper, Typography } from '@mui/material';
import { Question } from '@/types';

interface QuestionCardProps {
  question: Question;
}

export default function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Paper sx={{ mb: 2, p: 2, '&:hover': { boxShadow: 3 } }}>
      <Typography variant="subtitle1" fontWeight="bold" component="p" gutterBottom>
        Q: {question.q}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        A: {question.a}
      </Typography>
    </Paper>
  );
}