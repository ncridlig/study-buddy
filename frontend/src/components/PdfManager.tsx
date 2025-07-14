// src/components/PdfManager.tsx
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Stack,
  Divider,
} from '@mui/material';
import { UploadFile, Delete, PictureAsPdf } from '@mui/icons-material';
import { PdfFile } from '@/types';

interface PdfManagerProps {
  files: PdfFile[];
  onUpload: () => void;
  onDelete: (fileId: string) => void;
  isLoading: boolean;
  isUploading: boolean;
}

const PdfManager = ({ files, onUpload, onDelete, isLoading, isUploading }: PdfManagerProps) => {
  return (
    <Card variant="outlined" sx={{ height: 'fit-content' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" component="h2">
            Source Files
          </Typography>
          {isUploading && <CircularProgress size={24} />}
        </Stack>

        <Button
          variant="contained"
          color="primary"
          startIcon={<UploadFile />}
          onClick={onUpload}
          disabled={isUploading}
          fullWidth
        >
          Upload Document
        </Button>
      </CardContent>
      <Divider />
      <Box sx={{ maxHeight: { md: 'calc(100vh - 300px)' }, overflowY: 'auto' }}>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : files.length > 0 ? (
          <List dense>
            {files.map((file) => (
              <ListItem
                key={file.id}
                secondaryAction={
                  <IconButton edge="end" aria-label="delete" onClick={() => onDelete(file.id)}>
                    <Delete />
                  </IconButton>
                }
              >
                <PictureAsPdf sx={{ mr: 1.5, color: 'text.secondary' }} />
                <ListItemText
                  primary={file.filename}
                  primaryTypographyProps={{
                    noWrap: true,
                    sx: { fontWeight: 500 },
                  }}
                />
              </ListItem>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="text.secondary" sx={{ p: 3, textAlign: 'center' }}>
            Upload a document to get started.
          </Typography>
        )}
      </Box>
    </Card>
  );
};

export default PdfManager;