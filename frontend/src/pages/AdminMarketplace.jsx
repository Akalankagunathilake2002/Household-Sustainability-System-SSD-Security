import React, { useState } from "react";
import ProductManagement from "../components/marketplace/ProductManagement";
import OrderManagement from "../components/marketplace/OrderManagement";
import { ShoppingBag, ClipboardList } from "lucide-react";

const AdminMarketplace = () => {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="flex flex-col gap-6">

      {/* HEADER */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Marketplace Management</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage listed products and marketplace orders.</p>
        </div>

        {/* Toggle Tabs */}
        <div className="flex bg-white border border-gray-200 p-1 rounded-xl shadow-sm gap-1">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "products"
                ? "bg-teal-500 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <ShoppingBag size={15} />
            Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === "orders"
                ? "bg-teal-500 text-white shadow-sm"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <ClipboardList size={15} />
            Orders
          </button>
        </div>
      </header>

      {activeTab === "products" ? <ProductManagement /> : <OrderManagement />}

    </div>
  );
};

export default AdminMarketplace;