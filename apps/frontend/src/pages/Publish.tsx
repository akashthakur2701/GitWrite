import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import TextEditor from '../components/TextEditor';
import { apiClient, handleApiError } from '../utils/api';
import type { ApiResponse } from '../hooks';
import { postInput } from '@akashthakur2701/zod';
import type { AxiosError } from 'axios';

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export const Publish = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('<p>Start writing your story...</p>');
  const [excerpt, setExcerpt] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [saveAsDraft, setSaveAsDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [generalError, setGeneralError] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    // Fetch categories
    const fetchCategories = async () => {
      try {
        const response = await apiClient.get<ApiResponse<Category[]>>('/api/v1/categories');
        if (response.data.success) {
          setCategories(response.data.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      addTag();
    }
  };

  const calculateReadTime = (content: string) => {
    const wordsPerMinute = 200;
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute);
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  const handlePublish = async (saveAsDraft = false) => {
    setErrors({});
    setGeneralError('');
    
    const postData = {
      title: title.trim(),
      content,
      excerpt: excerpt.trim() || content.replace(/<[^>]*>/g, '').substring(0, 200) + '...',
      slug: generateSlug(title),
      categoryId: selectedCategory || undefined,
      tags: tags,
      published: !saveAsDraft,
      readTime: calculateReadTime(content)
    };

    // Validate with Zod
    const validation = postInput.safeParse(postData);
    if (!validation.success) {
      setErrors(validation.error.flatten().fieldErrors);
      return;
    }

    try {
      setIsPublishing(true);

      const response = await apiClient.post<ApiResponse<{ blog: { id: string } }>>(
        '/api/v1/blog',
        postData
      );

      if (response.data.success && response.data.data?.blog?.id) {
        // Fix: Navigate to the published blog
        navigate(`/blog/${response.data.data.blog.id}`);
      } else {
        console.error("Invalid response structure:", response.data);
        alert(saveAsDraft ? "Draft saved successfully!" : "Blog published successfully!");
        navigate("/dashboard");
      }
    } catch (error: unknown) {
      console.error('Publish error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as AxiosError<ApiResponse<unknown>>;
        if (axiosError.response?.data?.errors) {
          setErrors(axiosError.response.data.errors);
        } else {
          setGeneralError(`Failed to ${saveAsDraft ? 'save draft' : 'publish blog'}: ${handleApiError(axiosError)}`);
        }
      } else {
        setGeneralError(`Failed to ${saveAsDraft ? 'save draft' : 'publish blog'}: Unknown error`);
      }
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link 
                to="/dashboard" 
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors duration-200"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back to Dashboard</span>
              </Link>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handlePublish(true)}
                disabled={isPublishing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
              >
                {isPublishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                    Saving...
                  </>
                ) : (
                  'Save Draft'
                )}
              </button>
              <button
                onClick={() => handlePublish(false)}
                disabled={isPublishing || !title.trim() || !content.trim()}
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
              >
                {isPublishing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    Publish
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Error Display */}
        {generalError && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm">
            <div className="flex">
              <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{generalError}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Title Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`w-full text-5xl font-bold placeholder-gray-400 border-none focus:ring-0 focus:outline-none bg-transparent resize-none leading-tight ${
                  errors.title ? 'text-red-600' : 'text-gray-900'
                }`}
                placeholder="Write your story title..."
                maxLength={200}
              />
              <div className="text-sm mt-3 flex justify-between">
                <span className={errors.title ? 'text-red-600' : 'text-gray-500'}>
                  {errors.title?.[0] || `${title.length}/200 characters`}
                </span>
              </div>
            </div>

            {/* Excerpt Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <label className="block text-lg font-semibold text-gray-900 mb-4">
                Story Excerpt
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={4}
                className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 text-lg leading-relaxed"
                placeholder="Write a compelling excerpt that will make readers want to read your story..."
                maxLength={300}
              />
              <div className="text-sm text-gray-500 mt-3 flex justify-between">
                <span>This will appear in previews and search results</span>
                <span>{excerpt.length}/300 characters</span>
              </div>
            </div>

            {/* Content Editor */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <label className={`block text-lg font-semibold mb-4 ${
                errors.content ? 'text-red-700' : 'text-gray-900'
              }`}>
                Your Story
              </label>
              <div className={`border-2 rounded-xl overflow-hidden transition-colors duration-200 ${
                errors.content ? 'border-red-300' : 'border-gray-200 focus-within:border-blue-500'
              }`}>
                <TextEditor
                  onChange={setContent}
                  content="<p>Start writing your story...</p>"
                />
              </div>
              <div className="text-sm mt-4">
                {errors.content ? (
                  <span className="text-red-600">{errors.content[0]}</span>
                ) : (
                  <div className="flex justify-between text-gray-500 bg-gray-50 rounded-lg p-3">
                    <span>📖 Estimated read time: {calculateReadTime(content)} min</span>
                    <span>📝 {content.replace(/<[^>]*>/g, '').split(/\s+/).length} words</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
                Publishing Options
              </h3>
              
              {/* Category Selection */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags Section */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tags (up to 5)
                </label>
                <div className="space-y-3">
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                      placeholder="Add a tag..."
                      className="flex-1 border-gray-300 rounded-l-lg shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      disabled={tags.length >= 5}
                  />
                  <button
                    onClick={addTag}
                      disabled={!newTag.trim() || tags.length >= 5}
                      className="px-4 py-2 bg-blue-600 text-white rounded-r-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    Add
                  </button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                        >
                          {tag}
                          <button
                            onClick={() => removeTag(tag)}
                            className="ml-2 text-blue-600 hover:text-blue-800"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Draft Toggle */}
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700">
                  Save as Draft
                </label>
                <button
                  onClick={() => setSaveAsDraft(!saveAsDraft)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                    saveAsDraft ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                      saveAsDraft ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Writing Tips */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Writing Tips
              </h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Write a compelling title that hooks readers
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Start with a strong opening paragraph
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Use clear, concise language
                </li>
                <li className="flex items-start">
                  <span className="text-blue-600 mr-2">•</span>
                  Break up text with headings and images
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
