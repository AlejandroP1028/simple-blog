'use client'

import type React from 'react'

import { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from '@/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import BlogCard from '@/components/blog-card'
import { Search, ChevronLeft, ChevronRight, Plus, Loader2 } from 'lucide-react'
import { addBlogFunc } from '@/lib/blogFunctions'
import { createClient } from '@/lib/supabaseClient'
import NavBar from '@/components/nav-bar'
import Link from 'next/link'

export default function HomePage() {
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user)
  const blogs = useAppSelector((state) => state.blog.blogs)
  const supabase = createClient()

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [loading, setLoading] = useState(false)
  const [totalCount, setTotalCount] = useState(0)
  const [searchLoading, setSearchLoading] = useState(false)
  const blogsPerPage = 6

  // Calculate pagination values
  const totalPages = Math.ceil(totalCount / blogsPerPage)
  const startIndex = (currentPage - 1) * blogsPerPage

  // Fetch blogs with pagination and search
  const fetchBlogs = async (page: number, search = '') => {
    setLoading(true)
    try {
      let query = supabase
        .from('blogs')
        .select(
          `
          *,
          profiles (
            first_name,
            last_name
          )
        `,
          { count: 'exact' }
        )
        .order('created_at', { ascending: false })

      // Add search filter if search term exists
      if (search.trim()) {
        query = query.or(
          `title.ilike.%${search}%,content.ilike.%${search}%,excerpt.ilike.%${search}%`
        )
      }

      // Add pagination
      const from = (page - 1) * blogsPerPage
      const to = from + blogsPerPage - 1
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching blogs:', error.message)
      } else {
        console.log('Fetched blogs:', data)
        console.log('Total count:', count)

        // Update Redux store with current page blogs
        dispatch({ type: 'blog/setBlogs', payload: data || [] })
        setTotalCount(count || 0)
      }
    } catch (error) {
      console.error('Unexpected error fetching blogs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Debounced search function
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        setSearchLoading(true)
        setCurrentPage(1) // Reset to first page on search
        fetchBlogs(1, searchTerm).finally(() => setSearchLoading(false))
      }
    }, 500) // 500ms delay for debouncing

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  // Fetch blogs when page changes (but not on search)
  useEffect(() => {
    if (searchTerm === '') {
      fetchBlogs(currentPage)
    } else {
      // If there's a search term, fetch with search
      setSearchLoading(true)
      fetchBlogs(currentPage, searchTerm).finally(() => setSearchLoading(false))
    }
  }, [currentPage])

  // Initial load
  useEffect(() => {
    fetchBlogs(1)
  }, [])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)

    // If search is cleared, fetch all blogs
    if (value === '') {
      setCurrentPage(1)
      fetchBlogs(1)
    }
  }

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // fetchBlogs will be called by useEffect
  }

  const handleAddSampleBlog = () => {
    if (!user.isLoggedIn) {
      alert('Please log in to add a blog post.')
      return
    }

    addBlogFunc(
      dispatch,
      {
        id: Date.now().toString(),
        title: `Sample Blog Post ${Date.now()}`,
        excerpt: 'This is a sample blog post excerpt that gives readers a preview of the content.',
        content:
          'This is the full content of the sample blog post. It contains detailed information about the topic.',
        user_id: user.id as string,
      },
      setLoading
    ).then(() => {
      // Refresh the current page after adding a blog
      fetchBlogs(currentPage, searchTerm)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">Welcome to DevBlog</h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              {user.isLoggedIn
                ? `Welcome back, ${user.firstName} ${user.lastName}! Share your thoughts with the world.`
                : 'Discover insights, tutorials, and stories from developers around the world'}
            </p>
            {user.isLoggedIn ? (
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/create">Start Writing</Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
                  onClick={handleAddSampleBlog}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? 'Adding...' : 'Quick Add Sample'}
                </Button>
              </div>
            ) : (
              <div className="flex gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link href="/register">Get Started</Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  variant="outline"
                  className="bg-transparent border-white text-white hover:bg-white hover:text-blue-600"
                >
                  <Link href="/login">Sign In</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Stats */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm ? `Search Results (${totalCount})` : `Latest Posts (${totalCount})`}
            </h2>
            <p className="text-gray-600">
              {totalCount === 0
                ? 'No blog posts yet. Be the first to share your thoughts!'
                : `Showing ${blogs.length} of ${totalCount} posts`}
            </p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search articles..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="pl-10 w-64"
            />
            {searchLoading && (
              <Loader2 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 animate-spin" />
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && !searchLoading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading posts...</span>
          </div>
        )}

        {/* Blog Grid */}
        {!loading && blogs.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {blogs.map((blog) => (
                <BlogCard key={blog.id} blog={blog} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                <div className="flex gap-1">
                  {/* Show page numbers with ellipsis for large page counts */}
                  {(() => {
                    const pages = []
                    const showEllipsis = totalPages > 7

                    if (!showEllipsis) {
                      // Show all pages if 7 or fewer
                      for (let i = 1; i <= totalPages; i++) {
                        pages.push(i)
                      }
                    } else {
                      // Show first page, current page area, and last page with ellipsis
                      if (currentPage <= 4) {
                        for (let i = 1; i <= 5; i++) pages.push(i)
                        pages.push('...')
                        pages.push(totalPages)
                      } else if (currentPage >= totalPages - 3) {
                        pages.push(1)
                        pages.push('...')
                        for (let i = totalPages - 4; i <= totalPages; i++) pages.push(i)
                      } else {
                        pages.push(1)
                        pages.push('...')
                        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
                        pages.push('...')
                        pages.push(totalPages)
                      }
                    }

                    return pages.map((page, index) =>
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
                          ...
                        </span>
                      ) : (
                        <Button
                          key={page}
                          variant={currentPage === page ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => handlePageChange(page as number)}
                          className="w-10"
                          disabled={loading}
                        >
                          {page}
                        </Button>
                      )
                    )
                  })()}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                  disabled={currentPage === totalPages || loading}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          !loading && (
            /* Empty State */
            <div className="text-center py-16">
              <div className="max-w-md mx-auto">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {searchTerm ? 'No posts found' : 'No blog posts yet'}
                </h3>
                <p className="text-gray-600 mb-6">
                  {searchTerm
                    ? `No posts match "${searchTerm}". Try adjusting your search terms.`
                    : user.isLoggedIn
                      ? 'Start sharing your thoughts and experiences with the community!'
                      : 'Be the first to share your thoughts! Sign up and create your first post.'}
                </p>
                {searchTerm ? (
                  <Button onClick={() => setSearchTerm('')} variant="outline">
                    Clear Search
                  </Button>
                ) : user.isLoggedIn ? (
                  <div className="flex gap-3 justify-center">
                    <Button asChild>
                      <Link href="/create">
                        <Plus className="h-4 w-4 mr-2" />
                        Create Your First Post
                      </Link>
                    </Button>
                    <Button variant="outline" onClick={handleAddSampleBlog} disabled={loading}>
                      {loading ? 'Adding...' : 'Add Sample Post'}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-3 justify-center">
                    <Button asChild>
                      <Link href="/register">Get Started</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href="/login">Sign In</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
