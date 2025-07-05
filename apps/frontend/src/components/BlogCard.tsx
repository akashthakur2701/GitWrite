import { Link } from "react-router-dom";
import { useState } from "react";
import type { Blog } from "../hooks";

interface BlogCardProps {
  blog: Blog;
  onLike?: (blogId: string) => void;
  onBookmark?: (blogId: string) => void;
}

export const BlogCard = ({ blog, onLike, onBookmark }: BlogCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(blog.likesCount || 0);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLiked(!isLiked);
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    onLike?.(blog.id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    onBookmark?.(blog.id);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  return (
    <article className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden group">
      <Link to={`/blog/${blog.id}`} className="block">
        {/* Header */}
        <div className="p-6 pb-4">
          <div className="flex items-center space-x-3 mb-4">
            <Avatar 
              name={blog.author?.name || "Anonymous"} 
              avatar={blog.author?.avatar}
              size="medium" 
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {blog.author?.name || "Anonymous"}
              </p>
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <time dateTime={blog.createdAt}>
                  {formatDate(blog.createdAt)}
                </time>
                <Circle />
                <span>{calculateReadTime(blog.content)} min read</span>
                {blog.views > 0 && (
                  <>
                    <Circle />
                    <span>{blog.views.toLocaleString()} views</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
              {blog.title}
            </h2>
            <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">
              {blog.excerpt || stripHtml(blog.content).substring(0, 200) + '...'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center space-x-1 text-sm transition-colors ${
                  isLiked
                    ? 'text-red-600 hover:text-red-700'
                    : 'text-gray-500 hover:text-red-600'
                }`}
              >
                <svg 
                  className={`w-5 h-5 ${
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
                <span>{likesCount}</span>
              </button>

              {/* Comments */}
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>{blog.commentsCount || 0}</span>
              </div>
            </div>

            {/* Bookmark Button */}
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked
                  ? 'text-blue-600 bg-blue-50 hover:bg-blue-100'
                  : 'text-gray-400 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <svg 
                className={`w-5 h-5 ${
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
            </button>
          </div>
        </div>
      </Link>
    </article>
  );
};

export function Circle() {
  return <div className="h-1 w-1 rounded-full bg-gray-400"></div>;
}

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
    small: "w-6 h-6 text-xs",
    medium: "w-8 h-8 text-sm",
    big: "w-10 h-10 text-md",
    large: "w-16 h-16 text-lg"
  };

  return (
    <div className={`relative inline-flex items-center justify-center overflow-hidden bg-gray-100 rounded-full border-2 border-white shadow-sm ${sizeClasses[size]}`}>
      {avatar ? (
        <img
          className="w-full h-full object-cover"
          src={avatar}
          alt={name}
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span className={`font-medium text-gray-600`}>
          {name?.[0]?.toUpperCase() ?? "?"}
        </span>
      )}
    </div>
  );
}
