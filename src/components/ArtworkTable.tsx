
import React from 'react';
import { Button } from './ui/button';
import { Artwork } from '@/types';

interface ArtworkTableProps {
  artworks: Artwork[];
  onEdit: (artwork: Artwork) => void;
  onDelete: (id: string) => void;
}

const ArtworkTable: React.FC<ArtworkTableProps> = ({ artworks, onEdit, onDelete }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Title</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Artist</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {artworks.map((artwork) => (
            <tr key={artwork.id}>
              <td className="px-6 py-4 whitespace-nowrap">
                <img 
                  src={artwork.imageUrl} 
                  alt={artwork.title}
                  className="h-16 w-16 object-cover rounded"
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap">{artwork.title}</td>
              <td className="px-6 py-4 whitespace-nowrap">{artwork.artist}</td>
              <td className="px-6 py-4 whitespace-nowrap">KSH {artwork.price}</td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  artwork.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {artwork.status}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Button
                  onClick={() => onEdit(artwork)}
                  variant="ghost"
                  className="mr-2"
                >
                  Edit
                </Button>
                <Button
                  onClick={() => onDelete(artwork.id)}
                  variant="ghost"
                  className="text-red-600 hover:text-red-800"
                >
                  Delete
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ArtworkTable;
