import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="border-t border-gray-200 py-6 mt-auto">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm text-gray-500">OptimalPay © 2026</p>
        <div className="flex gap-5 text-sm text-gray-500">
          <Link to="/privacy" className="hover:text-navy">Privacy Policy</Link>
          <Link to="/terms" className="hover:text-navy">Terms</Link>
          <a href="mailto:hello@optimalpay.in" className="hover:text-navy">Contact</a>
        </div>
      </div>
    </footer>
  );
}
