import { apiClient } from './api';
import type { ApiResponse } from '../hooks';

// Like API functions
export const likeApi = {
  toggleLike: async (postId: string) => {
    const response = await apiClient.post<ApiResponse<{
      isLiked: boolean;
      likesCount: number;
    }>>(`/api/v1/like/${postId}`);
    return response.data;
  },

  getLikeStatus: async (postId: string) => {
    const response = await apiClient.get<ApiResponse<{
      isLiked: boolean;
      likesCount: number;
    }>>(`/api/v1/like/${postId}/status`);
    return response.data;
  }
};

// Comment API functions
export const commentApi = {
  createComment: async (data: {
    content: string;
    postId: string;
    parentId?: string;
  }) => {
    const response = await apiClient.post<ApiResponse<{
      comment: any;
    }>>('/api/v1/comment', data);
    return response.data;
  },

  getComments: async (postId: string, page = 1, limit = 20) => {
    const response = await apiClient.get<ApiResponse<{
      comments: any[];
      pagination: any;
    }>>(`/api/v1/comment/post/${postId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  deleteComment: async (commentId: string) => {
    const response = await apiClient.delete<ApiResponse<any>>(
      `/api/v1/comment/${commentId}`
    );
    return response.data;
  }
};

// Follow API functions
export const followApi = {
  toggleFollow: async (targetUserId: string) => {
    const response = await apiClient.post<ApiResponse<{
      isFollowing: boolean;
      targetUser: {
        id: string;
        name: string;
        followerCount: number;
      };
    }>>(`/api/v1/follow/${targetUserId}`);
    return response.data;
  },

  getFollowStatus: async (targetUserId: string) => {
    const response = await apiClient.get<ApiResponse<{
      isFollowing: boolean;
      followerCount: number;
    }>>(`/api/v1/follow/${targetUserId}/status`);
    return response.data;
  },

  getFollowers: async (userId: string, page = 1, limit = 20) => {
    const response = await apiClient.get<ApiResponse<{
      followers: any[];
      pagination: any;
    }>>(`/api/v1/follow/followers/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  getFollowing: async (userId: string, page = 1, limit = 20) => {
    const response = await apiClient.get<ApiResponse<{
      following: any[];
      pagination: any;
    }>>(`/api/v1/follow/following/${userId}?page=${page}&limit=${limit}`);
    return response.data;
  }
};

// Bookmark API functions
export const bookmarkApi = {
  toggleBookmark: async (postId: string) => {
    const response = await apiClient.post<ApiResponse<{
      isBookmarked: boolean;
      bookmarksCount: number;
    }>>(`/api/v1/bookmark/${postId}`);
    return response.data;
  },

  getBookmarkStatus: async (postId: string) => {
    const response = await apiClient.get<ApiResponse<{
      isBookmarked: boolean;
      bookmarksCount: number;
    }>>(`/api/v1/bookmark/${postId}/status`);
    return response.data;
  },

  getMyBookmarks: async (page = 1, limit = 10) => {
    const response = await apiClient.get<ApiResponse<{
      bookmarks: any[];
      pagination: any;
    }>>(`/api/v1/bookmark/my-bookmarks?page=${page}&limit=${limit}`);
    return response.data;
  }
};

// Search API functions
export const searchApi = {
  searchBlogs: async (params: {
    query?: string;
    category?: string;
    author?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        searchParams.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get<ApiResponse<{
      blogs: any[];
      pagination: any;
      searchQuery: any;
    }>>(`/api/v1/search/blogs?${searchParams.toString()}`);
    return response.data;
  },

  searchUsers: async (query: string, page = 1, limit = 10) => {
    const response = await apiClient.get<ApiResponse<{
      users: any[];
      pagination: any;
      searchQuery: any;
    }>>(`/api/v1/search/users?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`);
    return response.data;
  },

  getSuggestions: async (query: string) => {
    const response = await apiClient.get<ApiResponse<{
      blogs: any[];
      users: any[];
      tags: any[];
    }>>(`/api/v1/search/suggestions?query=${encodeURIComponent(query)}`);
    return response.data;
  }
};

// User API functions
export const userApi = {
  getPublicProfile: async (userId: string) => {
    const response = await apiClient.get<ApiResponse<{
      user: any;
      recentPosts: any[];
    }>>(`/api/v1/user/public/${userId}`);
    return response.data;
  }
};
