"use client";
import { useEffect, useState } from "react";
import ProductMultiSelect from "@/components/ProductMultiSelect";
import Chart from "@/components/Chart";
import OverlayChart from "@/components/OverlayChart";

type Product = { id: number; name: string; openingInventory: number };

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selected, setSelected] = useState<number[]>([]);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [overlay, setOverlay] = useState(false);

  async function loadProducts() {
    const res = await fetch("/api/products");
    if (res.ok) setProducts(await res.json());
  }

  useEffect(() => { loadProducts(); }, []);

  async function onUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setUploading(true); setMessage("");
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) { setMessage("Upload & import success"); loadProducts(); }
    else { setMessage((await res.json()).error || "Import failed"); }
  }

  return (
    <main className="p-6 space-y-6 max-w-6xl mx-auto">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">AIBUILD Data Dashboard</h1>
        <form action="/api/auth/logout" method="post"><button className="border rounded-2xl px-4 py-2">Logout</button></form>
      </header>

      <section className="grid gap-4 md:grid-cols-2">
        <form onSubmit={onUpload} className="border rounded-2xl p-4 space-y-3">
          <h2 className="font-medium">Import Excel</h2>
          <input name="file" type="file" accept=".xlsx,.xls" required className="w-full" />
          <button disabled={uploading} className="border rounded-2xl px-4 py-2">{uploading?"Uploading...":"Upload"}</button>
          {message && <p className="text-sm opacity-80">{message}</p>}
        </form>

        <div className="border rounded-2xl p-4">
          <h2 className="font-medium mb-2">Select products</h2>
          <ProductMultiSelect products={products} selected={selected} onChange={setSelected} />
          <p className="text-xs opacity-70 mt-2">Tip: Select 1+ products. Each renders its own chart for clear comparison.</p>
        </div>

        <label style={{ display:"inline-flex", alignItems:"center", gap:8, fontSize:14, marginTop:8 }}>
          <input type="checkbox" checked={overlay} onChange={e=>setOverlay(e.target.checked)} />
          Overlay products in one chart
          </label>
      </section>

      <section className="space-y-6">
        {overlay ? (
          <OverlayChart products={products.filter(p=>selected.includes(p.id))} />
        ) : (
        <>
        {selected.map(pid => {
          const p = products.find(x=>x.id===pid);
          return <Chart key={pid} product={p!} />
        })}
        {selected.length===0 && (<p className="opacity-70">No product selected.</p>)}
        </>
  )}
</section>
    </main>
  );
}