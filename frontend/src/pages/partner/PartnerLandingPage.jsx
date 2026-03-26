import { Link } from 'react-router-dom';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const PartnerLandingPage = () => {
  return (
    <div className="page-container space-y-6">
      <section className="panel brand-gradient text-white">
        <p className="badge border-white/20 bg-white/10 text-white">Partner Program</p>
        <h1 className="mt-3 text-3xl font-bold">Grow with FoodFlow</h1>
        <p className="mt-2 max-w-3xl text-sm text-white/85">
          Join thousands of restaurants and riders delivering faster, smarter, and with predictable earnings.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="space-y-3">
          <h2 className="text-2xl font-bold text-ink-900">Restaurant Partner</h2>
          <p className="text-sm text-ink-500">
            Get more orders with featured listings, smart delivery assignment, and live order management.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-600">
            <li>Real-time order dashboard</li>
            <li>Menu and pricing controls</li>
            <li>Growth and promo visibility</li>
          </ul>
          <Button as={Link} to="/partner/register/restaurant" className="w-full">
            Join as Restaurant
          </Button>
        </Card>

        <Card className="space-y-3">
          <h2 className="text-2xl font-bold text-ink-900">Rider Partner</h2>
          <p className="text-sm text-ink-500">
            Earn with flexible delivery slots, route visibility, and easy payout-friendly order tracking.
          </p>
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-600">
            <li>Live delivery queue</li>
            <li>Location updates on map</li>
            <li>Status controls per order</li>
          </ul>
          <Button as={Link} to="/partner/register/rider" className="w-full">
            Join as Rider
          </Button>
        </Card>
      </section>
    </div>
  );
};
