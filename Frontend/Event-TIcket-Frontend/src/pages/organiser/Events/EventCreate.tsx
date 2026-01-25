import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { Card } from '@/components/common/Card';
import { eventsApi, CreateEventDto } from '@/api/endpoints/events';

interface TicketTypeFormData {
  name: string;
  price: number;
  description?: string;
  totalAvailable?: number;
}

interface EventFormData {
  name: string;
  description: string;
  startTime: string;
  endTime: string;
  venue: string;
  eventType: string;
  salesStartDate?: string;
  salesEndDate?: string;
  ticketTypes: TicketTypeFormData[];
}

export const EventCreate = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting }
  } = useForm<EventFormData>({
    defaultValues: {
      name: '',
      description: '',
      startTime: '',
      endTime: '',
      venue: '',
      eventType: '',
      salesStartDate: '',
      salesEndDate: '',
      ticketTypes: [{ name: 'General Admission', price: 0, totalAvailable: 100 }]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketTypes'
  });

  // Format date to include seconds for backend
  const formatDateForBackend = (dateString?: string): string | undefined => {
    if (!dateString || dateString.trim() === '') return undefined;

    // If time format is YYYY-MM-DDTHH:mm, add :00 seconds
    if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
      return `${dateString}:00`;
    }

    return dateString;
  };

  const onSubmit = async (data: EventFormData) => {
    try {
      // Prepare payload matching backend DTO
      const payload: CreateEventDto = {
        name: data.name,
        description: data.description,
        startTime: formatDateForBackend(data.startTime) || '',
        endTime: formatDateForBackend(data.endTime) || '',
        venue: data.venue,
        eventType: data.eventType,
        salesStartDate: data.salesStartDate ? formatDateForBackend(data.salesStartDate) : undefined,
        salesEndDate: data.salesEndDate ? formatDateForBackend(data.salesEndDate) : undefined,
        ticketTypes: data.ticketTypes.map(ticket => ({
          name: ticket.name,
          price: Number(ticket.price),
          description: ticket.description || '',
          totalAvailable: ticket.totalAvailable ? Number(ticket.totalAvailable) : undefined
        }))
      };

      console.log('Creating event with payload:', payload);

      // Call API
      const response = await eventsApi.create(payload);
      console.log('Event created:', response);

      // Navigate to event details
      navigate(`/events/${response.id}`);
    } catch (error) {
      console.error('Failed to create event:', error);
      alert('Failed to create event. Please check the form data.');
    }
  };

  const addTicketType = () => {
    append({ name: '', price: 0 });
  };

  const removeTicketType = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Create Event</h1>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Event Name */}
          <Input
            label="Event Name *"
            {...register('name', { required: 'Event name is required' })}
            error={errors.name?.message}
            placeholder="Enter event name"
          />

          {/* Event Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-netflix-gray text-gray-900 dark:text-white"
              rows={4}
              placeholder="Describe your event"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description.message}</p>
            )}
          </div>

          {/* Event Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Start Time *"
              type="datetime-local"
              {...register('startTime', { required: 'Start time is required' })}
              error={errors.startTime?.message}
            />
            <Input
              label="End Time *"
              type="datetime-local"
              {...register('endTime', { required: 'End time is required' })}
              error={errors.endTime?.message}
            />
          </div>

          {/* Venue */}
          <Input
            label="Venue *"
            {...register('venue', { required: 'Venue is required' })}
            error={errors.venue?.message}
            placeholder="Enter venue address"
          />

          {/* Event Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Event Type *
            </label>
            <select
              {...register('eventType', { required: 'Event type is required' })}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white dark:bg-netflix-gray text-gray-900 dark:text-white ${errors.eventType ? 'border-red-500' : 'border-gray-300 dark:border-gray-700'
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
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.eventType.message}
              </p>
            )}
          </div>


          {/* Sales Period */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Ticket Sales Period</h3>
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
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              If not specified, event will be saved as DRAFT
            </p>
          </div>

          {/* Ticket Types */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ticket Types *</h3>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addTicketType}
              >
                + Add Ticket Type
              </Button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-netflix-gray">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">Ticket Type {index + 1}</h4>
                  {fields.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => removeTicketType(index)}
                    >
                      Remove
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <Input
                    label="Ticket Type Name *"
                    {...register(`ticketTypes.${index}.name`, {
                      required: 'Ticket type name is required'
                    })}
                    error={errors.ticketTypes?.[index]?.name?.message}
                    placeholder="e.g., General Admission, VIP"
                  />
                  <Input
                    label="Price *"
                    type="number"
                    step="0.01"
                    min="0"
                    {...register(`ticketTypes.${index}.price`, {
                      required: 'Price is required',
                      valueAsNumber: true,
                      min: { value: 0, message: 'Price cannot be negative' }
                    })}
                    error={errors.ticketTypes?.[index]?.price?.message}
                    placeholder="0.00"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Description"
                    {...register(`ticketTypes.${index}.description`)}
                    placeholder="Optional description"
                  />
                  <Input
                    label="Total Available"
                    type="number"
                    min="0"
                    {...register(`ticketTypes.${index}.totalAvailable`, {
                      valueAsNumber: true,
                      min: { value: 0, message: 'Cannot be negative' }
                    })}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>
            ))}

            {fields.length === 0 && (
              <div className="text-center py-8 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg">
                <p className="text-gray-500 dark:text-gray-400 mb-2">No ticket types added</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Events need at least one ticket type</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTicketType}
                >
                  Add First Ticket Type
                </Button>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/events')}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};