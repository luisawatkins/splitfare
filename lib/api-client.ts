import { ApiResponse } from './api-utils';
import { 
  User, CreateUser, 
  Group, CreateGroup, 
  Expense, CreateExpense, 
  Settlement, CreateSettlement 
} from './validations';

class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string = '/api') {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('api_token', token);
    }
  }

  private async request<T>(
    method: string,
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers);

    // Try to recover token from session storage if not present
    if (!this.token && typeof window !== 'undefined') {
      this.token = sessionStorage.getItem('api_token');
    }

    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    if (!(options.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const response = await fetch(url, {
      ...options,
      method,
      headers,
    });

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      const error = new Error(result.error.message);
      (error as any).code = result.error.code;
      (error as any).details = result.error.details;
      (error as any).status = response.status;
      throw error;
    }

    return result.data;
  }

  users = {
    me: () => this.request<User>('GET', '/users/me'),
    get: (id: string) => this.request<User>('GET', `/users/${id}`),
    create: (data: CreateUser) => this.request<User>('POST', '/users', { body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateUser>) => 
      this.request<User>('PATCH', `/users/${id}`, { body: JSON.stringify(data) }),
  };

  groups = {
    list: () => this.request<Group[]>('GET', '/groups'),
    get: (id: string) => this.request<Group>('GET', `/groups/${id}`),
    create: (data: CreateGroup) => this.request<Group>('POST', '/groups', { body: JSON.stringify(data) }),
    update: (id: string, data: Partial<CreateGroup>) => 
      this.request<Group>('PATCH', `/groups/${id}`, { body: JSON.stringify(data) }),
    getMembers: (id: string) => this.request<User[]>('GET', `/groups/${id}/members`),
  };

  expenses = {
    list: (groupId: string) => this.request<Expense[]>('GET', `/expenses?groupId=${groupId}`),
    get: (id: string) => this.request<Expense>('GET', `/expenses/${id}`),
    create: (data: CreateExpense) => this.request<Expense>('POST', '/expenses', { body: JSON.stringify(data) }),
    delete: (id: string) => this.request<void>('DELETE', `/expenses/${id}`),
  };

  settlements = {
    list: (groupId: string) => this.request<Settlement[]>('GET', `/settlements?groupId=${groupId}`),
    create: (data: CreateSettlement) => 
      this.request<Settlement>('POST', '/settlements', { body: JSON.stringify(data) }),
    updateStatus: (id: string, status: Settlement['status'], txHash?: string) =>
      this.request<Settlement>('PATCH', `/settlements/${id}`, { 
        body: JSON.stringify({ status, transaction_hash: txHash }) 
      }),
  };
}

export const apiClient = new ApiClient();
