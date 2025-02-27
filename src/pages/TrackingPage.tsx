import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Search, MapPin, Clock, User, Phone, Box } from 'lucide-react';
import { packages } from '../lib/api';
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

function TrackingTimeline({ status }: { status: PackageStatus }) {
  const steps = [
    { status: 'REGISTERED', label: 'Package Registered' },
    { status: 'IN_TRANSIT', label: 'In Transit' },
    { status: 'AT_HUB', label: 'At Hub' },
    { status: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
    { status: 'DELIVERED', label: 'Delivered' },
  ];

  const currentStepIndex = steps.findIndex(step => step.status === status);

  return (
    <div className="py-6">
      <div className="relative">
        <div className="absolute inset-0 flex items-center" aria-hidden="true">
          <div className="w-full border-t border-gray-300"></div>
        </div>
        <div className="relative flex justify-between">
          {steps.map((step, index) => (
            <div key={step.status} className="flex flex-col items-center">
              <div className={`relative flex h-8 w-8 items-center justify-center rounded-full ${
                index <= currentStepIndex ? 'bg-indigo-600' : 'bg-gray-200'
              }`}>
                <Clock className={`h-5 w-5 ${
                  index <= currentStepIndex ? 'text-white' : 'text-gray-500'
                }`} />
              </div>
              <div className="mt-2 text-xs text-gray-500">{step.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrackingPage() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [searchInitiated, setSearchInitiated] = useState(false);

  const { data: packageData, isLoading, error } = useQuery({
    queryKey: ['package', trackingNumber],
    queryFn: () => packages.track(trackingNumber),
    enabled: searchInitiated && !!trackingNumber,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchInitiated(true);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="text-center mb-8">
        <Package className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Your Package</h1>
        <p className="text-gray-600">Enter your tracking number to get real-time updates</p>
      </div>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-2">
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
        </div>
      </form>

      {isLoading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading package information...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-800">Package not found. Please check the tracking number and try again.</p>
        </div>
      )}

      {packageData && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Package Details</h2>
              <StatusBadge status={packageData.status} />
            </div>
          </div>

          <div className="px-6 py-4">
            <TrackingTimeline status={packageData.status} />
          </div>

          <div className="px-6 py-4 space-y-6">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 text-gray-400 mr-2" />
              <div>
                <span className="text-sm font-medium text-gray-500">Current Location</span>
                <p className="text-gray-900">{packageData.currentLocation}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-1" /> Sender
                  </h3>
                  <div className="mt-1">
                    <p className="text-gray-900">{packageData.sender.name}</p>
                    <p className="text-gray-600 text-sm">{packageData.sender.address}</p>
                    <p className="text-gray-600 text-sm flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {packageData.sender.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 flex items-center">
                    <User className="h-4 w-4 mr-1" /> Receiver
                  </h3>
                  <div className="mt-1">
                    <p className="text-gray-900">{packageData.receiver.name}</p>
                    <p className="text-gray-600 text-sm">{packageData.receiver.address}</p>
                    <p className="text-gray-600 text-sm flex items-center">
                      <Phone className="h-4 w-4 mr-1" />
                      {packageData.receiver.phone}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
              <div>
                <span className="text-sm font-medium text-gray-500 flex items-center">
                  <Box className="h-4 w-4 mr-1" /> Weight
                </span>
                <p className="mt-1 text-gray-900">{packageData.weight} kg</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Dimensions</span>
                <p className="mt-1 text-gray-900">
                  {packageData.dimensions.length}x{packageData.dimensions.width}x{packageData.dimensions.height} cm
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Last Updated</span>
                <p className="mt-1 text-gray-900">{new Date(packageData.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TrackingPage;