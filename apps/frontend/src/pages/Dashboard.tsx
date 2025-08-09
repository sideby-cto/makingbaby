import { Box } from '../design-system';
import { Button } from '@mui/material';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <Box className="p-4">
      <h2 className="text-2xl font-bold mb-4">Dashboard</h2>
      <p>Welcome to the dashboard!</p>
      <Button className="mt-4" component={Link} to="/login" variant="outlined">
        Log out
      </Button>
    </Box>
  );
};

export default Dashboard;
