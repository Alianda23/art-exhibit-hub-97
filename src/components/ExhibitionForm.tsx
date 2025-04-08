
import React, { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { ExhibitionData } from "@/services/api";
import { ImageUp } from "lucide-react";

const MAX_FILE_SIZE = 5000000; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

const exhibitionSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  location: z.string().min(3, { message: "Location must be at least 3 characters" }),
  imageUrl: z.string().url({ message: "Please enter a valid image URL" }).optional(),
  startDate: z.string().min(1, { message: "Start date is required" }),
  endDate: z.string().min(1, { message: "End date is required" }),
  ticketPrice: z.coerce.number().min(0, { message: "Ticket price must be a positive number" }),
  totalSlots: z.coerce.number().int().min(1, { message: "Total slots must be at least 1" }),
  availableSlots: z.coerce.number().int().min(0, { message: "Available slots must be a non-negative number" }),
  status: z.enum(["upcoming", "ongoing", "past"], { message: "Status must be upcoming, ongoing, or past" }),
});

type ExhibitionFormValues = z.infer<typeof exhibitionSchema>;

interface ExhibitionFormProps {
  initialData?: ExhibitionData;
  onSubmit: (data: ExhibitionData) => void;
  onCancel: () => void;
}

const ExhibitionForm: React.FC<ExhibitionFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
}) => {
  const { toast } = useToast();
  const [previewImage, setPreviewImage] = useState<string | null>(initialData?.imageUrl || null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  
  const defaultValues = initialData || {
    title: "",
    description: "",
    location: "",
    imageUrl: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    ticketPrice: 0,
    totalSlots: 100,
    availableSlots: 100,
    status: "upcoming" as const,
  };

  const form = useForm<ExhibitionFormValues>({
    resolver: zodResolver(exhibitionSchema),
    defaultValues,
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    
    if (!files || files.length === 0) return;
    
    const file = files[0];
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Image size should be less than 5MB",
      });
      return;
    }
    
    // Validate file type
    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Image format should be JPG, PNG or WebP",
      });
      return;
    }
    
    setImageFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (values: ExhibitionFormValues) => {
    try {
      // If there's a new image file, let's prepare it for upload first
      let imageUrl = values.imageUrl || initialData?.imageUrl || "";
      
      if (imageFile) {
        // In a real implementation, you would upload the file to a server here
        // and get back the URL. For now, we'll simulate this with local URL.
        const formData = new FormData();
        formData.append('file', imageFile);
        
        // Just use the local preview as the URL for now
        // In production, you would upload to server and get a real URL back
        imageUrl = previewImage || "";
        
        toast({
          title: "Image Ready",
          description: "Image prepared for upload",
        });
      }
      
      // Include the image URL in the submission data
      onSubmit({
        ...values,
        imageUrl,
        ticketPrice: values.ticketPrice, // Keep the price as is - already in KSh
      } as ExhibitionData);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to submit exhibition. Please try again.",
      });
      console.error("Submit error:", error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Exhibition title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Exhibition description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Exhibition location" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-2">
          <FormLabel>Exhibition Image</FormLabel>
          <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-300 rounded-lg">
            {previewImage && (
              <div className="mb-4 w-full max-w-xs">
                <img 
                  src={previewImage} 
                  alt="Exhibition preview" 
                  className="w-full h-auto rounded-lg"
                />
              </div>
            )}
            
            <label className="w-full flex flex-col items-center px-4 py-6 bg-white rounded-lg cursor-pointer hover:bg-gray-50">
              <ImageUp className="w-8 h-8 text-gray-500" />
              <span className="mt-2 text-base text-gray-500">
                {previewImage ? "Change image" : "Upload image"}
              </span>
              <input type="file" className="hidden" onChange={handleImageChange} accept="image/*" />
            </label>
            
            {previewImage && (
              <p className="text-sm text-gray-500 mt-2">
                Click above to change the image
              </p>
            )}
            
            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem className="w-full mt-4">
                  <FormLabel>Or use image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/image.jpg" 
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        if (e.target.value) {
                          setPreviewImage(e.target.value);
                          setImageFile(null);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            control={form.control}
            name="ticketPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ticket Price (KSh)</FormLabel>
                <FormControl>
                  <Input type="number" min="0" step="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="totalSlots"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Slots</FormLabel>
                <FormControl>
                  <Input type="number" min="1" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="availableSlots"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Available Slots</FormLabel>
                <FormControl>
                  <Input type="number" min="0" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <FormControl>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                  {...field}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="ongoing">Ongoing</option>
                  <option value="past">Past</option>
                </select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData ? "Update Exhibition" : "Create Exhibition"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ExhibitionForm;
