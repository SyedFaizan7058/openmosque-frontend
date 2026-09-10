import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-primary-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">🕌</span>
              </div>
              <span className="text-xl font-bold text-primary-600 dark:text-primary-400">OpenMosque</span>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Connecting Muslim communities through mosque discovery, prayer times, and shared events.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Discover</h3>
            <ul className="space-y-2">
              <li><Link to="/mosques" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400">Find Mosques</Link></li>
              <li><Link to="/mosques/add" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400">Add a Mosque</Link></li>
              <li><Link to="/mosques?sort=popular" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400">Popular Mosques</Link></li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Community</h3>
            <ul className="space-y-2">
              <li><Link to="/events" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400">Events</Link></li>
              <li><Link to="/announcements" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400">Announcements</Link></li>
              <li><Link to="/jumah" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400">Jumu'ah Guide</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4">Support</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400">About Us</Link></li>
              <li><Link to="/contact" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400">Contact</Link></li>
              <li><Link to="/privacy" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400">Privacy Policy</Link></li>
              <li><Link to="/terms" className="text-sm text-gray-500 hover:text-primary-600 dark:text-gray-400">Terms of Service</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            © {new Date().getFullYear()} OpenMosque. All rights reserved.
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 flex items-center gap-1">
            Made with <Heart size={14} className="text-red-500 fill-red-500" /> for the Ummah
          </p>
        </div>
      </div>
    </footer>
  );
}
