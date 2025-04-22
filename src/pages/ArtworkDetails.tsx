
import React from 'react';
import { useParams } from 'react-router-dom';

const ArtworkDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Artwork Details</h1>
      <p className="text-lg">Viewing artwork ID: {id}</p>
    </div>
  );
};

export default ArtworkDetails;
