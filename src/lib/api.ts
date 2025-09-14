const API_BASE_URL = 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getAuthHeaders() {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { message: 'Network error occurred' };
        }
        
        throw new ApiError(
          errorData.error || errorData.message || 'Request failed',
          response.status,
          errorData
        );
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      
      throw new ApiError('Network error occurred', 0, error);
    }
  }

  // Authentication Methods
  async register(userData: any) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: any) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.data?.token) {
      this.setToken(response.data.token);
    }
    
    return response;
  }

  async logout() {
    try {
      await this.request('/auth/logout', { method: 'POST' });
    } finally {
      this.setToken(null);
    }
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  async updatePassword(passwordData: any) {
    return this.request('/auth/updatepassword', {
      method: 'PUT',
      body: JSON.stringify(passwordData),
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgotpassword', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  // Users Methods
  async getUsers(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/users${query}`);
  }

  async getUserById(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateProfile(profileData: any) {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  }

  async getAlumniDirectory(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/users/alumni${query}`);
  }

  async searchUsers(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/users/search${query}`);
  }

  // Posts Methods
  async getPosts(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/posts/feed${query}`);
  }

  async getPostById(id: string) {
    return this.request(`/posts/${id}`);
  }

  async createPost(postData: any) {
    return this.request('/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  }

  async updatePost(id: string, postData: any) {
    return this.request(`/posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(postData),
    });
  }

  async deletePost(id: string) {
    return this.request(`/posts/${id}`, {
      method: 'DELETE',
    });
  }

  async likePost(id: string) {
    return this.request(`/posts/${id}/like`, {
      method: 'POST',
    });
  }

  async commentOnPost(id: string, comment: any) {
    return this.request(`/posts/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment),
    });
  }

  // Messages Methods
  async getConversations(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/messages/conversations${query}`);
  }

  async getConversationWithUser(userId: string, params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/messages/conversation/${userId}${query}`);
  }

  async sendMessage(messageData: any) {
    return this.request('/messages/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(messageId: string) {
    return this.request(`/messages/${messageId}/read`, {
      method: 'PATCH',
    });
  }

  async getUnreadCount() {
    return this.request('/messages/unread-count');
  }

  // Events Methods
  async getEvents(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/events${query}`);
  }

  async getEventById(id: string) {
    return this.request(`/events/${id}`);
  }

  async createEvent(eventData: any) {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(eventData),
    });
  }

  async registerForEvent(id: string) {
    return this.request(`/events/${id}/register`, {
      method: 'POST',
    });
  }

  async unregisterFromEvent(id: string) {
    return this.request(`/events/${id}/register`, {
      method: 'DELETE',
    });
  }

  // Jobs Methods
  async getJobs(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/requests/jobs${query}`);
  }

  async getJobById(id: string) {
    return this.request(`/requests/jobs/${id}`);
  }

  async createJob(jobData: any) {
    return this.request('/requests/jobs', {
      method: 'POST',
      body: JSON.stringify(jobData),
    });
  }

  async applyToJob(id: string, applicationData: any) {
    return this.request(`/requests/jobs/${id}/apply`, {
      method: 'POST',
      body: JSON.stringify(applicationData),
    });
  }

  async getJobApplications(jobId: string) {
    return this.request(`/requests/jobs/${jobId}/applications`);
  }

  async updateApplicationStatus(jobId: string, applicationId: string, statusData: any) {
    return this.request(`/requests/jobs/${jobId}/applications/${applicationId}`, {
      method: 'PATCH',
      body: JSON.stringify(statusData),
    });
  }

  // Mentorship Methods
  async getMentorshipRequests(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/requests/mentorship${query}`);
  }

  async createMentorshipRequest(requestData: any) {
    return this.request('/requests/mentorship', {
      method: 'POST',
      body: JSON.stringify(requestData),
    });
  }

  async respondToMentorshipRequest(id: string, responseData: any) {
    return this.request(`/requests/mentorship/${id}/respond`, {
      method: 'POST',
      body: JSON.stringify(responseData),
    });
  }

  async addConversationMessage(id: string, messageData: any) {
    return this.request(`/requests/mentorship/${id}/conversation`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }
}

export const api = new ApiClient(API_BASE_URL);
export { ApiError };