import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { apiClient, handleApiError } from "../utils/api";
import type { ApiResponse } from "../hooks";
import TextEditor from "../components/TextEditor";

interface Category {
  id: string;
  name: string;
  slug: string;
  color: string;
}

export const Publish = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const navigate = useNavigate();

  // Mock categories - you can replace with API call
  useEffect(() => {
    setCategories([
      { id: '1', name: 'Technology', slug: 'tech', color: '#3B82F6' },
      { id: '2', name: 'Design', slug: 'design', color: '#8B5CF6' },
      { id: '3', name: 'Business', slug: 'business', color: '#10B981' },
      { id: '4', name: 'Life', slug: 'life', color: '#F59E0B' },
      { id: '5', name: 'Travel', slug: 'travel', color: '#EF4444' },
      { id: '6', name: 'Food', slug: 'food', color: '#F97316' },
    ]);
  }, []);

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 10) {
      setTags([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handlePublish = async (saveAsDraft = false) => {
    if (!title.trim() || !content.trim()) {
      alert('Please fill in both title and content');
      return;
    }

    try {
      setIsPublishing(true);
      
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

      const response = await apiClient.post<ApiResponse<{ blog: { id: string } }>>(
        '/api/v1/blog',
        postData
      );

      if (response.data.success && response.data.data?.blog?.id) {
        navigate(`/blog/${response.data.data.blog.id}`);
      } else {
        console.error("Invalid response structure:", response.data);
        alert(saveAsDraft ? "Draft saved successfully!" : "Blog published successfully!");
        navigate("/dashboard");
      }
    } catch (error) {
      console.error('Publish error:', error);
      alert(`Failed to ${saveAsDraft ? 'save draft' : 'publish blog'}: ${handleApiError(error as any)}`);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Link>
              <h1 className="text-xl font-semibold text-gray-900">Write a new story</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => handlePublish(true)}
                disabled={isPublishing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {isPublishing && isDraft ? 'Saving...' : 'Save Draft'}
              </button>
              <button
                onClick={() => handlePublish(false)}
                disabled={isPublishing || !title.trim() || !content.trim()}
                className="inline-flex items-center px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPublishing && !isDraft ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Publishing...
                  </>
                ) : (
                  'Publish'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-4xl font-bold placeholder-gray-400 border-none focus:ring-0 focus:outline-none bg-transparent resize-none"
                placeholder="Title"
                maxLength={200}
              />
              <div className="text-sm text-gray-500 mt-1">
                {title.length}/200 characters
              </div>
            </div>

            {/* Excerpt */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Excerpt (Optional)
              </label>
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={3}
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Write a brief description of your story..."
                maxLength={300}
              />
              <div className="text-sm text-gray-500 mt-1">
                {excerpt.length}/300 characters
              </div>
            </div>

            {/* Content Editor */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <div className="border border-gray-300 rounded-md overflow-hidden">
                <TextEditor
                  onChange={setContent}
                  content="<p>Start writing your story...</p>"
                />
              </div>
              <div className="text-sm text-gray-500 mt-2 flex justify-between">
                <span>Estimated read time: {calculateReadTime(content)} min</span>
                <span>{content.replace(/<[^>]*>/g, '').split(/\s+/).length} words</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Publishing Options */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Publishing Options</h3>
              
              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select a category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags ({tags.length}/10)
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded-full hover:bg-blue-200"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 border-gray-300 rounded-l-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add a tag"
                    maxLength={50}
                    disabled={tags.length >= 10}
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    disabled={!newTag.trim() || tags.includes(newTag.trim()) || tags.length >= 10}
                    className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Add up to 10 tags to help readers discover your story
                </p>
              </div>
            </div>

            {/* Writing Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">💡 Writing Tips</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>• Write a compelling title that grabs attention</li>
                <li>• Use subheadings to break up your content</li>
                <li>• Include relevant images to enhance your story</li>
                <li>• Choose tags that accurately describe your content</li>
                <li>• Proofread before publishing</li>
              </ul>
            </div>

            {/* Category Preview */}
            {selectedCategory && (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Category Preview</h3>
                {(() => {
                  const category = categories.find(c => c.id === selectedCategory);
                  return category ? (
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category.color }}
                      ></div>
                      <span className="text-sm font-medium text-gray-700">{category.name}</span>
                    </div>
                  ) : null;
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
