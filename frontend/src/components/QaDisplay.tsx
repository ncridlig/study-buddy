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
import { ExpandMore, AutoAwesome, Download } from '@mui/icons-material';
import { useState } from 'react';
import Cookies from 'js-cookie';
import { Question } from '@/types'; // Make sure this type is imported or defined


interface QaDisplayProps {
  tasks: QaGenerationTask[];
  onGenerate: () => void;
  isLoading: boolean;
  isGenerating: boolean;
  fileCount: number;
  apiBaseUrl: string | undefined; 
}

interface QaGenerationTask {
  id: number;
  topic: number;
  name?: string;
  date?: string;
  status: string;
  result_file?: string | null;
}

const parseQaMarkdown = (markdown: string): Question[] => {
  if (!markdown) return [];

  // --- normalise line-endings so the regexes act the same on every OS
  const lines = markdown.replace(/\r\n?/g, '\n').split('\n');

  const Q: Question[] = [];
  const delimiters = ['---', '###', 'Files:'];

  let currentQ: string | null = null;
  let currentA: string[] = [];

  const commit = () => {
    if (currentQ) {
      const answer = currentA.join('\n').trim();
      if (answer) {
        Q.push({
          id: `q-${Q.length}-${Date.now()}`,
          q: currentQ,
          a: answer,
        });
      }
    }
    currentQ = null;
    currentA = [];
  };

  lines.forEach(raw => {
    const line = raw.trimStart();

    if (line.startsWith(':question:')) {
      commit();
      currentQ = line.slice(':question:'.length).trim();
    } else if (delimiters.some(d => line.startsWith(d))) {
      commit(); // boundary reached
    } else if (currentQ) {
      currentA.push(raw); // preserve original indentation
    }
  });

  commit(); // flush last Q-A pair
  return Q;
};

const QaDisplay = ({ tasks, onGenerate, isLoading, isGenerating, fileCount, apiBaseUrl }: QaDisplayProps) => {

  // ✨ CHANGE: State to hold content and loading status for each accordion
  const [qaContent, setQaContent] = useState<Record<number, Question[]>>({});
  const [loadingState, setLoadingState] = useState<Record<number, boolean>>({});
  const [inProgress, setInProgress] = useState<boolean>(false);

  // ✨ CHANGE: Handler to fetch data when an accordion expands
  const handleAccordionChange = async (taskId: number, topicId: number, isExpanded: boolean) => {
    // Fetch only if expanding and content isn't already loaded
    if (isExpanded && !qaContent[taskId]) {
      setLoadingState(prev => ({ ...prev, [taskId]: true }));
      try {
        const authToken = Cookies.get('access_token');
        const response = await fetch(`${apiBaseUrl}/api/result/content/${topicId}/${taskId}/`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch Q&A content.');
        }
        const markdown = await response.json();
        if(markdown.result_file==="Q&A generation in progress"){
          setInProgress(true)
        }
        const parsedQuestions = parseQaMarkdown(markdown.result_file_content);
        setQaContent(prev => ({ ...prev, [taskId]: parsedQuestions }));
      } catch (error) {
        console.error(error);
        // Optionally set an error state to display in the UI
        setQaContent(prev => ({ ...prev, [taskId]: [] })); // Set empty to prevent re-fetching
      } finally {
        setLoadingState(prev => ({ ...prev, [taskId]: false }));
      }
    }
  };

  return (
    <Stack spacing={3}>
      <Card variant="outlined">
         <CardContent sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: 'center', gap: 2 }}>
            <Box sx={{ flexGrow: 1 }}>
               <Typography variant="h6" component="h2">Generated Q&A</Typography>
               <Typography variant="body2" color="text.secondary">Generate questions and answers based on your uploaded documents.</Typography>
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
      ) : tasks.length > 0 ? (
        <Box>
          {tasks.map((task) => (
            <Accordion 
              key={task.id} 
              // ✨ CHANGE: Added onChange handler
              onChange={(event, isExpanded) => handleAccordionChange(task.id, task.topic, isExpanded)}
            >
              <AccordionSummary expandIcon={!inProgress&&<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', gap: 2 }}>
                  <Typography sx={{ fontWeight: 'bold', flexGrow: 1 }}>{inProgress ? `Generating QAs`: `View QAs`}</Typography>
                  <Typography variant="body2" color="text.secondary">{task.date}</Typography>
                  <Box
                    component="div"
                    sx={{ p: 1, borderRadius: '50%', display: 'inline-flex', '&:hover': { backgroundColor: 'action.hover' } }}
                    role="button"
                    aria-label="download qa file"
                    onClick={(event) => {
                      event.stopPropagation();
                      window.open(task.result_file!, '_blank');
                    }}
                  >
                    {!inProgress && <Download fontSize="small" />}
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {/* ✨ CHANGE: Conditional rendering for fetched content */}
                {loadingState[task.id] && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                    <CircularProgress size={24} />
                  </Box>
                )}
                {qaContent[task.id] && !loadingState[task.id] && (
                  qaContent[task.id].length > 0 ? (
                    <Stack spacing={2}>
                      {qaContent[task.id].map(q => (
                        <Box key={q.id}>
                          <Typography variant="subtitle2" component="p" sx={{ fontWeight: 'bold' }}>Q: {q.q}</Typography>
                          <Typography variant="body2" component="p" color="text.secondary">A: {q.a}</Typography>
                        </Box>
                      ))}
                    </Stack>
                  ) : (
                    <Typography color="text.secondary">No Q&A pairs found in this file.</Typography>
                  )
                )}
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      ) : (
         // ... Placeholder Card (no changes) ...
        <Card variant="outlined" sx={{ textAlign: 'center', p: { xs: 3, sm: 5 } }}>
            <AutoAwesome sx={{ fontSize: 50, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" gutterBottom>No Q&A generated yet</Typography>
            <Typography color="text.secondary">
              {fileCount > 0
                ? 'Click the "Generate Q&A" button to create your first set of questions and answers.'
                : 'Upload at least one document first, then you can generate your Q&A.'}
            </Typography>
        </Card>
      )}
    </Stack>
  );
};

export default QaDisplay;