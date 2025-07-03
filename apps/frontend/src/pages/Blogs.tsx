import { Appbar } from "../components/Appbar"
import { BlogCard } from "../components/BlogCard"
import { BlogSkeleton } from "../components/BlogSkeleton";
import { useBlogs } from "../hooks";
//console.log("blogs component mouted")
export const Blogs = () => {
    const { loading, blogs } = useBlogs();

    if (loading) {
        return <div>
            <Appbar /> 
            <div  className="flex justify-center">
                <div>
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                    <BlogSkeleton />
                </div>
            </div>
        </div>
    }
//     if (!blogs || blogs.length === 0) {
//   return <div><Appbar /><p className="text-center">No blogs available</p></div>
// }
 //console.log(blogs);
    return <div>
        <Appbar />
        <div  className="flex justify-center">
            <div>
                
                {(blogs ?? []).map(blog => <BlogCard
                   key={blog.id}
                    id={blog.id}
                    authorName={blog.author?.name ?? "Anonymous"}
                    title={blog.title}
                    content={blog.content}
                    publishedDate={"2nd Feb 2024"}
                />)}
            </div>
        </div>
    </div>
}