
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Exhibition } from '@/types';
import { format } from 'date-fns';

interface ExhibitionDetailsProps {
  exhibition: Exhibition | null;
  isOpen: boolean;
  onClose: () => void;
}

const ExhibitionDetails: React.FC<ExhibitionDetailsProps> = ({ exhibition, isOpen, onClose }) => {
  if (!exhibition) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{exhibition.title}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
          <div>
            <img 
              src={exhibition.imageUrl} 
              alt={exhibition.title}
              className="w-full h-64 object-cover rounded-lg shadow-md"
            />
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">Description</h3>
              <p className="text-gray-600">{exhibition.description}</p>
            </div>
            <div>
              <h3 className="font-semibold">Location</h3>
              <p className="text-gray-600">{exhibition.location}</p>
            </div>
            <div>
              <h3 className="font-semibold">Dates</h3>
              <p className="text-gray-600">
                {format(new Date(exhibition.startDate), 'PPP')} - {format(new Date(exhibition.endDate), 'PPP')}
              </p>
            </div>
            <div>
              <h3 className="font-semibold">Ticket Price</h3>
              <p className="text-gray-600">KSH {exhibition.ticketPrice}</p>
            </div>
            <div>
              <h3 className="font-semibold">Available Slots</h3>
              <p className="text-gray-600">{exhibition.availableSlots} / {exhibition.totalSlots}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExhibitionDetails;
