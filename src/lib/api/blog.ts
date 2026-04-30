'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { BlogPost, ApiResponse } from '@/lib/types'

// ==========================================
// GET ALL BLOG POSTS (Admin)
// ==========================================

export async function getAllBlogPosts(options?: {
    status?: 'draft' | 'published' | 'archived'
    limit?: number
}): Promise<ApiResponse<BlogPost[]>> {
    try {
        const supabase = await createAdminClient()

        let query = supabase
            .from('blog_posts')
            .select('*')
            .order('created_at', { ascending: false })

        if (options?.status) {
            query = query.eq('status', options.status)
        }

        if (options?.limit) {
            query = query.limit(options.limit)
        }

        const { data, error } = await query

        if (error) {
            return { error: error.message }
        }

        return { data: data as BlogPost[] }
    } catch (error) {
        return { error: 'Failed to fetch blog posts' }
    }
}

// ==========================================
// GET BLOG POST BY SLUG (Public)
// ==========================================

export async function getBlogPostBySlug(slug: string): Promise<ApiResponse<BlogPost>> {
    try {
        const supabase = await createAdminClient()

        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('slug', slug)
            .eq('status', 'published')
            .single()

        if (error) {
            return { error: 'Blog post not found' }
        }

        return { data: data as BlogPost }
    } catch (error) {
        return { error: 'Failed to fetch blog post' }
    }
}

// ==========================================
// GET BLOG POST BY ID (Admin)
// ==========================================

export async function getBlogPostById(id: string): Promise<ApiResponse<BlogPost>> {
    try {
        const supabase = await createAdminClient()

        const { data, error } = await supabase
            .from('blog_posts')
            .select('*')
            .eq('id', id)
            .single()

        if (error) {
            return { error: 'Blog post not found' }
        }

        return { data: data as BlogPost }
    } catch (error) {
        return { error: 'Failed to fetch blog post' }
    }
}

// ==========================================
// CREATE BLOG POST
// ==========================================

export async function createBlogPost(input: {
    title: string
    slug?: string
    content?: string
    excerpt?: string
    featured_image?: string
    tags?: string[]
    status?: 'draft' | 'published'
}): Promise<ApiResponse<BlogPost>> {
    try {
        const supabase = await createAdminClient()

        // Generate slug from title if not provided
        const slug = input.slug || input.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '')

        const { data, error } = await supabase
            .from('blog_posts')
            .insert({
                title: input.title,
                slug,
                content: input.content || '',
                excerpt: input.excerpt,
                featured_image: input.featured_image,
                tags: input.tags || [],
                status: input.status || 'draft',
                published_at: input.status === 'published' ? new Date().toISOString() : null,
            })
            .select()
            .single()

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/admin/blog')
        return { data: data as BlogPost, message: 'Blog post created' }
    } catch (error) {
        return { error: 'Failed to create blog post' }
    }
}

// ==========================================
// UPDATE BLOG POST
// ==========================================

export async function updateBlogPost(
    id: string,
    input: Partial<{
        title: string
        slug: string
        content: string
        excerpt: string
        featured_image: string
        tags: string[]
        status: 'draft' | 'published' | 'archived'
        seo_title: string
        seo_description: string
    }>
): Promise<ApiResponse<BlogPost>> {
    try {
        const supabase = await createAdminClient()

        // Set published_at if publishing for first time
        const updateData: any = { ...input }
        if (input.status === 'published') {
            const { data: existing } = await supabase
                .from('blog_posts')
                .select('published_at')
                .eq('id', id)
                .single()

            if (!existing?.published_at) {
                updateData.published_at = new Date().toISOString()
            }
        }

        const { data, error } = await supabase
            .from('blog_posts')
            .update(updateData)
            .eq('id', id)
            .select()
            .single()

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/admin/blog')
        revalidatePath(`/blog/${data.slug}`)
        return { data: data as BlogPost, message: 'Blog post updated' }
    } catch (error) {
        return { error: 'Failed to update blog post' }
    }
}

// ==========================================
// DELETE BLOG POST
// ==========================================

export async function deleteBlogPost(id: string): Promise<ApiResponse<null>> {
    try {
        const supabase = await createAdminClient()

        const { error } = await supabase
            .from('blog_posts')
            .delete()
            .eq('id', id)

        if (error) {
            return { error: error.message }
        }

        revalidatePath('/admin/blog')
        return { message: 'Blog post deleted' }
    } catch (error) {
        return { error: 'Failed to delete blog post' }
    }
}

// ==========================================
// GET PUBLISHED BLOG POSTS (Public)
// ==========================================

export async function getPublishedBlogPosts(limit?: number): Promise<ApiResponse<BlogPost[]>> {
    try {
        const supabase = await createAdminClient()

        let query = supabase
            .from('blog_posts')
            .select('*')
            .eq('status', 'published')
            .order('published_at', { ascending: false })

        if (limit) {
            query = query.limit(limit)
        }

        const { data, error } = await query

        if (error) {
            return { error: error.message }
        }

        return { data: data as BlogPost[] }
    } catch (error) {
        return { error: 'Failed to fetch blog posts' }
    }
}
