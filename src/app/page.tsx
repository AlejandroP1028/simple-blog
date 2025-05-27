// app/page.tsx or any client component
'use client'

import { useAppDispatch, useAppSelector } from '@/store'
import { addBlog } from '@/features/blogSlice'
import { Button } from '@/components/ui/button'
export default function Home() {
  const dispatch = useAppDispatch()
  const blogs = useAppSelector((state) => state.blog.blogs)

  return (
    <div className="container mx-auto p-6 bg-white  shadow-md">
      <h1 className="text-2xl font-bold mb-4">Blog List</h1>
      <p className="mb-4">This is a simple blog application using Redux Toolkit.</p>
      <p className="mb-4">Click the button below to add a new blog post.</p>
      <Button
        onClick={() =>
          dispatch(addBlog({ id: Date.now().toString(), title: 'New Blog', content: '...' }))
        }
      >
        Add Blog
      </Button>
      <ul className="mt-6 space-y-4">
        {blogs.map((blog) => (
          <li key={blog.id} className="p-4 border rounded-md">
            <h2 className="text-xl font-semibold">{blog.title}</h2>
            <p>{blog.content}</p>
          </li>
        ))}
      </ul>
    </div>
  )
}
