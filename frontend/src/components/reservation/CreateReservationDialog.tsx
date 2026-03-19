import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Clock, Users, Phone, Mail, User } from 'lucide-react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { tableApi } from '@/api/tableApi';
import { useCreateReservation } from '@/hooks/queries/useReservationQueries';
import { useAuthStore } from '@/stores/authStore';
import type { CreateReservationRequest } from '@/types/dto';
import { TableStatus } from '@/types/dto';

interface CreateReservationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateReservationDialog({
  open,
  onOpenChange,
}: CreateReservationDialogProps) {
  const { staffInfo } = useAuthStore();
  const branchId = staffInfo?.branchId || '';

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [guestNumber, setGuestNumber] = useState('');
  const [reservationDateTime, setReservationDateTime] = useState<Date | null>(null);
  const [selectedTableId, setSelectedTableId] = useState<string>('');
  const [note, setNote] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const createMutation = useCreateReservation();

  const { data: tables = [] } = useQuery({
    queryKey: ['tables', branchId],
    queryFn: () => tableApi.getByBranch(branchId),
    enabled: !!branchId && open,
  });

  const availableTables = tables.filter(
    (table) => table.status === TableStatus.FREE || table.status === TableStatus.ACTIVE
  );

  useEffect(() => {
    if (open) {
      setCustomerName('');
      setCustomerPhone('');
      setCustomerEmail('');
      setGuestNumber('');
      setReservationDateTime(null);
      setSelectedTableId('');
      setNote('');
      setErrors({});
    }
  }, [open]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!customerName.trim()) {
      newErrors.customerName = 'Customer name is required';
    }

    if (!customerPhone.trim()) {
      newErrors.customerPhone = 'Phone number is required';
    } else if (!/^[0-9]{10,11}$/.test(customerPhone.replace(/\s/g, ''))) {
      newErrors.customerPhone = 'Please enter a valid phone number (10-11 digits)';
    }

    if (customerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerEmail)) {
      newErrors.customerEmail = 'Please enter a valid email address';
    }

    if (!guestNumber || parseInt(guestNumber) <= 0) {
      newErrors.guestNumber = 'Guest number must be greater than 0';
    }

    if (!reservationDateTime) {
      newErrors.reservationDateTime = 'Reservation date and time is required';
    } else if (reservationDateTime <= new Date()) {
      newErrors.reservationDateTime = 'Reservation time must be in the future';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const requestData: CreateReservationRequest = {
      branchId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      guestNumber: parseInt(guestNumber),
      startTime: reservationDateTime!.toISOString(),
      areaTableId: selectedTableId || undefined,
      note: note.trim() || undefined,
    };

    createMutation.mutate(requestData, {
      onSuccess: () => {
        onOpenChange(false);
      },
    });
  };

  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create Reservation</DialogTitle>
          <DialogDescription>
            Create a new reservation on behalf of a customer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">
                Customer Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="customerName"
                  placeholder="John Doe"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value);
                    if (errors.customerName) {
                      setErrors({ ...errors, customerName: '' });
                    }
                  }}
                  className={`pl-9 ${errors.customerName ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.customerName && (
                <p className="text-xs text-destructive">{errors.customerName}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerPhone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="customerPhone"
                  placeholder="0123456789"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (errors.customerPhone) {
                      setErrors({ ...errors, customerPhone: '' });
                    }
                  }}
                  className={`pl-9 ${errors.customerPhone ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.customerPhone && (
                <p className="text-xs text-destructive">{errors.customerPhone}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Email (Optional)</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="customerEmail"
                type="email"
                placeholder="john.doe@example.com"
                value={customerEmail}
                onChange={(e) => {
                  setCustomerEmail(e.target.value);
                  if (errors.customerEmail) {
                    setErrors({ ...errors, customerEmail: '' });
                  }
                }}
                className={`pl-9 ${errors.customerEmail ? 'border-destructive' : ''}`}
              />
            </div>
            {errors.customerEmail && (
              <p className="text-xs text-destructive">{errors.customerEmail}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guestNumber">
                Number of Guests <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="guestNumber"
                  type="number"
                  min="1"
                  placeholder="2"
                  value={guestNumber}
                  onChange={(e) => {
                    setGuestNumber(e.target.value);
                    if (errors.guestNumber) {
                      setErrors({ ...errors, guestNumber: '' });
                    }
                  }}
                  className={`pl-9 ${errors.guestNumber ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.guestNumber && (
                <p className="text-xs text-destructive">{errors.guestNumber}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="table">Table (Optional)</Label>
              <Select value={selectedTableId} onValueChange={setSelectedTableId}>
                <SelectTrigger id="table">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No table assigned</SelectItem>
                  {availableTables.map((table) => (
                    <SelectItem key={table.areaTableId} value={table.areaTableId!}>
                      {table.tag} - {table.areaName} (Capacity: {table.capacity})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reservationDateTime">
              Reservation Date & Time <span className="text-destructive">*</span>
            </Label>
            <div className="relative">
              <div className="flex gap-2">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                <Clock className="absolute left-8 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
              </div>
              <DatePicker
                selected={reservationDateTime}
                onChange={(date) => {
                  setReservationDateTime(date);
                  if (errors.reservationDateTime) {
                    setErrors({ ...errors, reservationDateTime: '' });
                  }
                }}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="MMMM d, yyyy h:mm aa"
                minDate={new Date()}
                minTime={
                  reservationDateTime &&
                  reservationDateTime.toDateString() === new Date().toDateString()
                    ? getMinDateTime()
                    : new Date(0, 0, 0, 0, 0)
                }
                maxTime={new Date(0, 0, 0, 23, 59)}
                placeholderText="Select date and time"
                className={`w-full pl-16 pr-4 py-2 rounded-md border ${
                  errors.reservationDateTime ? 'border-destructive' : 'border-input'
                } bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2`}
              />
            </div>
            {errors.reservationDateTime && (
              <p className="text-xs text-destructive">{errors.reservationDateTime}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Notes (Optional)</Label>
            <Textarea
              id="note"
              placeholder="Any special requests or notes..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={createMutation.isPending}
          >
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={createMutation.isPending}>
            {createMutation.isPending ? 'Creating...' : 'Create Reservation'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
