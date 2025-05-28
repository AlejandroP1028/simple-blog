import React from 'react'
import { Blog } from '@/lib/types'
import { Card, CardHeader, CardContent, CardTitle, CardFooter } from './ui/card'

import { Avatar, AvatarFallback } from './ui/avatar'
import Link from 'next/link'
import { Calendar } from 'lucide-react'

interface BlogCardProps {
  blog: Blog
}

function BlogCard({ blog }: BlogCardProps) {
  console.log('here', blog.profiles)
  return (
    <Card
      key={blog.id}
      className="flex flex-col h-full hover:shadow-lg transition-shadow p-0 gap-0"
    >
      <CardHeader className="p-0">
        <div className="w-full h-48 bg-gradient-to-br from-blue-100 to-purple-100 rounded-t-lg flex items-center justify-center">
          <div className="text-center p-4">
            <h3 className="font-semibold text-gray-700 mb-2">Blog Post</h3>
            <p className="text-sm text-gray-500">ID: {blog.id.slice(-6)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="py-4">
        <CardTitle className="text-xl mb-2 hover:text-blue-600 transition-colors line-clamp-2">
          <Link href={`/blog/${blog.id}`}>{blog.title}</Link>
        </CardTitle>
        <p className="text-gray-600  line-clamp-3">
          {blog.excerpt || blog.content.substring(0, 150) + '...'}
        </p>
      </CardContent>
      <CardFooter className="flex items-center justify-between text-sm text-gray-500 p-4 self-bottom">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {blog.profiles && blog.profiles.first_name && blog.profiles.last_name
                ? `${blog.profiles?.first_name[0]}${blog.profiles?.last_name[0]}`
                : 'AU'}
            </AvatarFallback>
          </Avatar>
          <span>
            {blog.profiles && blog.profiles.first_name && blog.profiles.last_name
              ? `${blog.profiles.first_name} ${blog.profiles.last_name}`
              : 'Anonymous User'}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          <span>{blog.created_at && new Date(blog.created_at).toLocaleDateString()}</span>
        </div>
      </CardFooter>
    </Card>
  )
}

export default BlogCard
