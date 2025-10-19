'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  MessageCircle, 
  Heart, 
  Eye, 
  Plus, 
  Send,
  EyeOff,
  Shield,
  Calendar,
  Clock,
  Loader2,
  RefreshCw,
  Filter
} from 'lucide-react';
import { toast } from 'sonner';
import { useUser } from '@/hooks/use-user';

interface CommunityPost {
  id: string;
  company_id: string;
  author_id: string;
  title: string;
  content: string;
  category: 'general' | 'stress_relief' | 'work_life_balance' | 'mental_health' | 'success_stories' | 'seeking_support';
  tags: string[];
  is_anonymous: boolean;
  likes: number;
  replies: number;
  views: number;
  is_pinned: boolean;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface CommunityReply {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  is_anonymous: boolean;
  likes: number;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

interface AnonymousUser {
  id: string;
  employee_id: string;
  company_id: string;
  anonymous_id: string;
  display_name: string;
  avatar_color: string;
  created_at: string;
  last_active: string;
}

export default function AnonymousCommunity() {
  const { user } = useUser();
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [replies, setReplies] = useState<{ [postId: string]: CommunityReply[] }>({});
  const [anonymousProfile, setAnonymousProfile] = useState<AnonymousUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    category: 'general' as const,
    tags: [] as string[]
  });
  const [newReply, setNewReply] = useState('');

  const categoryColors = {
    general: 'bg-gray-100 text-gray-700',
    stress_relief: 'bg-blue-100 text-blue-700',
    work_life_balance: 'bg-green-100 text-green-700',
    mental_health: 'bg-purple-100 text-purple-700',
    success_stories: 'bg-yellow-100 text-yellow-700',
    seeking_support: 'bg-red-100 text-red-700'
  };

  const fetchAnonymousProfile = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_anonymous_profile',
          employee_id: user.id,
          company_id: user.company_id
        })
      });

      const result = await response.json();
      if (result.success) {
        setAnonymousProfile(result.profile);
      }
    } catch (error) {
      console.error('Error fetching anonymous profile:', error);
    }
  };

  const fetchPosts = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_posts',
          company_id: user.company_id,
          data: { category: selectedCategory, limit_count: 20 }
        })
      });

      const result = await response.json();
      if (result.success) {
        setPosts(result.posts);
      }
    } catch (error) {
      console.error('Error fetching posts:', error);
    }
  };

  const fetchReplies = async (postId: string) => {
    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_replies',
          data: { post_id: postId }
        })
      });

      const result = await response.json();
      if (result.success) {
        setReplies(prev => ({ ...prev, [postId]: result.replies }));
      }
    } catch (error) {
      console.error('Error fetching replies:', error);
    }
  };

  const createPost = async () => {
    if (!user || !anonymousProfile) return;

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_post',
          employee_id: user.id,
          company_id: user.company_id,
          data: newPost
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Post created successfully!');
        setShowCreatePost(false);
        setNewPost({ title: '', content: '', category: 'general', tags: [] });
        fetchPosts();
      } else {
        toast.error('Failed to create post');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('An error occurred while creating the post');
    }
  };

  const createReply = async (postId: string) => {
    if (!user || !anonymousProfile || !newReply.trim()) return;

    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_reply',
          employee_id: user.id,
          company_id: user.company_id,
          data: { post_id: postId, content: newReply }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Reply posted successfully!');
        setNewReply('');
        fetchReplies(postId);
      } else {
        toast.error('Failed to post reply');
      }
    } catch (error) {
      console.error('Error creating reply:', error);
      toast.error('An error occurred while posting the reply');
    }
  };

  const likePost = async (postId: string) => {
    try {
      const response = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'like_post',
          data: { post_id: postId }
        })
      });

      const result = await response.json();
      if (result.success) {
        // Update local state
        setPosts(prev => prev.map(post => 
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        ));
      }
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchAnonymousProfile();
      await fetchPosts();
      setLoading(false);
    };
    loadData();
  }, [user]);

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Anonymous Community Space
        </h1>
        <p className="text-gray-600">
          Share experiences, seek support, and connect with colleagues anonymously
        </p>
      </div>

      {/* Anonymous Profile Info */}
      {anonymousProfile && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: anonymousProfile.avatar_color }}
              >
                {anonymousProfile.display_name.charAt(0)}
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">{anonymousProfile.display_name}</h3>
                <p className="text-sm text-blue-700">Your anonymous identity</p>
              </div>
              <div className="ml-auto flex items-center space-x-2 text-sm text-blue-600">
                <EyeOff className="h-4 w-4" />
                <span>Anonymous</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center space-x-4">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="general">General</SelectItem>
              <SelectItem value="stress_relief">Stress Relief</SelectItem>
              <SelectItem value="work_life_balance">Work-Life Balance</SelectItem>
              <SelectItem value="mental_health">Mental Health</SelectItem>
              <SelectItem value="success_stories">Success Stories</SelectItem>
              <SelectItem value="seeking_support">Seeking Support</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => setShowCreatePost(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Create Post Modal */}
      {showCreatePost && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="h-5 w-5" />
              <span>Create New Post</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <Input
                value={newPost.title}
                onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                placeholder="What's on your mind?"
                className="mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Category</label>
              <Select
                value={newPost.category}
                onValueChange={(value) => setNewPost(prev => ({ ...prev, category: value as any }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="stress_relief">Stress Relief</SelectItem>
                  <SelectItem value="work_life_balance">Work-Life Balance</SelectItem>
                  <SelectItem value="mental_health">Mental Health</SelectItem>
                  <SelectItem value="success_stories">Success Stories</SelectItem>
                  <SelectItem value="seeking_support">Seeking Support</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Content</label>
              <Textarea
                value={newPost.content}
                onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Share your thoughts, experiences, or ask for support..."
                rows={4}
                className="mt-1"
              />
            </div>

            <div className="flex space-x-3">
              <Button
                onClick={createPost}
                disabled={!newPost.title || !newPost.content}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="h-4 w-4 mr-2" />
                Post Anonymously
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreatePost(false)}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Posts */}
      <div className="space-y-4">
        {posts.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Posts Yet
              </h3>
              <p className="text-gray-600 mb-4">
                Be the first to share something with your community!
              </p>
              <Button
                onClick={() => setShowCreatePost(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create First Post
              </Button>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                        <Users className="h-4 w-4 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{post.title}</h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span>Anonymous User</span>
                          <Badge className={categoryColors[post.category]}>
                            {post.category.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(post.created_at).toLocaleDateString()}
                    </div>
                  </div>

                  <p className="text-gray-700 mb-4 leading-relaxed">{post.content}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => likePost(post.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        <Heart className="h-4 w-4 mr-1" />
                        {post.likes}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedPost(selectedPost === post.id ? null : post.id);
                          if (selectedPost !== post.id) {
                            fetchReplies(post.id);
                          }
                        }}
                        className="text-gray-500 hover:text-blue-500"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {post.replies}
                      </Button>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Eye className="h-4 w-4 mr-1" />
                        {post.views}
                      </div>
                    </div>
                  </div>

                  {/* Replies Section */}
                  {selectedPost === post.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-4 pt-4 border-t border-gray-200"
                    >
                      <div className="space-y-3">
                        {/* Reply Input */}
                        <div className="flex space-x-2">
                          <Input
                            value={newReply}
                            onChange={(e) => setNewReply(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1"
                          />
                          <Button
                            onClick={() => createReply(post.id)}
                            disabled={!newReply.trim()}
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Replies List */}
                        {replies[post.id] && replies[post.id].length > 0 ? (
                          <div className="space-y-3">
                            {replies[post.id].map((reply) => (
                              <div key={reply.id} className="bg-gray-50 p-3 rounded-lg">
                                <div className="flex items-center space-x-2 mb-2">
                                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                    <Users className="h-3 w-3 text-gray-600" />
                                  </div>
                                  <span className="text-sm font-medium text-gray-700">Anonymous</span>
                                  <span className="text-xs text-gray-500">
                                    {new Date(reply.created_at).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-gray-700 text-sm">{reply.content}</p>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-sm text-center py-2">
                            No replies yet. Be the first to respond!
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Privacy Notice */}
      <Card className="bg-gray-50 border-gray-200">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Shield className="h-5 w-5 text-gray-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Privacy & Safety</h4>
              <p className="text-sm text-gray-600">
                All posts and replies are anonymous. Your identity is protected, and only HR can access 
                your real identity for moderation purposes. Please be respectful and supportive of others.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


