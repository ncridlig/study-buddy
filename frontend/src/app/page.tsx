// 'use client';
// import React from 'react';
// import Container from '@mui/material/Container';
// import Typography from '@mui/material/Typography';
// import Button from '@mui/material/Button';
// import Stack from '@mui/material/Stack';
// import Box from '@mui/material/Box';

// import Link from 'next/link';

// export default function HomePage() {
//   return (
//     <Container maxWidth="md" sx={{ textAlign: 'center', py: 10 }}>
//       {/* Hero Section */}
//       <Typography variant="h2" fontWeight="bold" gutterBottom>
//         Meet Your Study Buddy
//       </Typography>

//       <Typography variant="h5" color="text.secondary" paragraph>
//         Turn your PDFs into smart Q&A guides and export to Anki — powered by LLMs and built for students.
//       </Typography>

//       <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
//         <Button variant="contained" color="primary" size="large" component={Link} href="/signup">
//           Get Started
//         </Button>
//         <Button variant="outlined" color="secondary" size="large" component={Link} href="/login">
//           Log In
//         </Button>
//       </Stack>

//       {/* Feature Section */}
//       <Box mt={10} textAlign="left">
//         <Typography variant="h4" gutterBottom>
//           📚 How it works
//         </Typography>
//         <Typography variant="body1" paragraph>
//           1. Upload your PDF course material.
//         </Typography>
//         <Typography variant="body1" paragraph>
//           2. We process it with advanced AI (Mistral, Qwen, etc.) to generate Question <-> Answer pairs.
//         </Typography>
//         <Typography variant="body1" paragraph>
//           3. Download your custom study guide — or export it directly into Anki.
//         </Typography>
//       </Box>
//     </Container>
//   );
// }

'use client';

import React from 'react';
import { Container, Button, Typography, Stack, Box } from '@mui/material';
import Link from 'next/link';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', py: 10 }}>
      <Typography>Testing terraform 5</Typography>
      <Typography variant="h2" fontWeight="bold" gutterBottom>
        Meet Your Study Buddy
      </Typography>

      <Typography variant="h5" color="text.secondary" paragraph>
        Turn your PDFs into smart Q&A guides and export to Anki — powered by LLMs and built for students.
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
        <Button variant="contained" color="primary" size="large" component={Link} href="/signup">
          Get Started
        </Button>
        <Button variant="outlined" color="secondary" size="large" component={Link} href="/login">
          Log In
        </Button>
      </Stack>

      <Box mt={10} textAlign="left">
        <Typography variant="h4" gutterBottom>
          📚 How it works
        </Typography>
        <Typography variant="body1" paragraph>
          1. Upload your PDF course material.
        </Typography>
        <Typography variant="body1" paragraph>
          2. Our AI processes it into question answer pairs.
        </Typography>
        <Typography variant="body1" paragraph>
          3. Download your guide or export it to Anki.
        </Typography>
      </Box>
    </Container>
  );
}

