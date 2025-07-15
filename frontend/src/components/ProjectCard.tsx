'use client';

// ✅ Import CardActions for better button layout
import { Card, CardContent, Typography, Button, CardActions } from '@mui/material';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
}

// ✅ Updated props to include the onDelete function
interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

// ✅ This component now accepts the onDelete prop
export default function ProjectCard({ project, onDelete }: ProjectCardProps) {
  return (
    // Added flex styles to ensure cards have equal height in a row
    <Card sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography variant="h6">{project.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {project.description}
        </Typography>
      </CardContent>

      {/* ✅ Added CardActions to neatly group the buttons */}
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Button
          href={`/dashboard/projects/${project.id}`}
          component={Link}
          size="small"
        >
          Open Project
        </Button>
        {/* ✅ NEW: The Delete Button */}
        <Button
          size="small"
          color="error" // 'error' color makes it red, indicating a destructive action
          onClick={() => onDelete(project.id)}
        >
          Delete
        </Button>
      </CardActions>
    </Card>
  );
}