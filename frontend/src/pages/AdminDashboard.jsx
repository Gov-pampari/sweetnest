import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { supabase, LOGO_URL } from "../lib/supabase";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { LogOut, Trash2, Check, X, Plus, Upload } from "lucide-react";

const emptyProduct = {
  name: "",
  description: "",
  price_250g: "",
  price_500g: "",
  price_1kg: "",
  quantity: "500g",
  image_url: "",
  category: "Traditional",
  is_active: true,
};

export default function AdminDashboard() {
  const { session, isAdmin, loading, signOut } = useAuth();
  const [tab, setTab] = useState("orders");
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState(emptyProduct);
  const [editingId, setEditingId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const onUploadImage = async (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setUploading(true);
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });
    if (error) {
      setUploading(false);
      toast.error("Upload failed: " + error.message);
      return;
    }
    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
    toast.success("Image uploaded");
  };

  const loadAll = async () => {
    const [o, p, r] = await Promise.all([
      supabase.from("orders").select("*").order("created_at", { ascending: false }),
      supabase.from("products").select("*").order("created_at", { ascending: false }),
      supabase.from("reviews").select("*").order("created_at", { ascending: false }),
    ]);
    setOrders(o.data || []);
    setProducts(p.data || []);
    setReviews(r.data || []);
  };

  useEffect(() => {
    if (isAdmin) loadAll();
  }, [isAdmin]);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#F5E6B8] text-[#5C1A0B]">Loading…</div>;
  if (!session) return <Navigate to="/admin/login" replace />;
  if (!isAdmin)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5E6B8] text-[#5C1A0B] px-6 text-center">
        <div>
          <p className="font-serif text-3xl">Access denied</p>
          <p className="mt-2 text-sm text-[#8A412A]">This account does not have admin role.</p>
          <button onClick={signOut} className="btn-primary rounded-full px-6 py-2 mt-4">Sign out</button>
        </div>
      </div>
    );

  // ======= Product CRUD =======
  const saveProduct = async (e) => {
    e.preventDefault();
    const p250 = form.price_250g === "" ? null : Number(form.price_250g);
    const p500 = form.price_500g === "" ? null : Number(form.price_500g);
    const p1kg = form.price_1kg === "" ? null : Number(form.price_1kg);
    // At least one price required
    if (p250 == null && p500 == null && p1kg == null) {
      toast.error("Please set at least one price (250g / 500g / 1kg)");
      return;
    }
    // Base `price` (legacy column) = whichever is available, preferring 500g
    const basePrice =
      p500 ?? (p250 != null ? Math.round(p250 * 2) : null) ??
      (p1kg != null ? Math.round(p1kg / 2) : 0);
    const payload = {
      name: form.name,
      description: form.description,
      category: form.category,
      quantity: form.quantity,
      image_url: form.image_url,
      is_active: form.is_active,
      price: basePrice,
      price_250g: p250,
      price_500g: p500,
      price_1kg: p1kg,
    };
    let res;
    if (editingId) {
      res = await supabase.from("products").update(payload).eq("id", editingId);
    } else {
      res = await supabase.from("products").insert(payload);
    }
    if (res.error) return toast.error(res.error.message);
    toast.success(editingId ? "Product updated" : "Product added");
    setForm(emptyProduct);
    setEditingId(null);
    loadAll();
  };

  const editProduct = (p) => {
    setForm({
      name: p.name,
      description: p.description || "",
      price_250g: p.price_250g ?? "",
      price_500g: p.price_500g ?? "",
      price_1kg: p.price_1kg ?? "",
      quantity: p.quantity,
      image_url: p.image_url,
      category: p.category,
      is_active: p.is_active,
    });
    setEditingId(p.id);
  };

  const deleteProduct = async (id) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Product deleted");
    loadAll();
  };

  // ======= Review approval =======
  const setReviewStatus = async (id, status) => {
    const { error } = await supabase.from("reviews").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Review ${status}`);
    loadAll();
  };

  // ======= Order status =======
  const setOrderStatus = async (id, status) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Order updated");
    loadAll();
  };

  const tabs = [
    { id: "orders", label: `Orders (${orders.length})` },
    { id: "products", label: `Products (${products.length})` },
    { id: "reviews", label: `Reviews (${reviews.length})` },
  ];

  return (
    <div className="min-h-screen bg-[#F5E6B8]" data-testid="admin-dashboard">
      <header className="bg-[#FAF6EA] border-b border-[#E8D8A7] px-4 md:px-8 py-3 flex items-center justify-between sticky top-0 z-40">
        <Link to="/" className="flex items-center gap-3" data-testid="admin-logo-link">
          <img src={LOGO_URL} alt="SweetNest" className="h-10 w-auto" />
          <span className="font-serif text-xl text-[#5C1A0B]">Control Room</span>
        </Link>
        <button
          onClick={signOut}
          className="inline-flex items-center gap-2 text-[#5C1A0B] hover:text-[#D4AF37] text-sm"
          data-testid="admin-signout-btn"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        <div className="flex gap-2 mb-6 border-b border-[#E8D8A7]">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              data-testid={`tab-${t.id}`}
              className={`px-4 py-2 text-sm border-b-2 transition ${
                tab === t.id
                  ? "border-[#5C1A0B] text-[#5C1A0B] font-medium"
                  : "border-transparent text-[#8A412A]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ORDERS */}
        {tab === "orders" && (
          <div className="space-y-3" data-testid="orders-panel">
            {orders.length === 0 && <p className="text-[#8A412A]">No orders yet.</p>}
            {orders.map((o) => (
              <div key={o.id} className="bg-[#FAF6EA] rounded-2xl border border-[#E8D8A7] p-5" data-testid={`order-${o.id}`}>
                <div className="flex flex-wrap justify-between gap-4 items-start">
                  <div>
                    <p className="font-serif text-xl text-[#5C1A0B]">{o.customer_name}</p>
                    <p className="text-xs text-[#8A412A]">
                      {o.customer_phone} · {new Date(o.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-serif text-2xl text-[#5C1A0B]">₹{o.total}</p>
                    <select
                      value={o.status}
                      onChange={(e) => setOrderStatus(o.id, e.target.value)}
                      className="text-xs bg-white border border-[#E8D8A7] rounded px-2 py-1 mt-1"
                      data-testid={`order-status-${o.id}`}
                    >
                      <option value="new">new</option>
                      <option value="confirmed">confirmed</option>
                      <option value="delivered">delivered</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                </div>
                <ul className="mt-3 text-sm text-[#5C1A0B] space-y-0.5">
                  {(o.items || []).map((i, idx) => (
                    <li key={idx}>
                      • {i.name} ({i.weight}) × {i.qty} — ₹{i.subtotal}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* PRODUCTS */}
        {tab === "products" && (
          <div className="grid lg:grid-cols-[400px,1fr] gap-6" data-testid="products-panel">
            <form onSubmit={saveProduct} className="bg-[#FAF6EA] rounded-2xl border border-[#E8D8A7] p-5 space-y-3 h-fit" data-testid="product-form">
              <h3 className="font-serif text-2xl text-[#5C1A0B]">
                {editingId ? "Edit Product" : "Add Product"}
              </h3>
              {[
                ["name", "Name"],
                ["category", "Category"],
                ["quantity", "Default weight (e.g. 500g)"],
              ].map(([k, label]) => (
                <input
                  key={k}
                  placeholder={label}
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                  className="w-full bg-white rounded-lg px-3 py-2 border border-[#E8D8A7] text-sm"
                  required
                  data-testid={`product-${k}-input`}
                />
              ))}

              {/* Image: upload or URL */}
              <div className="space-y-2">
                <label
                  htmlFor="product-image-file"
                  className={`flex items-center justify-center gap-2 w-full border-2 border-dashed border-[#E8D8A7] rounded-lg py-3 text-sm cursor-pointer hover:border-[#5C1A0B] transition ${
                    uploading ? "opacity-60 pointer-events-none" : ""
                  }`}
                  data-testid="product-image-upload-label"
                >
                  <Upload className="w-4 h-4" />
                  {uploading ? "Uploading…" : "Upload image"}
                </label>
                <input
                  id="product-image-file"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onUploadImage(e.target.files?.[0])}
                  data-testid="product-image-file-input"
                />
                <input
                  placeholder="…or paste image URL"
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  className="w-full bg-white rounded-lg px-3 py-2 border border-[#E8D8A7] text-sm"
                  required
                  data-testid="product-image_url-input"
                />
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="preview"
                    className="w-full h-40 object-cover rounded-lg border border-[#E8D8A7]"
                    data-testid="product-image-preview"
                  />
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs uppercase tracking-wider text-[#8A412A]">Prices per weight (₹)</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    ["price_250g", "250g"],
                    ["price_500g", "500g"],
                    ["price_1kg", "1kg"],
                  ].map(([key, label]) => (
                    <div key={key}>
                      <label className="block text-[11px] text-[#8A412A] mb-1">{label}</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="—"
                        value={form[key]}
                        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                        className="w-full bg-white rounded-lg px-2 py-2 border border-[#E8D8A7] text-sm"
                        data-testid={`product-${key}-input`}
                      />
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-[#8A412A]">
                  Leave a field empty to hide that weight on the product card.
                </p>
              </div>
              <textarea
                placeholder="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-white rounded-lg px-3 py-2 border border-[#E8D8A7] text-sm resize-none"
                data-testid="product-description-input"
              />
              <label className="flex items-center gap-2 text-sm text-[#5C1A0B]">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                  data-testid="product-active-input"
                />
                Active
              </label>
              <div className="flex gap-2">
                <button type="submit" className="btn-primary rounded-full px-5 py-2 inline-flex items-center gap-2" data-testid="product-save-btn">
                  <Plus className="w-4 h-4" /> {editingId ? "Save" : "Add"}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setForm(emptyProduct);
                    }}
                    className="text-sm text-[#8A412A] underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>

            <div className="grid sm:grid-cols-2 gap-4">
              {products.map((p) => (
                <div key={p.id} className="bg-[#FAF6EA] rounded-2xl border border-[#E8D8A7] overflow-hidden" data-testid={`admin-product-${p.id}`}>
                  <img src={p.image_url} alt={p.name} className="aspect-video w-full object-cover" />
                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-serif text-xl text-[#5C1A0B]">{p.name}</p>
                        <p className="text-xs text-[#8A412A]">
                          {p.category} · ₹{p.price_250g ?? "—"}/250g · ₹{p.price_500g ?? "—"}/500g · ₹{p.price_1kg ?? "—"}/1kg · {p.is_active ? "active" : "hidden"}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={() => editProduct(p)} className="text-xs px-2 py-1 rounded border border-[#E8D8A7]" data-testid={`edit-${p.id}`}>
                          Edit
                        </button>
                        <button onClick={() => deleteProduct(p.id)} className="text-xs px-2 py-1 rounded bg-[#5C1A0B] text-[#F5E6B8]" data-testid={`delete-${p.id}`}>
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REVIEWS */}
        {tab === "reviews" && (
          <div className="space-y-3" data-testid="reviews-panel">
            {reviews.length === 0 && <p className="text-[#8A412A]">No reviews yet.</p>}
            {reviews.map((r) => (
              <div key={r.id} className="bg-[#FAF6EA] rounded-2xl border border-[#E8D8A7] p-5" data-testid={`admin-review-${r.id}`}>
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <p className="font-serif text-xl text-[#5C1A0B]">{r.name} · {r.rating}★</p>
                    <p className="text-sm text-[#5C1A0B] mt-1">{r.comment}</p>
                    <p className="text-xs text-[#8A412A] mt-1">Status: {r.status}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => setReviewStatus(r.id, "approved")}
                      className="inline-flex items-center gap-1 bg-[#5C1A0B] text-[#F5E6B8] rounded-full px-3 py-1.5 text-xs"
                      data-testid={`approve-${r.id}`}
                    >
                      <Check className="w-3.5 h-3.5" /> Approve
                    </button>
                    <button
                      onClick={() => setReviewStatus(r.id, "rejected")}
                      className="inline-flex items-center gap-1 border border-[#5C1A0B] text-[#5C1A0B] rounded-full px-3 py-1.5 text-xs"
                      data-testid={`reject-${r.id}`}
                    >
                      <X className="w-3.5 h-3.5" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
