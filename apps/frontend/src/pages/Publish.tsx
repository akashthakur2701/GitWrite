import { Appbar } from "../components/Appbar";
import axios from "axios";
import { BACKEND_URL } from "../config";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import TextEditor from "../components/TextEditor";

export const Publish = () => {
  const [title, setTitle] = useState("");
  const [htmlContent, setHtmlContent] = useState(""); 
  const navigate = useNavigate();

  const handlePublish = async () => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/blog`,
        {
          title,
          content: htmlContent,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}` || "",
          },
        }
      );
      
      // Handle new API response structure
      if (response.data.success && response.data.data?.blog?.id) {
        navigate(`/blog/${response.data.data.blog.id}`);
      } else {
        console.error("Invalid response structure:", response.data);
        alert("Blog published but unable to redirect. Check your blogs list.");
        navigate("/");
      }
    } catch (error) {
      console.error("Publish error:", error);
      alert("Failed to publish blog");
    }
  };

  return (
    <div>
      <Appbar />
      <div className="flex justify-center w-full pt-8 px-4">
        <div className="max-w-screen-lg w-full">
          <input
            onChange={(e) => setTitle(e.target.value)}
            type="text"
            className="mb-4 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
            placeholder="Blog Title"
          />

          <TextEditor
            onChange={(html) => setHtmlContent(html)}
            content="<p>Start writing your blog here...</p>"
          />

          <button
            onClick={handlePublish}
            className="mt-4 inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-900"
          >
            Publish post
          </button>
        </div>
      </div>
    </div>
  );
};
