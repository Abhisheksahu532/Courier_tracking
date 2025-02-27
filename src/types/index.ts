export type User = {
  id: string;
  username: string;
  email: string;
  role: 'CUSTOMER' | 'OFFICE_MANAGER' | 'ADMIN' | 'COURIER';
  officeId?: string;
};

export type Package = {
  id: string;
  trackingNumber: string;
  sender: {
    name: string;
    address: string;
    phone: string;
  };
  receiver: {
    name: string;
    address: string;
    phone: string;
  };
  weight: number;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  status: PackageStatus;
  currentLocation: string;
  createdAt: string;
  updatedAt: string;
  assignedCourier?: string;
  remarks?: string;
  adminApproved?: boolean;
};

export type PackageStatus =
  | 'PENDING'
  | 'REGISTERED'
  | 'IN_TRANSIT'
  | 'AT_HUB'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

export type Office = {
  id: string;
  name: string;
  address: string;
  phone: string;
};

export type Courier = {
  id: string;
  name: string;
  phone: string;
  officeId: string;
};