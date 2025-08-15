import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X } from "lucide-react";

interface ImageUploaderProps {
  onImageSelect: (file: File) => void;
  onImageRemove: () => void;
  currentImage?: string;
  currentFile?: File;
}

export default function ImageUploader({
  onImageSelect,
  onImageRemove,
  currentImage,
  currentFile
}: ImageUploaderProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onImageRemove();
    
    // Clear file input
    const input = document.getElementById('image-upload') as HTMLInputElement;
    if (input) {
      input.value = '';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        <Input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => document.getElementById('image-upload')?.click()}
          className="flex items-center space-x-2"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Image</span>
        </Button>
        
        {preview && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRemove}
            className="flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Remove</span>
          </Button>
        )}
      </div>

      {preview && (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border"
          />
        </div>
      )}
    </div>
  );
}
