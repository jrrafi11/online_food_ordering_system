import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';

export const NotFoundPage = () => {
  return (
    <div className="page-container">
      <div className="panel text-center">
        <p className="badge">404</p>
        <h1 className="mt-3 text-3xl font-bold text-ink-900">Page not found</h1>
        <p className="mt-2 text-sm text-ink-500">The page you requested does not exist or was moved.</p>
        <Button as={Link} to="/" className="mt-4">
          Back to Home
        </Button>
      </div>
    </div>
  );
};
