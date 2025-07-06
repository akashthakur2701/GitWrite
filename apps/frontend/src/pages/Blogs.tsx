import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Appbar } from "../components/Appbar";
import { BlogCard } from "../components/BlogCard";
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";
import { apiClient } from "../utils/api";

const categories = [
  { id: 'all', name: 'All', color: '#6B7280', icon: '📚' },
  { id: 'tech', name: 'Technology', color: '#3B82F6', icon: '💻' },
  { id: 'design', name: 'Design', color: '#8B5CF6', icon: '🎨' },
  { id: 'business', name: 'Business', color: '#10B981', icon: '💼' },
  { id: 'life', name: 'Life', color: '#F59E0B', icon: '🌟' },
  { id: 'travel', name: 'Travel', color: '#EF4444', icon: '✈️' },
  { id: 'writing', name: 'Writing', color: '#EC4899', icon: '✍️' },
  { id: 'productivity', name: 'Productivity', color: '#06B6D4', icon: '⚡' },
];

const staffPicks = [
  { id: '1', title: 'The Future of AI in Content Creation', author: 'Sarah Chen', readTime: '5 min', views: '2.3k' },
  { id: '2', title: 'Building Better User Experiences', author: 'Mike Rodriguez', readTime: '7 min', views: '1.8k' },
  { id: '3', title: 'Remote Work: Lessons Learned', author: 'Emma Thompson', readTime: '4 min', views: '3.1k' },
];

const trendingTopics = [
  'Artificial Intelligence', 'Web Development', 'Design Systems', 
  'Product Management', 'Remote Work', 'Mental Health', 
  'Climate Change', 'Startup Life', 'Personal Growth'
];

const quotes = [
  {
    text: "The best way to predict the future is to invent it.",
    author: "Alan Kay"
  },
  {
    text: "Design is not just what it looks like and feels like. Design is how it works.",
    author: "Steve Jobs"
  },
  {
    text: "The only way to do great work is to love what you do.",
    author: "Steve Jobs"
  }
];

const sortOptions = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Popular' },
  { value: 'trending', label: 'Trending' },
  { value: 'oldest', label: 'Oldest' },
];

export const Blogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [currentPage, setCurrentPage] = useState(1);
  const { loading, blogs, error, pagination } = useBlogs(currentPage, 12);

  // Update search params when search query changes
  useEffect(() => {
    if (searchQuery) {
      setSearchParams({ search: searchQuery });
    } else {
      setSearchParams({});
    }
  }, [searchQuery, setSearchParams]);

  const handleLike = async (blogId: string) => {
    try {
      await apiClient.post(`/api/v1/like/${blogId}`);
      // Optionally refresh the blogs or update local state
    } catch (error) {
      console.error('Failed to like blog:', error);
    }
  };

  const handleBookmark = async (blogId: string) => {
    try {
      await apiClient.post(`/api/v1/bookmark/${blogId}`);
      // Optionally refresh the blogs or update local state
    } catch (error) {
      console.error('Failed to bookmark blog:', error);
    }
  };

  const filteredBlogs = blogs?.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         blog.author?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    // For now, we'll filter by search only since we don't have category data yet
    return matchesSearch;
  }) || [];

  if (loading && currentPage === 1) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Appbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-4 bg-gray-200 rounded animate-pulse" />
                  ))}
                </div>
              </div>
            </div>
            
            {/* Main Content Skeleton */}
            <div className="lg:col-span-3">
              <div className="space-y-8">
                {Array.from({ length: 6 }).map((_, i) => (
              <BlogSkeleton key={i} />
            ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Appbar />
      
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 leading-tight">
              Discover Stories That Matter
            </h1>
            <p className="text-base sm:text-lg text-blue-100 mb-6 max-w-2xl mx-auto leading-relaxed">
              Explore insightful articles from talented writers around the world. Find stories that inspire, educate, and entertain.
            </p>
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search for stories, authors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-0 rounded-xl focus:ring-2 focus:ring-white focus:ring-opacity-50 text-base shadow-lg bg-white/95 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <aside className="lg:col-span-1 w-full max-w-xs space-y-6 sticky top-24 self-start h-[calc(100vh-6rem)] overflow-y-auto custom-scrollbar">
            {/* Categories */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">📂</span>
                Categories
              </h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-110 ${
                      selectedCategory === category.id
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <span className="text-lg">{category.icon}</span>
                    <span>{category.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Option - moved below categories */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">Sort by:</label>
              <select
                id="sort"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            {/* Staff Picks */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">⭐</span>
                Staff Picks
              </h3>
              <div className="space-y-4">
                {staffPicks.map((pick) => (
                  <div key={pick.id} className="group cursor-pointer">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                      {pick.title}
                    </h4>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{pick.author}</span>
                      <div className="flex items-center space-x-2">
                        <span>{pick.readTime}</span>
                        <span>·</span>
                        <span>{pick.views}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🔥</span>
                Trending Topics
              </h3>
              <div className="flex flex-wrap gap-2">
                {trendingTopics.map((topic, index) => (
                  <button
                    key={index}
                    className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-full hover:bg-gray-200 transition-colors"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Quote of the Day */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 shadow-sm border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">💭</span>
                Quote of the Day
              </h3>
              <blockquote className="text-gray-700 italic mb-3">
                "{quotes[0].text}"
              </blockquote>
              <cite className="text-sm text-gray-500">— {quotes[0].author}</cite>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-3 relative overflow-visible">
            {/* Error State */}
        {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
            <div className="flex">
                  <svg className="h-6 w-6 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-red-800">Error loading stories</h3>
                    <p className="text-red-700 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

            {/* Empty State */}
        {filteredBlogs.length === 0 && !loading && (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                  <svg className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No stories found</h3>
                <p className="text-gray-600 max-w-md mx-auto">
              {searchQuery 
                    ? `No stories match "${searchQuery}". Try adjusting your search terms or browse our categories.`
                    : "No stories available yet. Be the first to share your story and inspire others!"
              }
            </p>
          </div>
        )}

            {/* Blog List */}
        {filteredBlogs.length > 0 && (
          <>
                <div className="space-y-6">
                  {filteredBlogs.map((blog) => (
                    <BlogCard
                      key={blog.id}
                      blog={blog}
                      onLike={handleLike}
                      onBookmark={handleBookmark}
                    />
                  ))}
                </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <nav className="flex items-center space-x-2">
                      <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Previous
                      </button>
                      
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => setCurrentPage(page)}
                            className={`px-3 py-2 text-sm font-medium rounded-lg ${
                              currentPage === page
                                ? 'bg-blue-600 text-white'
                                : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}

                      <button
                        onClick={() => setCurrentPage(Math.min(pagination.totalPages, currentPage + 1))}
                        disabled={currentPage === pagination.totalPages}
                        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Next
                      </button>
                    </nav>
              </div>
            )}
          </>
        )}
          </div>
        </div>
      </div>
    </div>
  );
};
