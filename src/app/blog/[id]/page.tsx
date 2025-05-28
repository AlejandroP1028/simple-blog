'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAppSelector } from '@/store'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ArrowLeft, Loader2, AlertCircle, Edit, Calendar } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { createClient } from '@/lib/supabaseClient'
import NavBar from '@/components/nav-bar'
import Link from 'next/link'

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const user = useAppSelector((state) => state.user)
  const supabase = createClient()

  const [blog, setBlog] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get blog ID from params
  const blogId = Array.isArray(params.id) ? params.id[0] : params.id

  // Fetch blog post data
  useEffect(() => {
    const fetchBlog = async () => {
      setLoading(true)
      setError(null)

      try {
        // Fetch the blog post with author information
        const { data, error } = await supabase
          .from('blogs')
          .select(
            `
            *,
            profiles (
              id,
              first_name,
              last_name
            )
          `
          )
          .eq('id', blogId)
          .single()

        if (error) {
          console.error('Error fetching blog:', error.message)
          setError("Failed to load blog post. It may have been removed or doesn't exist.")
        } else if (data) {
          console.log('Fetched blog:', data)
          setBlog(data)
        } else {
          setError('Blog post not found.')
        }
      } catch (error) {
        console.error('Unexpected error fetching blog:', error)
        setError('An unexpected error occurred. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    if (blogId) {
      fetchBlog()
    }
  }, [blogId, supabase])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar></NavBar>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading post...</span>
          </div>
        )}

        {/* Error State */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Blog Post */}
        {!loading && blog && (
          <article>
            {/* Article Header */}
            <header className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>

              {blog.excerpt && <p className="text-xl text-gray-600 mb-6">{blog.excerpt}</p>}

              {/* Author and Meta Info */}
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback>
                      {blog.profiles?.first_name && blog.profiles?.last_name
                        ? `${blog.profiles.first_name[0]}${blog.profiles.last_name[0]}`
                        : 'AU'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {blog.profiles?.first_name && blog.profiles?.last_name
                        ? `${blog.profiles.first_name} ${blog.profiles.last_name}`
                        : 'Anonymous User'}
                    </p>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Calendar className="h-4 w-4" />
                      <span>{formatDate(blog.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Edit button for author */}
                {user.isLoggedIn && user.id === blog.user_id && (
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/your-blogs`}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Post
                    </Link>
                  </Button>
                )}
              </div>
            </header>

            {/* Article Content */}
            <Card>
              <CardContent className="p-8">
                <div className="prose max-w-none">
                  {/* Render content with proper formatting */}
                  {blog.content.split('\n').map((paragraph: string, index: number) => (
                    <p key={index} className="mb-4 text-gray-800 leading-relaxed">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Author Info Footer */}
            <div className="mt-8 p-6 bg-white rounded-lg border">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-lg">
                    {blog.profiles?.first_name && blog.profiles?.last_name
                      ? `${blog.profiles.first_name[0]}${blog.profiles.last_name[0]}`
                      : 'AU'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-lg">
                    {blog.profiles?.first_name && blog.profiles?.last_name
                      ? `${blog.profiles.first_name} ${blog.profiles.last_name}`
                      : 'Anonymous User'}
                  </p>
                  <p className="text-gray-600">Author</p>
                </div>
              </div>
            </div>
          </article>
        )}
      </div>
    </div>
  )
}
