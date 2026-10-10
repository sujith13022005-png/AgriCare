export type ProductCategory =
  | 'Seeds'
  | 'Fertilizers'
  | 'Pesticides'
  | 'Farm Tools'
  | 'Organic Nutrients';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  originalPrice?: number;
  rating: number;
  ratingCount: number;
  shortDescription: string;
  description: string;
  stock: number;
  lowStockThreshold: number; // default 5
  unit: string;
  image: string;
  cropCompatibility: string[];
  usageInstructions: string;
  composition: string;
  safetyNotes?: string;
  organicCertified?: boolean;
  featured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  phone: string;
  address: string;
  villageCity: string;
  pincode: string;
  paymentMethod: 'Cash on Delivery' | 'UPI' | 'Net Banking';
  upiId?: string;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
    image: string;
  }[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  status: 'Received' | 'Preparing' | 'Dispatched' | 'Delivered';
  createdAt: string;
  notes?: string;
  userId?: string;
  userEmail?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  phone?: string;
  villageCity?: string;
  savedProductIds?: string[];
  lastLogin: string;
  createdAt?: string;
}

export interface VideoGenerationJob {
  operationName: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoUrl?: string;
  error?: string;
  createdAt: string;
}

export type AdvisorRole = 'general' | 'complex_diagnostic' | 'fast_assistant';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  roleType?: AdvisorRole;
  modelUsed?: string;
  searchGrounded?: boolean;
  mapsGrounded?: boolean;
  groundingSources?: { title?: string; uri?: string }[];
  searchQueries?: string[];
  matchedProducts?: { id: string; name: string; price: number; unit: string }[];
  audioUrl?: string;
}

export interface AdminSession {
  isLoggedIn: boolean;
  username: string;
  loginTime?: string;
}

export interface LowStockAlertItem {
  id: string;
  name: string;
  category: string;
  stock: number;
  threshold: number;
  unit: string;
  price: number;
  recommendedRestock: number;
  urgency: 'Critical' | 'Urgent' | 'Low';
}

export interface LowStockEmailAlert {
  id: string;
  timestamp: string;
  recipientEmail: string;
  subject: string;
  triggeredCount: number;
  products: LowStockAlertItem[];
  htmlPreview: string;
  status: 'Delivered' | 'Pending' | 'Acknowledged' | 'Resolved';
  triggerType: 'automatic' | 'manual_test';
  resolutionNotes?: string;
}

export interface EmailAlertSettings {
  recipientEmail: string;
  threshold: number;
  autoTriggerEnabled: boolean;
  lastTriggeredAt?: string;
}
