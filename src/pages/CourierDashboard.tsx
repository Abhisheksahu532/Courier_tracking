import { useQuery } from '@tanstack/react-query';
import { Package, CheckCircle, XCircle } from 'lucide-react';
import { packages } from '../lib/api';

function CourierDashboard() {
  const { data: courierPackages, isLoading } = useQuery({
    queryKey: ['courierPackages'],
    queryFn: packages.listByCourier,
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-8">My Deliveries</h1>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Assigned Packages</h2>
            </div>
            <ul className="divide-y divide-gray-200">
              {courierPackages?.map((pkg) => (
                <li key={pkg.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Package className="h-6 w-6 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {pkg.trackingNumber}
                        </p>
                        <p className="text-sm text-gray-500">
                          {pkg.receiver.name} - {pkg.receiver.address}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Mark Delivered
                      </button>
                      <button className="inline-flex items-center px-3 py-1 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">
                        <XCircle className="h-4 w-4 mr-1" />
                        Failed Delivery
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourierDashboard;