import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from './common';

export default function NotFound({ what, to }) {
  const navigate = useNavigate();
  return (
    <Box sx={{ textAlign: 'center', py: 8 }}>
      <EmptyState text={`${what} not found`} />
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>It may have been deleted.</Typography>
      <Button variant="contained" onClick={() => navigate(to)}>Go back</Button>
    </Box>
  );
}
