"use client";
import Table from "@/app/components/layout/Table";
import { useState } from "react";
import { Trash2, Eye, PenLine } from "lucide-react";
import ConfirmModal from "@/app/components/organisms/ConfirmModal";
import useToast from "@/app/hooks/ui/useToast";
import { usePathname, useRouter } from "next/navigation";
import {
  useDeleteOrderMutation,
  useGetAllOrdersQuery,
  useUpdateOrderMutation,
} from "@/app/store/apis/OrderApi";
import Modal from "@/app/components/organisms/Modal";
import Dropdown from "@/app/components/molecules/Dropdown";
import { withAuth } from "@/app/components/HOC/WithAuth";

const OrdersDashboard = () => {
  const { showToast } = useToast();
  const router = useRouter();
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("");

  const pathname = usePathname();
  const shouldFetchOrders = pathname === "/dashboard/orders";

  const { data, isLoading } = useGetAllOrdersQuery(undefined, {
    skip: !shouldFetchOrders,
  });
  const [updateOrder, { error: updateError }] = useUpdateOrderMutation();
  const [deleteOrder, { error: deleteError }] = useDeleteOrderMutation();

  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string>("");

  const handleDeleteOrder = (id: string) => {
    // Find the order to check for warnings
    const order = data?.orders?.find((o: any) => o.id === id);
    
    let warning = "";
    if (order) {
      // Check if order has items (means it was placed)
      if (order.orderItems && order.orderItems.length > 0) {
        warning = "⚠️ WARNING: This order contains items and has order history. Deleting it will remove transaction records. ";
      }
      
      // Check order status
      if (order.status === "PENDING" || order.status === "PROCESSING") {
        warning += "This order is still active and may be in process. ";
      }
    }
    
    setDeleteWarning(warning);
    setIsConfirmModalOpen(true);
    setOrderToDelete(id);
  };

  const handleUpdateStatus = (order: any) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsStatusModalOpen(true);
  };

  const handleViewDetails = (id: string) => {
    router.push(`/dashboard/orders/${id}`);
  };

  const confirmDelete = async () => {
    if (!orderToDelete) return;
    setIsConfirmModalOpen(false);
    try {
      await deleteOrder(orderToDelete).unwrap();
      setOrderToDelete(null);
      showToast("Order deleted successfully", "success");
    } catch (err) {
      console.error("Failed to delete order:", err);
      showToast("Failed to delete order", "error");
    }
  };

  const confirmStatusUpdate = async () => {
    if (!selectedOrder || !newStatus) return;
    setIsStatusModalOpen(false);
    try {
      await updateOrder({
        orderId: selectedOrder.id,
        status: newStatus,
      }).unwrap();
      showToast("Status updated successfully", "success");
    } catch (err) {
      console.error("Failed to update status:", err);
      showToast("Failed to update status", "error");
    }
  };

  const ORDER_STATUSES = [
    { label: "PENDING", value: "PENDING" },
    { label: "PROCESSING", value: "PROCESSING" },
    { label: "SHIPPED", value: "SHIPPED" },
    { label: "DELIVERED", value: "DELIVERED" },
    { label: "CANCELED", value: "CANCELED" },
  ];

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

  const columns = [
    {
      key: "id",
      label: "Order ID",
      sortable: true,
      render: (row: any) => (
        <div className="flex items-center space-x-2 min-w-[100px]">
          <span className="font-mono text-xs">{row.id.substring(0, 8)}...</span>
        </div>
      ),
    },
    {
      key: "user",
      label: "Customer",
      sortable: true,
      render: (row: any) => (
        <div className="min-w-[150px]">
          <div className="font-medium text-sm">{row.user?.name || "N/A"}</div>
          <div className="text-xs text-gray-500 truncate">{row.user?.email || "N/A"}</div>
        </div>
      ),
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (row: any) => (
        <span className="font-semibold text-sm whitespace-nowrap">${row.amount.toFixed(2)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      sortable: true,
      render: (row: any) => (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${getStatusColor(
            row.status
          )}`}
        >
          {row.status}
        </span>
      ),
    },
    {
      key: "orderDate",
      label: "Order Date",
      sortable: true,
      render: (row: any) => (
        <span className="text-sm whitespace-nowrap">{new Date(row.orderDate).toLocaleDateString()}</span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row: any) => (
        <div className="flex space-x-2 min-w-[200px]">
          <button
            onClick={() => handleViewDetails(row.id)}
            className="text-blue-600 hover:text-blue-800 flex items-center gap-1 text-sm"
          >
            <Eye size={14} />
            View
          </button>
          <button
            onClick={() => handleUpdateStatus(row)}
            className="text-green-600 hover:text-green-800 flex items-center gap-1 text-sm"
          >
            <PenLine size={14} />
            Update
          </button>
          <button
            onClick={() => handleDeleteOrder(row.id)}
            className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
          >
            <Trash2 size={14} />
            Delete
          </button>
        </div>
      ),
    },
  ];

  const cancelDelete = () => {
    setIsConfirmModalOpen(false);
  };

  const cancelStatusUpdate = () => {
    setIsStatusModalOpen(false);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Orders Management</h1>
        <p className="text-sm text-gray-500">
          View and manage customer orders
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table
          data={data?.orders}
          columns={columns}
          isLoading={isLoading}
          emptyMessage="No orders available"
          onRefresh={() => console.log("refreshed")}
          showHeader={false}
        />
      </div>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        message={
          deleteWarning
            ? `${deleteWarning}\n\nAre you sure you want to delete this order? This action cannot be undone.`
            : "Are you sure you want to delete this order? This action cannot be undone."
        }
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Update Status Modal */}
      <Modal open={isStatusModalOpen} onClose={cancelStatusUpdate}>
        <div>
          <h2 className="text-lg font-semibold mb-4">Update Order Status</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Order ID
            </label>
            <input
              type="text"
              value={selectedOrder?.id || ""}
              className="w-full p-2 border border-gray-300 rounded-md bg-gray-50"
              disabled
            />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Dropdown
              options={ORDER_STATUSES}
              value={newStatus}
              onChange={(value) => setNewStatus(value || "")}
              className="w-full"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={cancelStatusUpdate}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={confirmStatusUpdate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Update Status
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default withAuth(OrdersDashboard);
