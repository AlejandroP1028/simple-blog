// lib/blogFunctions.ts
import { Blog } from '@/lib/types'
import { AppDispatch } from '@/store'
import { addBlog } from '@/features/blogSlice'
import { createClient } from '@/lib/supabaseClient'

export const addBlogFunc = async (
  dispatch: AppDispatch,
  blog: Blog,
  setLoading: (val: boolean) => void
) => {
  const supabase = createClient()

  setLoading(true)

  console.log('Adding blog:', blog)
  dispatch(addBlog(blog))

  const { data, error } = await supabase.from('blogs').insert([
    {
      title: blog.title,
      excerpt: blog.excerpt,
      content: blog.content,
      user_id: blog.user_id ?? null,
    },
  ])

  setLoading(false)

  if (error) {
    console.error('Error adding blog to Supabase:', error.message)
  } else {
    console.log('Blog added to Supabase:', data)
  }
}
