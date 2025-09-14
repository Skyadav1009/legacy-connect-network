import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { 
  Search, 
  Send, 
  MoreHorizontal, 
  Phone, 
  Video,
  Info,
  Smile,
  Paperclip,
  MessageCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Conversation {
  _id: string;
  participants: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
    profile?: {
      profilePicture?: string;
      currentCompany?: string;
      currentPosition?: string;
    };
  }>;
  lastMessage?: {
    content: string;
    sender: string;
    createdAt: string;
    messageType: string;
  };
  unreadCount: number;
}

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  messageType: string;
  reactions: Array<{
    user: string;
    reaction: string;
  }>;
  isRead: boolean;
  createdAt: string;
  replyTo?: {
    _id: string;
    content: string;
    sender: {
      firstName: string;
      lastName: string;
    };
  };
}

export default function Messages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await api.getConversations({
        page: 1,
        limit: 50
      });
      
      if (response.success) {
        setConversations(response.data.conversations || []);
        
        // Auto-select first conversation if available
        if (response.data.conversations?.length > 0 && !selectedConversation) {
          setSelectedConversation(response.data.conversations[0]._id);
        }
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      // For this demo, we'll use the conversation with user endpoint
      const conversation = conversations.find(c => c._id === conversationId);
      if (!conversation) return;

      const otherParticipant = conversation.participants.find(p => p._id !== user?.id);
      if (!otherParticipant) return;

      const response = await api.getConversationWithUser(otherParticipant._id, {
        page: 1,
        limit: 50
      });
      
      if (response.success) {
        setMessages(response.data.messages || []);
        
        // Mark messages as read
        const unreadMessages = response.data.messages?.filter((msg: Message) => 
          !msg.isRead && msg.sender._id !== user?.id
        );
        
        if (unreadMessages?.length > 0) {
          // Mark messages as read
          for (const message of unreadMessages) {
            try {
              await api.markMessageAsRead(message._id);
            } catch (error) {
              // Ignore errors
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const conversation = conversations.find(c => c._id === selectedConversation);
    if (!conversation) return;

    const otherParticipant = conversation.participants.find(p => p._id !== user?.id);
    if (!otherParticipant) return;

    setSendingMessage(true);
    try {
      const response = await api.sendMessage({
        receiver: otherParticipant._id,
        content: newMessage.trim(),
        messageType: 'text'
      });

      if (response.success) {
        setNewMessage("");
        // Refresh messages
        loadMessages(selectedConversation);
        // Refresh conversations to update last message
        loadConversations();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation) => {
    return conversation.participants.find(p => p._id !== user?.id);
  };

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const selectedConversationData = conversations.find(c => c._id === selectedConversation);
  const selectedOtherParticipant = selectedConversationData ? getOtherParticipant(selectedConversationData) : null;

  const filteredConversations = conversations.filter(conversation => {
    const otherParticipant = getOtherParticipant(conversation);
    if (!otherParticipant) return false;
    
    const fullName = `${otherParticipant.firstName} ${otherParticipant.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="h-[calc(100vh-8rem)] max-w-7xl mx-auto">
      <div className="grid grid-cols-12 h-full bg-background rounded-lg shadow-elegant overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="col-span-4 border-r border-border bg-card">
          <div className="p-4 border-b border-border">
            <h2 className="text-xl font-semibold mb-4">Messages</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <ScrollArea className="h-[calc(100%-8rem)]">
            {loading ? (
              <div className="space-y-3 p-4">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="flex items-center space-x-3 animate-pulse">
                    <div className="w-12 h-12 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center">
                <MessageCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold text-lg mb-2">No conversations</h3>
                <p className="text-muted-foreground text-sm">
                  Start a conversation by visiting someone's profile
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredConversations.map((conversation) => {
                  const otherParticipant = getOtherParticipant(conversation);
                  if (!otherParticipant) return null;

                  return (
                    <div
                      key={conversation._id}
                      className={`p-4 cursor-pointer transition-colors hover:bg-accent/50 ${
                        selectedConversation === conversation._id ? 'bg-accent' : ''
                      }`}
                      onClick={() => setSelectedConversation(conversation._id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Avatar>
                            <AvatarImage src={otherParticipant.profile?.profilePicture} />
                            <AvatarFallback>
                              {getUserInitials(otherParticipant.firstName, otherParticipant.lastName)}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.unreadCount > 0 && (
                            <Badge 
                              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs p-0 bg-destructive"
                            >
                              {conversation.unreadCount}
                            </Badge>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium truncate">
                              {otherParticipant.firstName} {otherParticipant.lastName}
                            </h3>
                            {conversation.lastMessage && (
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {otherParticipant.role}
                            </Badge>
                          </div>

                          {conversation.lastMessage && (
                            <p className="text-sm text-muted-foreground truncate mt-1">
                              {conversation.lastMessage.content}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>
        </div>

        {/* Message Area */}
        <div className="col-span-8 flex flex-col">
          {selectedConversation && selectedOtherParticipant ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-border bg-card">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarImage src={selectedOtherParticipant.profile?.profilePicture} />
                      <AvatarFallback>
                        {getUserInitials(selectedOtherParticipant.firstName, selectedOtherParticipant.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-semibold">
                        {selectedOtherParticipant.firstName} {selectedOtherParticipant.lastName}
                      </h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs capitalize">
                          {selectedOtherParticipant.role}
                        </Badge>
                        {selectedOtherParticipant.profile?.currentPosition && (
                          <span className="text-sm text-muted-foreground">
                            {selectedOtherParticipant.profile.currentPosition}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button variant="ghost" size="icon">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Video className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Info className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((message) => {
                    const isOwnMessage = message.sender._id === user?.id;
                    
                    return (
                      <div
                        key={message._id}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                          {message.replyTo && (
                            <div className="text-xs text-muted-foreground mb-1 p-2 bg-muted/50 rounded border-l-2 border-primary">
                              <span className="font-medium">
                                {message.replyTo.sender.firstName} {message.replyTo.sender.lastName}
                              </span>
                              <p className="truncate">{message.replyTo.content}</p>
                            </div>
                          )}
                          
                          <div
                            className={`rounded-lg px-4 py-2 ${
                              isOwnMessage
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-muted'
                            }`}
                          >
                            <p className="whitespace-pre-wrap">{message.content}</p>
                          </div>
                          
                          <div className={`text-xs text-muted-foreground mt-1 ${isOwnMessage ? 'text-right' : 'text-left'}`}>
                            {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                            {isOwnMessage && !message.isRead && (
                              <span className="ml-2">✓</span>
                            )}
                            {isOwnMessage && message.isRead && (
                              <span className="ml-2 text-primary">✓✓</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t border-border bg-card">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-2">
                  <div className="flex-1">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={sendingMessage}
                      className="resize-none"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    <Button type="button" variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    
                    <Button type="button" variant="ghost" size="icon">
                      <Smile className="h-4 w-4" />
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={!newMessage.trim() || sendingMessage}
                      size="icon"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-muted/10">
              <div className="text-center">
                <MessageCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground">
                  Choose a conversation from the sidebar to start messaging
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}