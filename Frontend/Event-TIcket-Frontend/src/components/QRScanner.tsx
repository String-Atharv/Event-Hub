import { useState, useEffect } from 'react';
import { Scanner } from '@yudiel/react-qr-scanner';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { staffValidationApi } from '@/api/endpoints/staff';
import { TicketValidationResponse } from '@/types';
import { format } from 'date-fns';

interface QRScannerProps {
  onValidationComplete?: (result: TicketValidationResponse) => void;
  onError?: (error: string) => void;
  validatedHistory?: TicketValidationResponse[];
}

export const QRScanner = ({ onValidationComplete, onError, validatedHistory = [] }: QRScannerProps) => {
  const [mode, setMode] = useState<'QR' | 'VALIDATED_ATTENDEES'>('QR');

  // QR State
  const [isValidating, setIsValidating] = useState(false);
  const [scannedResult, setScannedResult] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState('');

  // Debounce scanning to prevent rapid duplicate calls
  useEffect(() => {
    if (scannedResult) {
      handleScanValidation(scannedResult);
      const timer = setTimeout(() => setScannedResult(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [scannedResult]);

  // Handler for QR Scans (hits /scan endpoint)
  const handleScanValidation = async (code: string) => {
    if (!code || isValidating) return;

    try {
      setIsValidating(true);
      const output = await staffValidationApi.validateByQR(code);
      onValidationComplete?.(output);
    } catch (err: any) {
      handleValidationError(err);
    } finally {
      setIsValidating(false);
    }
  };

  // Handler for Manual Entry - typed or selected (hits /manual endpoint)
  const handleManualEntryValidation = async (code: string) => {
    if (!code || isValidating) return;

    try {
      setIsValidating(true);
      const output = await staffValidationApi.validateManually(code);
      onValidationComplete?.(output);
      setManualCode('');
    } catch (err: any) {
      handleValidationError(err);
    } finally {
      setIsValidating(false);
    }
  };

  const handleValidationError = (err: any) => {
    console.error('Validation error:', err);
    let errorMessage = err.message || 'Validation failed';

    if (errorMessage.includes('expired')) {
      errorMessage = "QR code has expired. Please ask attendee to regenerate.";
    } else if (errorMessage.includes('already used')) {
      errorMessage = "Ticket already used or invalid";
    } else if (errorMessage.includes('cancelled')) {
      errorMessage = "Ticket has been cancelled";
    } else if (errorMessage.includes('different event')) {
      errorMessage = "This ticket is for a different event";
    } else if (errorMessage.includes('not found')) {
      errorMessage = "Ticket not found";
    }

    onError?.(errorMessage);
  };


  return (
    <div className="space-y-6">
      {/* Tab Switcher */}
      <div className="flex bg-gray-100 dark:bg-netflix-gray p-1 rounded-lg w-fit mx-auto md:mx-0">
        <button
          onClick={() => { setMode('QR'); }}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'QR'
            ? 'bg-white dark:bg-netflix-dark text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          QR Scanner
        </button>
        <button
          onClick={() => setMode('VALIDATED_ATTENDEES')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${mode === 'VALIDATED_ATTENDEES'
            ? 'bg-white dark:bg-netflix-dark text-gray-900 dark:text-white shadow-sm'
            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
        >
          View Validated Attendees
        </button>
      </div>

      <Card className="p-6">
        {mode === 'QR' ? (
          <div className="space-y-4">
            <div className="aspect-square bg-gray-900 rounded-lg overflow-hidden relative max-w-sm mx-auto">
              <Scanner
                onScan={(results) => {
                  if (results && results.length > 0) {
                    if (results[0].rawValue !== scannedResult) {
                      setScannedResult(results[0].rawValue);
                    }
                  }
                }}
                onError={(error: any) => console.log(error?.message)}
              />
              {isValidating && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-white z-10">
                  Validating...
                </div>
              )}
              {/* Scan Area Overlay */}
              <div className="absolute inset-0 border-2 border-white/30 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-cyan-500 rounded-lg"></div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Point camera at ticket QR code
            </p>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200 dark:border-gray-800"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-netflix-dark text-gray-500 dark:text-gray-400">Or enter code manually</span>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Use manual entry handler (hits /manual)
                handleManualEntryValidation(manualCode);
              }}
              className="flex gap-2"
            >
              <Input
                placeholder="Enter code (e.g. 8x29b...)"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                className="flex-1"
              />
              <Button
                type="submit"
                disabled={!manualCode.trim() || isValidating}
                isLoading={isValidating}
              >
                Validate
              </Button>
            </form>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">Validated Attendees</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Total: {validatedHistory.length} attendee{validatedHistory.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {/* Attendees List */}
            {validatedHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-12 h-12 bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-full flex items-center justify-center mb-3">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-sm">No validated attendees yet</p>
                <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Scan tickets to see them here</p>
              </div>
            ) : (
              <div className="border border-gray-100 dark:border-gray-800 rounded-lg divide-y divide-gray-100 dark:divide-gray-800 max-h-[400px] overflow-y-auto">
                {validatedHistory.map((attendee, index) => (
                  <div
                    key={attendee.validationId || index}
                    className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{attendee.attendeeName}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{attendee.ticketTypeName}</p>
                      </div>
                      <div className="text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                          Validated
                        </span>
                        <p className="text-xs text-gray-400 dark:text-gray-400 mt-1">
                          {format(new Date(attendee.validatedAt || new Date()), 'h:mm a')}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
};