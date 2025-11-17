"use client";
import { useParams, useRouter } from "next/navigation";
import { useGetOrderQuery } from "@/app/store/apis/OrderApi";
import { ArrowLeft, Package, User, MapPin, CreditCard, Truck } from "lucide-react";
import { withAuth } from "@/app/components/HOC/WithAuth";

const OrderDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data, isLoading, error } = useGetOrderQuery(orderId, {
    skip: !orderId,
  });
  const order = data?.order;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Failed to load order details</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "PROCESSING":
        return "bg-blue-100 text-blue-800";
      case "SHIPPED":
        return "bg-indigo-100 text-indigo-800";
      case "DELIVERED":
        return "bg-green-100 text-green-800";
      case "CANCELED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="p-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} className="mr-2" />
          Back to Orders
        </button>
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">Order Details</h1>
            <p className="text-sm text-gray-500 mt-1">
              Order ID: {order.id}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {order.status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-full">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <Package className="mr-2 text-gray-600" size={20} />
              <h2 className="text-lg font-semibold">Order Items</h2>
            </div>
            <div className="space-y-4">
              {order.orderItems?.map((item: any) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between border-b pb-4 last:border-b-0"
                >
                  <div className="flex items-center space-x-4">
                    {item.variant?.images && (() => {
                      try {
                        const images = JSON.parse(item.variant.images);
                        return images && images[0] ? (
                          <img
                            src={images[0]}
                            alt={item.variant?.product?.name}
                            className="w-16 h-16 object-cover rounded"
                          />
                        ) : null;
                      } catch {
                        return null;
                      }
                    })()}
                    <div>
                      <h3 className="font-medium">
                        {item.variant?.product?.name || "Unknown Product"}
                      </h3>
                      <p className="text-sm text-gray-500">
                        SKU: {item.variant?.sku}
                      </p>
                      <p className="text-sm text-gray-500">
                        Quantity: {item.quantity}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${item.price.toFixed(2)}</p>
                    <p className="text-sm text-gray-500">
                      Total: ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total Amount:</span>
                <span className="text-2xl font-bold text-indigo-600">
                  ${order.amount.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Shipment Information */}
          {order.shipment && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <Truck className="mr-2 text-gray-600" size={20} />
                <h2 className="text-lg font-semibold">Shipment Information</h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Carrier:</span>
                  <span className="font-medium">{order.shipment.carrier}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tracking Number:</span>
                  <span className="font-medium font-mono">
                    {order.shipment.trackingNumber}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipped Date:</span>
                  <span className="font-medium">
                    {new Date(order.shipment.shippedDate).toLocaleDateString()}
                  </span>
                </div>
                {order.shipment.deliveryDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Date:</span>
                    <span className="font-medium">
                      {new Date(order.shipment.deliveryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              <User className="mr-2 text-gray-600" size={20} />
              <h2 className="text-lg font-semibold">Customer Information</h2>
            </div>
            <div className="space-y-2">
              <div>
                <p className="text-sm text-gray-600">Name</p>
                <p className="font-medium">{order.user?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{order.user?.email || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Order Date</p>
                <p className="font-medium">
                  {new Date(order.orderDate).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* Delivery Address */}
          {order.address && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <MapPin className="mr-2 text-gray-600" size={20} />
                <h2 className="text-lg font-semibold">Delivery Address</h2>
              </div>
              <div className="space-y-1">
                <p className="font-medium">{order.address.street}</p>
                <p className="text-gray-600">
                  {order.address.city}, {order.address.state}
                </p>
                <p className="text-gray-600">{order.address.zip}</p>
                <p className="text-gray-600">{order.address.country}</p>
              </div>
            </div>
          )}

          {/* Payment Information */}
          {order.payment && (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center mb-4">
                <CreditCard className="mr-2 text-gray-600" size={20} />
                <h2 className="text-lg font-semibold">Payment Information</h2>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Method:</span>
                  <span className="font-medium">{order.payment.method}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-medium">
                    ${order.payment.amount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium ${
                      order.payment.status === "PAID"
                        ? "bg-green-100 text-green-800"
                        : order.payment.status === "PENDING"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {order.payment.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default withAuth(OrderDetailPage);
