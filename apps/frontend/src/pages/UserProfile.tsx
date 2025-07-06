import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Appbar } from '../components/Appbar';
import { Avatar } from '../components/BlogCard';
import { userApi, followApi } from '../utils/apiHelpers';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  bio?: string;
  hobby?: string;
  avatar?: string;
  rating: number;
  totalViews: number;
  verified: boolean;
  createdAt: string;
  _count: {
    posts: number;
    followers: number;
    following: number;
  };
}

interface RecentPost {
  id: string;
  title: string;
  excerpt?: string;
  slug: string;
  createdAt: string;
  views: number;
  likesCount: number;
  commentsCount: number;
  readTime: number;
}

export const UserProfile = () => {
  const { userId } = useParams<{ userId: string }>();
  const [user, setUser] = useState<UserProfileData | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followLoading, setFollowLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'followers' | 'following'>('posts');

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchFollowStatus();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await userApi.getPublicProfile(userId!);
      
      if (response.success && response.data) {
        setUser(response.data.user);
        setRecentPosts(response.data.recentPosts);
      } else {
        setError(response.message || 'Failed to fetch user profile');
      }
    } catch (error: any) {
      setError('Failed to fetch user profile');
      console.error('Profile fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFollowStatus = async () => {
    try {
      const response = await followApi.getFollowStatus(userId!);
      if (response.success && response.data) {
        setIsFollowing(response.data.isFollowing);
        setFollowerCount(response.data.followerCount);
      }
    } catch (error) {
      console.error('Follow status fetch error:', error);
    }
  };

  const handleFollow = async () => {
    if (followLoading) return;
    
    try {
      setFollowLoading(true);
      const response = await followApi.toggleFollow(userId!);
      
      if (response.success && response.data) {
        setIsFollowing(response.data.isFollowing);
        setFollowerCount(response.data.targetUser.followerCount);
      }
    } catch (error) {
      console.error('Follow toggle error:', error);
    } finally {
      setFollowLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Appbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-20 h-20 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-6 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Appbar />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">User Not Found</h2>
            <p className="text-gray-600 mb-6">
              {error || "The user you're looking for doesn't exist."}
            </p>
            <Link 
              to="/blogs" 
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              ← Back to Blogs
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Appbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <Avatar 
                name={user.name}
                avatar={user.avatar}
                size="large"
              />
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                  {user.verified && (
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                {user.bio && <p className="text-gray-600 mb-2">{user.bio}</p>}
                {user.hobby && <p className="text-blue-600 mb-2">🎯 {user.hobby}</p>}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>⭐ {user.rating.toFixed(1)} rating</span>
                  <span>📝 {user._count.posts} posts</span>
                  <span>👁️ {user.totalViews.toLocaleString()} views</span>
                  <span>📅 Joined {formatDate(user.createdAt)}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <button
                onClick={handleFollow}
                disabled={followLoading}
                className={`px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  isFollowing
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {followLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading...</span>
                  </div>
                ) : (
                  isFollowing ? 'Following' : 'Follow'
                )}
              </button>
              <span className="text-sm text-gray-500">{followerCount} followers</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{user._count.posts}</div>
            <div className="text-gray-600">Total Posts</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{user._count.followers}</div>
            <div className="text-gray-600">Followers</div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-1">{user._count.following}</div>
            <div className="text-gray-600">Following</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {[
                { key: 'posts', label: `Posts (${user._count.posts})`, icon: '📝' },
                { key: 'followers', label: `Followers (${user._count.followers})`, icon: '👥' },
                { key: 'following', label: `Following (${user._count.following})`, icon: '🔗' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`${
                    activeTab === tab.key
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'posts' && (
              <div>
                {recentPosts.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6">
                    {recentPosts.map((post) => (
                      <div key={post.id} className="border border-gray-200 rounded-lg p-4">
                        <Link to={`/blog/${post.id}`} className="block hover:bg-gray-50 rounded-lg p-2 -m-2">
                          <h3 className="font-semibold text-gray-900 mb-2">{post.title}</h3>
                          {post.excerpt && (
                            <p className="text-gray-600 text-sm mb-3">{post.excerpt}</p>
                          )}
                          <div className="flex items-center space-x-4 text-sm text-gray-500">
                            <span>{formatDate(post.createdAt)}</span>
                            <span>👁️ {post.views} views</span>
                            <span>❤️ {post.likesCount} likes</span>
                            <span>💬 {post.commentsCount} comments</span>
                            <span>⏱️ {post.readTime} min read</span>
                          </div>
                        </Link>
                      </div>
                    ))}
                    {recentPosts.length >= 5 && (
                      <div className="text-center">
                        <Link 
                          to={`/search/blogs?author=${user.name}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          View all posts by {user.name} →
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-500">No posts yet</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'followers' && (
              <div className="text-center py-8">
                <p className="text-gray-500">Followers list coming soon...</p>
              </div>
            )}

            {activeTab === 'following' && (
              <div className="text-center py-8">
                <p className="text-gray-500">Following list coming soon...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
