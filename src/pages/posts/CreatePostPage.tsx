import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { postsApi } from '../../api/posts.api';
import { useToast } from '../../hooks/useToast';
import { parseApiError } from '../../utils/error';
import PostForm from '../../components/posts/PostForm';
import { ArrowLeft } from 'lucide-react';

export const CreatePostPage: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  const handleCreatePost = async (data: {
    title: string;
    caption?: string | null;
    image?: File | null;
  }) => {
    setIsSubmitting(true);
    try {
      const createdPost = await postsApi.createPost(data);
      toast.success('Post created successfully');
      navigate(`/posts/${createdPost.id}`);
    } catch (err: unknown) {
      const msg = parseApiError(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/profile"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors focus:outline-none focus:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to profile
        </Link>
      </div>

      {/* Main card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Create New Post
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Publish an update, announcement, or media to your SN profile.
          </p>
        </div>

        <PostForm
          onSubmit={handleCreatePost}
          submitLabel="Publish Post"
          isSubmitting={isSubmitting}
          onCancel={() => navigate('/profile')}
        />
      </div>
    </div>
  );
};

export default CreatePostPage;
