'use client';

import React, { useEffect, useState } from 'react';
import {
  Container,
  Button,
  Typography,
  Stack,
  Box,
} from '@mui/material';
import Link from 'next/link';
import Cookies from 'js-cookie';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    const token = Cookies.get('access_token');
    if (token) {
      setIsLoggedIn(true);
      // Optional: decode token or fetch user details here
      const nameFromCookie = Cookies.get('user_name'); // Replace this with real logic
      setUserName(nameFromCookie || 'there');
    }
  }, []);

  return (
    <Container maxWidth="md" sx={{ textAlign: 'center', py: 10 }}>
      <Typography variant="h2" fontWeight="bold" gutterBottom>
        {isLoggedIn ? `Hello, ${userName}!` : 'Meet Your Study Buddy'}
      </Typography>

      <Typography variant="h5" color="text.secondary" paragraph>
        Turn your PDFs into smart Q&A guides and export to Anki — powered by LLMs and built for students.
      </Typography>

      <Stack direction="row" spacing={2} justifyContent="center" mt={4}>
        {isLoggedIn ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            component={Link}
            href="/dashboard"
          >
            Go to Dashboard
          </Button>
        ) : (
          <>
            <Button
              variant="contained"
              color="primary"
              size="large"
              component={Link}
              href="/signup"
            >
              Get Started
            </Button>
            <Button
              variant="outlined"
              color="secondary"
              size="large"
              component={Link}
              href="/login"
            >
              Log In
            </Button>
          </>
        )}
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
