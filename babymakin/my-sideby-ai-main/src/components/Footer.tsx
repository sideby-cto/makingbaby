
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="w-full bg-gradient-to-r from-purple-50 via-purple-100 to-purple-50 border-t border-purple-200">
      <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between">
          <div className="mb-2 md:mb-0">
            <p className="text-xs text-gray-500">© {new Date().getFullYear()} sideby. All rights reserved.</p>
          </div>
          <div className="flex space-x-4 text-xs text-gray-500">
            <Link to="/terms" className="hover:text-gray-700">Terms of Use</Link>
            <Link to="/policy" className="hover:text-gray-700">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
