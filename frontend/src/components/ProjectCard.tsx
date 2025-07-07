'use client';

// Note: Grid is no longer needed here
import { Card, CardContent, Typography, Button } from '@mui/material';
import Link from 'next/link';

interface Project {
  id: string;
  title: string;
  description: string;
}

interface ProjectCardProps {
  project: Project;
}

// This component now only returns the Card, without the Grid wrapper.
export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6">{project.title}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {project.description}
        </Typography>
        <Button
          href={`/dashboard/projects/${project.id}`}
          component={Link}
          size="small"
          sx={{ mt: 1 }}
        >
          Open Project
        </Button>
      </CardContent>
    </Card>
  );
}