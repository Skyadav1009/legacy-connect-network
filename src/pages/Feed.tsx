import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { 
  Heart, 
  MessageCircle, 
  Share, 
  MoreHorizontal, 
  Plus, 
  Search,
  Filter,
  TrendingUp,
  Award,
  HelpCircle,
  Briefcase,
  Calendar,
  Send
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Post {
  _id: string;
  author: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    profile?: {
      profilePicture?: string;
      currentCompany?: string;
      currentPosition?: string;
    };
  };
  content: string;
  type: 'announcement' | 'achievement' | 'question' | 'general' | 'job' | 'event';
  visibility: 'public' | 'alumni' | 'students' | 'faculty';
  tags: string[];
  likes: string[];
  comments: any[];
  createdAt: string;
  updatedAt: string;
}

export default function Feed() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [createPostOpen, setCreatePostOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [newPost, setNewPost] = useState({
    content: "",
    type: "general",
    visibility: "public",
    tags: ""
  });

  useEffect(() => {
    loadPosts();
  }, [filterType]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: 1,
        limit: 20,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      };

      if (filterType !== 'all') {
        params.type = filterType;
      }

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await api.getPosts(params);
      if (response.success) {
        setPosts(response.data.posts || []);
      }
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const postData = {
        ...newPost,
        tags: newPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      const response = await api.createPost(postData);
      if (response.success) {
        setCreatePostOpen(false);
        setNewPost({ content: "", type: "general", visibility: "public", tags: "" });
        loadPosts(); // Refresh posts
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleLikePost = async (postId: string) => {
    try {
      await api.likePost(postId);
      // Update local state
      setPosts(prev => prev.map(post => {
        if (post._id === postId) {
          const isLiked = post.likes.includes(user?.id || '');
          return {
            ...post,
            likes: isLiked 
              ? post.likes.filter(id => id !== user?.id)
              : [...post.likes, user?.id || '']
          };
        }
        return post;
      }));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'achievement': return <Award className="h-4 w-4" />;
      case 'question': return <HelpCircle className="h-4 w-4" />;
      case 'job': return <Briefcase className="h-4 w-4" />;
      case 'event': return <Calendar className="h-4 w-4" />;
      case 'announcement': return <TrendingUp className="h-4 w-4" />;
      default: return <MessageCircle className="h-4 w-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'achievement': return 'bg-success';
      case 'question': return 'bg-primary';
      case 'job': return 'bg-accent';
      case 'event': return 'bg-warning';
      case 'announcement': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Alumni Feed</h1>
          <p className="text-muted-foreground">Stay connected with your network</p>
        </div>

        {(user?.role === 'alumni' || user?.role === 'faculty' || user?.role === 'admin') && (
          <Dialog open={createPostOpen} onOpenChange={setCreatePostOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Post</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePost} className="space-y-4">
                <div>
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    placeholder="Share your thoughts, achievements, or ask a question..."
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    required
                    rows={4}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type">Post Type</Label>
                    <Select value={newPost.type} onValueChange={(value) => setNewPost(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General</SelectItem>
                        <SelectItem value="achievement">Achievement</SelectItem>
                        <SelectItem value="question">Question</SelectItem>
                        <SelectItem value="announcement">Announcement</SelectItem>
                        {user?.role === 'faculty' && <SelectItem value="event">Event</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="visibility">Visibility</Label>
                    <Select value={newPost.visibility} onValueChange={(value) => setNewPost(prev => ({ ...prev, visibility: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="public">Public</SelectItem>
                        <SelectItem value="alumni">Alumni Only</SelectItem>
                        <SelectItem value="students">Students Only</SelectItem>
                        {user?.role === 'faculty' && <SelectItem value="faculty">Faculty Only</SelectItem>}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    placeholder="career, technology, networking"
                    value={newPost.tags}
                    onChange={(e) => setNewPost(prev => ({ ...prev, tags: e.target.value }))}
                  />
                </div>

                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setCreatePostOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <Send className="h-4 w-4 mr-2" />
                    Post
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search posts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            onKeyDown={(e) => e.key === 'Enter' && loadPosts()}
          />
        </div>

        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Posts</SelectItem>
            <SelectItem value="achievement">Achievements</SelectItem>
            <SelectItem value="question">Questions</SelectItem>
            <SelectItem value="job">Job Posts</SelectItem>
            <SelectItem value="event">Events</SelectItem>
            <SelectItem value="announcement">Announcements</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Posts */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-muted rounded-full" />
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="space-y-2">
                        <div className="h-4 bg-muted rounded" />
                        <div className="h-4 bg-muted rounded w-5/6" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                Be the first to share something with the community!
              </p>
            </CardContent>
          </Card>
        ) : (
          posts.map((post) => (
            <Card key={post._id} className="hover:shadow-card transition-all duration-300">
              <CardContent className="p-6">
                <div className="flex items-start space-x-4">
                  <Avatar>
                    <AvatarImage src={post.author.profile?.profilePicture} />
                    <AvatarFallback>
                      {getUserInitials(post.author.firstName, post.author.lastName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 space-y-3">
                    {/* Author Info */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {post.author.firstName} {post.author.lastName}
                          </h3>
                          <Badge variant="outline" className="text-xs capitalize">
                            {post.author.role}
                          </Badge>
                          <div className={`p-1 rounded-full text-white ${getPostTypeColor(post.type)}`}>
                            {getPostTypeIcon(post.type)}
                          </div>
                        </div>
                        {post.author.profile?.currentPosition && post.author.profile?.currentCompany && (
                          <p className="text-sm text-muted-foreground">
                            {post.author.profile.currentPosition} at {post.author.profile.currentCompany}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </p>
                      </div>

                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Content */}
                    <div className="space-y-3">
                      <p className="text-foreground whitespace-pre-wrap">{post.content}</p>

                      {/* Tags */}
                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              #{tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-6 pt-3 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="gap-2 hover:text-destructive"
                        onClick={() => handleLikePost(post._id)}
                      >
                        <Heart 
                          className={`h-4 w-4 ${post.likes.includes(user?.id || '') ? 'fill-destructive text-destructive' : ''}`}
                        />
                        {post.likes.length} {post.likes.length === 1 ? 'Like' : 'Likes'}
                      </Button>

                      <Button variant="ghost" size="sm" className="gap-2">
                        <MessageCircle className="h-4 w-4" />
                        {post.comments.length} {post.comments.length === 1 ? 'Comment' : 'Comments'}
                      </Button>

                      <Button variant="ghost" size="sm" className="gap-2">
                        <Share className="h-4 w-4" />
                        Share
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Load More */}
      {posts.length > 0 && (
        <div className="text-center">
          <Button variant="outline" onClick={loadPosts}>
            Load More Posts
          </Button>
        </div>
      )}
    </div>
  );
}