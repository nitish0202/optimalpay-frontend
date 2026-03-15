import { Link, useNavigate } from 'react-router-dom';
import { CreditCard, ShoppingBag, Trophy, Lock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Footer } from '../components/layout/Footer';

export function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <span className="font-semibold text-navy text-lg">OptimalPay</span>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-600 hover:text-navy">Log in</Link>
            <Button size="sm" onClick={() => navigate('/signup')}>Get Started</Button>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-navy leading-tight mb-5">
            Find your best card<br className="hidden sm:block" /> in seconds.
          </h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
            Enter a purchase. We show you exactly which card in your wallet earns the most —
            with clear reasoning.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" onClick={() => navigate('/signup')}>
              Get Started — Free
            </Button>
            <Button size="lg" variant="secondary" onClick={() => navigate('/login')}>
              Already have an account? Log in
            </Button>
          </div>
        </section>

        {/* Reward example */}
        <section className="bg-blue-50 border-y border-blue-100 py-10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
            <p className="text-sm font-semibold text-brand uppercase tracking-wide mb-3">Example</p>
            <p className="text-navy text-base sm:text-lg">
              On a <strong>₹1,700 Swiggy order</strong> — Axis ACE earns{' '}
              <span className="text-green-700 font-semibold">₹85 cashback (5%)</span>.
              HDFC Millennia earns <span className="text-gray-600">₹34 (2%)</span>.
              That's a <strong>2.5× difference</strong>.
            </p>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-2xl font-bold text-navy text-center mb-10">How it works</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: CreditCard, title: 'Add your cards', desc: 'Select the cards you own from our catalogue of 46 Indian credit cards.' },
              { icon: ShoppingBag, title: 'Enter a purchase', desc: "Tell us where you're shopping and the amount — merchant, category, or both." },
              { icon: Trophy, title: 'See the winner', desc: 'We rank every card in your wallet and show you exactly which earns the most.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex flex-col items-center text-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <Icon className="text-brand" size={22} />
                </div>
                <h3 className="font-semibold text-navy">{title}</h3>
                <p className="text-sm text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Trust strip */}
        <section className="bg-gray-50 border-y border-gray-200 py-8">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
            <Lock className="text-navy flex-shrink-0" size={20} />
            <p className="text-navy font-medium">
              No card numbers. No account access. Just your card names.
            </p>
          </div>
        </section>

        {/* Supported banks */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 text-center">
          <p className="text-sm text-gray-500 mb-4">Supported banks</p>
          <div className="flex flex-wrap justify-center gap-4 text-navy font-semibold text-sm mb-4">
            {['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'SBI Card', 'Kotak', 'AmEx'].map((b) => (
              <span key={b} className="px-4 py-2 border border-gray-200 rounded-lg bg-white">{b}</span>
            ))}
          </div>
          <p className="text-sm text-gray-500">46 cards from India's top banks.</p>
        </section>

        {/* CTA bottom */}
        <section className="bg-navy text-white py-14 text-center">
          <h2 className="text-2xl font-bold mb-3">Start saving on every transaction.</h2>
          <p className="text-blue-200 mb-6 text-sm">Free. No card details needed. Ready in 2 minutes.</p>
          <Button size="lg" className="bg-white !text-navy hover:bg-blue-50" onClick={() => navigate('/signup')}>
            Get Started — Free
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
