import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  CircularProgress,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { PdfFile } from '@/types';

interface PdfSidebarProps {
  files: PdfFile[];
  onUpload: () => void;
  onDelete: (fileId: string) => void;
  isLoading: boolean;
  isUploading: boolean;
}

export default function PdfSidebar({ files, onUpload, onDelete, isLoading, isUploading }: PdfSidebarProps) {
  return (
    <Box
      sx={{
        width: { xs: '100%', md: 280 },
        borderRight: { xs: 'none', md: '1px solid #ddd' },
        borderBottom: { xs: '1px solid #ddd', md: 'none' },
        p: 2,
        m: { xs: 0, md: 3 },
        overflowY: 'auto',
      }}
    >
      <Typography variant="h6" gutterBottom>
        Project Files
      </Typography>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
        </Box>
      ) : (
        <List>
          {files.map((file) => (
            <ListItem
              key={file.id}
              secondaryAction={
                <IconButton edge="end" onClick={() => onDelete(file.id)} aria-label="delete">
  <DeleteIcon />
</IconButton>
              }
            >
              <ListItemText primary={file.filename} />
            </ListItem>
          ))}
        </List>
      )}

      <Button
        fullWidth
        variant="outlined"
        startIcon={isUploading ? <CircularProgress size={20} /> : <UploadFileIcon />}
        sx={{ mt: 2 }}
        onClick={onUpload}
        disabled={isUploading}
      >
        {isUploading ? 'Uploading...' : 'Upload PDF'}
      </Button>
    </Box>
  );
}