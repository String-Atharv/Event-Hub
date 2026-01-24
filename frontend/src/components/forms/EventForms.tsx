import { useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { 
  EventCreatedResponseDto, 
  ListEventResponseDto
} from '@/api/endpoints/events';

// ============================================================================
// FORM DATA TYPES
// ============================================================================

interface TicketTypeFormData {
  id?: number;
  name: string;
  price: number;
  description?: string;
  totalAvailable?: number;
}

interface EventFormData {
  name: string;
  description: string;
  venue: string;
  eventType:string;
  startTime: string;
  endTime: string;
  salesStartDate?: string;
  salesEndDate?: string;
  ticketTypes: TicketTypeFormData[];
}

// ============================================================================
// COMPONENT PROPS
// ============================================================================

interface EventFormProps {
  mode: 'create' | 'edit';
  initialData?: EventCreatedResponseDto | ListEventResponseDto;
  onSubmit: (data: EventFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

// ============================================================================
// EVENT FORM COMPONENT
// ============================================================================

export const EventForm = ({ 
  mode, 
  initialData, 
  onSubmit, 
  onCancel,
  isLoading = false 
}: EventFormProps) => {
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<EventFormData>({
    defaultValues: {
      name: '',
      description: '',
      venue: '',
      eventType:'',
      startTime: '',
      endTime: '',
      salesStartDate: '',
      salesEndDate: '',
      ticketTypes: [
        {
          name: '',
          price: 0,
          description: '',
          totalAvailable: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketTypes',
  });

  // Helper function to safely get ticket type description
  const getTicketDescription = (ticket: any): string => {
    // Check if ticket has description property
    if ('description' in ticket && typeof ticket.description === 'string') {
      return ticket.description;
    }
    return '';
  };

  // Helper function to safely get ticket type totalAvailable
  const getTicketTotalAvailable = (ticket: any): number | undefined => {
    // Check if ticket has totalAvailable property
    if ('totalAvailable' in ticket && ticket.totalAvailable !== undefined) {
      return ticket.totalAvailable;
    }
    return undefined;
  };

  // Populate form with initial data in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      reset({
        name: initialData.name,
        description: initialData.description,
        venue: initialData.venue,
        eventType: initialData.eventType,
        startTime: formatDateTimeForInput(initialData.startTime),
        endTime: formatDateTimeForInput(initialData.endTime),
        salesStartDate: initialData.salesStartDate ? formatDateTimeForInput(initialData.salesStartDate) : '',
        salesEndDate: initialData.salesEndDate ? formatDateTimeForInput(initialData.salesEndDate) : '',
        ticketTypes: (initialData.ticketTypes || []).map(tt => ({
          id: tt.id,
          name: tt.name,
          price: tt.price,
          description: getTicketDescription(tt),
          totalAvailable: getTicketTotalAvailable(tt),
        })),
      });
    }
  }, [mode, initialData, reset]);

  // Format datetime for backend
  const formatDateForBackend = (dateString?: string): string | undefined => {
    if (!dateString || dateString.trim() === '') return undefined;
    
    // If time format is YYYY-MM-DDTHH:mm, add :00 seconds
    if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
      return `${dateString}:00`;
    }
    
    return dateString;
  };

  const handleFormSubmit = async (data: EventFormData) => {
    // Format dates for backend
    const formattedData: EventFormData = {
      ...data,
      startTime: formatDateForBackend(data.startTime) || '',
      endTime: formatDateForBackend(data.endTime) || '',
      salesStartDate: formatDateForBackend(data.salesStartDate),
      salesEndDate: formatDateForBackend(data.salesEndDate),
      ticketTypes: data.ticketTypes.map(ticket => ({
        ...ticket,
        price: Number(ticket.price),
        totalAvailable: ticket.totalAvailable ? Number(ticket.totalAvailable) : undefined
      }))
    };

    await onSubmit(formattedData);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
        
        <div className="space-y-4">
          <Input
            label="Event Name *"
            {...register('name', { required: 'Event name is required' })}
            error={errors.name?.message}
            placeholder="Enter event name"
          />

<div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        Event Type *
      </label>
      <select
        {...register('eventType', { required: 'Event type is required' })}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
          errors.eventType ? 'border-red-500' : 'border-gray-300'
        }`}
      >
        <option value="">Select event type</option>
        <option value="PERFORMANCES">Performances</option>
        <option value="EXPERIENCES">Experiences</option>
        <option value="PARTIES">Parties</option>
        <option value="SPORTS">Sports</option>
        <option value="CONFERENCES">Conferences</option>
      </select>
      {errors.eventType && (
        <p className="mt-1 text-sm text-red-600">
          {errors.eventType.message}
        </p>
      )}
    </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
              placeholder="Describe your event"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

          <Input
            label="Venue *"
            {...register('venue', { required: 'Venue is required' })}
            error={errors.venue?.message}
            placeholder="Enter venue location"
          />
        </div>
      </Card>

      {/* Event Timing */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Event Timing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Event Start Time *"
            type="datetime-local"
            {...register('startTime', { required: 'Start time is required' })}
            error={errors.startTime?.message}
          />
          
          <Input
            label="Event End Time *"
            type="datetime-local"
            {...register('endTime', { required: 'End time is required' })}
            error={errors.endTime?.message}
          />
        </div>
      </Card>

      {/* Sales Period */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Ticket Sales Period</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Sales Start Date"
            type="datetime-local"
            {...register('salesStartDate')}
            error={errors.salesStartDate?.message}
          />
          
          <Input
            label="Sales End Date"
            type="datetime-local"
            {...register('salesEndDate')}
            error={errors.salesEndDate?.message}
          />
        </div>
        <p className="text-sm text-gray-500 mt-2">
          If sales dates are not specified, event will be saved as DRAFT
        </p>
      </Card>

      {/* Ticket Types */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Ticket Types *</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                name: '',
                price: 0,
                description: '',
                totalAvailable: 0,
              })
            }
          >
            + Add Ticket Type
          </Button>
        </div>

        <div className="space-y-6">
          {fields.map((field, index) => (
            <div key={field.id} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-medium text-gray-900">
                  Ticket Type {index + 1}
                  {field.id && <span className="text-xs text-gray-500 ml-2">(ID: {field.id})</span>}
                </h3>
                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Ticket Name *"
                  {...register(`ticketTypes.${index}.name`, {
                    required: 'Ticket name is required',
                  })}
                  error={errors.ticketTypes?.[index]?.name?.message}
                  placeholder="e.g., General Admission"
                />

                <Input
                  label="Price *"
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(`ticketTypes.${index}.price`, {
                    required: 'Price is required',
                    valueAsNumber: true,
                    min: { value: 0, message: 'Price cannot be negative' },
                  })}
                  error={errors.ticketTypes?.[index]?.price?.message}
                  placeholder="0.00"
                />

                <Input
                  label="Total Available"
                  type="number"
                  min="0"
                  {...register(`ticketTypes.${index}.totalAvailable`, {
                    valueAsNumber: true,
                    min: { value: 0, message: 'Cannot be negative' },
                  })}
                  error={errors.ticketTypes?.[index]?.totalAvailable?.message}
                  placeholder="Leave empty for unlimited"
                />

                <div className="md:col-span-2">
                  <Input
                    label="Description (Optional)"
                    {...register(`ticketTypes.${index}.description`)}
                    placeholder="Ticket description"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {fields.length === 0 && (
          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg mt-4">
            <p className="text-gray-500 mb-2">No ticket types added</p>
            <p className="text-sm text-gray-400 mb-4">Events need at least one ticket type</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: '', price: 0, description: '', totalAvailable: 0 })}
            >
              Add First Ticket Type
            </Button>
          </div>
        )}
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {mode === 'create' ? 'Create Event' : 'Update Event'}
        </Button>
      </div>
    </form>
  );
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Format ISO-8601 datetime to datetime-local input format
 * @param isoString ISO-8601 datetime string
 * @returns Formatted string for datetime-local input (YYYY-MM-DDTHH:mm)
 */
function formatDateTimeForInput(isoString?: string): string {
  if (!isoString) return '';
  
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return '';
  
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}