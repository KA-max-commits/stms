import React from 'react';
import { Box, Typography, Avatar } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import PlaceIcon from '@mui/icons-material/Place';

/** Visual route timeline: School → Pickup 1 → … → Pickup N → School */
export default function RouteSequence({ route, points, studentCounts = {} }) {
  const sorted = [...points].sort((a, b) => a.pickupTime.localeCompare(b.pickupTime));
  const nodes = [
    { key: 'start', label: 'School', sub: route.departureTime, school: true },
    ...sorted.map((p, i) => ({ key: p.id, label: p.name, sub: p.pickupTime, extra: studentCounts[p.id] !== undefined ? `${studentCounts[p.id]} students` : p.code, n: i + 1 })),
    { key: 'end', label: 'School', sub: route.returnTime, school: true },
  ];
  return (
    <Box sx={{ overflowX: 'auto', pb: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', minWidth: nodes.length * 130 }}>
        {nodes.map((n, i) => (
          <React.Fragment key={n.key + i}>
            <Box className="anim-in" style={{ '--i': i }} sx={{ textAlign: 'center', width: 110, flexShrink: 0 }}>
              <Avatar sx={{ mx: 'auto', mb: 0.75, bgcolor: n.school ? 'primary.main' : 'secondary.main', color: '#fff', boxShadow: 3, width: 44, height: 44 }}>
                {n.school ? <SchoolIcon /> : <PlaceIcon />}
              </Avatar>
              <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.2 }}>{n.label}</Typography>
              <Typography variant="caption" color="text.secondary" display="block">{n.sub}</Typography>
              {n.extra && <Typography variant="caption" color="text.disabled">{n.extra}</Typography>}
            </Box>
            {i < nodes.length - 1 && <Box sx={{ flex: 1, minWidth: 24, display: 'flex', alignItems: 'center', height: 44, color: 'primary.main' }}><Box className="route-line" /></Box>}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}
