'use client';

import { Box, Typography, Card, CardContent, Button } from '@mui/material';
import Grid from '@mui/material/Grid';

import Link from 'next/link';

const mockProjects = [
  { id: '1', title: 'Biology Notes' },
  { id: '2', title: 'Math Summary' },
];

export default function ProjectList() {
  return (
    <Box sx={{ p: 3, m: 7 }}>
      <Typography variant="h4" gutterBottom>
        Your Projects
      </Typography>

      <Grid container spacing={2}>
        {mockProjects.map((project) => (
          <Grid key={project.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{project.title}</Typography>
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
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
