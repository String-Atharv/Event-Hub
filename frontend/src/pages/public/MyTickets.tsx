import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Badge } from '@/components/common/Badge';
import { Button } from '@/components/common/Button';
import { Spinner } from '@/components/feedback/Spinner';
import { ticketsApi, TicketPurchasedDto, QrCodeDetails } from '@/api/endpoints/tickets';
import { formatDate } from '@/utils/formatters';

export const MyTickets = () => {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState<TicketPurchasedDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await ticketsApi.listMyTickets(0, 50);
      setTickets(response.content || []);
    } catch (err: any) {
      console.error('Failed to fetch tickets:', err);
      setError(err.message || 'Failed to load tickets');
    } finally {
      setIsLoading(false);
    }
  };

  // Group tickets by event
  const groupedTickets = tickets.reduce((acc, ticket) => {
    const eventId = ticket.event.id;
    if (!acc[eventId]) {
      acc[eventId] = {
        event: ticket.event,
        tickets: [],
      };
    }
    acc[eventId].tickets.push(ticket);
    return acc;
  }, {} as Record<string, { event: any; tickets: TicketPurchasedDto[] }>);

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (status) {
      case 'PURCHASED':
        return 'success';
      case 'USED':
        return 'info';
      case 'CANCELLED':
        return 'danger';
      case 'EXPIRED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const handleViewTicket = (ticketId: string) => {
    setSelectedTicket(ticketId);
  };

  const handleCloseTicket = () => {
    setSelectedTicket(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-netflix-black">
        <header className="bg-white dark:bg-netflix-dark shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <button
              onClick={() => navigate('/')}
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            >
              ← Back to Home
            </button>
          </div>
        </header>
        <div className="flex justify-center items-center min-h-64 mt-20">
          <Spinner size="lg" />
        </div>
      </div>
    );
  }

  if (selectedTicket) {
    return <TicketDetailsView ticketId={selectedTicket} onClose={handleCloseTicket} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-netflix-black">
      <header className="bg-white dark:bg-netflix-dark shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Home
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Your Tickets</h1>

        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-300">{error}</p>
          </div>
        )}

        {tickets.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">No tickets yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Book your first event to see tickets here</p>
              <Button onClick={() => navigate('/')}>Browse Events</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-8">
            {Object.values(groupedTickets).map(({ event, tickets: eventTickets }) => (
              <Card key={event.id}>
                <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{event.name}</h2>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-400 mt-2">
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    {formatDate(event.startTime, 'PPp')}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {eventTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-400 hover:shadow-md transition-all cursor-pointer bg-white dark:bg-netflix-dark"
                      onClick={() => handleViewTicket(ticket.id)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white">{ticket.ticketType.name}</h3>
                          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">₹{ticket.price}</p>
                        </div>
                        <Badge variant={getStatusVariant(ticket.status)}>
                          {ticket.status}
                        </Badge>
                      </div>

                      <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Ticket ID: {ticket.id.substring(0, 8)}...
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewTicket(ticket.id);
                        }}
                      >
                        View Ticket
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// ============================================================================
// TICKET DETAILS VIEW COMPONENT
// ============================================================================

interface TicketDetailsViewProps {
  ticketId: string;
  onClose: () => void;
}

const TicketDetailsView = ({ ticketId, onClose }: TicketDetailsViewProps) => {
  const [ticketDetails, setTicketDetails] = useState<any>(null);
  const [qrDetails, setQrDetails] = useState<QrCodeDetails | null>(null);
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(true);
  const [isLoadingQr, setIsLoadingQr] = useState(false);
  const [isGeneratingQr, setIsGeneratingQr] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTicketDetails();
    fetchQrDetails();
  }, [ticketId]);

  const fetchTicketDetails = async () => {
    try {
      setIsLoadingTicket(true);
      const details = await ticketsApi.getTicketDetails(ticketId);
      setTicketDetails(details);
    } catch (err: any) {
      console.error('Failed to fetch ticket details:', err);
      setError(err.message || 'Failed to load ticket details');
    } finally {
      setIsLoadingTicket(false);
    }
  };

  const fetchQrDetails = async () => {
    try {
      setIsLoadingQr(true);
      const qr = await ticketsApi.getQrCodeDetails(ticketId);
      setQrDetails(qr);
    } catch (err: any) {
      console.error('Failed to fetch QR details:', err);
      // Don't set error - QR might not exist yet
    } finally {
      setIsLoadingQr(false);
    }
  };

  const handleGenerateQr = async () => {
    try {
      setIsGeneratingQr(true);
      setError(null);

      // Generate QR image
      const blob = await ticketsApi.generateQrCode(ticketId);
      const imageUrl = URL.createObjectURL(blob);
      setQrImage(imageUrl);

      // Refresh QR details
      await fetchQrDetails();
    } catch (err: any) {
      console.error('Failed to generate QR:', err);

      // Parse error messages from backend
      let errorMessage = 'Failed to generate QR code';

      if (err.message) {
        const msg = err.message.toLowerCase();
        if (msg.includes('cancelled')) {
          errorMessage = 'Cannot generate QR code - Ticket has been cancelled';
        } else if (msg.includes('used')) {
          errorMessage = 'Cannot generate QR code - Ticket has already been used';
        } else if (msg.includes('expired')) {
          errorMessage = 'Cannot generate QR code - Ticket has expired';
        } else if (msg.includes('invalid')) {
          errorMessage = 'Cannot generate QR code - Ticket is invalid';
        } else {
          errorMessage = err.message;
        }
      }

      setError(errorMessage);
    } finally {
      setIsGeneratingQr(false);
    }
  };

  const getStatusVariant = (status: string): 'success' | 'warning' | 'danger' | 'info' | 'default' => {
    switch (status) {
      case 'PURCHASED':
        return 'success';
      case 'USED':
        return 'info';
      case 'CANCELLED':
        return 'danger';
      case 'EXPIRED':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getQrStatusVariant = (status: string): 'success' | 'warning' | 'danger' => {
    switch (status) {
      case 'ACTIVE':
        return 'success';
      case 'EXPIRED':
        return 'warning';
      case 'USED':
        return 'danger';
      default:
        return 'warning';
    }
  };

  if (isLoadingTicket) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-netflix-black flex justify-center items-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!ticketDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-netflix-black flex flex-col justify-center items-center">
        <p className="text-red-600 dark:text-red-400 mb-4">Ticket not found</p>
        <Button onClick={onClose}>Back to Tickets</Button>
      </div>
    );
  }

  const canGenerateQr = ticketDetails.status === 'PURCHASED';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-netflix-black">
      <header className="bg-white dark:bg-netflix-dark shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={onClose}
            className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white flex items-center"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Tickets
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <div className="mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  {ticketDetails.ticketType.name}
                </h1>
                <Badge variant={getStatusVariant(ticketDetails.status)}>
                  {ticketDetails.status}
                </Badge>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">₹{ticketDetails.price}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Ticket ID</label>
                <p className="text-gray-900 dark:text-white font-mono">{ticketDetails.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Purchased At</label>
                <p className="text-gray-900 dark:text-white">{formatDate(ticketDetails.purchasedAt, 'PPp')}</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* QR Code Section */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Entry QR Code</h2>

            {!canGenerateQr ? (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-yellow-600 dark:text-yellow-500 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h3 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-1">QR Code Not Available</h3>
                    <p className="text-yellow-800 dark:text-yellow-300 text-sm">
                      {ticketDetails.status === 'CANCELLED' && 'This ticket has been cancelled. QR codes cannot be generated for cancelled tickets.'}
                      {ticketDetails.status === 'USED' && 'This ticket has already been used for entry. QR codes are single-use only.'}
                      {ticketDetails.status === 'EXPIRED' && 'This ticket has expired. QR codes cannot be generated for expired tickets.'}
                      {ticketDetails.status === 'INVALID' && 'This ticket is invalid. QR codes cannot be generated.'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* QR Metadata (Read-only) */}
                {isLoadingQr ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : qrDetails ? (
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">QR Status</p>
                        <Badge variant={getQrStatusVariant(qrDetails.qrCodeStatus)}>
                          {qrDetails.qrCodeStatus}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Public Code</p>
                        <p className="font-mono text-lg font-bold text-gray-900 dark:text-white">{qrDetails.publicCode}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Generated: {formatDate(qrDetails.generatedDateTime, 'PPp')}
                    </p>
                  </div>
                ) : (
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
                    <p className="text-blue-800 dark:text-blue-300">No QR code generated yet. Click below to generate.</p>
                  </div>
                )}

                {/* QR Image Display */}
                {qrImage ? (
                  <div className="text-center">
                    <img
                      src={qrImage}
                      alt="Ticket QR Code"
                      className="mx-auto border-4 border-gray-300 rounded-lg"
                      style={{ width: '300px', height: '300px' }}
                    />
                    {qrDetails && (
                      <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Manual Entry Code:</p>
                        <p className="text-2xl font-bold font-mono text-gray-900 dark:text-white">{qrDetails.publicCode}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <Button
                    onClick={handleGenerateQr}
                    isLoading={isGeneratingQr}
                    className="w-full"
                    size="lg"
                  >
                    {qrDetails?.qrCodeStatus === 'EXPIRED'
                      ? 'Regenerate QR Code'
                      : 'Generate QR Code'}
                  </Button>
                )}

                <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <h3 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">How to use:</h3>
                  <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                    <li>• Click "Generate QR Code" when you arrive at the venue</li>
                    <li>• Show the QR code to the entry scanner</li>
                    <li>• Or provide the manual code to venue staff</li>
                    <li>• QR codes are valid for a limited time</li>
                  </ul>
                </div>
              </>
            )}
          </div>
        </Card>
      </main>
    </div>
  );
};