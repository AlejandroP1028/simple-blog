// app/page.tsx or any client component
'use client'

import { useAppDispatch, useAppSelector } from '@/store'
import { addBlog } from '@/features/blogSlice'

export default function Home() {
  const dispatch = useAppDispatch()
  const blogs = useAppSelector((state) => state.blog.blogs)

  return (
    <div>
      <button
        onClick={() =>
          dispatch(addBlog({ id: Date.now().toString(), title: 'New Blog', content: '...' }))
        }
      >
        Add Blog
      </button>
      <ul>
        {blogs.map((b) => (
          <li key={b.id}>{b.title}</li>
        ))}
      </ul>
    </div>
  )
}
