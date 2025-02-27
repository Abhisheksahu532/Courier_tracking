import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Users, Building2, Truck, CheckCircle, XCircle } from 'lucide-react';
import { analytics, offices, couriers, packages } from '../lib/api';
import type { Package as PackageType } from '../types';

function StatusBadge({ status, approved }: { status: PackageType['status']; approved?: boolean }) {
  const colors = {
    PENDING: approved ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800',
    REGISTERED: 'bg-green-100 text-green-800',
    IN_TRANSIT: 'bg-blue-100 text-blue-800',
    AT_HUB: 'bg-yellow-100 text-yellow-800',
    OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
    DELIVERED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[status]}`}>
      {status === 'PENDING' && !approved ? 'Pending Approval' : status.replace(/_/g, ' ')}
    </span>
  );
}

function PendingPackages() {
  const queryClient = useQueryClient();

  const { data: pendingPackages, isLoading } = useQuery({
    queryKey: ['pendingPackages'],
    queryFn: packages.listPendingApproval,
  });

  const approveMutation = useMutation({
    mutationFn: packages.approvePackage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pendingPackages'] });
      queryClient.invalidateQueries({ queryKey: ['dailyMetrics'] });
    },
  });

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm rounded-lg overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Pending Approvals</h2>
      </div>
      <ul className="divide-y divide-gray-200">
        {pendingPackages?.map((pkg) => (
          <li key={pkg.id} className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Tracking Number: {pkg.trackingNumber}
                  </p>
                  <StatusBadge status={pkg.status} approved={pkg.adminApproved} />
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => approveMutation.mutate(pkg.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Approve
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Sender</h4>
                  <p className="text-sm text-gray-900">{pkg.sender.name}</p>
                  <p className="text-sm text-gray-500">{pkg.sender.address}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-500">Receiver</h4>
                  <p className="text-sm text-gray-900">{pkg.receiver.name}</p>
                  <p className="text-sm text-gray-500">{pkg.receiver.address}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500">Weight</span>
                  <p className="text-sm text-gray-900">{pkg.weight} kg</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Dimensions</span>
                  <p className="text-sm text-gray-900">
                    {pkg.dimensions.length}x{pkg.dimensions.width}x{pkg.dimensions.height} cm
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Created</span>
                  <p className="text-sm text-gray-900">
                    {new Date(pkg.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          </li>
        ))}
        {pendingPackages?.length === 0 && (
          <li className="p-6 text-center text-gray-500">
            No packages pending approval
          </li>
        )}
      </ul>
    </div>
  );
}

function AdminDashboard() {
  const [isOfficeModalOpen, setIsOfficeModalOpen] = useState(false);
  const [isCourierModalOpen, setIsCourierModalOpen] = useState(false);

  const { data: metrics } = useQuery({
    queryKey: ['dailyMetrics'],
    queryFn: analytics.getDailyMetrics,
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Packages Created Today
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {metrics?.packagesCreated || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Packages Delivered Today
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {metrics?.packagesDelivered || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Package className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Pending Approvals
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {metrics?.packagesApprovalPending || 0}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Truck className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    Average Delivery Time
                  </dt>
                  <dd className="text-3xl font-semibold text-gray-900">
                    {metrics?.averageDeliveryTime || 0} hrs
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <PendingPackages />
    </div>
  );
}

export default AdminDashboard;