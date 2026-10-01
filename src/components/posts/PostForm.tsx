import React, { useState, useRef } from 'react';
import { validateImageFile, resolveImageUrl } from '../../utils/image';
import { useToast } from '../../hooks/useToast';
import Input from '../common/Input';
import Textarea from '../common/Textarea';
import Button from '../common/Button';
import { UploadCloud, X, Image as ImageIcon } from 'lucide-react';

export interface PostFormProps {
  initialValues?: {
    title?: string;
    caption?: string | null;
    imageUrl?: string | null;
  };
  onSubmit: (data: {
    title: string;
    caption?: string | null;
    image?: File | null;
    remove_image?: boolean;
  }) => Promise<void>;
  submitLabel?: string;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export const PostForm: React.FC<PostFormProps> = ({
  initialValues,
  onSubmit,
  submitLabel = 'Publish Post',
  isSubmitting = false,
  onCancel,
}) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [caption, setCaption] = useState(initialValues?.caption || '');
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [removeExistingImage, setRemoveExistingImage] = useState(false);

  const [errors, setErrors] = useState<{ title?: string; image?: string }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToast();

  const existingResolvedUrl =
    !removeExistingImage && initialValues?.imageUrl
      ? resolveImageUrl(initialValues.imageUrl)
      : null;

  const currentPreview = imagePreview || existingResolvedUrl;

  const handleFileSelection = (file: File) => {
    const validation = validateImageFile(file);
    if (!validation.isValid) {
      toast.error(validation.error || 'Invalid image file');
      return;
    }

    setImageFile(file);
    setRemoveExistingImage(false);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
    setErrors((prev) => ({ ...prev, image: undefined }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (initialValues?.imageUrl) {
      setRemoveExistingImage(true);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = () => {
    const newErrors: { title?: string } = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.trim().length < 1) {
      newErrors.title = 'Please enter a title';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    await onSubmit({
      title: title.trim(),
      caption: caption.trim() || null,
      image: imageFile || undefined,
      remove_image: removeExistingImage,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate>
      {/* Title */}
      <Input
        label="Post Title"
        type="text"
        placeholder="Give your post a concise title..."
        value={title}
        onChange={(e) => {
          setTitle(e.target.value);
          if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
        }}
        error={errors.title}
        required
        disabled={isSubmitting}
      />

      {/* Caption */}
      <Textarea
        label="Caption / Content"
        rows={5}
        placeholder="What would you like to share? Markdown and plain text supported..."
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
        disabled={isSubmitting}
      />

      {/* Image Upload Area */}
      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-wider text-zinc-400">
          Post Image <span className="text-zinc-400">(Optional)</span>
        </label>

        {currentPreview ? (
          <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-900 group">
            <img
              src={currentPreview}
              alt="Post preview"
              className="w-full max-h-96 object-contain bg-black/40"
            />
            <div className="absolute top-3 right-3 flex items-center gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 bg-zinc-950/90 text-white rounded-lg text-xs font-medium border border-zinc-700 hover:bg-zinc-900 transition-colors flex items-center gap-1.5 shadow-lg"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                Change
              </button>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="p-1.5 bg-zinc-950/90 text-zinc-400 hover:text-white rounded-lg border border-zinc-700 hover:bg-zinc-900 transition-colors shadow-lg"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-zinc-800 hover:border-zinc-600 rounded-xl bg-zinc-950/50 hover:bg-zinc-900/30 transition-colors cursor-pointer group text-center"
          >
            <div className="p-3 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 group-hover:text-white transition-colors mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-zinc-200">
              Click to upload or drag & drop image
            </p>
            <p className="text-xs text-zinc-400 mt-1">
              Supports JPG, PNG, WebP or GIF (max 5MB)
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleInputChange}
          disabled={isSubmitting}
        />
      </div>

      {/* Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-900">
        {onCancel && (
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isSubmitting}
        >
          {submitLabel}
        </Button>
      </div>
    </form>
  );
};

export default PostForm;
