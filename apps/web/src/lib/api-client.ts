import { ApiResponse, ApiError } from '@growflow/types';

class ApiClient {
  private accessToken: string | null = null;
  private apiBaseUrl: string;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
  }

  setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  private onAccessTokenFetched(token: string) {
    this.refreshSubscribers.forEach((callback) => callback(token));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(callback: (token: string) => void) {
    this.refreshSubscribers.push(callback);
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.apiBaseUrl}${endpoint}`;
    
    // Setup headers
    const headers = new Headers(options.headers || {});
    if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }
    
    if (this.accessToken) {
      headers.set('Authorization', `Bearer ${this.accessToken}`);
    }

    const config: RequestInit = {
      credentials: 'include',
      ...options,
      headers,
    };

    const response = await fetch(url, config);

    if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/refresh')) {
      // Handle token refresh
      return new Promise((resolve, reject) => {
        this.addRefreshSubscriber((token: string) => {
          headers.set('Authorization', `Bearer ${token}`);
          fetch(url, { credentials: 'include', ...options, headers })
            .then((res) => {
              if (!res.ok) {
                return res.json().then((err) => reject(err));
              }
              return res.json();
            })
            .then((json) => resolve(json.data as T))
            .catch((err) => reject(err));
        });

        if (!this.isRefreshing) {
          this.isRefreshing = true;
          this.performRefresh()
            .then((newAccessToken) => {
              this.isRefreshing = false;
              this.onAccessTokenFetched(newAccessToken);
            })
            .catch((err) => {
              this.isRefreshing = false;
              this.setAccessToken(null);
              // Redirect to login on authentication failure
              if (typeof window !== 'undefined') {
                window.location.href = '/login';
              }
              reject(err);
            });
        }
      });
    }

    if (!response.ok) {
      let errorData: ApiError;
      try {
        errorData = await response.json();
      } catch {
        errorData = {
          statusCode: response.status,
          message: 'An unknown error occurred',
          error: response.statusText,
          timestamp: new Date().toISOString(),
        };
      }
      throw errorData;
    }

    // If it is 204 No Content
    if (response.status === 204) {
      return {} as T;
    }

    const json = (await response.json()) as ApiResponse<T>;
    return json.data;
  }

  async performRefresh(): Promise<string> {
    const url = `${this.apiBaseUrl}/auth/refresh`;
    const response = await fetch(url, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Refresh failed');
    }

    const json = (await response.json()) as ApiResponse<{
      accessToken: string;
    }>;

    const data = json.data;
    this.setAccessToken(data.accessToken);
    return data.accessToken;
  }

  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
