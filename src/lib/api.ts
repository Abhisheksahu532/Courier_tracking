import axios from 'axios';
import type { Package, PackageStatus, Office, Courier, User } from '../types';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
});

// Mock data storage
let mockPackages: Package[] = [
  {
    id: 'pkg1',
    trackingNumber: 'TN20240001',
    sender: {
      name: 'John Customer',
      address: 'Mumbai, Maharashtra',
      phone: '+91 98765 43210',
    },
    receiver: {
      name: 'Jane Doe',
      address: 'Bangalore, Karnataka',
      phone: '+91 98765 43211',
    },
    weight: 2.5,
    dimensions: {
      length: 30,
      width: 20,
      height: 15,
    },
    status: 'PENDING',
    currentLocation: 'Mumbai Hub',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T12:00:00Z',
    adminApproved: false,
  },
];

// Mock Users
const mockUsers: User[] = [
  {
    id: 'admin1',
    username: 'admin',
    password: '1234',
    email: 'admin@couriertrack.com',
    role: 'ADMIN',
  },
  {
    id: 'manager1',
    username: 'mumbai_manager',
    password: '1234',
    email: 'mumbai@couriertrack.com',
    role: 'OFFICE_MANAGER',
    officeId: 'mumbai-hub',
  },
  {
    id: 'manager2',
    username: 'bangalore_manager',
    password: '1234',
    email: 'bangalore@couriertrack.com',
    role: 'OFFICE_MANAGER',
    officeId: 'bangalore-hub',
  },
  {
    id: 'customer1',
    username: 'john_customer',
    password: '1234',
    email: 'john@example.com',
    role: 'CUSTOMER',
  },
  {
    id: 'customer2',
    username: 'jane_customer',
    password: '1234',
    email: 'john@example.com',
    role: 'CUSTOMER',
  }
];

// Mock Offices
let mockOffices: Office[] = [
  {
    id: 'mumbai-hub',
    name: 'Mumbai Hub',
    address: 'Andheri East, Mumbai, Maharashtra 400069',
    phone: '+91 22 2345 6789',
  },
  {
    id: 'bangalore-hub',
    name: 'Bangalore Hub',
    address: 'Whitefield, Bangalore, Karnataka 560066',
    phone: '+91 80 2345 6789',
  },
];

// Mock Couriers
let mockCouriers: Courier[] = [
  {
    id: 'courier1',
    name: 'Raj Kumar',
    phone: '+91 98765 43210',
    officeId: 'mumbai-hub',
  },
  {
    id: 'courier2',
    name: 'Priya Singh',
    phone: '+91 98765 43211',
    officeId: 'mumbai-hub',
  },
];

// Auth API with mock implementation
export const auth = {
  login: async (username: string, password: string) => {
    const user = mockUsers.find(u => u.username === username && u.password === password);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    return { user, token: 'mock-jwt-token' };
  },
  logout: () => Promise.resolve(),
  getProfile: () => Promise.resolve(mockUsers[0]),
};

// Package API with mock implementation
export const packages = {
  track: async (trackingNumber: string) => {
    const pkg = mockPackages.find(p => p.trackingNumber === trackingNumber);
    if (!pkg) throw new Error('Package not found');
    return pkg;
  },
  
  listByCustomer: async () => {
    return mockPackages;
  },
  
  listByOffice: async (officeId: string) => {
    return mockPackages.filter(p => 
      p.currentLocation.toLowerCase().includes(officeId.split('-')[0]) && 
      p.status !== 'PENDING' && 
      p.adminApproved
    );
  },

  listPendingApproval: async () => {
    return mockPackages.filter(p => p.status === 'PENDING' && !p.adminApproved);
  },
  
  updateStatus: async (packageId: string, status: PackageStatus) => {
    const pkg = mockPackages.find(p => p.id === packageId);
    if (!pkg) throw new Error('Package not found');
    pkg.status = status;
    pkg.updatedAt = new Date().toISOString();
    return pkg;
  },

  approvePackage: async (packageId: string) => {
    const pkg = mockPackages.find(p => p.id === packageId);
    if (!pkg) throw new Error('Package not found');
    pkg.adminApproved = true;
    pkg.status = 'REGISTERED';
    pkg.updatedAt = new Date().toISOString();
    return pkg;
  },
  
  create: async (packageData: Partial<Package>) => {
    const newPackage: Package = {
      id: `pkg${mockPackages.length + 1}`,
      trackingNumber: `TN${Date.now()}`,
      status: 'PENDING',
      currentLocation: packageData.sender?.address || 'System',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      adminApproved: false,
      ...packageData,
    } as Package;
    mockPackages.push(newPackage);
    return newPackage;
  },

  assignCourier: async (packageId: string, courierId: string) => {
    const pkg = mockPackages.find(p => p.id === packageId);
    if (!pkg) throw new Error('Package not found');
    pkg.assignedCourier = courierId;
    return pkg;
  }
};

// Office API with mock implementation
export const offices = {
  list: async () => mockOffices,
  getById: async (id: string) => mockOffices.find(o => o.id === id),
  create: async (data: Partial<Office>) => {
    const newOffice: Office = {
      id: data.name?.toLowerCase().replace(/\s+/g, '-') || `office-${Date.now()}`,
      name: data.name || '',
      address: data.address || '',
      phone: data.phone || '',
    };
    mockOffices.push(newOffice);
    return newOffice;
  },
};

// Courier API with mock implementation
export const couriers = {
  list: async () => mockCouriers,
  listByOffice: async (officeId: string) => mockCouriers.filter(c => c.officeId === officeId),
  create: async (data: Partial<Courier>) => {
    const newCourier: Courier = {
      id: `courier${mockCouriers.length + 1}`,
      name: data.name || '',
      phone: data.phone || '',
      officeId: data.officeId || '',
    };
    mockCouriers.push(newCourier);
    return newCourier;
  },
};

// Analytics API with mock implementation
export const analytics = {
  getDailyMetrics: async () => ({
    packagesCreated: mockPackages.length,
    packagesDelivered: mockPackages.filter(p => p.status === 'DELIVERED').length,
    packagesApprovalPending: mockPackages.filter(p => p.status === 'PENDING' && !p.adminApproved).length,
    averageDeliveryTime: 24, // hours
  }),
};