import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Search } from 'lucide-react';
import { packages } from '../lib/api';
import type { Package as PackageType } from '../types';

function CreatePackageModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    receiverName: '',
    receiverPhone: '',
    receiverAddress: '',
    weight: '',
    length: '',
    width: '',
    height: '',
  });

  const createPackageMutation = useMutation({
    mutationFn: (data: typeof formData) => packages.create({
      receiver: {
        name: data.receiverName,
        phone: data.receiverPhone,
        address: data.receiverAddress,
      },
      weight: parseFloat(data.weight),
      dimensions: {
        length: parseFloat(data.length),
        width: parseFloat(data.width),
        height: parseFloat(data.height),
      },
      sender: {
        name: 'John Customer',
        address: 'Mumbai, Maharashtra',
        phone: '+91 98765 43210',
      },
    }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customerPackages'] });
      onClose();
    },
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createPackageMutation.mutate(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Create New Package</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Receiver Name</label>
            <input
              type="text"
              value={formData.receiverName}
              onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Receiver Phone</label>
            <input
              type="tel"
              value={formData.receiverPhone}
              onChange={(e) => setFormData({ ...formData, receiverPhone: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Receiver Address</label>
            <textarea
              value={formData.receiverAddress}
              onChange={(e) => setFormData({ ...formData, receiverAddress: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Dimensions (cm)</label>
              <div className="grid grid-cols-3 gap-2">
                <input
                  type="number"
                  placeholder="L"
                  value={formData.length}
                  onChange={(e) => setFormData({ ...formData, length: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
                <input
                  type="number"
                  placeholder="W"
                  value={formData.width}
                  onChange={(e) => setFormData({ ...formData, width: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
                <input
                  type="number"
                  placeholder="H"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>
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
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
              disabled={createPackageMutation.isPending}
            >
              {createPackageMutation.isPending ? 'Creating...' : 'Create Package'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function PackageList({ packages }: { packages: PackageType[] }) {
  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <ul className="divide-y divide-gray-200">
        {packages.map((pkg) => (
          <li key={pkg.id} className="p-6 hover:bg-gray-50">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  Tracking Number: {pkg.trackingNumber}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  To: {pkg.receiver.name}
                </p>
                <p className="text-sm text-gray-500">
                  Current Location: {pkg.currentLocation}
                </p>
              </div>
              <div>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  pkg.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                  pkg.status === 'IN_TRANSIT' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {pkg.status.replace(/_/g, ' ')}
                </span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CustomerDashboard() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchInitiated, setSearchInitiated] = useState(false);

  const { data: customerPackages, isLoading: isLoadingPackages } = useQuery({
    queryKey: ['customerPackages'],
    queryFn: packages.listByCustomer,
  });

  const { data: trackedPackage, isLoading: isLoadingTracked } = useQuery({
    queryKey: ['trackedPackage', trackingNumber],
    queryFn: () => packages.track(trackingNumber),
    enabled: searchInitiated && !!trackingNumber,
  });

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchInitiated(true);
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">My Packages</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Package
        </button>
      </div>

      <div className="mb-8">
        <form onSubmit={handleTrack} className="flex gap-2">
          <input
            type="text"
            value={trackingNumber}
            onChange={(e) => setTrackingNumber(e.target.value)}
            placeholder="Enter tracking number"
            className="flex-1 rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Search className="h-5 w-5 mr-2" />
            Track
          </button>
        </form>

        {searchInitiated && trackedPackage && (
          <div className="mt-4 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Package Details</h3>
            <dl className="grid grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">{trackedPackage.status}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Current Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{trackedPackage.currentLocation}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Receiver</dt>
                <dd className="mt-1 text-sm text-gray-900">{trackedPackage.receiver.name}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(trackedPackage.updatedAt).toLocaleString()}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </div>

      {isLoadingPackages ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : (
        <PackageList packages={customerPackages || []} />
      )}

      <CreatePackageModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
}

export default CustomerDashboard;