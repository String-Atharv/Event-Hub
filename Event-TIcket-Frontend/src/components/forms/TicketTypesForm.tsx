// components/forms/TicketTypeForm.tsx
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Input } from '@/components/common/Input';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';

export interface TicketTypeData {
  name: string;
  description?: string;
  price: number;
  quantity: number;
  saleStartDate?: string;  // Optional - can use event defaults
  saleEndDate?: string;    // Optional - can use event defaults
}

interface TicketTypeFormProps {
  onAddTicketType: (data: TicketTypeData) => void;
  onCancel?: () => void;
  defaultSaleStartDate?: string;
  defaultSaleEndDate?: string;
}

export const TicketTypeForm = ({
  onAddTicketType,
  onCancel,
  defaultSaleStartDate,
  defaultSaleEndDate
}: TicketTypeFormProps) => {
  const { register, handleSubmit, formState: { errors } } = useForm<TicketTypeData>({
    defaultValues: {
      saleStartDate: defaultSaleStartDate,
      saleEndDate: defaultSaleEndDate
    }
  });

  const [useCustomDates, setUseCustomDates] = useState(false);

  const onSubmit = (data: TicketTypeData) => {
    // If not using custom dates, clear them
    if (!useCustomDates) {
      data.saleStartDate = undefined;
      data.saleEndDate = undefined;
    }
    onAddTicketType(data);
  };

  return (
    <Card className="mb-4">
      <h3 className="text-lg font-semibold mb-4">Add Ticket Type</h3>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Ticket Name *"
            {...register('name', { required: 'Name is required' })}
            error={errors.name?.message}
            placeholder="e.g., General Admission"
          />

          <Input
            label="Price ($) *"
            type="number"
            step="0.01"
            min="0"
            {...register('price', {
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' },
              valueAsNumber: true
            })}
            error={errors.price?.message}
          />
        </div>

        <Input
          label="Description"
          {...register('description')}
          placeholder="What does this ticket include?"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Quantity Available *"
            type="number"
            min="1"
            {...register('quantity', {
              required: 'Quantity is required',
              min: { value: 1, message: 'At least 1 ticket required' },
              valueAsNumber: true
            })}
            error={errors.quantity?.message}
          />
        </div>

        {/* Custom Sales Dates Toggle */}
        <div className="pt-2 border-t">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="checkbox"
              checked={useCustomDates}
              onChange={(e) => setUseCustomDates(e.target.checked)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Set custom sales dates for this ticket type
            </span>
          </label>

          <p className="text-sm text-gray-500 mt-1 mb-3">
            If unchecked, will use the event's sales period
          </p>
        </div>

        {/* Custom Sales Dates (Conditional) */}
        {useCustomDates && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-3 bg-gray-50 rounded-lg">
            <Input
              label="Sales Start Date"
              type="datetime-local"
              {...register('saleStartDate')}
            />

            <Input
              label="Sales End Date"
              type="datetime-local"
              {...register('saleEndDate')}
            />
          </div>
        )}

        <div className="flex justify-end space-x-2 pt-4 border-t">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button type="submit">Add Ticket Type</Button>
        </div>
      </form>
    </Card>
  );
};