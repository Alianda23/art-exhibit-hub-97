
import React, { useState, useEffect } from 'react';
import ArtworkCard from '@/components/ArtworkCard';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { formatPrice } from '@/utils/formatters';
import { Search } from 'lucide-react';
import { getAllArtworks } from '@/services/api';
import { Artwork } from '@/types';
import { useToast } from '@/hooks/use-toast';

const ArtworksPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState([0, 100000]);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  // Get min and max prices from artwork data
  const minPrice = 0;
  const maxPrice = 100000;

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        setLoading(true);
        const data = await getAllArtworks();
        console.log("Artworks loaded successfully:", data.length);
        
        // Log image URLs for debugging
        data.forEach((artwork: Artwork) => {
          const imageSource = artwork.image_url || artwork.imageUrl;
          console.log(`Artwork ${artwork.id} (${artwork.title}) image source: ${imageSource}`);
        });
        
        setArtworks(data);
      } catch (error) {
        console.error('Failed to fetch artworks:', error);
        toast({
          title: "Error",
          description: "Failed to load artworks. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchArtworks();
  }, [toast]);

  // Filter artworks based on search term and price range
  const filteredArtworks = artworks.filter((artwork) => {
    const matchesSearch = 
      artwork.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artwork.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPrice = artwork.price >= priceRange[0] && artwork.price <= priceRange[1];
    
    return matchesSearch && matchesPrice;
  });

  return (
    <div className="py-12 px-4 md:px-6 bg-secondary min-h-screen">
      <div className="container mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-serif font-bold mb-4">
            Discover Our <span className="text-gold">Artwork</span> Collection
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore and purchase unique artworks created by talented Kenyan artists
          </p>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-10">
          <div className="grid md:grid-cols-[1fr_2fr] gap-6">
            <div>
              <Label htmlFor="price-range" className="text-lg font-medium mb-3 block">Price Range</Label>
              <div className="px-2">
                <Slider
                  id="price-range"
                  defaultValue={[minPrice, maxPrice]}
                  max={maxPrice}
                  min={minPrice}
                  step={1000}
                  value={priceRange}
                  onValueChange={setPriceRange}
                  className="my-4"
                />
              </div>
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>{formatPrice(priceRange[0])}</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>
            
            <div className="flex items-end">
              <div className="relative w-full">
                <Label htmlFor="search" className="text-lg font-medium mb-3 block">Search</Label>
                <div className="relative">
                  <Input
                    id="search"
                    placeholder="Search by title, artist, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pr-10"
                  />
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Results */}
        <div className="mb-6">
          <p className="text-gray-600">
            {loading ? "Loading artworks..." : `Showing ${filteredArtworks.length} artworks`}
          </p>
        </div>
        
        {loading ? (
          <div className="text-center py-16">
            <h3 className="text-2xl font-medium mb-2">Loading artworks...</h3>
            <p className="text-gray-600">Please wait while we fetch the artworks</p>
          </div>
        ) : filteredArtworks.length > 0 ? (
          <div className="artwork-grid">
            {filteredArtworks.map((artwork) => (
              <ArtworkCard key={artwork.id} artwork={artwork} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <h3 className="text-2xl font-medium mb-2">No artworks found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtworksPage;
