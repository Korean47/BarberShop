import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Scissors, Home } from 'lucide-react';
import { Button } from '../components/ui/Button';

export function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        {/* Icon */}
        <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-slate-800 flex items-center justify-center">
          <Scissors className="w-12 h-12 text-slate-600" />
        </div>

        {/* 404 */}
        <h1 className="text-7xl font-display font-bold text-gradient mb-4">404</h1>
        <h2 className="text-xl font-semibold text-white mb-3">Page Not Found</h2>
        <p className="text-slate-400 max-w-md mx-auto mb-8">
          Looks like this page got a little too much off the top.
          Let's get you back to familiar territory.
        </p>

        <Link to="/">
          <Button size="lg">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
