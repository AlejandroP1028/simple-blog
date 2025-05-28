'use client'

import type React from 'react'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppDispatch, useAppSelector } from '@/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, AlertCircle, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabaseClient'
import NavBar from '@/components/nav-bar'
import Link from 'next/link'
import { addBlog } from '@/features/blogSlice'

export default function CreateBlogPage() {
  const router = useRouter()
  const dispatch = useAppDispatch()
  const user = useAppSelector((state) => state.user)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user.isLoggedIn) {
      router.push('/login')
    }
  }, [user.isLoggedIn, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user.isLoggedIn) {
      setError('You must be logged in to create a blog post.')
      return
    }

    if (!formData.title.trim() || !formData.content.trim()) {
      setError('Title and content are required.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('blogs')
        .insert([
          {
            title: formData.title.trim(),
            excerpt: formData.excerpt.trim() || null,
            content: formData.content.trim(),
            user_id: user.id,

            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single()

      if (error) {
        console.error('Error creating blog:', error.message)
        setError('Failed to create blog post. Please try again.')
      } else if (data) {
        console.log('Blog created successfully:', data)

        dispatch(addBlog(data))

        router.push(`/blog/${data.id}`)
      }
    } catch (error) {
      console.error('Unexpected error creating blog:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user.isLoggedIn) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Blog
          </Link>
        </Button>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Blog Post</h1>
          <p className="text-gray-600">Share your thoughts and ideas with the community</p>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Create Form */}
        <Card>
          <CardHeader>
            <CardTitle>Write Your Post</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter your blog post title..."
                  value={formData.title}
                  onChange={handleInputChange}
                  className="text-lg"
                  required
                  disabled={loading}
                />
              </div>

              {/* Excerpt */}
              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="Write a brief description of your post (optional)..."
                  value={formData.excerpt}
                  onChange={handleInputChange}
                  rows={3}
                  disabled={loading}
                />
                <p className="text-sm text-gray-500">
                  A short summary that will appear in blog listings and search results.
                </p>
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">
                  Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  placeholder="Write your blog post content here..."
                  value={formData.content}
                  onChange={handleInputChange}
                  rows={20}
                  className="font-mono"
                  required
                  disabled={loading}
                />
                <p className="text-sm text-gray-500">
                  Write your full blog post content. You can use line breaks to separate paragraphs.
                </p>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6">
                <Button type="submit" disabled={loading} size="lg">
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    'Publish Post'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
