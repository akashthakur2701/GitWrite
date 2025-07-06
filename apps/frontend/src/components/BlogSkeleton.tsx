export const BlogSkeleton = () => {
  return (
    <div className="animate-pulse">
      <div className="flex gap-6 py-8 px-6 -mx-6 rounded-xl">
        {/* Content Section */}
        <div className="flex-1 min-w-0">
          {/* Author Info */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="h-6 w-6 bg-gray-200 rounded-full"></div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
              <div className="h-4 w-2 bg-gray-200 rounded"></div>
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
            </div>
          </div>

          {/* Title and Excerpt */}
          <div className="space-y-3 mb-4">
            <div className="h-6 bg-gray-200 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>

          {/* Footer Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-4 w-16 bg-gray-200 rounded"></div>
              <div className="h-4 w-2 bg-gray-200 rounded"></div>
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              <div className="h-8 w-16 bg-gray-200 rounded-full"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Optional Featured Image */}
        <div className="flex-shrink-0 w-32 h-24 bg-gray-200 rounded-lg"></div>
      </div>
    </div>
  );
};