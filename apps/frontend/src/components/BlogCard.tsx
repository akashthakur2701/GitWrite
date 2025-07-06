import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import type { Blog } from "../hooks";
import { likeApi, bookmarkApi } from "../utils/apiHelpers";

interface BlogCardProps {
  blog: Blog;
  onLike?: (blogId: string) => void;
  onBookmark?: (blogId: string) => void;
}

export const BlogCard = ({ blog, onLike, onBookmark }: BlogCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likesCount || 0);
  const [loading, setLoading] = useState({ like: false, bookmark: false });

  // Load initial like and bookmark status
  useEffect(() => {
    const loadStatus = async () => {
      try {
        const [likeStatus, bookmarkStatus] = await Promise.all([
          likeApi.getLikeStatus(blog.id),
          bookmarkApi.getBookmarkStatus(blog.id)
        ]);
        
        if (likeStatus.success && likeStatus.data) {
          setIsLiked(likeStatus.data.isLiked);
          setLikesCount(likeStatus.data.likesCount);
        }
        
        if (bookmarkStatus.success && bookmarkStatus.data) {
          setIsBookmarked(bookmarkStatus.data.isBookmarked);
        }
      } catch (error) {
        console.error('Failed to load post status:', error);
      }
    };
    
    loadStatus();
  }, [blog.id]);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading.like) return;

    try {
      setLoading(prev => ({ ...prev, like: true }));
      const response = await likeApi.toggleLike(blog.id);

      if (response.success && response.data) {
        setIsLiked(response.data.isLiked);
        setLikesCount(response.data.likesCount);
        onLike?.(blog.id);
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    } finally {
      setLoading(prev => ({ ...prev, like: false }));
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (loading.bookmark) return;

    try {
      setLoading(prev => ({ ...prev, bookmark: true }));
      const response = await bookmarkApi.toggleBookmark(blog.id);

      if (response.success && response.data) {
        setIsBookmarked(response.data.isBookmarked);
        onBookmark?.(blog.id);
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error);
    } finally {
      setLoading(prev => ({ ...prev, bookmark: false }));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, '');
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = stripHtml(content).split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const getExcerpt = () => {
    const excerpt = blog.excerpt || stripHtml(blog.content);
    return excerpt.length > 120 ? excerpt.substring(0, 120) + '...' : excerpt;
  };

  return (
    <article className="group cursor-pointer mb-6">
      <Link to={`/blog/${blog.id}`} className="block">
        <div className="flex gap-6 p-6 shadow-sm transition-all duration-200 hover:shadow-lg hover:scale-105 hover:z-20 relative">
          {/* Content Section */}
          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="flex items-center space-x-3 mb-4">
              <Avatar 
                name={blog.author?.name || "Anonymous"} 
                avatar={blog.author?.avatar}
                size="small" 
              />
              <div className="flex items-center space-x-2 text-sm">
                <span className="font-medium text-gray-900">
                  {blog.author?.name || "Anonymous"}
                </span>
                <span className="text-gray-400">·</span>
                <time className="text-gray-500" dateTime={blog.createdAt}>
                  {formatDate(blog.createdAt)}
                </time>
              </div>
            </div>

            {/* Title and Excerpt */}
            <div className="space-y-3 mb-4">
              <h2 className="text-2xl font-extrabold text-gray-900 line-clamp-2 group-hover:text-blue-600 group-hover:underline transition-colors leading-tight">
                {blog.title}
              </h2>
              <p className="text-gray-600 line-clamp-2 text-base leading-relaxed">
                {getExcerpt()}
              </p>
              <span className="inline-block mt-1 text-blue-600 text-sm font-medium group-hover:underline">Read More →</span>
            </div>

            {/* Footer Stats */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{calculateReadTime(blog.content)} min read</span>
                {blog.views > 0 && (
                  <>
                    <span>·</span>
                    <span>{blog.views.toLocaleString()} views</span>
                  </>
                )}
                {blog.commentsCount > 0 && (
                  <>
                    <span>·</span>
                    <span>{blog.commentsCount} comments</span>
                  </>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Like Button */}
                <button
                  onClick={handleLike}
                  disabled={loading.like}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 disabled:opacity-50 transform hover:scale-110 active:scale-95 ${
                    isLiked
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                  }`}
                >
                  {loading.like ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg 
                      className={`w-4 h-4 ${
                        isLiked ? 'fill-current' : 'fill-none'
                      }`} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
                      />
                    </svg>
                  )}
                  <span>{likesCount}</span>
                </button>

                {/* Bookmark Button */}
                <button
                  onClick={handleBookmark}
                  disabled={loading.bookmark}
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm transition-all duration-200 disabled:opacity-50 transform hover:scale-110 active:scale-95 ${
                    isBookmarked
                      ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                      : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
                  }`}
                >
                  {loading.bookmark ? (
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg 
                      className={`w-4 h-4 ${
                        isBookmarked ? 'fill-current' : 'fill-none'
                      }`} 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" 
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Optional Featured Image */}
          {blog.featuredImage && (
            <div className="flex-shrink-0 w-32 h-24 rounded-lg overflow-hidden bg-gray-200">
              <img
                src={blog.featuredImage}
                alt={blog.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
              />
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};

// Avatar component
export function Avatar({ 
  name, 
  avatar, 
  size = "small" 
}: { 
  name: string; 
  avatar?: string;
  size?: "small" | "medium" | "big" | "large";
}) {
  const sizeClasses = {
    small: "h-6 w-6",
    medium: "h-8 w-8", 
    big: "h-12 w-12",
    large: "h-16 w-16"
  };

  return (
    <div className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gray-200 flex-shrink-0`}>
      {avatar ? (
        <img
          src={avatar}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-medium text-xs">
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </div>
  );
}
