import ProductForm from "@/components/ProductForm";
import React from "react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  
  return <ProductForm productId={resolvedParams.id} />;
}
