// import { useParams } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export const EventTickets = () => {
  // const { id } = useParams<{ id: string }>();

  // TODO: Fetch tickets and ticket tiers for this event

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Manage Tickets</h1>

      <div className="mb-6">
        <Button>Add Ticket Tier</Button>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-4">Ticket Tiers</h2>
        <p className="text-gray-500">No ticket tiers yet</p>
      </Card>

      <Card className="mt-6">
        <h2 className="text-xl font-semibold mb-4">Ticket Sales</h2>
        <p className="text-gray-500">No tickets sold yet</p>
      </Card>
    </div>
  );
};

