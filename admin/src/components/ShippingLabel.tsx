import React from "react";
import Barcode from "react-barcode";
import { format } from "date-fns";

interface ShippingLabelProps {
  order: any;
}

export const ShippingLabel = React.forwardRef<HTMLDivElement, ShippingLabelProps>(
  ({ order }, ref) => {
    // Determine address
    const address = order?.customer?.address || null;
    const name = order?.customer?.name || order?.name || "Customer";
    const orderType = order?.orderType || (order?.orderRef?.startsWith("QT") ? "Quote" : "Order");
    const orderDate = order?.createdAt?.toDate
      ? format(new Date(order.createdAt.toDate()), "PPP")
      : "N/A";

    return (
      <div
        ref={ref}
        className="w-[4in] h-[6in] bg-white text-black p-4 flex flex-col justify-between"
        style={{
          width: "4in",
          height: "6in",
          pageBreakAfter: "always",
          fontFamily: "Arial, sans-serif",
          margin: 0,
          boxSizing: "border-box"
        }}
      >
        {/* Header - Sender Info */}
        <div className="border-b-2 border-black pb-2 mb-2 flex justify-between items-start">
          <div className="text-[10px] leading-tight">
            <strong>FROM:</strong><br />
            <strong>Aveon Spaces</strong><br />
            123 Industrial Area, Phase 1<br />
            Mumbai, Maharashtra 400001<br />
            India<br />
            Phone: +91 98765 43210
          </div>
          <div className="text-right">
            <div className="font-black text-lg tracking-tighter uppercase border-2 border-black px-2 py-1 inline-block">
              AVEON
            </div>
          </div>
        </div>

        {/* Ship To Section */}
        <div className="border-b-2 border-black pb-4 mb-2 flex-grow">
          <p className="text-[10px] font-bold mb-1">SHIP TO:</p>
          <div className="pl-4 text-sm leading-tight uppercase font-medium">
            {typeof address === "object" && address !== null ? (
              <>
                <p className="font-bold text-base mb-1">{address.firstName} {address.lastName}</p>
                {order.customer?.company && <p>{order.customer.company}</p>}
                <p>{address.street}</p>
                <p>{address.city}, {address.state} {address.postalCode}</p>
                <p>{address.country}</p>
                {address.phone && <p className="mt-1 text-xs">Ph: {address.phone}</p>}
              </>
            ) : (
              <>
                <p className="font-bold text-base mb-1">{name}</p>
                {order.customer?.company && <p>{order.customer.company}</p>}
                <p className="whitespace-pre-wrap mt-1 text-xs">{typeof address === 'string' ? address : (order.customer?.message || order.message || "No Address Provided")}</p>
                <p className="mt-1 text-xs">Ph: {order.customer?.phone || order.phone}</p>
              </>
            )}
          </div>
        </div>

        {/* Order Details */}
        <div className="border-b-2 border-black pb-2 mb-2">
          <div className="flex justify-between text-[10px]">
            <div>
              <strong>Order Ref:</strong> {order.orderRef || order.id.substring(0,8).toUpperCase()}<br />
              <strong>Type:</strong> {orderType}<br />
              <strong>Date:</strong> {orderDate}
            </div>
            <div className="text-right">
              <strong>Items:</strong> {order.items?.length || 0}<br />
              <strong>Weight:</strong> -<br />
            </div>
          </div>
        </div>

        {/* Barcode Section */}
        <div className="flex flex-col items-center justify-center mt-auto pb-4">
          <Barcode 
            value={order.orderRef || order.id.substring(0,8).toUpperCase()} 
            width={1.5}
            height={50}
            fontSize={12}
            displayValue={true}
            margin={0}
          />
          <p className="text-[8px] text-center mt-2 uppercase font-bold text-gray-500">
            Internal Tracking Label
          </p>
        </div>
      </div>
    );
  }
);

ShippingLabel.displayName = "ShippingLabel";
