import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Card } from '@/components/common/Card';
import { Spinner } from '@/components/feedback/Spinner';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { eventsApi, UpdateEventDto, UpdateTicketTypeRequestDto } from '@/api/endpoints/events';
import apiClient from '@/api/client';

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
  startTime: string;
  endTime: string;
  venue: string;
  eventType: string;
  salesStartDate?: string;
  salesEndDate?: string;
  ticketTypes: TicketTypeFormData[];
}

export const EventEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track IDs of ticket types that were deleted
  const [deletedTicketTypeIds, setDeletedTicketTypeIds] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
    watch
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
      ticketTypes: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'ticketTypes'
  });

  // Watch ticket types to track changes
  const currentTicketTypes = watch('ticketTypes');

  const formatForInput = (isoString?: string): string => {
    if (!isoString) return '';

    try {
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return '';

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  const formatForBackend = (dateString?: string): string | undefined => {
    if (!dateString || dateString.trim() === '') return undefined;

    if (dateString.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/)) {
      return `${dateString}:00`;
    }

    return dateString;
  };

  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError('Event ID is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        console.log('Fetching event:', id);
        const eventData = await eventsApi.getById(id);
        console.log('Event data received:', eventData);

        // Store original ticket type IDs
        const originalIds = (eventData.ticketTypes || [])
          .map(ticket => ticket.id)
          .filter((id): id is number => id !== undefined);

        console.log('Original ticket type IDs:', originalIds);

        reset({
          name: eventData.name || '',
          description: eventData.description || '',
          startTime: formatForInput(eventData.startTime),
          endTime: formatForInput(eventData.endTime),
          venue: eventData.venue || '',
          eventType: eventData.eventType || '',
          salesStartDate: formatForInput(eventData.salesStartDate),
          salesEndDate: formatForInput(eventData.salesEndDate),
          ticketTypes: (eventData.ticketTypes || []).map(ticket => ({
            id: ticket.id,
            name: ticket.name,
            price: ticket.price,
            description: ticket.description || '',
            totalAvailable: ticket.totalAvailable
          }))
        });

      } catch (err: any) {
        console.error('Failed to fetch event:', err);
        setError(err.message || 'Failed to load event');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvent();
  }, [id, reset]);

  const addTicketType = () => {
    append({ name: '', price: 0, totalAvailable: 100 });
  };

  const removeTicketType = (index: number) => {
    const ticketTypeToRemove = currentTicketTypes[index];

    // If this ticket type has an ID (exists in database), track it for deletion
    if (ticketTypeToRemove?.id) {
      console.log('Marking ticket type for deletion:', ticketTypeToRemove.id);
      setDeletedTicketTypeIds(prev => [...prev, ticketTypeToRemove.id!]);
    }

    // Remove from form
    remove(index);
  };

  const onSubmit = async (data: EventFormData) => {
    if (!id) {
      setError('Event ID is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Step 1: Delete removed ticket types first
      if (deletedTicketTypeIds.length > 0) {
        console.log('Deleting ticket types:', deletedTicketTypeIds);

        const deletePromises = deletedTicketTypeIds.map(async (ticketTypeId) => {
          try {
            // Call the delete API endpoint
            await apiClient.delete(`/events/${id}/ticket-types/${ticketTypeId}`);
            console.log('Deleted ticket type:', ticketTypeId);
          } catch (err) {
            console.error('Failed to delete ticket type:', ticketTypeId, err);
            throw err; // Re-throw to stop the update process
          }
        });

        // Wait for all deletions to complete
        await Promise.all(deletePromises);
      }

      // Step 2: Update event with remaining ticket types
      const updateData: UpdateEventDto = {
        name: data.name,
        description: data.description,
        startTime: formatForBackend(data.startTime),
        endTime: formatForBackend(data.endTime),
        venue: data.venue,
        eventType: data.eventType,
        salesStartDate: formatForBackend(data.salesStartDate),
        salesEndDate: formatForBackend(data.salesEndDate),
        ticketTypes: data.ticketTypes.map(ticket => ({
          id: ticket.id,
          name: ticket.name,
          price: Number(ticket.price),
          description: ticket.description || '',
          totalAvailable: ticket.totalAvailable ? Number(ticket.totalAvailable) : undefined
        } as UpdateTicketTypeRequestDto))
      };

      console.log('Submitting update with payload:', updateData);

      const updatedEvent = await eventsApi.update(id, updateData);
      console.log('Event updated successfully:', updatedEvent);

      alert('Event updated successfully!');

      // Clear deleted IDs tracking
      setDeletedTicketTypeIds([]);

      navigate(`/events/${id}`);
    } catch (err: any) {
      console.error('Failed to update event:', err);
      setError(err.message || 'Failed to update event. Please check your data.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !fields.length) {
    return (
      <Card>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">Failed to load event</p>
          <p className="text-gray-500">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/events')}
          >
            Back to Events
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Edit Event</h1>
        <Button
          variant="outline"
          onClick={() => navigate(`/events/${id}`)}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 font-medium">❌ {error}</p>
        </div>
      )}

      {/* Show deletion warning */}
      {deletedTicketTypeIds.length > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">
            ⚠️ {deletedTicketTypeIds.length} ticket type(s) will be deleted when you save
          </p>
        </div>
      )}

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <Input
            label="Event Name *"
            {...register('name', { required: 'Event name is required' })}
            error={errors.name?.message}
            placeholder="Enter event name"
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description *
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-netflix-gray text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={4}
              placeholder="Describe your event"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>

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
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-netflix-gray text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.eventType ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
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
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Ticket Types</h3>
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
              <div key={field.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    Ticket Type {index + 1}
                    {field.id && <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">(ID: {field.id})</span>}
                  </h4>
                  <Button
                    type="button"
                    variant="danger"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to remove this ticket type?')) {
                        removeTicketType(index);
                      }
                    }}
                  >
                    Remove
                  </Button>
                </div>

                <input
                  type="hidden"
                  {...register(`ticketTypes.${index}.id`)}
                />

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
                <p className="text-gray-500 dark:text-gray-400 mb-4">No ticket types configured</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addTicketType}
                >
                  Add Ticket Type
                </Button>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/events/${id}`)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Event'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};