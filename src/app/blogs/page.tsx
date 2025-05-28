'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Calendar,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { createClient } from '@/lib/supabaseClient'
import NavBar from '@/components/nav-bar'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { setBlogs, removeBlog } from '@/features/blogSlice'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Blog } from '@/lib/types'

export default function YourBlogsPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user)
  const supabase = createClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [blogs, setUserBlogs] = useState<Blog[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [blogToDelete, setBlogToDelete] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [blogToEdit, setBlogToEdit] = useState<Blog | null>(null)
  const [editFormData, setEditFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
  })
  const [editLoading, setEditLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if user is logged in
  useEffect(() => {
    if (!user.isLoggedIn) {
      router.push('/login')
    }
  }, [user.isLoggedIn, router])

  // Fetch user's blogs
  useEffect(() => {
    const fetchUserBlogs = async () => {
      if (!user.id) return

      setLoading(true)
      setError(null)

      try {
        const { data, error } = await supabase
          .from('blogs')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching blogs:', error.message)
          setError('Failed to load your blogs. Please try again.')
        } else {
          console.log('Fetched user blogs:', data)
          setUserBlogs(data || [])
        }
      } catch (error) {
        console.error('Unexpected error fetching blogs:', error)
        setError('An unexpected error occurred. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (user.id) {
      fetchUserBlogs()
    }
  }, [user.id, supabase])

  // Filter blogs based on search term and active tab
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (blog.excerpt && blog.excerpt.toLowerCase().includes(searchTerm.toLowerCase()))

    return matchesSearch
  })

  const handleDeleteClick = (blogId: string) => {
    setBlogToDelete(blogId)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!blogToDelete) return

    setDeleteLoading(true)
    try {
      const { error } = await supabase.from('blogs').delete().eq('id', blogToDelete)

      if (error) {
        console.error('Error deleting blog:', error.message)
        setError('Failed to delete blog. Please try again.')
      } else {
        // Remove from local state
        setUserBlogs((prev) => prev.filter((blog) => blog.id !== blogToDelete))
        // Remove from Redux store
        dispatch(removeBlog(blogToDelete))
      }
    } catch (error) {
      console.error('Unexpected error deleting blog:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setDeleteLoading(false)
      setDeleteDialogOpen(false)
      setBlogToDelete(null)
    }
  }

  // Handle edit blog
  const handleEditClick = (blog: Blog) => {
    setBlogToEdit(blog)
    setEditFormData({
      title: blog.title,
      excerpt: blog.excerpt || '',
      content: blog.content,
    })
    setEditDialogOpen(true)
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditFormData((prev) => ({ ...prev, [name]: value }))
  }

  const confirmEdit = async () => {
    if (!blogToEdit) return

    setEditLoading(true)
    try {
      const { error } = await supabase
        .from('blogs')
        .update({
          title: editFormData.title,
          excerpt: editFormData.excerpt,
          content: editFormData.content,
        })
        .eq('id', blogToEdit.id)

      if (error) {
        console.error('Error updating blog:', error.message)
        setError('Failed to update blog. Please try again.')
      } else {
        // Update local state
        setUserBlogs((prev) =>
          prev.map((blog) =>
            blog.id === blogToEdit.id
              ? {
                  ...blog,
                  title: editFormData.title,
                  excerpt: editFormData.excerpt,
                  content: editFormData.content,
                  updated_at: new Date().toISOString(),
                }
              : blog
          )
        )

        // Refresh blogs in Redux store
        const { data } = await supabase
          .from('blogs')
          .select('*')
          .order('created_at', { ascending: false })
        if (data) {
          dispatch(setBlogs(data))
        }
      }
    } catch (error) {
      console.error('Unexpected error updating blog:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setEditLoading(false)
      setEditDialogOpen(false)
      setBlogToEdit(null)
    }
  }

  // If not logged in, don't render anything (will redirect)
  if (!user.isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Blogs</h1>
          <p className="text-gray-600">
            Manage your blog posts, track performance, and create new content
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Blog Management */}
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Your Posts</CardTitle>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Search your posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button asChild>
                  <Link href="/create">
                    <Plus className="h-4 w-4 mr-2" />
                    New Post
                  </Link>
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="ml-2 text-gray-600">Loading your posts...</span>
              </div>
            ) : filteredBlogs.length > 0 ? (
              <div className="space-y-4">
                {filteredBlogs.map((blog) => (
                  <div
                    key={blog.id}
                    className="border rounded-lg p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600">
                            <Link href={`/blog/${blog.id}`}>{blog.title}</Link>
                          </h3>
                        </div>
                        <p className="text-gray-600 mb-3">
                          {blog.excerpt || blog.content.substring(0, 150) + '...'}
                        </p>
                        <div className="flex items-center gap-6 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(blog.created_at!).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/blog/${blog.id}`}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditClick(blog)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteClick(blog.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchTerm ? 'No matching posts found' : 'No posts yet'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {searchTerm
                    ? 'Try adjusting your search terms or filters.'
                    : 'Get started by creating your first blog post.'}
                </p>
                <Button asChild>
                  <Link href="/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create your first post
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <div className="text-sm text-gray-500">
              {filteredBlogs.length} {filteredBlogs.length === 1 ? 'post' : 'posts'} found
            </div>
            <Button asChild variant="outline">
              <Link href="/">View All Blogs</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Blog Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this blog post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteLoading}>
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Blog Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>Make changes to your blog post below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                name="title"
                value={editFormData.title}
                onChange={handleEditChange}
                placeholder="Enter blog title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="excerpt" className="text-sm font-medium">
                Excerpt
              </label>
              <Input
                id="excerpt"
                name="excerpt"
                value={editFormData.excerpt}
                onChange={handleEditChange}
                placeholder="Brief description of your post"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                name="content"
                value={editFormData.content}
                onChange={handleEditChange}
                placeholder="Write your blog content here..."
                rows={10}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDialogOpen(false)}
              disabled={editLoading}
            >
              Cancel
            </Button>
            <Button onClick={confirmEdit} disabled={editLoading}>
              {editLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
