// app/lib/features/blogSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { Blog } from '@/lib/types' 

interface BlogState {
  blogs: Blog[]
}

const initialState: BlogState = {
  blogs: [],
}

const blogSlice = createSlice({
  name: 'blog',
  initialState,
  reducers: {
    setBlogs(state, action: PayloadAction<Blog[]>) {
      state.blogs = action.payload
    },
    addBlog(state, action: PayloadAction<Blog>) {
      state.blogs.push(action.payload)
    },
    removeBlog(state, action: PayloadAction<string>) {
      state.blogs = state.blogs.filter((b) => b.id !== action.payload)
    },
  },
})

export const { setBlogs, addBlog, removeBlog } = blogSlice.actions
export default blogSlice.reducer
