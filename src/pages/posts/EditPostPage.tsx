import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postsApi } from '../../api/posts.api';
import type { Post } from '../../types/post';
import { useToast } from '../../hooks/useToast';
import { parseApiError } from '../../utils/error';
import PostForm from '../../components/posts/PostForm';
import { PageSkeleton } from '../../components/common/Skeleton';
import { ArrowLeft } from 'lucide-react';

export const EditPostPage: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    let isCancelled = false;
    const fetchPost = async () => {
      if (!postId) return;
      setIsLoading(true);
      try {
        const data = await postsApi.getPost(postId);
        if (!isCancelled) {
          setPost(data);
        }
      } catch (err: unknown) {
        if (!isCancelled) {
          const msg = parseApiError(err);
          toast.error(msg);
          navigate('/profile');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchPost();

    return () => {
      isCancelled = true;
    };
  }, [postId, navigate, toast]);

  const handleUpdatePost = async (data: {
    title: string;
    caption?: string | null;
    image?: File | null;
    remove_image?: boolean;
  }) => {
    if (!postId) return;

    setIsSubmitting(true);
    try {
      await postsApi.updatePost(postId, data);
      toast.success('Post updated successfully');
      navigate(`/posts/${postId}`);
    } catch (err: unknown) {
      const msg = parseApiError(err);
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !post) {
    return <PageSkeleton />;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to={`/posts/${post.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400 hover:text-white transition-colors focus:outline-none focus:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to post
        </Link>
      </div>

      {/* Main card */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Edit Post
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Update your post details, caption, or image.
          </p>
        </div>

        <PostForm
          initialValues={{
            title: post.title,
            caption: post.caption,
            imageUrl: post.image_url,
          }}
          onSubmit={handleUpdatePost}
          submitLabel="Save Changes"
          isSubmitting={isSubmitting}
          onCancel={() => navigate(`/posts/${post.id}`)}
        />
      </div>
    </div>
  );
};

export default EditPostPage;
