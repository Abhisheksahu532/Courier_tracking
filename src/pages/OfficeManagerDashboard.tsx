import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Truck, MapPin, User, Phone, Box, Clock } from 'lucide-react';
import { packages, couriers } from '../lib/api';
import { useAuthStore } from '../store/auth';
import type { PackageStatus } from '../types';

function StatusBadge({ status }: { status: PackageStatus }) {
  const colors = {
    REGISTERED: 'bg-gray-100 text-gray-800',
    IN_TRANSIT: 'bg-blue-100 text-blue-800',
    AT_HUB: 'bg-yellow-100 text-yellow-800',
    OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

function StatusUpdateModal({
  isOpen,
  onClose,
  packageId,
  currentStatus,
}: {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
  currentStatus: PackageStatus;
}) {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<PackageStatus>(currentStatus);

  const updateStatusMutation = useMutation({
    mutationFn: () => packages.updateStatus(packageId, selectedStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officePackages'] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const validNextStatuses: Record<PackageStatus, PackageStatus[]> = {
    'REGISTERED': ['IN_TRANSIT', 'CANCELLED'],
    'IN_TRANSIT': ['AT_HUB', 'OUT_FOR_DELIVERY', 'CANCELLED'],
    'AT_HUB': ['IN_TRANSIT', 'OUT_FOR_DELIVERY', 'CANCELLED'],
    'OUT_FOR_DELIVERY': ['DELIVERED', 'AT_HUB', 'CANCELLED'],
    'DELIVERED': [],
    'CANCELLED': [],
  };

  const availableStatuses = validNextStatuses[currentStatus];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Update Package Status</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Current Status</label>
            <div className="mt-1">
              <StatusBadge status={currentStatus} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">New Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as PackageStatus)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {availableStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={() => updateStatusMutation.mutate()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              disabled={updateStatusMutation.isPending}
            >
              {updateStatusMutation.isPending ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AssignCourierModal({
  isOpen,
  onClose,
  packageId,
}: {
  isOpen: boolean;
  onClose: () => void;
  packageId: string;
}) {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedCourierId, setSelectedCourierId] = useState('');

  const { data: availableCouriers } = useQuery({
    queryKey: ['couriers', user?.officeId],
    queryFn: () => couriers.listByOffice(user?.officeId || ''),
    enabled: !!user?.officeId,
  });

  const assignCourierMutation = useMutation({
    mutationFn: () => packages.assignCourier(packageId, selectedCourierId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['officePackages'] });
      onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Assign Courier</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Select Courier</label>
            <select
              value={selectedCourierId}
              onChange={(e) => setSelectedCourierId(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Select a courier</option>
              {availableCouriers?.map((courier) => (
                <option key={courier.id} value={courier.id}>
                  {courier.name} - {courier.phone}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              onClick={() => assignCourierMutation.mutate()}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              disabled={!selectedCourierId || assignCourierMutation.isPending}
            >
              {assignCourierMutation.isPending ? 'Assigning...' : 'Assign Courier'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PackageDetails({ pkg }: { pkg: Package }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Package className="h-6 w-6 text-gray-400" />
          <div>
            <p className="text-sm font-medium text-gray-900">
              {pkg.trackingNumber}
            </p>
            <div className="flex items-center space-x-2">
              <StatusBadge status={pkg.status} />
              <span className="text-sm text-gray-500">
                Last updated: {new Date(pkg.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-sm font-medium text-gray-500 flex items-center">
            <User className="h-4 w-4 mr-1" /> Sender
          </h4>
          <p className="text-sm text-gray-900">{pkg.sender.name}</p>
          <p className="text-sm text-gray-500">{pkg.sender.address}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-500 flex items-center">
            <User className="h-4 w-4 mr-1" /> Receiver
          </h4>
          <p className="text-sm text-gray-900">{pkg.receiver.name}</p>
          <p className="text-sm text-gray-500">{pkg.receiver.address}</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <span className="text-sm font-medium text-gray-500 flex items-center">
            <Box className="h-4 w-4 mr-1" /> Weight
          </span>
          <p className="text-sm text-gray-900">{pkg.weight} kg</p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500 flex items-center">
            <Box className="h-4 w-4 mr-1" /> Dimensions
          </span>
          <p className="text-sm text-gray-900">
            {pkg.dimensions.length}x{pkg.dimensions.width}x{pkg.dimensions.height} cm
          </p>
        </div>
        <div>
          <span className="text-sm font-medium text-gray-500 flex items-center">
            <MapPin className="h-4 w-4 mr-1" /> Location
          </span>
          <p className="text-sm text-gray-900">{pkg.currentLocation}</p>
        </div>
      </div>
    </div>
  );
}

function OfficeManagerDashboard() {
  const { user } = useAuthStore();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const { data: officePackages, isLoading } = useQuery({
    queryKey: ['officePackages', user?.officeId],
    queryFn: () => packages.listByOffice(user?.officeId || ''),
    enabled: !!user?.officeId,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Office Dashboard</h1>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">
                Packages at {user?.officeId === 'mumbai-hub' ? 'Mumbai Hub' : 'Bangalore Hub'}
              </h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {officePackages?.map((pkg) => (
                <li key={pkg.id} className="p-6 hover:bg-gray-50">
                  <div className="space-y-4">
                    <PackageDetails pkg={pkg} />
                    <div className="flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setSelectedPackage(pkg.id);
                          setIsStatusModalOpen(true);
                        }}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        <Clock className="h-4 w-4 mr-1" />
                        Update Status
                      </button>
                      {!pkg.assignedCourier && pkg.status === 'AT_HUB' && (
                        <button
                          onClick={() => {
                            setSelectedPackage(pkg.id);
                            setIsAssignModalOpen(true);
                          }}
                          className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Truck className="h-4 w-4 mr-1" />
                          Assign Courier
                        </button>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {selectedPackage && (
        <>
          <StatusUpdateModal
            isOpen={isStatusModalOpen}
            onClose={() => {
              setIsStatusModalOpen(false);
              setSelectedPackage(null);
            }}
            packageId={selectedPackage}
            currentStatus={officePackages?.find(p => p.id === selectedPackage)?.status || 'REGISTERED'}
          />
          <AssignCourierModal
            isOpen={isAssignModalOpen}
            onClose={() => {
              setIsAssignModalOpen(false);
              setSelectedPackage(null);
            }}
            packageId={selectedPackage}
          />
        </>
      )}
    </div>
  );
}

export default OfficeManagerDashboard;