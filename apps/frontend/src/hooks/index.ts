import { useEffect, useState } from "react"
import axios, { AxiosError } from "axios";
import { BACKEND_URL } from "../config";

export interface Blog {
    "content": string;
    "title": string;
    "id": string;
    "createdAt": string;
    "published": boolean;
    "excerpt"?: string;
    "slug"?: string;
    "views": number;
    "likesCount": number;
    "commentsCount": number;
    "bookmarksCount": number;
    "readTime"?: number;
    "author": {
        "id": string;
        "name": string;
        "avatar"?: string;
        "bio"?: string;
    }
}

export interface ApiResponse<T> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    errors?: Record<string, string[]>;
}

export interface BlogResponse {
    blog: Blog;
}

export interface BlogsResponse {
    blogs: Blog[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalBlogs: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
    };
}

export const useBlog = ({ id }: { id: string }) => {
    const [loading, setLoading] = useState(true);
    const [blog, setBlog] = useState<Blog>();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchBlog = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get<ApiResponse<BlogResponse>>(
                    `${BACKEND_URL}/api/v1/blog/${id}`, 
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}` || ""
                        }
                    }
                );
                
                if (response.data.success && response.data.data) {
                    setBlog(response.data.data.blog);
                } else {
                    setError(response.data.message || 'Failed to fetch blog');
                }
            } catch (err) {
                const axiosError = err as AxiosError<ApiResponse<any>>;
                setError(
                    axiosError.response?.data?.message || 
                    'Network error occurred while fetching blog'
                );
                console.error('Blog fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        
        if (id) {
            fetchBlog();
        }
    }, [id]);

    return {
        loading,
        blog,
        error
    };
};
export const useBlogs = (page: number = 1, limit: number = 10) => {
    const [loading, setLoading] = useState(true);
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalBlogs: 0,
        hasNextPage: false,
        hasPrevPage: false
    });

    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                setError(null);
                
                const response = await axios.get<ApiResponse<BlogsResponse>>(
                    `${BACKEND_URL}/api/v1/blog/bulk`, 
                    {
                        params: { page, limit },
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem("token")}` || ""
                        }
                    }
                );
                
                if (response.data.success && response.data.data) {
                    setBlogs(response.data.data.blogs);
                    setPagination(response.data.data.pagination);
                } else {
                    setError(response.data.message || 'Failed to fetch blogs');
                }
            } catch (err) {
                const axiosError = err as AxiosError<ApiResponse<any>>;
                setError(
                    axiosError.response?.data?.message || 
                    'Network error occurred while fetching blogs'
                );
                console.error('Blogs fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        
        fetchBlogs();
    }, [page, limit]);

    return {
        loading,
        blogs,
        error,
        pagination,
        refetch: () => {
            setLoading(true);
            setError(null);
        }
    };
};
