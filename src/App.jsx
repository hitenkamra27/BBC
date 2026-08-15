import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { supabase, supabaseConfigSource, supabaseUrlInUse, setSupabaseOverride, clearSupabaseOverride, getSupabaseOverride } from "./supabaseClient";
import {
  Pencil, Blocks, BookOpen, NotebookPen, Gift, Trophy, ShoppingCart, X, Plus, Minus,
  User, Lock, Mail, Phone, MapPin, Package, LayoutGrid, CreditCard, CheckCircle2,
  Search, Menu, LogOut, Settings, ClipboardList, Layers, Store, Trash2, Edit3,
  ChevronRight, ChevronLeft, Star, AlertCircle, Building2, Home, Save,
  Instagram, Facebook, MessageCircle, Truck, Upload, PlugZap, Download, KeyRound,
  ToggleLeft, ToggleRight, TrendingUp, Award, Eye, EyeOff, Image as ImageIcon, Tag
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Design tokens                                                       */
/* ------------------------------------------------------------------ */
const INK = "#1A1F36";
const PAPER = "#FAF9F6";
const CARD = "#FFFFFF";
const TEAL = "#0F8B8D";
const CORAL = "#FF6B4A";

const ICONS = { Pencil, Blocks, BookOpen, NotebookPen, Gift, Trophy };

const DEFAULT_CATEGORIES = [
  { id: "stationery", name: "Stationery", icon: "Pencil", color: "#F4B942" },
  { id: "toys", name: "Toys", icon: "Blocks", color: "#FF6B4A" },
  { id: "books", name: "Books", icon: "BookOpen", color: "#0F8B8D" },
  { id: "notebooks", name: "Notebooks", icon: "NotebookPen", color: "#7C6FE0" },
  { id: "gifts", name: "Gifts", icon: "Gift", color: "#E8558A" },
  { id: "sports", name: "Sports", icon: "Trophy", color: "#4CAF6D" },
];

const DEFAULT_PRODUCTS = [
  { id: "p1", name: "Gel Pen Set (10pc)", category: "stationery", sku: "STA-001", emoji: "🖊️", retailPrice: 149, wholesalePrice: 99, stock: 120, desc: "Smooth-writing gel pens in assorted colors." },
  { id: "p2", name: "Sticky Notes Pack", category: "stationery", sku: "STA-002", emoji: "📝", retailPrice: 89, wholesalePrice: 55, stock: 200, desc: "5 pads of neon sticky notes, 400 sheets total." },
  { id: "p3", name: "Geometry Box", category: "stationery", sku: "STA-003", emoji: "📐", retailPrice: 129, wholesalePrice: 85, stock: 60, desc: "Complete geometry set with compass and scales." },
  { id: "p4", name: "Building Blocks (150pc)", category: "toys", sku: "TOY-001", emoji: "🧱", retailPrice: 899, wholesalePrice: 650, stock: 40, desc: "Colorful interlocking blocks for ages 3+." },
  { id: "p5", name: "Remote Control Car", category: "toys", sku: "TOY-002", emoji: "🚗", retailPrice: 1299, wholesalePrice: 950, stock: 25, desc: "Fast RC car with rechargeable battery." },
  { id: "p6", name: "Plush Teddy Bear", category: "toys", sku: "TOY-003", emoji: "🧸", retailPrice: 599, wholesalePrice: 420, stock: 55, desc: "Soft huggable teddy, 12 inches." },
  { id: "p7", name: "Illustrated Storybook", category: "books", sku: "BOK-001", emoji: "📖", retailPrice: 249, wholesalePrice: 175, stock: 80, desc: "Bedtime stories collection for kids." },
  { id: "p8", name: "Puzzle & Riddles Book", category: "books", sku: "BOK-002", emoji: "🧩", retailPrice: 199, wholesalePrice: 140, stock: 70, desc: "200 brain-teasers for curious minds." },
  { id: "p9", name: "Classic Novel Set (3)", category: "books", sku: "BOK-003", emoji: "📚", retailPrice: 499, wholesalePrice: 360, stock: 30, desc: "Three timeless classics in one bundle." },
  { id: "p10", name: "A5 Ruled Notebook", category: "notebooks", sku: "NTB-001", emoji: "📓", retailPrice: 79, wholesalePrice: 45, stock: 300, desc: "200-page notebook, smooth paper." },
  { id: "p11", name: "Spiral Notebook (Set of 3)", category: "notebooks", sku: "NTB-002", emoji: "🗒️", retailPrice: 199, wholesalePrice: 130, stock: 150, desc: "Wire-bound notebooks, assorted covers." },
  { id: "p12", name: "Premium Diary", category: "notebooks", sku: "NTB-003", emoji: "📔", retailPrice: 349, wholesalePrice: 240, stock: 45, desc: "Hardbound diary with ribbon bookmark." },
  { id: "p13", name: "Scented Candle Gift Box", category: "gifts", sku: "GFT-001", emoji: "🕯️", retailPrice: 449, wholesalePrice: 320, stock: 35, desc: "Set of 3 scented candles in a gift box." },
  { id: "p14", name: "Photo Frame Set", category: "gifts", sku: "GFT-002", emoji: "🖼️", retailPrice: 349, wholesalePrice: 240, stock: 40, desc: "Set of 4 wooden photo frames." },
  { id: "p15", name: "Greeting Card Pack", category: "gifts", sku: "GFT-003", emoji: "💌", retailPrice: 129, wholesalePrice: 80, stock: 100, desc: "Assorted occasion greeting cards, pack of 10." },
  { id: "p16", name: "Football (Size 5)", category: "sports", sku: "SPT-001", emoji: "⚽", retailPrice: 599, wholesalePrice: 420, stock: 50, desc: "Match-quality football, all-weather." },
  { id: "p17", name: "Badminton Racket Set", category: "sports", sku: "SPT-002", emoji: "🏸", retailPrice: 749, wholesalePrice: 530, stock: 38, desc: "Pair of rackets with 2 shuttlecocks." },
  { id: "p18", name: "Skipping Rope", category: "sports", sku: "SPT-003", emoji: "🪢", retailPrice: 99, wholesalePrice: 60, stock: 150, desc: "Adjustable-length fitness skipping rope." },
  // Extra items — added to round out the catalog across every category
  { id: "p19", name: "Wax Crayons (24 shades)", category: "stationery", sku: "STA-004", emoji: "🖍️", retailPrice: 65, wholesalePrice: 40, stock: 180, desc: "Non-toxic wax crayons, 24 vibrant shades." },
  { id: "p20", name: "Correction Pen", category: "stationery", sku: "STA-005", emoji: "🧴", retailPrice: 35, wholesalePrice: 20, stock: 220, desc: "Quick-dry correction fluid pen." },
  { id: "p21", name: "School Backpack", category: "stationery", sku: "STA-006", emoji: "🎒", retailPrice: 699, wholesalePrice: 480, stock: 45, desc: "Durable water-resistant school bag with multiple compartments." },
  { id: "p22", name: "Building Blocks Mini (60pc)", category: "toys", sku: "TOY-004", emoji: "🧩", retailPrice: 399, wholesalePrice: 280, stock: 60, desc: "Compact block set, great for travel and small hands." },
  { id: "p23", name: "Toy Kitchen Set", category: "toys", sku: "TOY-005", emoji: "🍳", retailPrice: 749, wholesalePrice: 540, stock: 30, desc: "Pretend-play kitchen set with utensils and cookware." },
  { id: "p24", name: "Board Game — Ludo & Snakes", category: "toys", sku: "TOY-006", emoji: "🎲", retailPrice: 199, wholesalePrice: 130, stock: 90, desc: "2-in-1 family board game, ages 5+." },
  { id: "p25", name: "General Knowledge Book", category: "books", sku: "BOK-004", emoji: "🌍", retailPrice: 229, wholesalePrice: 160, stock: 65, desc: "Fun facts and GK for school-age readers." },
  { id: "p26", name: "Coloring & Activity Book", category: "books", sku: "BOK-005", emoji: "🎨", retailPrice: 89, wholesalePrice: 55, stock: 140, desc: "Coloring pages plus mazes and dot-to-dots." },
  { id: "p27", name: "A4 Long Notebook (Set of 5)", category: "notebooks", sku: "NTB-004", emoji: "📒", retailPrice: 249, wholesalePrice: 170, stock: 120, desc: "Long-size ruled notebooks, 172 pages each." },
  { id: "p28", name: "Sketchbook", category: "notebooks", sku: "NTB-005", emoji: "🖌️", retailPrice: 149, wholesalePrice: 95, stock: 85, desc: "Thick blank pages for drawing and sketching." },
  { id: "p29", name: "Wall Clock Gift Set", category: "gifts", sku: "GFT-004", emoji: "🕰️", retailPrice: 599, wholesalePrice: 430, stock: 25, desc: "Silent-sweep wall clock, great housewarming gift." },
  { id: "p30", name: "Rakhi Gift Hamper", category: "gifts", sku: "GFT-005", emoji: "🎁", retailPrice: 399, wholesalePrice: 270, stock: 50, desc: "Festive hamper with sweets and a rakhi." },
  { id: "p31", name: "Cricket Bat (Kashmir Willow)", category: "sports", sku: "SPT-004", emoji: "🏏", retailPrice: 899, wholesalePrice: 650, stock: 28, desc: "Full-size kashmir willow bat for tennis-ball cricket." },
  { id: "p32", name: "Yoga Mat", category: "sports", sku: "SPT-005", emoji: "🧘", retailPrice: 449, wholesalePrice: 310, stock: 55, desc: "Non-slip 6mm exercise & yoga mat." },
];

const DEFAULT_CONTENT = {
  storeName: "Bhagwati Book Center",
  logoUrl: "", // data-URL or hosted image URL set from Admin → Website content → Branding
  bannerTitle: "Everything your desk, playroom & trophy shelf needs",
  bannerSubtitle: "Stationery, toys, books, notebooks, gifts & sports gear — retail or wholesale.",
  announcement: "🚚 Free delivery on orders above ₹999",
  contactPhone: "+91 98765 43210",
  contactEmail: "hello@kiranacorner.shop",
  whatsappNumber: "919876543210",
  instagramUrl: "https://instagram.com/",
  facebookUrl: "https://facebook.com/",
  address: "Main Bazaar Road, Your Village, District, State",
  // Delivery rule: home delivery only for orders at/above this amount.
  // Orders below this are "Book & self pick-up" — customer books online and
  // collects the order in person from the store instead of home delivery.
  deliveryMinimum: 999,
  // Google Sign-In (Google Identity Services). Paste an OAuth 2.0 Web Client ID
  // from https://console.cloud.google.com/apis/credentials — leave blank to hide the button.
  googleClientId: "",
  // Cashfree Payments power the "Pay online" button (label stays "Pay online" for
  // customers). appId is the public Client/App ID (safe to expose in the browser).
  // Real orders need a small backend/serverless endpoint (Cashfree's secret key can
  // never live in frontend code) that creates the order and returns a
  // payment_session_id — point orderEndpoint at that URL. Until it's set, "Pay
  // online" shows a clear message instead of faking a successful payment.
  cashfreeAppId: "",
  cashfreeMode: "sandbox", // "sandbox" | "production"
  cashfreeOrderEndpoint: "",
  // Transactional emails (wholesale approval, order booked/paid, order packed)
  // are sent through Resend's SMTP relay via the app's own built-in endpoint
  // (see server.js) — same origin, no separate backend to deploy. Fill in
  // the API key below (from resend.com → API Keys), or — to keep it out of
  // this publicly-readable content — set RESEND_API_KEY as an environment
  // variable on your host (e.g. Render) instead; that always takes priority.
  emailApiEndpoint: "/api/send-email",
  emailSmtpHost: "smtp.resend.com",
  emailSmtpPort: "465",
  emailApiKey: "",
  emailFromAddress: "",
  emailFromName: "",
  // Promotional banners/posters shown as a carousel at the top of the
  // storefront (below the hero) — e.g. "20% off school supplies this week".
  // Each is { id, imageUrl, link, title }. Images are uploaded to Supabase
  // Storage from Admin → Banners (falls back to an inline data-URL if
  // Supabase Storage isn't set up yet). Recommended poster size: 1200×400px
  // (3:1 ratio) — see Admin → Banners for the full guidance.
  banners: [],
  bannerIntervalSeconds: 5,
};

// The admin password and store-open/closed state now live in shop-admin
// storage (see DEFAULT_ADMIN_SETTINGS below) so the shop owner can change
// them from Admin → Settings instead of editing code.
const DEFAULT_ADMIN_SETTINGS = { password: "admin123", storeOpen: true };

/* ------------------------------------------------------------------ */
/* Storage helpers                                                     */
/* ------------------------------------------------------------------ */
// Backed by Supabase (a `kv_store` table — see supabase-schema.sql) so data
// is shared across every device and customer, not trapped in one browser.
// If Supabase isn't configured, these quietly fall back to localStorage so
// local dev still works without a .env file.
async function loadShared(key, fallback) {
  if (!supabase) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  }
  try {
    const { data, error } = await supabase.from("kv_store").select("value").eq("key", key).maybeSingle();
    if (error) throw error;
    return data ? data.value : fallback;
  } catch (e) {
    console.error("supabase load failed", key, e);
    return fallback;
  }
}
async function saveShared(key, value) {
  if (!supabase) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error("storage save failed", key, e);
    }
    return;
  }
  try {
    const { error } = await supabase.from("kv_store").upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
  } catch (e) {
    console.error("supabase save failed", key, e);
  }
}

const money = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const genId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

// Loads an external <script> tag once and resolves when it's ready — used for
// the Google Identity Services button on sign-in.
function loadExternalScript(src, id) {
  return new Promise((resolve, reject) => {
    if (document.getElementById(id)) return resolve();
    const el = document.createElement("script");
    el.src = src;
    el.id = id;
    el.async = true;
    el.onload = () => resolve();
    el.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(el);
  });
}

// Decodes the payload of a Google Identity Services JWT credential purely
// client-side (base64url → JSON). This is fine for a no-backend demo store —
// it reads the name/email/picture Google already signed — but a production
// app with a real backend should also verify the token signature server-side.
function decodeGoogleCredential(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64).split("").map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0")).join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

// Delivery rule: home delivery only kicks in once the cart total reaches the
// store's configured minimum; smaller orders switch to "book & self pick-up".
const fulfillmentFor = (total, minimum) => (total >= (minimum ?? 999) ? "delivery" : "pickup");

// Products can have multiple photos (product.images: string[]). Older products
// saved before multi-photo support only have a single product.image string —
// this normalizes either shape into an array so display code has one path.
const productImages = (p) => {
  if (Array.isArray(p?.images) && p.images.length) return p.images;
  if (p?.image) return [p.image];
  return [];
};

// Average rating + count from a product's reviews array (added via the
// product page). Older products with no reviews field just show nothing.
const reviewStats = (p) => {
  const reviews = Array.isArray(p?.reviews) ? p.reviews : [];
  if (!reviews.length) return { avg: 0, count: 0 };
  const avg = reviews.reduce((s, r) => s + (r.rating || 0), 0) / reviews.length;
  return { avg, count: reviews.length };
};

/* ------------------------------------------------------------------ */
/* Transactional emails (Resend)                                      */
/* ------------------------------------------------------------------ */

// A clean, professional HTML shell shared by every notification email so
// they all look consistent and on-brand.
function buildEmailHtml({ storeName, heading, greeting, lines = [], footer }) {
  return `
  <div style="font-family:'Segoe UI',Helvetica,Arial,sans-serif;background:#F7F5EF;padding:32px 16px;">
    <div style="max-width:480px;margin:0 auto;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #ECE7DC;">
      <div style="background:#1A1F36;color:#ffffff;padding:20px 24px;font-size:18px;font-weight:700;">${storeName}</div>
      <div style="padding:28px 24px;">
        <h1 style="margin:0 0 14px;font-size:20px;color:#1A1F36;">${heading}</h1>
        <p style="margin:0 0 14px;color:#444444;font-size:14px;line-height:1.6;">${greeting}</p>
        ${lines.map((l) => `<p style="margin:0 0 12px;color:#444444;font-size:14px;line-height:1.6;">${l}</p>`).join("")}
      </div>
      <div style="padding:16px 24px;background:#F7F5EF;color:#8b8578;font-size:12px;">${footer}</div>
    </div>
  </div>`;
}

// Sends a transactional email through the shop's own built-in relay
// (server.js → POST /api/send-email), which sends via Resend's SMTP relay.
// Host/port/API key come from Admin → Website content → Integrations
// (falls back to a private RESEND_API_KEY env var on the server if set —
// see server.js). If nothing is configured yet, this quietly no-ops instead
// of blocking the surrounding action (approving a wholesale account,
// placing an order, etc. should never fail just because email isn't wired
// up yet).
async function sendTransactionalEmail({ content, to, subject, html }) {
  if (!content?.emailApiEndpoint || !to) return { skipped: true };
  try {
    const res = await fetch(content.emailApiEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to,
        subject,
        html,
        from: `${content.emailFromName || content.storeName || "Store"} <${content.emailFromAddress || "orders@yourshop.com"}>`,
        smtpHost: content.emailSmtpHost || "smtp.resend.com",
        smtpPort: content.emailSmtpPort || "465",
        apiKey: content.emailApiKey || "",
      }),
    });
    if (!res.ok) throw new Error("Email endpoint returned an error");
    return { sent: true };
  } catch (e) {
    console.warn("Email notification skipped:", e.message);
    return { error: e.message };
  }
}

const wholesaleApprovedEmail = (content, user) => buildEmailHtml({
  storeName: content.storeName,
  heading: "Your wholesale account is approved 🎉",
  greeting: `Hi ${user.name},`,
  lines: [
    "Good news — your wholesale account has been approved. You can now sign in and enjoy wholesale pricing across the store.",
    "If you have any questions, just reply to this email or reach out to us directly.",
  ],
  footer: `${content.storeName}${content.address ? ` · ${content.address}` : ""}`,
});

const orderConfirmedEmail = (content, order) => {
  const isPickup = order.fulfillment === "pickup";
  const itemsLine = order.items.map((it) => `${it.name} × ${it.qty}`).join(", ");
  const lines = [
    `<strong>Order ${order.id}</strong> — ${itemsLine} — ${money(order.total)}`,
  ];
  if (isPickup) {
    lines.push(`This order is booked for self pick-up${content.address ? ` from ${content.address}` : " from our store"}. We'll email you again once it's packed and ready.`);
    if (order.paymentStatus?.startsWith("pending")) lines.push("You chose to pay at the store — just settle the bill when you collect your order.");
  } else {
    lines.push("We've received your payment and your order is now being prepared for delivery.");
  }
  return buildEmailHtml({
    storeName: content.storeName,
    heading: isPickup ? "Your order is booked!" : "Payment received — order confirmed",
    greeting: `Hi ${order.customerName || "there"},`,
    lines,
    footer: `${content.storeName}${content.address ? ` · ${content.address}` : ""}`,
  });
};

const orderPackedEmail = (content, order) => {
  const isPickup = order.fulfillment === "pickup";
  return buildEmailHtml({
    storeName: content.storeName,
    heading: "Your order has been packed 📦",
    greeting: `Hi ${order.customerName || "there"},`,
    lines: [
      `<strong>Order ${order.id}</strong> is packed and ready to go.`,
      isPickup
        ? `Please visit us${content.address ? ` at ${content.address}` : ""} to collect it whenever it's convenient.`
        : "It will be handed over for delivery shortly — thanks for your patience!",
    ],
    footer: `${content.storeName}${content.address ? ` · ${content.address}` : ""}`,
  });
};

/* ------------------------------------------------------------------ */
/* Main App                                                            */
/* ------------------------------------------------------------------ */
export default function ShopApp() {
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [users, setUsers] = useState({}); // email -> user
  const [orders, setOrders] = useState([]);

  const [currentUser, setCurrentUser] = useState(null); // email of logged-in customer
  const [isAdmin, setIsAdmin] = useState(false);

  const [view, setView] = useState("home"); // home | category | orders | admin
  const [activeCategory, setActiveCategory] = useState(null);
  const [search, setSearch] = useState("");
  const [cart, setCart] = useState([]); // {productId, qty}
  const [showCart, setShowCart] = useState(false);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showCheckout, setShowCheckout] = useState(false);
  const [productModal, setProductModal] = useState(null);
  const [toast, setToast] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [adminLoginOpen, setAdminLoginOpen] = useState(false);
  const [adminSettings, setAdminSettings] = useState(DEFAULT_ADMIN_SETTINGS);

  useEffect(() => {
    (async () => {
      const catalog = await loadShared("shop-catalog", null);
      if (catalog) {
        setCategories(catalog.categories || DEFAULT_CATEGORIES);
        setProducts(catalog.products || DEFAULT_PRODUCTS);
        // merge so newly-added content fields (contact/social) show up even for shops
        // that already saved a catalog under the old shape. storeName is locked to
        // DEFAULT_CONTENT.storeName below, overriding any older saved value.
        setContent({ ...DEFAULT_CONTENT, ...(catalog.content || {}), storeName: DEFAULT_CONTENT.storeName });
      } else {
        await saveShared("shop-catalog", { categories: DEFAULT_CATEGORIES, products: DEFAULT_PRODUCTS, content: DEFAULT_CONTENT });
      }
      const u = await loadShared("shop-users", {});
      setUsers(u);
      const o = await loadShared("shop-orders", []);
      setOrders(o);
      const as = await loadShared("shop-admin", null);
      if (as) setAdminSettings({ ...DEFAULT_ADMIN_SETTINGS, ...as });
      else await saveShared("shop-admin", DEFAULT_ADMIN_SETTINGS);
      setLoading(false);

      // Hidden admin route: visiting yoursite.com/admin opens the admin login,
      // with no visible "Admin login" button anywhere on the storefront.
      const path = window.location.pathname.replace(/\/+$/, "");
      if (path === "/admin") setAdminLoginOpen(true);
    })();

    // keep the browser back/forward buttons working between storefront and admin
    const onPopState = () => {
      const path = window.location.pathname.replace(/\/+$/, "");
      if (path === "/admin") {
        setAdminLoginOpen(true);
      } else {
        setIsAdmin(false);
        setAdminLoginOpen(false);
      }
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Live sync: if another device/tab changes the shared data in Supabase
  // (e.g. the shop owner updates stock from their phone), reflect it here
  // immediately without needing a page refresh.
  useEffect(() => {
    if (!supabase) return;
    const channel = supabase
      .channel("kv_store_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "kv_store" }, (payload) => {
        const row = payload.new;
        if (!row) return;
        if (row.key === "shop-catalog") {
          const c = row.value || {};
          setCategories(c.categories || DEFAULT_CATEGORIES);
          setProducts(c.products || DEFAULT_PRODUCTS);
          setContent({ ...DEFAULT_CONTENT, ...(c.content || {}), storeName: DEFAULT_CONTENT.storeName });
        } else if (row.key === "shop-users") {
          setUsers(row.value || {});
        } else if (row.key === "shop-orders") {
          setOrders(row.value || []);
        } else if (row.key === "shop-admin") {
          setAdminSettings({ ...DEFAULT_ADMIN_SETTINGS, ...(row.value || {}) });
        }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // keep the browser tab title in sync with the store name set in admin
  useEffect(() => {
    if (content?.storeName) document.title = `${content.storeName} — Shop stationery, toys, books & more`;
  }, [content?.storeName]);

  const persistCatalog = useCallback(async (next) => {
    const payload = {
      categories: next.categories || categories,
      products: next.products || products,
      content: next.content || content,
    };
    if (next.categories) setCategories(next.categories);
    if (next.products) setProducts(next.products);
    if (next.content) setContent(next.content);
    await saveShared("shop-catalog", payload);
  }, [categories, products, content]);

  const persistUsers = useCallback(async (next) => {
    setUsers(next);
    await saveShared("shop-users", next);
  }, []);

  const persistOrders = useCallback(async (next) => {
    setOrders(next);
    await saveShared("shop-orders", next);
  }, []);

  const persistAdminSettings = useCallback(async (next) => {
    setAdminSettings(next);
    await saveShared("shop-admin", next);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const user = currentUser ? users[currentUser] : null;

  // Appends a review onto the product's `reviews` array and saves the whole
  // catalog — reviews live alongside the product itself rather than in a
  // separate table, so no extra Supabase table/migration is needed for them.
  const submitReview = useCallback(async (productId, { rating, comment }) => {
    const nextProducts = products.map((p) => {
      if (p.id !== productId) return p;
      const review = { rating, comment, userName: user?.name || "Customer", userEmail: currentUser, date: Date.now() };
      return { ...p, reviews: [...(Array.isArray(p.reviews) ? p.reviews : []), review] };
    });
    await persistCatalog({ products: nextProducts });
    // Keep the open product page in sync with the new review immediately.
    setProductModal((pm) => (pm && pm.id === productId ? nextProducts.find((p) => p.id === productId) : pm));
    showToast("Thanks for your review!");
  }, [products, user, currentUser, persistCatalog]);

  const isWholesale = user?.type === "wholesale" && user?.approved;

  const priceFor = (p) => (isWholesale ? p.wholesalePrice : p.retailPrice);

  /* ---------------- cart ---------------- */
  const addToCart = (productId, qty = 1) => {
    setCart((c) => {
      const existing = c.find((i) => i.productId === productId);
      if (existing) return c.map((i) => (i.productId === productId ? { ...i, qty: i.qty + qty } : i));
      return [...c, { productId, qty }];
    });
    showToast("Added to cart");
  };
  const updateQty = (productId, qty) => {
    setCart((c) => (qty <= 0 ? c.filter((i) => i.productId !== productId) : c.map((i) => (i.productId === productId ? { ...i, qty } : i))));
  };
  const removeFromCart = (productId) => setCart((c) => c.filter((i) => i.productId !== productId));

  const cartLines = cart.map((i) => {
    const p = products.find((pp) => pp.id === i.productId);
    return p ? { ...i, product: p, lineTotal: priceFor(p) * i.qty } : null;
  }).filter(Boolean);
  const cartTotal = cartLines.reduce((s, l) => s + l.lineTotal, 0);
  const cartCount = cart.reduce((s, i) => s + i.qty, 0);
  // Below the configured minimum, carts switch from home delivery to self pick-up.
  const fulfillment = fulfillmentFor(cartTotal, content.deliveryMinimum);

  /* ---------------- auth ---------------- */
  const signup = async ({ name, email, password, phone, type }) => {
    if (users[email]) return { error: "An account with this email already exists." };
    if (phone && Object.values(users).some((u) => u.phone === phone)) return { error: "An account with this mobile number already exists." };
    const newUser = { name, email, password, phone, type, approved: type === "retail" ? true : false, createdAt: Date.now() };
    const next = { ...users, [email]: newUser };
    await persistUsers(next);
    setCurrentUser(email);
    setShowAuth(false);
    showToast(type === "wholesale" ? "Account created — wholesale pricing pending admin approval." : "Account created. Welcome!");
    return {};
  };
  // Accepts either the account's email or its mobile number as the identifier.
  const login = ({ identifier, password }) => {
    const id = (identifier || "").trim();
    const byEmail = users[id];
    const byPhone = byEmail ? null : Object.values(users).find((u) => u.phone && u.phone === id);
    const u = byEmail || byPhone;
    if (!u || u.password !== password) return { error: "Invalid email/mobile number or password." };
    setCurrentUser(u.email);
    setShowAuth(false);
    showToast(`Welcome back, ${u.name}!`);
    return {};
  };
  // Google Identity Services hands us a signed credential; we decode the
  // name/email out of it. If the account already exists, log straight in.
  // If it's brand new, we don't create it yet — we ask the person to pick
  // retail or wholesale first (see completeGoogleSignup below).
  const loginWithGoogle = async (payload) => {
    if (!payload?.email) return { error: "Could not read your Google account. Please try again." };
    const existing = users[payload.email];
    if (existing) {
      setCurrentUser(payload.email);
      setShowAuth(false);
      showToast(`Welcome back, ${existing.name}!`);
      return {};
    }
    // New Google account — signal the AuthModal to show the retail/wholesale
    // picker before we actually create the account.
    return { needsAccountType: true };
  };
  // Called once the person has picked retail or wholesale after signing in
  // with a brand-new Google account.
  const completeGoogleSignup = async (payload, type) => {
    if (!payload?.email) return { error: "Could not read your Google account. Please try again." };
    if (users[payload.email]) {
      setCurrentUser(payload.email);
      setShowAuth(false);
      return {};
    }
    const newUser = {
      name: payload.name || payload.email.split("@")[0],
      email: payload.email,
      password: null,
      phone: "",
      type,
      approved: type === "retail" ? true : false,
      authProvider: "google",
      createdAt: Date.now(),
    };
    const next = { ...users, [payload.email]: newUser };
    await persistUsers(next);
    setCurrentUser(payload.email);
    setShowAuth(false);
    showToast(
      type === "wholesale"
        ? `Welcome, ${newUser.name}! Account created with Google — wholesale pricing pending admin approval.`
        : `Welcome, ${newUser.name}! Account created with Google.`
    );
    return {};
  };
  const logout = () => {
    setCurrentUser(null);
    setView("home");
    showToast("Logged out");
  };

  // Reset password (customer) — sends a 6-digit code by email via Resend
  // (through the shop's configured emailApiEndpoint), then verifies that
  // code before letting the customer set a new password. No email backend
  // configured yet? requestPasswordReset returns a clear error instead of
  // silently failing.
  const requestPasswordReset = async (email) => {
    const id = (email || "").trim();
    const u = users[id];
    if (!u) return { error: "No account found with that email address." };
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const next = { ...users, [id]: { ...u, resetCode: code, resetCodeExpires: Date.now() + 15 * 60 * 1000 } };
    await persistUsers(next);
    const html = buildEmailHtml({
      storeName: content.storeName,
      heading: "Reset your password",
      greeting: `Hi ${u.name},`,
      lines: [
        `Your password reset code is: <strong style="font-size:22px;letter-spacing:3px;">${code}</strong>`,
        "This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.",
      ],
      footer: `${content.storeName}${content.address ? " · " + content.address : ""}`,
    });
    const r = await sendTransactionalEmail({ content, to: id, subject: `Your ${content.storeName} password reset code`, html });
    if (r.skipped) return { error: "Email isn't set up for this store yet — please contact the shop directly to reset your password." };
    if (r.error) return { error: "Couldn't send the reset email right now. Please try again shortly." };
    return {};
  };
  const confirmPasswordReset = async ({ email, code, newPassword }) => {
    const id = (email || "").trim();
    const u = users[id];
    if (!u || !u.resetCode) return { error: "No reset was requested for this account — request a new code." };
    if (u.resetCode !== code.trim()) return { error: "Incorrect code." };
    if (Date.now() > (u.resetCodeExpires || 0)) return { error: "This code has expired — request a new one." };
    if (!newPassword || newPassword.length < 4) return { error: "Password must be at least 4 characters." };
    const next = { ...users, [id]: { ...u, password: newPassword, resetCode: null, resetCodeExpires: null } };
    await persistUsers(next);
    showToast("Password updated — please sign in.");
    return {};
  };

  // Reset password (admin) — same idea as the customer flow, but there's
  // only one admin account and no email field for it, so the code is sent
  // to the store's own contact email (Admin → Website content).
  const requestAdminPasswordReset = async () => {
    if (!content.contactEmail) return { error: "No contact email is set for this store (Admin → Website content) — can't send a reset code." };
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    await persistAdminSettings({ ...adminSettings, resetCode: code, resetCodeExpires: Date.now() + 15 * 60 * 1000 });
    const html = buildEmailHtml({
      storeName: content.storeName,
      heading: "Admin password reset",
      greeting: "Hi,",
      lines: [
        `Your admin password reset code is: <strong style="font-size:22px;letter-spacing:3px;">${code}</strong>`,
        "This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.",
      ],
      footer: `${content.storeName}${content.address ? " · " + content.address : ""}`,
    });
    const r = await sendTransactionalEmail({ content, to: content.contactEmail, subject: `${content.storeName} — admin password reset code`, html });
    if (r.skipped) return { error: "Email isn't set up for this store yet (Admin → Website content → Integrations)." };
    if (r.error) return { error: "Couldn't send the reset email right now. Please try again shortly." };
    return {};
  };
  const confirmAdminPasswordReset = async ({ code, newPassword }) => {
    if (!adminSettings.resetCode) return { error: "No reset was requested — request a new code." };
    if (adminSettings.resetCode !== code.trim()) return { error: "Incorrect code." };
    if (Date.now() > (adminSettings.resetCodeExpires || 0)) return { error: "This code has expired — request a new one." };
    if (!newPassword || newPassword.length < 4) return { error: "Password must be at least 4 characters." };
    await persistAdminSettings({ ...adminSettings, password: newPassword, resetCode: null, resetCodeExpires: null });
    return {};
  };

  /* ---------------- orders ---------------- */
  const placeOrder = async ({ address, paymentMethod, paymentStatus, fulfillment: orderFulfillment }) => {
    const order = {
      id: genId("ORD"),
      userEmail: currentUser,
      customerName: user?.name,
      customerType: isWholesale ? "wholesale" : "retail",
      items: cartLines.map((l) => ({ productId: l.product.id, name: l.product.name, qty: l.qty, price: priceFor(l.product), lineTotal: l.lineTotal })),
      total: cartTotal,
      fulfillment: orderFulfillment || fulfillment, // "delivery" | "pickup"
      address,
      paymentMethod,
      paymentStatus,
      status: orderFulfillment === "pickup" ? "booked" : "placed",
      createdAt: Date.now(),
    };
    // decrement stock
    const nextProducts = products.map((p) => {
      const line = cartLines.find((l) => l.product.id === p.id);
      return line ? { ...p, stock: Math.max(0, p.stock - line.qty) } : p;
    });
    await persistCatalog({ products: nextProducts });
    await persistOrders([order, ...orders]);
    setCart([]);
    setShowCheckout(false);
    setShowCart(false);
    setView("orders");
    showToast(order.fulfillment === "pickup" ? "Booked! Collect it from the store." : "Order placed successfully!");

    // Email the customer once they've paid or booked a pick-up — not for
    // "pay at store on delivery" orders that are still just placed & pending.
    if (order.paymentStatus?.startsWith("paid") || order.fulfillment === "pickup") {
      sendTransactionalEmail({
        content,
        to: order.userEmail,
        subject: order.fulfillment === "pickup" ? `Your order is booked — ${order.id}` : `Payment received — order ${order.id}`,
        html: orderConfirmedEmail(content, order),
      });
    }
  };

  const myOrders = orders.filter((o) => o.userEmail === currentUser).sort((a, b) => b.createdAt - a.createdAt);

  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory) list = list.filter((p) => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCategory, search]);

  if (loading) {
    return (
      <div style={{ minHeight: 500, display: "flex", alignItems: "center", justifyContent: "center", background: PAPER, fontFamily: "Inter, sans-serif" }}>
        <div style={{ color: INK, fontWeight: 600 }}>Loading shop…</div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <AdminPanel
        categories={categories} products={products} content={content} orders={orders} users={users} adminSettings={adminSettings}
        persistCatalog={persistCatalog} persistOrders={persistOrders} persistUsers={persistUsers} persistAdminSettings={persistAdminSettings}
        onExit={() => { setIsAdmin(false); window.history.pushState({}, "", "/"); }} showToast={showToast}
      />
    );
  }

  return (
    <div style={{ fontFamily: "Inter, sans-serif", background: PAPER, minHeight: "100vh", color: INK }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;600;700;800&family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .disp { font-family: 'Baloo 2', sans-serif; }
        .btn { transition: transform .12s ease, box-shadow .12s ease; }
        .btn:active { transform: scale(0.97); }
        .card-hover { transition: transform .18s ease, box-shadow .18s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 16px 30px rgba(26,31,54,0.12); }
        .card-hover .card-img { transition: transform .35s ease; }
        .card-hover:hover .card-img { transform: scale(1.06); }
        input, select, textarea { font-family: 'Inter', sans-serif; }
        ::-webkit-scrollbar { height: 8px; width: 8px; }
        ::-webkit-scrollbar-thumb { background: #ddd8cd; border-radius: 8px; }
        .bottom-nav { display: none; }
        @media (max-width: 720px) {
          .bottom-nav { display: flex; }
          .hide-mobile { display: none !important; }
          body { padding-bottom: 62px; }
        }
      `}</style>

      {/* Announcement bar — turns red when the admin has paused new orders */}
      <div style={{ background: adminSettings.storeOpen ? INK : "#B3261E", color: "#fff", textAlign: "center", fontSize: 13, padding: "6px 12px" }}>
        {adminSettings.storeOpen ? content.announcement : "🚫 We're temporarily not accepting new orders — please check back soon."}
      </div>

      {/* Header */}
      <header style={{ position: "sticky", top: 0, zIndex: 40, background: "rgba(250,249,246,0.92)", backdropFilter: "blur(8px)", borderBottom: "1px solid #ECE7DC" }}>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "12px 16px", display: "flex", alignItems: "center", gap: 12 }}>
          <button onClick={() => setMobileNav((v) => !v)} className="btn" style={{ display: "none", background: "none", border: "none" }} id="mnbtn">
            <Menu size={22} />
          </button>
          <div className="disp" onClick={() => { setView("home"); setActiveCategory(null); }} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontWeight: 800, fontSize: 22, color: INK }}>
            {content.logoUrl ? (
              <img src={content.logoUrl} alt={content.storeName} style={{ width: 34, height: 34, borderRadius: 9, objectFit: "cover" }} />
            ) : (
              <div style={{ width: 34, height: 34, borderRadius: 9, background: TEAL, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff" }}>
                <Store size={19} />
              </div>
            )}
            {content.storeName}
          </div>

          <div style={{ flex: 1, maxWidth: 420, marginLeft: 12, position: "relative", display: "none" }} className="search-desktop">
            <Search size={16} style={{ position: "absolute", left: 12, top: 11, color: "#9a9488" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 999, border: "1px solid #ECE7DC", outline: "none", fontSize: 14 }} />
          </div>

          <div style={{ flex: 1 }} />

          {user && (
            <span style={{ fontSize: 12, background: isWholesale ? "#EAF6E9" : "#F1EFE9", color: isWholesale ? "#2E7D32" : "#6b6558", padding: "4px 10px", borderRadius: 999, fontWeight: 600, display: window.innerWidth < 640 ? "none" : "inline-block" }}>
              {isWholesale ? "Wholesale" : user.type === "wholesale" ? "Wholesale (pending approval)" : "Retail"} · {user.name}
            </span>
          )}

          <button className="btn" onClick={() => setView(user ? "orders" : (setShowAuth(true), setAuthMode("login"), "home"))}
            style={{ background: "none", border: "1px solid #ECE7DC", borderRadius: 999, padding: "8px 12px", display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
            <User size={16} /> {user ? "My orders" : "Sign in"}
          </button>

          <button className="btn" onClick={() => setShowCart(true)} style={{ position: "relative", background: INK, color: "#fff", border: "none", borderRadius: 999, padding: "9px 14px", display: "flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
            <ShoppingCart size={17} />
            {cartCount > 0 && (
              <span style={{ position: "absolute", top: -6, right: -6, background: CORAL, color: "#fff", fontSize: 11, fontWeight: 700, borderRadius: 999, width: 19, height: 19, display: "flex", alignItems: "center", justifyContent: "center" }}>{cartCount}</span>
            )}
          </button>
        </div>
        <div style={{ maxWidth: 1180, margin: "0 auto", padding: "0 16px 10px" }}>
          <div style={{ position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: 12, top: 11, color: "#9a9488" }} />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…"
              style={{ width: "100%", padding: "9px 12px 9px 34px", borderRadius: 999, border: "1px solid #ECE7DC", outline: "none", fontSize: 14 }} />
          </div>
        </div>
      </header>

      {/* Category strip */}
      <nav style={{ maxWidth: 1180, margin: "0 auto", padding: "14px 16px 4px", display: "flex", gap: 10, overflowX: "auto" }}>
        <CategoryPill active={!activeCategory && view !== "orders"} color={INK} label="All" onClick={() => { setActiveCategory(null); setView("home"); }} Icon={LayoutGrid} />
        {categories.map((c) => {
          const Icon = ICONS[c.icon] || LayoutGrid;
          return <CategoryPill key={c.id} active={activeCategory === c.id} color={c.color} label={c.name} onClick={() => { setActiveCategory(c.id); setView("category"); }} Icon={Icon} />;
        })}
      </nav>

      {/* Main content */}
      <main style={{ maxWidth: 1180, margin: "0 auto", padding: "16px" }}>
        {view === "orders" ? (
          user ? (
            <OrdersView orders={myOrders} onBrowse={() => setView("home")} onLogout={logout} />
          ) : (
            <EmptyState title="Sign in to view your orders" subtitle="Create an account or log in to track your purchases." action={<button className="btn" onClick={() => { setShowAuth(true); setAuthMode("login"); }} style={primaryBtn}>Sign in</button>} />
          )
        ) : (
          <>
            {!activeCategory && !search && (
              <div className="disp" style={{
                background: `linear-gradient(120deg, ${TEAL} 0%, #0b6a6c 100%)`, borderRadius: 20, padding: "34px 28px", color: "#fff", marginBottom: 22,
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20, flexWrap: "wrap"
              }}>
                <div style={{ maxWidth: 560 }}>
                  <h1 style={{ fontSize: 30, margin: "0 0 8px", lineHeight: 1.15 }}>{content.bannerTitle}</h1>
                  <p style={{ fontFamily: "Inter", fontWeight: 400, fontSize: 15, opacity: 0.92, margin: 0 }}>{content.bannerSubtitle}</p>
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {categories.slice(0, 3).map((c) => {
                    const Icon = ICONS[c.icon] || LayoutGrid;
                    return (
                      <div key={c.id} onClick={() => { setActiveCategory(c.id); setView("category"); }} style={{ cursor: "pointer", background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: 14, textAlign: "center", width: 92 }}>
                        <Icon size={22} />
                        <div style={{ fontFamily: "Inter", fontSize: 12, marginTop: 6 }}>{c.name}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {!activeCategory && !search && content.banners?.length > 0 && (
              <BannerCarousel banners={content.banners} intervalSeconds={content.bannerIntervalSeconds} />
            )}

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h2 className="disp" style={{ fontSize: 20, margin: 0 }}>
                {search ? `Results for "${search}"` : activeCategory ? categories.find((c) => c.id === activeCategory)?.name : "All products"}
              </h2>
              <span style={{ fontSize: 13, color: "#8b8578" }}>{filteredProducts.length} items</span>
            </div>

            {user && user.type === "wholesale" && !user.approved && (
              <div style={{ background: "#FFF6E5", border: "1px solid #F4D9A0", color: "#8a5a00", borderRadius: 12, padding: "10px 14px", fontSize: 13, marginBottom: 16, display: "flex", gap: 8, alignItems: "center" }}>
                <AlertCircle size={16} /> Your wholesale account is awaiting admin approval — retail pricing applies until then.
              </div>
            )}

            {filteredProducts.length === 0 ? (
              <EmptyState title="No products found" subtitle="Try a different search or browse another category." />
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px,1fr))", gap: 20 }}>
                {filteredProducts.map((p) => (
                  <ProductCard key={p.id} product={p} categories={categories} price={priceFor(p)} isWholesale={isWholesale}
                    onAdd={() => addToCart(p.id, 1)} onOpen={() => setProductModal(p)} />
                ))}
              </div>
            )}
          </>
        )}
      </main>

      <footer style={{ borderTop: "1px solid #ECE7DC", marginTop: 40, padding: "28px 16px 24px", textAlign: "center", fontSize: 13, color: "#9a9488" }}>
        <div className="disp" style={{ fontSize: 16, fontWeight: 700, color: INK, marginBottom: 4 }}>{content.storeName}</div>
        <div>Stationery · Toys · Books · Notebooks · Gifts · Sports</div>
        {content.address && <div style={{ marginTop: 6 }}>{content.address}</div>}

        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 16, marginTop: 14 }}>
          {content.contactPhone && (
            <a href={`tel:${content.contactPhone.replace(/\s+/g, "")}`} style={{ color: "#6b6558", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", fontSize: 13 }}>
              <Phone size={14} /> {content.contactPhone}
            </a>
          )}
          {content.contactEmail && (
            <a href={`mailto:${content.contactEmail}`} style={{ color: "#6b6558", display: "flex", alignItems: "center", gap: 6, textDecoration: "none", fontSize: 13 }}>
              <Mail size={14} /> {content.contactEmail}
            </a>
          )}
        </div>

        {(content.instagramUrl || content.facebookUrl) && (
          <div style={{ display: "flex", justifyContent: "center", gap: 12, marginTop: 16 }}>
            {content.instagramUrl && (
              <a href={content.instagramUrl} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#F1EFE9", display: "flex", alignItems: "center", justifyContent: "center", color: INK }}>
                <Instagram size={16} />
              </a>
            )}
            {content.facebookUrl && (
              <a href={content.facebookUrl} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                style={{ width: 34, height: 34, borderRadius: "50%", background: "#F1EFE9", display: "flex", alignItems: "center", justifyContent: "center", color: INK }}>
                <Facebook size={16} />
              </a>
            )}
          </div>
        )}

        <div style={{ marginTop: 18, fontSize: 11, color: "#c2bcae" }}>© {new Date().getFullYear()} {content.storeName}. All rights reserved.</div>
      </footer>

      {/* Floating WhatsApp contact button — quick way for village customers to reach the shop */}
      {content.whatsappNumber && (
        <a href={`https://wa.me/${content.whatsappNumber.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
          aria-label="Chat on WhatsApp"
          style={{
            position: "fixed", bottom: 20, right: 20, zIndex: 60, width: 52, height: 52, borderRadius: "50%",
            background: "#25D366", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 8px 20px rgba(37,211,102,0.4)", textDecoration: "none",
          }}>
          <MessageCircle size={24} />
        </a>
      )}

      {/* Product page */}
      {productModal && (
        <ProductModal product={productModal} categories={categories} allProducts={products} price={priceFor(productModal)} isWholesale={isWholesale}
          currentUser={user} onSubmitReview={submitReview} onOpenProduct={(p) => setProductModal(p)}
          onClose={() => setProductModal(null)} onAdd={(qty) => { addToCart(productModal.id, qty); setProductModal(null); }} />
      )}

      {/* Cart drawer */}
      {showCart && (
        <CartDrawer lines={cartLines} total={cartTotal} fulfillment={fulfillment} deliveryMinimum={content.deliveryMinimum} onClose={() => setShowCart(false)} onUpdateQty={updateQty} onRemove={removeFromCart}
          onCheckout={() => {
            if (!adminSettings.storeOpen) { showToast("Store is currently closed for new orders"); return; }
            if (!user) { setShowCart(false); setShowAuth(true); setAuthMode("login"); showToast("Please sign in to check out"); } else { setShowCheckout(true); }
          }} />
      )}

      {/* Checkout modal */}
      {showCheckout && user && (
        <CheckoutModal user={user} total={cartTotal} lines={cartLines} fulfillment={fulfillment} content={content}
          onClose={() => setShowCheckout(false)} onPlace={placeOrder} />
      )}

      {/* Auth modal */}
      {showAuth && (
        <AuthModal mode={authMode} setMode={setAuthMode} onClose={() => setShowAuth(false)} onLogin={login} onSignup={signup}
          googleClientId={content.googleClientId} onGoogleLogin={loginWithGoogle} onGoogleSignupComplete={completeGoogleSignup}
          onRequestPasswordReset={requestPasswordReset} onConfirmPasswordReset={confirmPasswordReset} />
      )}

      {/* Admin login — only reachable by navigating to /admin directly, no link on the site */}
      {adminLoginOpen && (
        <AdminLoginModal
          adminPassword={adminSettings.password}
          onClose={() => { setAdminLoginOpen(false); window.history.pushState({}, "", "/"); }}
          onSuccess={() => { setAdminLoginOpen(false); setIsAdmin(true); window.history.pushState({}, "", "/admin"); }}
          onRequestReset={requestAdminPasswordReset} onConfirmReset={confirmAdminPasswordReset}
        />
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", bottom: 20, left: "50%", transform: "translateX(-50%)", background: INK, color: "#fff", padding: "10px 18px", borderRadius: 999, fontSize: 13, zIndex: 100, display: "flex", alignItems: "center", gap: 8 }}>
          <CheckCircle2 size={15} /> {toast}
        </div>
      )}

      {/* Mobile category picker sheet */}
      {mobileNav && (
        <Overlay onClose={() => setMobileNav(false)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: "18px 18px 0 0", width: "100%", maxWidth: 480, padding: 20, position: "fixed", bottom: 0, left: "50%", transform: "translateX(-50%)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <h3 className="disp" style={{ margin: 0, fontSize: 17 }}>Browse categories</h3>
              <button onClick={() => setMobileNav(false)} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              <div onClick={() => { setActiveCategory(null); setView("home"); setMobileNav(false); }} style={{ cursor: "pointer", textAlign: "center", padding: "14px 6px", borderRadius: 14, background: !activeCategory ? `${INK}10` : "#F7F5EF" }}>
                <LayoutGrid size={22} style={{ margin: "0 auto 6px" }} />
                <div style={{ fontSize: 12, fontWeight: 600 }}>All</div>
              </div>
              {categories.map((c) => {
                const Icon = ICONS[c.icon] || LayoutGrid;
                return (
                  <div key={c.id} onClick={() => { setActiveCategory(c.id); setView("category"); setMobileNav(false); }} style={{ cursor: "pointer", textAlign: "center", padding: "14px 6px", borderRadius: 14, background: activeCategory === c.id ? `${c.color}1A` : "#F7F5EF" }}>
                    <Icon size={22} color={c.color} style={{ margin: "0 auto 6px" }} />
                    <div style={{ fontSize: 12, fontWeight: 600 }}>{c.name}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </Overlay>
      )}

      {/* Mobile bottom nav — quick-access tab bar, hidden on desktop widths */}
      <nav className="bottom-nav" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 50, background: "#fff", borderTop: "1px solid #ECE7DC",
        padding: "6px 4px calc(6px + env(safe-area-inset-bottom))", alignItems: "stretch", justifyContent: "space-around",
        boxShadow: "0 -4px 14px rgba(26,31,54,0.06)",
      }}>
        <BottomNavItem Icon={Home} label="Home" active={view === "home" && !activeCategory && !search} onClick={() => { setView("home"); setActiveCategory(null); setSearch(""); }} />
        <BottomNavItem Icon={LayoutGrid} label="Categories" active={view === "category"} onClick={() => setMobileNav(true)} />
        <BottomNavItem Icon={ShoppingCart} label="Cart" active={showCart} badge={cartCount} onClick={() => setShowCart(true)} />
        <BottomNavItem Icon={User} label={user ? "Account" : "Sign in"} active={view === "orders"} onClick={() => setView(user ? "orders" : (setShowAuth(true), setAuthMode("login"), "home"))} />
      </nav>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reusable bits                                                       */
/* ------------------------------------------------------------------ */
const primaryBtn = { background: INK, color: "#fff", border: "none", borderRadius: 10, padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: 14 };

function BottomNavItem({ Icon, label, active, badge, onClick }) {
  return (
    <button onClick={onClick} className="btn" style={{
      flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3, background: "none", border: "none",
      cursor: "pointer", padding: "6px 2px", color: active ? TEAL : "#7a7568", position: "relative",
    }}>
      <span style={{ position: "relative" }}>
        <Icon size={21} strokeWidth={active ? 2.4 : 2} />
        {!!badge && (
          <span style={{ position: "absolute", top: -5, right: -8, background: CORAL, color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: 999, minWidth: 15, height: 15, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 2px" }}>{badge}</span>
        )}
      </span>
      <span style={{ fontSize: 10, fontWeight: active ? 700 : 500 }}>{label}</span>
    </button>
  );
}

function CategoryPill({ active, color, label, onClick, Icon }) {
  return (
    <button onClick={onClick} className="btn" style={{
      flexShrink: 0, display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 999, cursor: "pointer",
      border: active ? `1.5px solid ${color}` : "1px solid #ECE7DC", background: active ? `${color}1A` : "#fff", color: active ? color : INK, fontSize: 13, fontWeight: 600
    }}>
      <Icon size={15} /> {label}
    </button>
  );
}

function EmptyState({ title, subtitle, action }) {
  return (
    <div style={{ textAlign: "center", padding: "60px 20px", color: "#8b8578" }}>
      <div className="disp" style={{ fontSize: 18, color: INK, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 14, marginBottom: 16 }}>{subtitle}</div>
      {action}
    </div>
  );
}

// Auto-advancing carousel of promotional poster images set from Admin →
// Website content → Banners. Purely visual — no cropping/overlay applied,
// so posters show exactly as uploaded.
function BannerCarousel({ banners, intervalSeconds }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (banners.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % banners.length), Math.max(2, intervalSeconds || 5) * 1000);
    return () => clearInterval(t);
  }, [banners.length, intervalSeconds]);
  const b = banners[i];
  const Wrap = b.link ? "a" : "div";
  const wrapProps = b.link ? { href: b.link, target: "_blank", rel: "noopener noreferrer" } : {};
  return (
    <div style={{ position: "relative", borderRadius: 18, overflow: "hidden", marginBottom: 22, background: "#F1EFE9" }}>
      <Wrap {...wrapProps} style={{ display: "block" }}>
        <img src={b.imageUrl} alt={b.title || "Offer"} style={{ width: "100%", maxHeight: 260, objectFit: "cover", display: "block" }} />
      </Wrap>
      {banners.length > 1 && (
        <div style={{ position: "absolute", bottom: 10, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
          {banners.map((_, n) => (
            <span key={n} onClick={() => setI(n)} style={{ width: n === i ? 18 : 6, height: 6, borderRadius: 999, background: n === i ? "#fff" : "rgba(255,255,255,0.55)", cursor: "pointer", transition: "width .2s ease" }} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductCard({ product, categories, price, isWholesale, onAdd, onOpen }) {
  const cat = categories.find((c) => c.id === product.category);
  const outOfStock = product.stock <= 0;
  const images = productImages(product);
  const { avg, count } = reviewStats(product);
  return (
    <div className="card-hover" style={{ background: CARD, borderRadius: 18, overflow: "hidden", border: "1px solid #ECE7DC", display: "flex", flexDirection: "column", boxShadow: "0 2px 8px rgba(26,31,54,0.04)" }}>
      <div onClick={onOpen} style={{ cursor: "pointer", background: `${cat?.color || TEAL}22`, height: 210, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 72, position: "relative", overflow: "hidden" }}>
        {images[0] ? (
          <img className="card-img" src={images[0]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : product.emoji}
        {images.length > 1 && (
          <span style={{ position: "absolute", bottom: 10, right: 10, background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "3px 8px" }}>+{images.length - 1} more</span>
        )}
        {isWholesale && <span style={{ position: "absolute", top: 10, left: 10, background: "#2E7D32", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "3px 8px" }}>WHOLESALE</span>}
        {outOfStock && <span style={{ position: "absolute", top: 10, right: 10, background: "#B3261E", color: "#fff", fontSize: 10, fontWeight: 700, borderRadius: 999, padding: "3px 8px" }}>OUT OF STOCK</span>}
      </div>
      <div style={{ padding: "16px 18px 18px", display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: cat?.color, textTransform: "uppercase", letterSpacing: 0.4 }}>{cat?.name}</span>
        <div onClick={onOpen} style={{ cursor: "pointer", fontWeight: 600, fontSize: 16, lineHeight: 1.3 }}>{product.name}</div>
        {count > 0 && (
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 3, background: "#EAF6F0", color: "#2E7D32", fontSize: 12, fontWeight: 700, borderRadius: 6, padding: "2px 6px" }}>
              {avg.toFixed(1)} <Star size={11} fill="#2E7D32" strokeWidth={0} />
            </span>
            <span style={{ fontSize: 12, color: "#9a9488" }}>({count})</span>
          </div>
        )}
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginTop: "auto" }}>
          <span className="disp" style={{ fontWeight: 700, fontSize: 20 }}>{money(price)}</span>
          {isWholesale && <span style={{ fontSize: 13, color: "#b5afa0", textDecoration: "line-through" }}>{money(product.retailPrice)}</span>}
        </div>
        <button disabled={outOfStock} onClick={onAdd} className="btn" style={{
          marginTop: 8, background: outOfStock ? "#EDEAE2" : INK, color: outOfStock ? "#aaa" : "#fff", border: "none", borderRadius: 10,
          padding: "11px 12px", fontSize: 14, fontWeight: 600, cursor: outOfStock ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6
        }}>
          <ShoppingCart size={15} /> {outOfStock ? "Unavailable" : "Add to cart"}
        </button>
      </div>
    </div>
  );
}

function StarPicker({ value, onChange, size = 20 }) {
  return (
    <div style={{ display: "flex", gap: 3 }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} onClick={() => onChange(n)} style={{ cursor: "pointer", color: n <= value ? "#F4B942" : "#E2DED3", display: "flex" }}>
          <Star size={size} fill={n <= value ? "#F4B942" : "none"} strokeWidth={1.5} />
        </span>
      ))}
    </div>
  );
}

// Full product page — opened by clicking a product card. Covers the whole
// viewport (not a small popup) so there's room for a photo gallery, reviews,
// and a "more like this" section, similar to a marketplace app's PDP.
function ProductModal({ product, categories, allProducts, price, isWholesale, currentUser, onClose, onAdd, onOpenProduct, onSubmitReview }) {
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const cat = categories.find((c) => c.id === product.category);
  const images = productImages(product);
  const reviews = Array.isArray(product.reviews) ? product.reviews : [];
  const { avg, count } = reviewStats(product);
  const related = (allProducts || []).filter((p) => p.id !== product.id && p.category === product.category).slice(0, 4);

  useEffect(() => { setActiveImg(0); setQty(1); setMyRating(0); setMyComment(""); }, [product.id]);

  const submitReview = () => {
    if (!myRating) return;
    onSubmitReview(product.id, { rating: myRating, comment: myComment.trim() });
    setMyRating(0);
    setMyComment("");
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: PAPER, zIndex: 200, overflowY: "auto" }} onClick={(e) => e.stopPropagation()}>
      <div style={{ position: "sticky", top: 0, background: "rgba(250,249,246,0.92)", backdropFilter: "blur(6px)", zIndex: 5, padding: "12px 16px", display: "flex", alignItems: "center", gap: 12, borderBottom: "1px solid #ECE7DC" }}>
        <button onClick={onClose} style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 999, width: 34, height: 34, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <ChevronLeft size={18} />
        </button>
        <span style={{ fontWeight: 700, fontSize: 14, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{product.name}</span>
      </div>

      <div style={{ maxWidth: 920, margin: "0 auto", padding: "20px 16px 100px", display: "grid", gridTemplateColumns: "1fr", gap: 28 }}>
        <div>
          <div style={{ background: `${cat?.color || TEAL}22`, borderRadius: 18, height: 340, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 110, position: "relative", overflow: "hidden" }}>
            {images[activeImg] ? (
              <img src={images[activeImg]} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : product.emoji}
            {images.length > 1 && (
              <>
                <button onClick={() => setActiveImg((i) => (i - 1 + images.length) % images.length)} style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "#fff", border: "none", borderRadius: 999, width: 34, height: 34, cursor: "pointer" }}><ChevronLeft size={17} /></button>
                <button onClick={() => setActiveImg((i) => (i + 1) % images.length)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "#fff", border: "none", borderRadius: 999, width: 34, height: 34, cursor: "pointer" }}><ChevronRight size={17} /></button>
              </>
            )}
          </div>
          {images.length > 1 && (
            <div style={{ display: "flex", gap: 8, padding: "10px 2px 0", overflowX: "auto" }}>
              {images.map((img, i) => (
                <div key={i} onClick={() => setActiveImg(i)} style={{ width: 56, height: 56, borderRadius: 10, overflow: "hidden", flexShrink: 0, cursor: "pointer", border: i === activeImg ? `2px solid ${TEAL}` : "2px solid #ECE7DC" }}>
                  <img src={img} alt={`${product.name} ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <span style={{ fontSize: 11, fontWeight: 700, color: cat?.color, textTransform: "uppercase" }}>{cat?.name} · SKU {product.sku}</span>
          <h1 className="disp" style={{ margin: "6px 0 6px", fontSize: 26 }}>{product.name}</h1>
          {count > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
              <span style={{ display: "flex", alignItems: "center", gap: 3, background: "#EAF6F0", color: "#2E7D32", fontSize: 13, fontWeight: 700, borderRadius: 6, padding: "3px 7px" }}>
                {avg.toFixed(1)} <Star size={12} fill="#2E7D32" strokeWidth={0} />
              </span>
              <span style={{ fontSize: 13, color: "#9a9488" }}>{count} review{count > 1 ? "s" : ""}</span>
            </div>
          )}
          <p style={{ fontSize: 14, color: "#6b6558", margin: "0 0 16px", lineHeight: 1.6 }}>{product.desc}</p>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
            <span className="disp" style={{ fontSize: 28, fontWeight: 700 }}>{money(price)}</span>
            {isWholesale && <span style={{ fontSize: 14, color: "#b5afa0", textDecoration: "line-through" }}>{money(product.retailPrice)}</span>}
          </div>
          <div style={{ fontSize: 12, color: product.stock > 0 ? "#2E7D32" : "#B3261E", marginBottom: 18, fontWeight: 600 }}>
            {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ display: "flex", alignItems: "center", border: "1px solid #ECE7DC", borderRadius: 10 }}>
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} style={qtyBtn}><Minus size={14} /></button>
              <span style={{ width: 32, textAlign: "center", fontWeight: 600 }}>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))} style={qtyBtn}><Plus size={14} /></button>
            </div>
            <button disabled={product.stock <= 0} onClick={() => onAdd(qty)} className="btn" style={{ ...primaryBtn, flex: 1, opacity: product.stock <= 0 ? 0.5 : 1 }}>Add to cart</button>
          </div>
        </div>

        {/* Reviews */}
        <div style={{ borderTop: "1px solid #ECE7DC", paddingTop: 24 }}>
          <h3 className="disp" style={{ fontSize: 18, margin: "0 0 14px" }}>Reviews {count > 0 && `(${count})`}</h3>

          {currentUser ? (
            <div style={{ background: CARD, border: "1px solid #ECE7DC", borderRadius: 14, padding: 16, marginBottom: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Rate this product</div>
              <StarPicker value={myRating} onChange={setMyRating} />
              <textarea placeholder="Share your experience (optional)" value={myComment} onChange={(e) => setMyComment(e.target.value)}
                style={{ ...inputStyle, minHeight: 64, marginTop: 12, resize: "vertical" }} />
              <button onClick={submitReview} disabled={!myRating} className="btn" style={{ ...primaryBtn, opacity: myRating ? 1 : 0.5 }}>Submit review</button>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "#8b8578", marginBottom: 18 }}>Sign in to leave a review.</div>
          )}

          {reviews.length === 0 ? (
            <div style={{ fontSize: 13, color: "#9a9488" }}>No reviews yet — be the first!</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {[...reviews].reverse().map((r, i) => (
                <div key={i} style={{ borderBottom: "1px solid #F4F1EA", paddingBottom: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <div style={{ display: "flex" }}>
                      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={13} fill={n <= r.rating ? "#F4B942" : "none"} color={n <= r.rating ? "#F4B942" : "#E2DED3"} strokeWidth={1.5} />)}
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#6b6558" }}>{r.userName || "Customer"}</span>
                  </div>
                  {r.comment && <div style={{ fontSize: 13, color: "#4a4638" }}>{r.comment}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* More like this */}
        {related.length > 0 && (
          <div style={{ borderTop: "1px solid #ECE7DC", paddingTop: 24 }}>
            <h3 className="disp" style={{ fontSize: 18, margin: "0 0 14px" }}>More like this</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px,1fr))", gap: 14 }}>
              {related.map((p) => (
                <div key={p.id} onClick={() => onOpenProduct(p)} style={{ cursor: "pointer", background: CARD, border: "1px solid #ECE7DC", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ background: `${cat?.color || TEAL}18`, height: 110, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 40, overflow: "hidden" }}>
                    {productImages(p)[0] ? <img src={productImages(p)[0]} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : p.emoji}
                  </div>
                  <div style={{ padding: 10 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{money(isWholesale ? p.wholesalePrice : p.retailPrice)}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
const qtyBtn = { background: "none", border: "none", padding: "8px 10px", cursor: "pointer" };

function Overlay({ children, onClose, align = "center" }) {
  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "rgba(26,31,54,0.45)", zIndex: 80, display: "flex",
      alignItems: align === "right" ? "stretch" : "center", justifyContent: align === "right" ? "flex-end" : "center", padding: align === "right" ? 0 : 16
    }}>
      {children}
    </div>
  );
}

function CartDrawer({ lines, total, fulfillment, deliveryMinimum, onClose, onUpdateQty, onRemove, onCheckout }) {
  const remaining = Math.max(0, (deliveryMinimum ?? 999) - total);
  return (
    <Overlay onClose={onClose} align="right">
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", width: 380, maxWidth: "100vw", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: 16, borderBottom: "1px solid #ECE7DC", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 className="disp" style={{ margin: 0, fontSize: 18 }}>Your cart</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
          {lines.length === 0 ? (
            <EmptyState title="Cart is empty" subtitle="Add some products to get started." />
          ) : lines.map((l) => (
            <div key={l.productId} style={{ display: "flex", gap: 10, marginBottom: 16 }}>
              <div style={{ width: 48, height: 48, borderRadius: 10, background: "#F4F1EA", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{l.product.emoji}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{l.product.name}</div>
                <div style={{ fontSize: 12, color: "#8b8578", marginBottom: 6 }}>{money(l.product.retailPrice === l.lineTotal / l.qty ? l.lineTotal / l.qty : l.lineTotal / l.qty)} each</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", border: "1px solid #ECE7DC", borderRadius: 8 }}>
                    <button onClick={() => onUpdateQty(l.productId, l.qty - 1)} style={qtyBtn}><Minus size={12} /></button>
                    <span style={{ width: 24, textAlign: "center", fontSize: 13 }}>{l.qty}</span>
                    <button onClick={() => onUpdateQty(l.productId, l.qty + 1)} style={qtyBtn}><Plus size={12} /></button>
                  </div>
                  <button onClick={() => onRemove(l.productId)} style={{ background: "none", border: "none", cursor: "pointer", color: "#B3261E" }}><Trash2 size={14} /></button>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{money(l.lineTotal)}</div>
            </div>
          ))}
        </div>
        {lines.length > 0 && (
          <div style={{ padding: 16, borderTop: "1px solid #ECE7DC" }}>
            <div style={{
              display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, borderRadius: 10, padding: "8px 10px", marginBottom: 12,
              background: fulfillment === "delivery" ? "#EAF6E9" : "#FFF6E5", color: fulfillment === "delivery" ? "#2E7D32" : "#8a5a00",
            }}>
              {fulfillment === "delivery" ? <Truck size={14} /> : <Store size={14} />}
              {fulfillment === "delivery"
                ? "Eligible for home delivery"
                : `Add ${money(remaining)} more for home delivery, or book & pick up in-store`}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700, marginBottom: 12 }}>
              <span>Total</span><span>{money(total)}</span>
            </div>
            <button onClick={onCheckout} className="btn" style={{ ...primaryBtn, width: "100%" }}>
              {fulfillment === "delivery" ? "Checkout" : "Book & pick up"}
            </button>
          </div>
        )}
      </div>
    </Overlay>
  );
}

function CheckoutModal({ user, total, lines, fulfillment, content, onClose, onPlace }) {
  const isPickup = fulfillment === "pickup";
  const [address, setAddress] = useState({ line1: "", city: "", pincode: "", phone: user.phone || "" });
  // COD has been retired: customers pay online, or choose "Book & pay at
  // store" for either delivery or self pick-up orders.
  const [paymentMethod, setPaymentMethod] = useState("online");
  const [step, setStep] = useState("form"); // form | paying | done
  const [payError, setPayError] = useState("");
  const canSubmit = isPickup ? !!address.phone : (address.line1 && address.city && address.pincode && address.phone);

  const finish = async (paymentStatus) => {
    await onPlace({
      address: isPickup ? { phone: address.phone } : address,
      paymentMethod,
      paymentStatus,
      fulfillment,
    });
  };

  const handlePlace = async () => {
    setPayError("");
    if (paymentMethod === "store") {
      await finish("pending (pay at store)");
      return;
    }
    // "online" — button says "Pay online" but is actually powered by Cashfree.
    setStep("paying");
    try {
      const result = await startCashfreePayment({ content, amount: total, customer: { name: user.name, email: user.email, phone: address.phone } });
      // Cashfree's checkout() resolving means the customer completed the
      // widget; a production build should still confirm the final status
      // server-side via Cashfree's webhook before treating it as paid.
      await finish("paid");
    } catch (e) {
      setStep("form");
      setPayError(e.message || "Payment failed. Please try again.");
    }
  };

  return (
    <Overlay onClose={step === "paying" ? () => {} : onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, maxWidth: 460, width: "100%", padding: 22, maxHeight: "90vh", overflowY: "auto" }}>
        {step === "paying" ? (
          <div style={{ textAlign: "center", padding: "30px 10px" }}>
            <div style={{ width: 46, height: 46, border: `3px solid ${TEAL}`, borderTopColor: "transparent", borderRadius: "50%", margin: "0 auto 16px", animation: "spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <div className="disp" style={{ fontSize: 16 }}>Processing payment…</div>
            <div style={{ fontSize: 12, color: "#8b8578", marginTop: 6 }}>Redirecting to secure payment</div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h3 className="disp" style={{ margin: 0, fontSize: 18 }}>{isPickup ? "Book & pick up" : "Checkout"}</h3>
              <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
            </div>

            {isPickup ? (
              <div style={{ background: "#FFF6E5", color: "#8a5a00", borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 12, display: "flex", gap: 8 }}>
                <Store size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>
                  Orders under {money(content?.deliveryMinimum ?? 999)} aren't home-delivered. Book now and collect this order yourself from
                  {content?.address ? ` ${content.address}` : " the store"}.
                </span>
              </div>
            ) : (
              <div style={{ background: "#EAF6E9", color: "#2E7D32", borderRadius: 12, padding: 12, marginBottom: 14, fontSize: 12, display: "flex", gap: 8 }}>
                <Truck size={16} style={{ flexShrink: 0, marginTop: 1 }} />
                <span>This order qualifies for home delivery.</span>
              </div>
            )}

            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={14} /> {isPickup ? "Contact number" : "Delivery address"}
            </div>
            {!isPickup && (
              <>
                <input placeholder="Address line" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} style={inputStyle} />
                <div style={{ display: "flex", gap: 10 }}>
                  <input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                  <input placeholder="Pincode" value={address.pincode} onChange={(e) => setAddress({ ...address, pincode: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
                </div>
              </>
            )}
            <input placeholder="Phone number" value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} style={inputStyle} />

            <div style={{ fontSize: 13, fontWeight: 600, margin: "14px 0 8px", display: "flex", alignItems: "center", gap: 6 }}><CreditCard size={14} /> Payment method</div>
            <div style={{ display: "flex", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
              <PayOption active={paymentMethod === "online"} label="Pay online" sub="UPI / Card / Netbanking" onClick={() => setPaymentMethod("online")} />
              <PayOption active={paymentMethod === "store"} label="Book & pay at store" sub={isPickup ? "Pay when you collect" : "Pay when you receive"} onClick={() => setPaymentMethod("store")} />
            </div>
            {payError && <div style={{ color: "#B3261E", fontSize: 12, marginBottom: 10 }}>{payError}</div>}

            <div style={{ background: "#F7F5EF", borderRadius: 12, padding: 12, marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}><span>{lines.length} item(s)</span><span>{money(total)}</span></div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 15, fontWeight: 700 }}><span>Total</span><span>{money(total)}</span></div>
            </div>

            <button disabled={!canSubmit} onClick={handlePlace} className="btn" style={{ ...primaryBtn, width: "100%", opacity: canSubmit ? 1 : 0.5 }}>
              {paymentMethod === "store" ? "Book order" : `Pay ${money(total)}`}
            </button>
            <div style={{ fontSize: 11, color: "#b5afa0", marginTop: 10, textAlign: "center" }}>
              {paymentMethod === "online" && !content?.cashfreeOrderEndpoint
                ? "Online payment isn't fully configured yet — see Admin → Website content → Integrations."
                : "Payments are processed securely — no card details touch this app."}
            </div>
          </>
        )}
      </div>
    </Overlay>
  );
}

// Kicks off a real Cashfree payment behind the "Pay online" button. Cashfree's
// Checkout SDK needs a payment_session_id that can only be minted server-side
// (it requires the secret key), so this calls the shop's own backend/serverless
// endpoint to get one — it does not fabricate or simulate a successful payment.
// If that endpoint hasn't been configured yet in Admin → Website content, it
// throws a clear error instead of pretending the order was paid.
async function startCashfreePayment({ content, amount, customer }) {
  if (!content?.cashfreeOrderEndpoint) {
    throw new Error("Online payment isn't set up yet. Ask the store admin to configure Cashfree in Admin → Website content → Integrations.");
  }
  await loadExternalScript("https://sdk.cashfree.com/js/v3/cashfree.js", "cashfree-sdk");
  const res = await fetch(content.cashfreeOrderEndpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ amount, customer, appId: content.cashfreeAppId }),
  });
  if (!res.ok) throw new Error("Could not start the payment. Please try again.");
  const data = await res.json();
  if (!data?.payment_session_id) throw new Error("Payment gateway didn't return a session. Please try again.");
  const Cashfree = window.Cashfree;
  if (!Cashfree) throw new Error("Payment SDK failed to load. Check your connection and try again.");
  const cashfree = Cashfree({ mode: content.cashfreeMode === "production" ? "production" : "sandbox" });
  return cashfree.checkout({ paymentSessionId: data.payment_session_id, redirectTarget: "_modal" });
}

function PayOption({ active, label, sub, onClick }) {
  return (
    <div onClick={onClick} style={{ flex: 1, cursor: "pointer", border: active ? `1.5px solid ${TEAL}` : "1px solid #ECE7DC", background: active ? `${TEAL}14` : "#fff", borderRadius: 12, padding: "10px 12px" }}>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 11, color: "#8b8578" }}>{sub}</div>
    </div>
  );
}
const inputStyle = { width: "100%", padding: "10px 12px", borderRadius: 10, border: "1px solid #ECE7DC", outline: "none", fontSize: 13, marginBottom: 10 };

// A password <input> with a show/hide eye toggle — used everywhere a
// password is typed (customer login/signup, admin login, change password).
function PasswordField({ placeholder, value, onChange, style }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        placeholder={placeholder}
        type={visible ? "text" : "password"}
        value={value}
        onChange={onChange}
        style={{ ...inputStyle, paddingRight: 38, ...style }}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Hide password" : "Show password"}
        tabIndex={-1}
        style={{ position: "absolute", right: 10, top: 10, background: "none", border: "none", cursor: "pointer", color: "#8b8578", padding: 2, display: "flex" }}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function OrdersView({ orders, onBrowse, onLogout }) {
  const statusColor = { placed: "#7C6FE0", booked: "#F4B942", packed: "#0F8B8D", shipped: TEAL, delivered: "#2E7D32", cancelled: "#B3261E" };
  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="disp" style={{ margin: 0, fontSize: 20 }}>My orders</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onBrowse} className="btn" style={{ ...primaryBtn, background: "#fff", color: INK, border: "1px solid #ECE7DC" }}>Continue shopping</button>
          <button onClick={onLogout} className="btn" style={{ ...primaryBtn, background: "#fff", color: "#B3261E", border: "1px solid #ECE7DC" }}><LogOut size={13} style={{ marginRight: 4 }} />Log out</button>
        </div>
      </div>
      {orders.length === 0 ? <EmptyState title="No orders yet" subtitle="Your placed orders will show up here." /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {orders.map((o) => (
            <div key={o.id} style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{o.id}</div>
                  <div style={{ fontSize: 12, color: "#8b8578" }}>{new Date(o.createdAt).toLocaleString("en-IN")}</div>
                </div>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: o.fulfillment === "pickup" ? "#8a5a00" : TEAL, background: o.fulfillment === "pickup" ? "#FFF6E5" : `${TEAL}18`, padding: "4px 10px", borderRadius: 999, height: "fit-content", display: "flex", alignItems: "center", gap: 4 }}>
                    {o.fulfillment === "pickup" ? <Store size={11} /> : <Truck size={11} />} {o.fulfillment === "pickup" ? "Store pickup" : "Delivery"}
                  </span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: statusColor[o.status] || TEAL, background: `${statusColor[o.status] || TEAL}18`, padding: "4px 10px", borderRadius: 999, height: "fit-content" }}>{o.status}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, color: o.paymentStatus === "paid" || o.paymentStatus?.startsWith("paid") ? "#2E7D32" : "#8a5a00", background: o.paymentStatus === "paid" || o.paymentStatus?.startsWith("paid") ? "#EAF6E9" : "#FFF6E5", padding: "4px 10px", borderRadius: 999, height: "fit-content" }}>{o.paymentStatus}</span>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#6b6558", marginBottom: 8 }}>{o.items.map((it) => `${it.name} × ${it.qty}`).join(", ")}</div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 14 }}>
                <span>{o.fulfillment === "pickup" ? "Collect from store" : `${o.address?.line1}, ${o.address?.city} ${o.address?.pincode}`}</span>
                <span>{money(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AuthModal({ mode, setMode, onClose, onLogin, onSignup, googleClientId, onGoogleLogin, onGoogleSignupComplete, onRequestPasswordReset, onConfirmPasswordReset }) {
  const [form, setForm] = useState({ identifier: "", name: "", email: "", password: "", phone: "", type: "retail" });
  const [error, setError] = useState("");
  // "form" = normal login/signup, "resetRequest" = enter email to get a
  // code, "resetConfirm" = enter the code + new password, "googleType" =
  // brand-new Google account picking retail vs wholesale before it's created.
  const [step, setStep] = useState("form");
  const [googlePayload, setGooglePayload] = useState(null);
  const [googleType, setGoogleType] = useState("retail");
  const [googleBusy, setGoogleBusy] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetBusy, setResetBusy] = useState(false);
  const [resetInfo, setResetInfo] = useState("");

  const submit = async () => {
    setError("");
    if (mode === "login") {
      if (!form.identifier || !form.password) { setError("Please enter your email/mobile number and password."); return; }
      const r = onLogin({ identifier: form.identifier, password: form.password });
      if (r.error) setError(r.error);
    } else {
      if (!form.name || !form.email || !form.phone || !form.password) { setError("Please fill all required fields."); return; }
      const r = await onSignup(form);
      if (r.error) setError(r.error);
    }
  };

  const sendResetCode = async () => {
    setError(""); setResetInfo("");
    if (!resetEmail) { setError("Enter the email address on your account."); return; }
    setResetBusy(true);
    const r = await onRequestPasswordReset(resetEmail);
    setResetBusy(false);
    if (r.error) { setError(r.error); return; }
    setResetInfo(`A 6-digit code was sent to ${resetEmail}.`);
    setStep("resetConfirm");
  };
  const confirmReset = async () => {
    setError("");
    if (!resetCode || !resetPassword) { setError("Enter the code and a new password."); return; }
    setResetBusy(true);
    const r = await onConfirmPasswordReset({ email: resetEmail, code: resetCode, newPassword: resetPassword });
    setResetBusy(false);
    if (r.error) { setError(r.error); return; }
    setStep("form"); setMode("login"); setResetCode(""); setResetPassword(""); setResetEmail(""); setResetInfo("");
  };

  // Google Sign-In button (Google Identity Services). Only mounts once the
  // shop owner has pasted a real OAuth Client ID into Admin → Website content.
  const googleBtnRef = useRef(null);
  useEffect(() => {
    if (!googleClientId || step !== "form") return;
    let cancelled = false;
    loadExternalScript("https://accounts.google.com/gsi/client", "google-identity-services").then(() => {
      if (cancelled || !window.google || !googleBtnRef.current) return;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          const payload = decodeGoogleCredential(response.credential);
          const r = await onGoogleLogin?.(payload);
          if (r?.needsAccountType) {
            setGooglePayload(payload);
            setGoogleType("retail");
            setStep("googleType");
          } else if (r?.error) {
            setError(r.error);
          }
        },
      });
      window.google.accounts.id.renderButton(googleBtnRef.current, { theme: "outline", size: "large", width: 352, text: mode === "login" ? "signin_with" : "signup_with" });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [googleClientId, mode, step]);

  const confirmGoogleType = async () => {
    if (!googlePayload) return;
    setGoogleBusy(true);
    setError("");
    const r = await onGoogleSignupComplete?.(googlePayload, googleType);
    setGoogleBusy(false);
    if (r?.error) { setError(r.error); return; }
    setGooglePayload(null);
    setStep("form");
  };

  if (step === "googleType") {
    return (
      <Overlay onClose={onClose}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, maxWidth: 400, width: "100%", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <h3 className="disp" style={{ margin: 0, fontSize: 19 }}>One more step</h3>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
          </div>
          <div style={{ fontSize: 13, color: "#6b6558", marginBottom: 16 }}>
            {googlePayload?.name ? `Welcome, ${googlePayload.name}! ` : ""}How will you be shopping with us?
          </div>
          <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
            <PayOption active={googleType === "retail"} label="Retail" sub="Standard pricing" onClick={() => setGoogleType("retail")} />
            <PayOption active={googleType === "wholesale"} label="Wholesale" sub="Needs admin approval" onClick={() => setGoogleType("wholesale")} />
          </div>
          {error && <div style={{ color: "#B3261E", fontSize: 12, marginBottom: 10 }}>{error}</div>}
          <button onClick={confirmGoogleType} disabled={googleBusy} className="btn" style={{ ...primaryBtn, width: "100%", opacity: googleBusy ? 0.6 : 1 }}>
            {googleBusy ? "Setting up your account…" : "Continue"}
          </button>
        </div>
      </Overlay>
    );
  }

  if (step === "resetRequest" || step === "resetConfirm") {
    return (
      <Overlay onClose={onClose}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, maxWidth: 400, width: "100%", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 className="disp" style={{ margin: 0, fontSize: 19 }}>Reset password</h3>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
          </div>
          {step === "resetRequest" ? (
            <>
              <div style={{ fontSize: 13, color: "#6b6558", marginBottom: 12 }}>Enter your account email — we'll send a 6-digit code.</div>
              <input placeholder="Email" type="email" value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} style={inputStyle} />
              {error && <div style={{ color: "#B3261E", fontSize: 12, marginBottom: 10 }}>{error}</div>}
              <button onClick={sendResetCode} disabled={resetBusy} className="btn" style={{ ...primaryBtn, width: "100%", opacity: resetBusy ? 0.6 : 1 }}>{resetBusy ? "Sending…" : "Send code"}</button>
            </>
          ) : (
            <>
              {resetInfo && <div style={{ fontSize: 12, color: "#2E7D32", marginBottom: 12 }}>{resetInfo}</div>}
              <input placeholder="6-digit code" value={resetCode} onChange={(e) => setResetCode(e.target.value)} style={inputStyle} maxLength={6} />
              <PasswordField placeholder="New password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} />
              {error && <div style={{ color: "#B3261E", fontSize: 12, marginBottom: 10 }}>{error}</div>}
              <button onClick={confirmReset} disabled={resetBusy} className="btn" style={{ ...primaryBtn, width: "100%", opacity: resetBusy ? 0.6 : 1 }}>{resetBusy ? "Saving…" : "Reset password"}</button>
              <div style={{ textAlign: "center", fontSize: 12, marginTop: 12 }}>
                <span onClick={sendResetCode} style={{ color: TEAL, cursor: "pointer", fontWeight: 600 }}>Resend code</span>
              </div>
            </>
          )}
          <div style={{ textAlign: "center", fontSize: 13, marginTop: 14, color: "#8b8578" }}>
            <span onClick={() => { setStep("form"); setError(""); }} style={{ color: TEAL, cursor: "pointer", fontWeight: 600 }}>Back to sign in</span>
          </div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, maxWidth: 400, width: "100%", padding: 24 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 className="disp" style={{ margin: 0, fontSize: 19 }}>{mode === "login" ? "Sign in" : "Create account"}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer" }}><X size={20} /></button>
        </div>

        {googleClientId && (
          <>
            <div ref={googleBtnRef} style={{ display: "flex", justifyContent: "center", marginBottom: 14 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, margin: "4px 0 16px", color: "#b5afa0", fontSize: 12 }}>
              <div style={{ flex: 1, height: 1, background: "#ECE7DC" }} /> or {mode === "login" ? "sign in" : "sign up"} with email <div style={{ flex: 1, height: 1, background: "#ECE7DC" }} />
            </div>
          </>
        )}

        {mode === "signup" && <input placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />}
        {mode === "login" ? (
          <input placeholder="Email or mobile number" value={form.identifier} onChange={(e) => setForm({ ...form, identifier: e.target.value })} style={inputStyle} />
        ) : (
          <>
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={inputStyle} />
            <input placeholder="Mobile number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} style={inputStyle} />
          </>
        )}
        <PasswordField placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        {mode === "login" && (
          <div style={{ textAlign: "right", marginTop: -6, marginBottom: 12 }}>
            <span onClick={() => { setStep("resetRequest"); setResetEmail(form.identifier.includes("@") ? form.identifier : ""); setError(""); }} style={{ fontSize: 12, color: TEAL, cursor: "pointer", fontWeight: 600 }}>Forgot password?</span>
          </div>
        )}
        {mode === "signup" && (
          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            <PayOption active={form.type === "retail"} label="Retail" sub="Standard pricing" onClick={() => setForm({ ...form, type: "retail" })} />
            <PayOption active={form.type === "wholesale"} label="Wholesale" sub="Needs admin approval" onClick={() => setForm({ ...form, type: "wholesale" })} />
          </div>
        )}
        {error && <div style={{ color: "#B3261E", fontSize: 12, marginBottom: 10 }}>{error}</div>}
        <button onClick={submit} className="btn" style={{ ...primaryBtn, width: "100%" }}>{mode === "login" ? "Sign in" : "Create account"}</button>
        <div style={{ textAlign: "center", fontSize: 13, marginTop: 14, color: "#8b8578" }}>
          {mode === "login" ? (
            <>New here? <span onClick={() => setMode("signup")} style={{ color: TEAL, cursor: "pointer", fontWeight: 600 }}>Create an account</span></>
          ) : (
            <>Already have an account? <span onClick={() => setMode("login")} style={{ color: TEAL, cursor: "pointer", fontWeight: 600 }}>Sign in</span></>

          )}
        </div>
      </div>
    </Overlay>
  );
}

function AdminLoginModal({ adminPassword, onClose, onSuccess, onRequestReset, onConfirmReset }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState("login"); // login | resetRequest | resetConfirm
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState("");

  const sendCode = async () => {
    setError(""); setInfo(""); setBusy(true);
    const r = await onRequestReset();
    setBusy(false);
    if (r.error) { setError(r.error); return; }
    setInfo("A 6-digit code was sent to the store's contact email.");
    setStep("resetConfirm");
  };
  const doReset = async () => {
    setError(""); setBusy(true);
    const r = await onConfirmReset({ code, newPassword: newPw });
    setBusy(false);
    if (r.error) { setError(r.error); return; }
    setStep("login"); setCode(""); setNewPw(""); setInfo(""); setPw("");
  };

  if (step === "resetRequest" || step === "resetConfirm") {
    return (
      <Overlay onClose={onClose}>
        <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, maxWidth: 360, width: "100%", padding: 24 }}>
          <h3 className="disp" style={{ marginTop: 0 }}>Reset admin password</h3>
          {step === "resetRequest" ? (
            <>
              <div style={{ fontSize: 13, color: "#6b6558", marginBottom: 14 }}>We'll email a 6-digit code to this store's contact email address.</div>
              {error && <div style={{ color: "#B3261E", fontSize: 12, marginBottom: 8 }}>{error}</div>}
              <button onClick={sendCode} disabled={busy} className="btn" style={{ ...primaryBtn, width: "100%", opacity: busy ? 0.6 : 1 }}>{busy ? "Sending…" : "Send code"}</button>
            </>
          ) : (
            <>
              {info && <div style={{ fontSize: 12, color: "#2E7D32", marginBottom: 10 }}>{info}</div>}
              <input placeholder="6-digit code" value={code} onChange={(e) => setCode(e.target.value)} style={inputStyle} maxLength={6} />
              <PasswordField placeholder="New admin password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
              {error && <div style={{ color: "#B3261E", fontSize: 12, marginBottom: 8 }}>{error}</div>}
              <button onClick={doReset} disabled={busy} className="btn" style={{ ...primaryBtn, width: "100%", opacity: busy ? 0.6 : 1 }}>{busy ? "Saving…" : "Reset password"}</button>
            </>
          )}
          <div style={{ textAlign: "center", fontSize: 13, marginTop: 14, color: "#8b8578" }}>
            <span onClick={() => { setStep("login"); setError(""); }} style={{ color: TEAL, cursor: "pointer", fontWeight: 600 }}>Back to login</span>
          </div>
        </div>
      </Overlay>
    );
  }

  return (
    <Overlay onClose={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 18, maxWidth: 360, width: "100%", padding: 24 }}>
        <h3 className="disp" style={{ marginTop: 0 }}>Admin login</h3>
        <PasswordField placeholder="Admin password" value={pw} onChange={(e) => setPw(e.target.value)} />
        {error && <div style={{ color: "#B3261E", fontSize: 12, marginBottom: 8 }}>{error}</div>}
        <button className="btn" style={{ ...primaryBtn, width: "100%" }} onClick={() => (pw === adminPassword ? onSuccess() : setError("Incorrect password."))}>Enter dashboard</button>
        <div style={{ textAlign: "center", fontSize: 12, marginTop: 12 }}>
          <span onClick={() => { setStep("resetRequest"); setError(""); }} style={{ color: TEAL, cursor: "pointer", fontWeight: 600 }}>Forgot password?</span>
        </div>
      </div>
    </Overlay>
  );
}

/* ------------------------------------------------------------------ */
/* Admin Panel                                                         */
/* ------------------------------------------------------------------ */
function AdminPanel({ categories, products, content, orders, users, adminSettings, persistCatalog, persistOrders, persistUsers, persistAdminSettings, onExit, showToast }) {
  const [tab, setTab] = useState("overview");
  const tabs = [
    { id: "overview", label: "Overview", icon: LayoutGrid },
    { id: "products", label: "Products & stock", icon: Package },
    { id: "orders", label: "Orders & payments", icon: ClipboardList },
    { id: "categories", label: "Categories", icon: Layers },
    { id: "customers", label: "Customers", icon: Building2 },
    { id: "content", label: "Website content", icon: Settings },
    { id: "banners", label: "Banners", icon: ImageIcon },
    { id: "settings", label: "Settings", icon: KeyRound },
  ];

  return (
    <div style={{ fontFamily: "Inter, sans-serif", minHeight: "100vh", background: PAPER, color: INK, display: "flex" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Baloo+2:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap'); .disp{font-family:'Baloo 2',sans-serif;} .btn{transition:transform .1s;} .btn:active{transform:scale(.97);}`}</style>
      <aside style={{ width: 220, background: INK, color: "#fff", padding: 18, display: "flex", flexDirection: "column", gap: 4, flexShrink: 0 }}>
        <div className="disp" style={{ fontSize: 18, marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}><Store size={18} /> Admin</div>
        {!adminSettings?.storeOpen && (
          <div style={{ background: "rgba(179,38,30,0.25)", color: "#fff", fontSize: 11, fontWeight: 700, padding: "6px 10px", borderRadius: 8, marginBottom: 10 }}>
            Store is closed to new orders
          </div>
        )}
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} className="btn" style={{
            display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, border: "none", cursor: "pointer", textAlign: "left",
            background: tab === t.id ? "rgba(255,255,255,0.15)" : "transparent", color: "#fff", fontSize: 13, fontWeight: 600
          }}>
            <t.icon size={16} /> {t.label}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <button onClick={onExit} className="btn" style={{ display: "flex", alignItems: "center", gap: 8, background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: 10, padding: "10px 12px", cursor: "pointer", fontSize: 13 }}>
          <Home size={15} /> Back to storefront
        </button>
      </aside>
      <main style={{ flex: 1, padding: 24, overflowY: "auto", maxHeight: "100vh" }}>
        {tab === "overview" && <AdminOverview products={products} orders={orders} users={users} />}
        {tab === "products" && <AdminProducts products={products} categories={categories} persistCatalog={persistCatalog} showToast={showToast} />}
        {tab === "orders" && <AdminOrders orders={orders} content={content} persistOrders={persistOrders} showToast={showToast} />}
        {tab === "categories" && <AdminCategories categories={categories} products={products} persistCatalog={persistCatalog} showToast={showToast} />}
        {tab === "customers" && <AdminCustomers users={users} content={content} persistUsers={persistUsers} showToast={showToast} />}
        {tab === "content" && <AdminContent content={content} persistCatalog={persistCatalog} showToast={showToast} />}
        {tab === "banners" && <AdminBanners content={content} persistCatalog={persistCatalog} showToast={showToast} />}
        {tab === "settings" && <AdminSettings adminSettings={adminSettings} persistAdminSettings={persistAdminSettings} showToast={showToast} />}
      </main>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 14, padding: 16, flex: 1, minWidth: 150 }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: `${color}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <Icon size={17} color={color} />
      </div>
      <div className="disp" style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 12, color: "#8b8578" }}>{label}</div>
    </div>
  );
}

function AdminOverview({ products, orders, users }) {
  const revenue = orders.filter((o) => o.paymentStatus === "paid" || o.paymentStatus?.startsWith("paid")).reduce((s, o) => s + o.total, 0);
  const lowStock = products.filter((p) => p.stock <= 10);
  const pendingWholesale = Object.values(users).filter((u) => u.type === "wholesale" && !u.approved);

  // Last 7 days revenue trend (paid orders only), oldest first.
  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() - i);
      days.push(d);
    }
    return days.map((d) => {
      const next = new Date(d); next.setDate(d.getDate() + 1);
      const total = orders
        .filter((o) => (o.paymentStatus === "paid" || o.paymentStatus?.startsWith("paid")) && o.createdAt >= d.getTime() && o.createdAt < next.getTime())
        .reduce((s, o) => s + o.total, 0);
      return { label: d.toLocaleDateString("en-IN", { weekday: "short" }), total };
    });
  }, [orders]);
  const maxDay = Math.max(1, ...last7.map((d) => d.total));

  // Top 5 best-selling products by quantity across all orders.
  const topProducts = useMemo(() => {
    const qtyByProduct = {};
    orders.forEach((o) => o.items.forEach((it) => { qtyByProduct[it.name] = (qtyByProduct[it.name] || 0) + it.qty; }));
    return Object.entries(qtyByProduct).sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [orders]);

  return (
    <div>
      <h2 className="disp" style={{ marginTop: 0 }}>Overview</h2>
      <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 24 }}>
        <StatCard label="Total revenue (paid)" value={money(revenue)} icon={CreditCard} color={TEAL} />
        <StatCard label="Total orders" value={orders.length} icon={ClipboardList} color={CORAL} />
        <StatCard label="Products" value={products.length} icon={Package} color="#7C6FE0" />
        <StatCard label="Registered customers" value={Object.keys(users).length} icon={Building2} color="#4CAF6D" />
      </div>

      <div style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 14, padding: 16, marginBottom: 16 }}>
        <div style={{ fontWeight: 700, marginBottom: 14, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
          <TrendingUp size={15} color={TEAL} /> Revenue — last 7 days
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 110 }}>
          {last7.map((d, i) => (
            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div title={money(d.total)} style={{
                width: "100%", maxWidth: 34, height: Math.max(3, (d.total / maxDay) * 80), background: d.total > 0 ? TEAL : "#ECE7DC",
                borderRadius: 6, transition: "height .2s",
              }} />
              <div style={{ fontSize: 10, color: "#8b8578" }}>{d.label}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 14, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>Low stock alerts</div>
          {lowStock.length === 0 ? <div style={{ fontSize: 13, color: "#8b8578" }}>All stock levels healthy.</div> :
            lowStock.map((p) => <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #F4F1EA" }}><span>{p.name}</span><span style={{ color: "#B3261E", fontWeight: 700 }}>{p.stock} left</span></div>)}
        </div>
        <div style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 14, padding: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14 }}>Pending wholesale approvals</div>
          {pendingWholesale.length === 0 ? <div style={{ fontSize: 13, color: "#8b8578" }}>No pending requests.</div> :
            pendingWholesale.map((u) => <div key={u.email} style={{ fontSize: 13, padding: "6px 0", borderBottom: "1px solid #F4F1EA" }}>{u.name} — {u.email}</div>)}
        </div>
        <div style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 14, padding: 16, gridColumn: "1 / -1" }}>
          <div style={{ fontWeight: 700, marginBottom: 10, fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
            <Award size={15} color="#F4B942" /> Top-selling products
          </div>
          {topProducts.length === 0 ? <div style={{ fontSize: 13, color: "#8b8578" }}>No sales yet.</div> :
            topProducts.map(([name, qty], i) => (
              <div key={name} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "6px 0", borderBottom: "1px solid #F4F1EA" }}>
                <span>{i + 1}. {name}</span><span style={{ fontWeight: 700 }}>{qty} sold</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function AdminProducts({ products, categories, persistCatalog, showToast }) {
  const [editing, setEditing] = useState(null); // product object or "new"
  const blank = { id: "", name: "", category: categories[0]?.id || "", sku: "", emoji: "🛍️", images: [], retailPrice: 0, wholesalePrice: 0, stock: 0, desc: "" };
  const [form, setForm] = useState(blank);

  useEffect(() => {
    const next = editing === "new" ? blank : editing || blank;
    // Normalize older single-image products into the images[] array on open.
    setForm({ ...next, images: productImages(next) });
  }, [editing]);

  const MAX_PRODUCT_PHOTOS = 6;
  const onImageFiles = (e) => {
    const files = Array.from(e.target.files || []);
    e.target.value = ""; // allow re-selecting the same file(s) later
    if (!files.length) return;
    const room = MAX_PRODUCT_PHOTOS - (form.images?.length || 0);
    if (room <= 0) { showToast(`You can add up to ${MAX_PRODUCT_PHOTOS} photos per product`); return; }
    const toAdd = files.slice(0, room);
    if (files.length > toAdd.length) showToast(`Only added ${toAdd.length} — max ${MAX_PRODUCT_PHOTOS} photos per product`);
    toAdd.forEach((file) => {
      if (file.size > 1.5 * 1024 * 1024) { showToast(`${file.name} is over 1.5MB — skipped`); return; }
      const reader = new FileReader();
      reader.onload = () => setForm((f) => ({ ...f, images: [...(f.images || []), reader.result] }));
      reader.readAsDataURL(file);
    });
  };
  const removeImageAt = (idx) => setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  const moveImage = (idx, dir) => setForm((f) => {
    const imgs = [...f.images];
    const j = idx + dir;
    if (j < 0 || j >= imgs.length) return f;
    [imgs[idx], imgs[j]] = [imgs[j], imgs[idx]];
    return { ...f, images: imgs };
  });

  const save = async () => {
    if (!form.name || !form.category) { showToast("Name and category are required"); return; }
    // Drop the legacy single `image` field once images[] is in use, so the
    // record has one clear source of truth going forward.
    const { image, ...rest } = form;
    const cleanForm = { ...rest, images: rest.images || [] };
    let next;
    if (editing === "new") {
      next = [...products, { ...cleanForm, id: genId("p"), retailPrice: Number(cleanForm.retailPrice), wholesalePrice: Number(cleanForm.wholesalePrice), stock: Number(cleanForm.stock) }];
    } else {
      next = products.map((p) => (p.id === form.id ? { ...cleanForm, retailPrice: Number(cleanForm.retailPrice), wholesalePrice: Number(cleanForm.wholesalePrice), stock: Number(cleanForm.stock) } : p));
    }
    await persistCatalog({ products: next });
    setEditing(null);
    showToast("Product saved");
  };
  const remove = async (id) => {
    await persistCatalog({ products: products.filter((p) => p.id !== id) });
    showToast("Product deleted");
  };
  const adjustStock = async (id, delta) => {
    const next = products.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p));
    await persistCatalog({ products: next });
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="disp" style={{ margin: 0 }}>Products & stock</h2>
        <button className="btn" onClick={() => setEditing("new")} style={primaryBtn}><Plus size={14} style={{ marginRight: 4 }} />Add product</button>
      </div>
      <div style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 14, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead><tr style={{ background: "#F7F5EF", textAlign: "left" }}>
            {["", "Product", "Category", "Retail", "Wholesale", "Stock", ""].map((h) => <th key={h} style={{ padding: "10px 12px", fontWeight: 700 }}>{h}</th>)}
          </tr></thead>
          <tbody>
            {products.map((p) => {
              const cat = categories.find((c) => c.id === p.category);
              const thumb = productImages(p)[0];
              return (
                <tr key={p.id} style={{ borderTop: "1px solid #F4F1EA" }}>
                  <td style={{ padding: "10px 12px" }}>
                    {thumb ? (
                      <img src={thumb} alt={p.name} style={{ width: 32, height: 32, borderRadius: 8, objectFit: "cover" }} />
                    ) : <span style={{ fontSize: 20 }}>{p.emoji}</span>}
                  </td>
                  <td style={{ padding: "10px 12px" }}><div style={{ fontWeight: 600 }}>{p.name}</div><div style={{ color: "#8b8578", fontSize: 11 }}>{p.sku}</div></td>
                  <td style={{ padding: "10px 12px" }}><span style={{ background: `${cat?.color}22`, color: cat?.color, padding: "2px 8px", borderRadius: 999, fontSize: 11, fontWeight: 700 }}>{cat?.name}</span></td>
                  <td style={{ padding: "10px 12px" }}>{money(p.retailPrice)}</td>
                  <td style={{ padding: "10px 12px" }}>{money(p.wholesalePrice)}</td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <button onClick={() => adjustStock(p.id, -1)} style={qtyBtn}><Minus size={12} /></button>
                      <span style={{ fontWeight: 700, color: p.stock <= 10 ? "#B3261E" : INK }}>{p.stock}</span>
                      <button onClick={() => adjustStock(p.id, 1)} style={qtyBtn}><Plus size={12} /></button>
                    </div>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => setEditing(p)} style={iconBtn}><Edit3 size={14} /></button>
                      <button onClick={() => remove(p.id)} style={{ ...iconBtn, color: "#B3261E" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {editing && (
        <Overlay onClose={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 22, width: 440, maxHeight: "85vh", overflowY: "auto" }}>
            <h3 className="disp" style={{ marginTop: 0 }}>{editing === "new" ? "Add product" : "Edit product"}</h3>

            <label style={labelStyle}>Product photos {form.images?.length ? `(${form.images.length}/${MAX_PRODUCT_PHOTOS})` : ""}</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 10 }}>
              {(form.images || []).map((img, i) => (
                <div key={i} style={{ position: "relative", width: 64, height: 64, flexShrink: 0 }}>
                  <img src={img} alt={`Photo ${i + 1}`} style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12, border: i === 0 ? `2px solid ${TEAL}` : "1px solid #ECE7DC" }} />
                  {i === 0 && <span style={{ position: "absolute", bottom: -6, left: 2, background: TEAL, color: "#fff", fontSize: 8, fontWeight: 700, borderRadius: 999, padding: "1px 5px" }}>MAIN</span>}
                  <button onClick={() => removeImageAt(i)} title="Remove" style={{ position: "absolute", top: -6, right: -6, background: "#B3261E", color: "#fff", border: "2px solid #fff", borderRadius: 999, width: 20, height: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><X size={11} /></button>
                  {i > 0 && <button onClick={() => moveImage(i, -1)} title="Move earlier" style={{ position: "absolute", bottom: -6, right: -6, background: "#fff", border: "1px solid #ECE7DC", borderRadius: 999, width: 18, height: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><ChevronLeft size={11} /></button>}
                </div>
              ))}
              {(form.images?.length || 0) < MAX_PRODUCT_PHOTOS && (
                <label className="btn" style={{ width: 64, height: 64, borderRadius: 12, border: "1px dashed #C9C2B2", background: "#F4F1EA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", gap: 2, flexShrink: 0 }}>
                  <Upload size={16} />
                  <span style={{ fontSize: 9, fontWeight: 600, color: "#8b8578" }}>Add</span>
                  <input type="file" accept="image/*" multiple onChange={onImageFiles} style={{ display: "none" }} />
                </label>
              )}
              {!form.images?.length && (
                <div style={{ width: 64, height: 64, borderRadius: 12, background: "#F4F1EA", border: "1px solid #ECE7DC", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>
                  {form.emoji || "🛍️"}
                </div>
              )}
            </div>
            <div style={{ fontSize: 11, color: "#8b8578", marginTop: -4, marginBottom: 10 }}>First photo is the main image shown on the storefront. Up to {MAX_PRODUCT_PHOTOS} photos, 1.5MB each.</div>

            <input placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <input placeholder="Emoji icon — used if no photo is uploaded (e.g. 🖊️)" value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })} style={inputStyle} />
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={inputStyle}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} style={inputStyle} />
            <div style={{ display: "flex", gap: 10 }}>
              <input placeholder="Retail price" type="number" value={form.retailPrice} onChange={(e) => setForm({ ...form, retailPrice: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
              <input placeholder="Wholesale price" type="number" value={form.wholesalePrice} onChange={(e) => setForm({ ...form, wholesalePrice: e.target.value })} style={{ ...inputStyle, flex: 1 }} />
            </div>
            <input placeholder="Stock quantity" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={inputStyle} />
            <textarea placeholder="Description" value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} style={{ ...inputStyle, minHeight: 70 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditing(null)} style={{ ...primaryBtn, flex: 1, background: "#fff", color: INK, border: "1px solid #ECE7DC" }}>Cancel</button>
              <button onClick={save} style={{ ...primaryBtn, flex: 1 }}><Save size={13} style={{ marginRight: 4 }} />Save</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}
const iconBtn = { background: "#F7F5EF", border: "none", borderRadius: 8, padding: 7, cursor: "pointer", color: INK, display: "flex" };

function AdminOrders({ orders, content, persistOrders, showToast }) {
  const setStatus = async (id, status) => {
    const order = orders.find((o) => o.id === id);
    await persistOrders(orders.map((o) => (o.id === id ? { ...o, status } : o)));
    showToast("Order status updated");
    if (status === "packed" && order) {
      sendTransactionalEmail({ content, to: order.userEmail, subject: `Your order has been packed — ${order.id}`, html: orderPackedEmail(content, order) });
    }
  };
  const setPayment = async (id, paymentStatus) => { await persistOrders(orders.map((o) => (o.id === id ? { ...o, paymentStatus } : o))); showToast("Payment status updated"); };

  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [fulfillmentFilter, setFulfillmentFilter] = useState("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== "all" && o.status !== statusFilter) return false;
      if (fulfillmentFilter !== "all" && o.fulfillment !== fulfillmentFilter) return false;
      if (paymentFilter !== "all" && !(o.paymentStatus || "").startsWith(paymentFilter)) return false;
      if (!q) return true;
      return o.id.toLowerCase().includes(q) || (o.customerName || "").toLowerCase().includes(q) || (o.userEmail || "").toLowerCase().includes(q);
    });
  }, [orders, query, statusFilter, paymentFilter, fulfillmentFilter]);

  const exportCsv = () => {
    const header = ["Order ID", "Date", "Customer", "Email", "Type", "Fulfillment", "Items", "Total", "Payment method", "Payment status", "Status"];
    const rows = filtered.map((o) => [
      o.id, new Date(o.createdAt).toLocaleString("en-IN"), o.customerName, o.userEmail, o.customerType, o.fulfillment,
      o.items.map((it) => `${it.name} x${it.qty}`).join("; "), o.total, o.paymentMethod, o.paymentStatus, o.status,
    ]);
    const csv = [header, ...rows].map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast(`Exported ${filtered.length} order(s) to CSV`);
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10 }}>
        <h2 className="disp" style={{ margin: 0 }}>Orders & payments</h2>
        <button onClick={exportCsv} disabled={filtered.length === 0} className="btn" style={{ ...iconBtn, width: "auto", padding: "8px 14px", fontSize: 12, fontWeight: 600, display: "flex", alignItems: "center", gap: 6, opacity: filtered.length === 0 ? 0.5 : 1 }}>
          <Download size={13} /> Export CSV
        </button>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "16px 0" }}>
        <div style={{ position: "relative", flex: "1 1 220px" }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: 10, color: "#b5afa0" }} />
          <input placeholder="Search order ID, customer, email" value={query} onChange={(e) => setQuery(e.target.value)} style={{ ...inputStyle, marginBottom: 0, paddingLeft: 30 }} />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ padding: "9px 10px", borderRadius: 10, border: "1px solid #ECE7DC" }}>
          <option value="all">All statuses</option>
          {["placed", "booked", "packed", "shipped", "delivered", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} style={{ padding: "9px 10px", borderRadius: 10, border: "1px solid #ECE7DC" }}>
          <option value="all">All payments</option>
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
          <option value="refunded">Refunded</option>
          <option value="failed">Failed</option>
        </select>
        <select value={fulfillmentFilter} onChange={(e) => setFulfillmentFilter(e.target.value)} style={{ padding: "9px 10px", borderRadius: 10, border: "1px solid #ECE7DC" }}>
          <option value="all">Delivery + pickup</option>
          <option value="delivery">Delivery only</option>
          <option value="pickup">Pickup only</option>
        </select>
      </div>

      <div style={{ fontSize: 12, color: "#8b8578", marginBottom: 10 }}>{filtered.length} of {orders.length} order(s)</div>

      {filtered.length === 0 ? <div style={{ color: "#8b8578", fontSize: 13 }}>No orders match.</div> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {filtered.map((o) => (
            <div key={o.id} style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{o.id} <span style={{ fontSize: 11, fontWeight: 600, color: "#8b8578" }}>({o.customerType})</span></div>
                  <div style={{ fontSize: 12, color: "#8b8578" }}>{o.customerName} · {o.userEmail}</div>
                  <div style={{ fontSize: 12, color: "#8b8578" }}>{new Date(o.createdAt).toLocaleString("en-IN")}</div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: o.fulfillment === "pickup" ? "#8a5a00" : TEAL, marginTop: 4, display: "flex", alignItems: "center", gap: 4 }}>
                    {o.fulfillment === "pickup" ? <Store size={11} /> : <Truck size={11} />} {o.fulfillment === "pickup" ? "Store pickup" : "Home delivery"}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="disp" style={{ fontWeight: 700, fontSize: 16 }}>{money(o.total)}</div>
                  <div style={{ fontSize: 11, color: "#8b8578" }}>{o.paymentMethod}</div>
                </div>
              </div>
              <div style={{ fontSize: 13, color: "#6b6558", margin: "8px 0" }}>{o.items.map((it) => `${it.name} × ${it.qty}`).join(", ")}</div>
              {o.fulfillment === "pickup" ? (
                <div style={{ fontSize: 12, color: "#8b8578" }}>Contact: {o.address?.phone}</div>
              ) : (
                <div style={{ fontSize: 12, color: "#8b8578" }}>{o.address?.line1}, {o.address?.city} {o.address?.pincode} · {o.address?.phone}</div>
              )}
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap", marginTop: 8 }}>
                <label style={{ fontSize: 12 }}>Status:&nbsp;
                  <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} style={{ padding: "5px 8px", borderRadius: 8, border: "1px solid #ECE7DC" }}>
                    {["placed", "booked", "packed", "shipped", "delivered", "cancelled"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
                <label style={{ fontSize: 12 }}>Payment:&nbsp;
                  <select value={o.paymentStatus} onChange={(e) => setPayment(o.id, e.target.value)} style={{ padding: "5px 8px", borderRadius: 8, border: "1px solid #ECE7DC" }}>
                    {["paid", "pending (pay at store)", "refunded", "failed"].map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AdminSettings({ adminSettings, persistAdminSettings, showToast }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [pwError, setPwError] = useState("");

  const changePassword = async () => {
    setPwError("");
    if (current !== adminSettings.password) { setPwError("Current password is incorrect."); return; }
    if (next.length < 4) { setPwError("New password must be at least 4 characters."); return; }
    if (next !== confirm) { setPwError("New password and confirmation don't match."); return; }
    await persistAdminSettings({ ...adminSettings, password: next });
    setCurrent(""); setNext(""); setConfirm("");
    showToast("Admin password updated");
  };

  const toggleStore = async () => {
    await persistAdminSettings({ ...adminSettings, storeOpen: !adminSettings.storeOpen });
    showToast(adminSettings.storeOpen ? "Store closed to new orders" : "Store reopened for orders");
  };

  return (
    <div style={{ maxWidth: 460 }}>
      <h2 className="disp" style={{ marginTop: 0 }}>Settings</h2>

      <div style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 14, padding: 18, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <Store size={15} /> Store status
        </div>
        <div style={{ fontSize: 12, color: "#8b8578", marginBottom: 12 }}>
          Pause new orders instantly — customers can still browse but checkout is disabled and the announcement bar turns red.
        </div>
        <button onClick={toggleStore} className="btn" style={{
          display: "flex", alignItems: "center", gap: 8, border: "none", borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontWeight: 600, fontSize: 13,
          background: adminSettings.storeOpen ? "#EAF6E9" : "#FDEBE9", color: adminSettings.storeOpen ? "#2E7D32" : "#B3261E",
        }}>
          {adminSettings.storeOpen ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
          {adminSettings.storeOpen ? "Store is open — accepting orders" : "Store is closed — click to reopen"}
        </button>
      </div>

      <div style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 14, padding: 18, marginBottom: 18 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
          <KeyRound size={15} /> Change admin password
        </div>
        <div style={{ fontSize: 12, color: "#8b8578", marginBottom: 12 }}>This is the password used at yoursite.com/admin.</div>
        <PasswordField placeholder="Current password" value={current} onChange={(e) => setCurrent(e.target.value)} />
        <PasswordField placeholder="New password" value={next} onChange={(e) => setNext(e.target.value)} />
        <PasswordField placeholder="Confirm new password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        {pwError && <div style={{ color: "#B3261E", fontSize: 12, marginBottom: 10 }}>{pwError}</div>}
        <button onClick={changePassword} className="btn" style={primaryBtn}>Update password</button>
      </div>

      <SupabaseConnectionCard />
    </div>
  );
}

// Lets a shop owner see/set the Supabase connection from the admin panel
// itself, without needing to touch Render's environment variables — handy
// for local testing or if env vars aren't accessible to them. This is a
// per-browser override (localStorage); it does not change what other
// visitors' browsers connect to, and Render's real env vars remain the
// source of truth for production.
function SupabaseConnectionCard() {
  const existing = getSupabaseOverride();
  const [url, setUrl] = useState(existing?.url || "");
  const [anonKey, setAnonKey] = useState(existing?.anonKey || "");
  const [saved, setSaved] = useState(false);

  const save = () => {
    if (!url || !anonKey) return;
    setSupabaseOverride(url.trim(), anonKey.trim());
    setSaved(true);
  };
  const clear = () => {
    clearSupabaseOverride();
    setUrl(""); setAnonKey(""); setSaved(false);
  };

  return (
    <div style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 14, padding: 18, marginTop: 18 }}>
      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4, display: "flex", alignItems: "center", gap: 6 }}>
        <PlugZap size={15} /> Supabase connection
      </div>
      <div style={{ fontSize: 12, color: "#8b8578", marginBottom: 10 }}>
        Currently using: <strong>{supabaseConfigSource}</strong>
        {supabaseUrlInUse && <> — <code style={{ fontSize: 11 }}>{supabaseUrlInUse}</code></>}
        {supabase ? (
          <span style={{ color: "#2E7D32", fontWeight: 600 }}> · Connected</span>
        ) : (
          <span style={{ color: "#B3261E", fontWeight: 600 }}> · Not connected</span>
        )}
      </div>
      <div style={{ fontSize: 11, color: "#8b8578", marginBottom: 12 }}>
        For production, set <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> as environment variables in Render (see README). The fields below are a per-browser override — useful for local testing — and take effect after a page reload.
      </div>
      <label style={labelStyle}>Project URL</label>
      <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://your-project-ref.supabase.co" style={inputStyle} />
      <label style={labelStyle}>Anon public key</label>
      <input value={anonKey} onChange={(e) => setAnonKey(e.target.value)} placeholder="eyJhbGciOi..." style={inputStyle} />
      <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
        <button onClick={save} className="btn" style={primaryBtn} disabled={!url || !anonKey}>Save override</button>
        {existing && <button onClick={clear} className="btn" style={{ ...iconBtn, width: "auto", padding: "8px 12px", fontSize: 12, color: "#B3261E" }}>Clear override</button>}
        {saved && <button onClick={() => window.location.reload()} className="btn" style={{ ...iconBtn, width: "auto", padding: "8px 12px", fontSize: 12, display: "flex", alignItems: "center", gap: 6 }}><Download size={13} style={{ transform: "rotate(90deg)" }} /> Reload to apply</button>}
      </div>
    </div>
  );
}

function AdminCategories({ categories, products, persistCatalog, showToast }) {
  const [editing, setEditing] = useState(null);
  const blank = { id: "", name: "", icon: "Pencil", color: "#0F8B8D" };
  const [form, setForm] = useState(blank);
  useEffect(() => { setForm(editing === "new" ? blank : editing || blank); }, [editing]);

  const save = async () => {
    if (!form.name) { showToast("Name is required"); return; }
    let next;
    if (editing === "new") next = [...categories, { ...form, id: form.name.toLowerCase().replace(/\s+/g, "-") + "-" + genId("c") }];
    else next = categories.map((c) => (c.id === form.id ? form : c));
    await persistCatalog({ categories: next });
    setEditing(null);
    showToast("Category saved");
  };
  const remove = async (id) => {
    if (products.some((p) => p.category === id)) { showToast("Move or delete products in this category first"); return; }
    await persistCatalog({ categories: categories.filter((c) => c.id !== id) });
    showToast("Category deleted");
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 className="disp" style={{ margin: 0 }}>Categories</h2>
        <button className="btn" onClick={() => setEditing("new")} style={primaryBtn}><Plus size={14} style={{ marginRight: 4 }} />Add category</button>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))", gap: 14 }}>
        {categories.map((c) => {
          const Icon = ICONS[c.icon] || LayoutGrid;
          const count = products.filter((p) => p.category === c.id).length;
          return (
            <div key={c.id} style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 14, padding: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: `${c.color}22`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
                <Icon size={17} color={c.color} />
              </div>
              <div style={{ fontWeight: 700, fontSize: 14 }}>{c.name}</div>
              <div style={{ fontSize: 12, color: "#8b8578", marginBottom: 10 }}>{count} products</div>
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={() => setEditing(c)} style={iconBtn}><Edit3 size={14} /></button>
                <button onClick={() => remove(c.id)} style={{ ...iconBtn, color: "#B3261E" }}><Trash2 size={14} /></button>
              </div>
            </div>
          );
        })}
      </div>
      {editing && (
        <Overlay onClose={() => setEditing(null)}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: "#fff", borderRadius: 16, padding: 22, width: 380 }}>
            <h3 className="disp" style={{ marginTop: 0 }}>{editing === "new" ? "Add category" : "Edit category"}</h3>
            <input placeholder="Category name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={inputStyle} />
            <select value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} style={inputStyle}>
              {Object.keys(ICONS).map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} style={{ ...inputStyle, height: 42, padding: 4 }} />
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => setEditing(null)} style={{ ...primaryBtn, flex: 1, background: "#fff", color: INK, border: "1px solid #ECE7DC" }}>Cancel</button>
              <button onClick={save} style={{ ...primaryBtn, flex: 1 }}>Save</button>
            </div>
          </div>
        </Overlay>
      )}
    </div>
  );
}

function AdminCustomers({ users, content, persistUsers, showToast }) {
  const list = Object.values(users);
  const toggleApproval = async (email) => {
    const wasApproved = users[email].approved;
    const next = { ...users, [email]: { ...users[email], approved: !wasApproved } };
    await persistUsers(next);
    showToast("Customer updated");
    if (!wasApproved) {
      sendTransactionalEmail({
        content,
        to: email,
        subject: `Your wholesale account is approved — ${content?.storeName || "our store"}`,
        html: wholesaleApprovedEmail(content, next[email]),
      });
    }
  };
  return (
    <div>
      <h2 className="disp" style={{ marginTop: 0 }}>Customers</h2>
      {list.length === 0 ? <div style={{ color: "#8b8578", fontSize: 13 }}>No customers yet.</div> : (
        <div style={{ background: "#fff", border: "1px solid #ECE7DC", borderRadius: 14, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead><tr style={{ background: "#F7F5EF", textAlign: "left" }}>{["Name", "Email", "Phone", "Type", "Status", ""].map((h) => <th key={h} style={{ padding: "10px 12px" }}>{h}</th>)}</tr></thead>
            <tbody>
              {list.map((u) => (
                <tr key={u.email} style={{ borderTop: "1px solid #F4F1EA" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: "10px 12px" }}>{u.email}</td>
                  <td style={{ padding: "10px 12px" }}>{u.phone}</td>
                  <td style={{ padding: "10px 12px", textTransform: "capitalize" }}>{u.type}</td>
                  <td style={{ padding: "10px 12px" }}>
                    {u.type === "wholesale" ? (
                      <span style={{ color: u.approved ? "#2E7D32" : "#8a5a00", fontWeight: 700 }}>{u.approved ? "Approved" : "Pending"}</span>
                    ) : <span style={{ color: "#8b8578" }}>—</span>}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {u.type === "wholesale" && (
                      <button onClick={() => toggleApproval(u.email)} className="btn" style={{ ...iconBtn, width: "auto", padding: "6px 10px", fontSize: 12, fontWeight: 600 }}>
                        {u.approved ? "Revoke" : "Approve"}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AdminContent({ content, persistCatalog, showToast }) {
  const [form, setForm] = useState({ ...DEFAULT_CONTENT_SHAPE, ...content });
  const [saved, setSaved] = useState(false);
  const save = async () => {
    // storeName is locked to "Bhagwati Book Center" — always save the fixed
    // value even if something upstream tried to change it.
    await persistCatalog({ content: { ...form, storeName: DEFAULT_CONTENT.storeName } });
    showToast("Website content updated");
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const onLogoFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 1024 * 1024) { showToast("Please choose a logo image under 1MB"); return; }
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, logoUrl: reader.result }));
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: 520 }}>
      <h2 className="disp" style={{ marginTop: 0 }}>Website content</h2>

      <div style={{ fontSize: 12, fontWeight: 800, color: "#8b8578", textTransform: "uppercase", letterSpacing: 0.4, margin: "18px 0 8px" }}>Branding</div>
      <label style={labelStyle}>Store logo</label>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: "#F4F1EA", border: "1px solid #ECE7DC", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0 }}>
          {form.logoUrl ? <img src={form.logoUrl} alt="Logo preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <Store size={22} color="#b5afa0" />}
        </div>
        <label className="btn" style={{ ...iconBtn, width: "auto", padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
          <Upload size={13} /> Upload logo
          <input type="file" accept="image/*" onChange={onLogoFile} style={{ display: "none" }} />
        </label>
        {form.logoUrl && (
          <button onClick={() => setForm({ ...form, logoUrl: "" })} className="btn" style={{ ...iconBtn, width: "auto", padding: "8px 12px", fontSize: 12, color: "#B3261E" }}>Remove</button>
        )}
      </div>
      <label style={labelStyle}>Store name</label>
      <input value={DEFAULT_CONTENT.storeName} disabled style={{ ...inputStyle, background: "#F4F1EA", color: "#8b8578", cursor: "not-allowed" }} />
      <div style={{ fontSize: 11, color: "#8b8578", marginTop: -6, marginBottom: 10 }}>
        The store name is set permanently to "{DEFAULT_CONTENT.storeName}" and can't be changed here.
      </div>
      <label style={labelStyle}>Homepage banner title</label>
      <input value={form.bannerTitle} onChange={set("bannerTitle")} style={inputStyle} />
      <label style={labelStyle}>Homepage banner subtitle</label>
      <textarea value={form.bannerSubtitle} onChange={set("bannerSubtitle")} style={{ ...inputStyle, minHeight: 60 }} />
      <label style={labelStyle}>Announcement bar text</label>
      <input value={form.announcement} onChange={set("announcement")} style={inputStyle} />

      <div style={{ fontSize: 12, fontWeight: 800, color: "#8b8578", textTransform: "uppercase", letterSpacing: 0.4, margin: "22px 0 8px" }}>Delivery</div>
      <label style={labelStyle}>Minimum order amount for home delivery (₹)</label>
      <input type="number" min={0} value={form.deliveryMinimum} onChange={(e) => setForm({ ...form, deliveryMinimum: Number(e.target.value) || 0 })} style={inputStyle} placeholder="999" />
      <div style={{ fontSize: 11, color: "#8b8578", marginTop: -6, marginBottom: 10 }}>
        Carts at or above this amount get home delivery. Smaller carts switch to "Book & pick up in-store" instead of cash on delivery.
      </div>

      <div style={{ fontSize: 12, fontWeight: 800, color: "#8b8578", textTransform: "uppercase", letterSpacing: 0.4, margin: "22px 0 8px" }}>Contact details</div>
      <label style={labelStyle}>Shop address</label>
      <input value={form.address} onChange={set("address")} style={inputStyle} placeholder="Shop address shown in footer" />
      <label style={labelStyle}>Contact phone number</label>
      <input value={form.contactPhone} onChange={set("contactPhone")} style={inputStyle} placeholder="+91 98765 43210" />
      <label style={labelStyle}>Contact email</label>
      <input value={form.contactEmail} onChange={set("contactEmail")} style={inputStyle} placeholder="hello@yourshop.com" />
      <label style={labelStyle}>WhatsApp number (for the floating chat button)</label>
      <input value={form.whatsappNumber} onChange={set("whatsappNumber")} style={inputStyle} placeholder="919876543210 (with country code, no + or spaces)" />

      <div style={{ fontSize: 12, fontWeight: 800, color: "#8b8578", textTransform: "uppercase", letterSpacing: 0.4, margin: "22px 0 8px" }}>Social media</div>
      <label style={labelStyle}>Instagram URL</label>
      <input value={form.instagramUrl} onChange={set("instagramUrl")} style={inputStyle} placeholder="https://instagram.com/yourshop" />
      <label style={labelStyle}>Facebook URL</label>
      <input value={form.facebookUrl} onChange={set("facebookUrl")} style={inputStyle} placeholder="https://facebook.com/yourshop" />

      <div style={{ fontSize: 12, fontWeight: 800, color: "#8b8578", textTransform: "uppercase", letterSpacing: 0.4, margin: "22px 0 8px", display: "flex", alignItems: "center", gap: 6 }}>
        <PlugZap size={13} /> Integrations
      </div>

      <label style={labelStyle}>Google Sign-In — OAuth Client ID</label>
      <input value={form.googleClientId} onChange={set("googleClientId")} style={inputStyle} placeholder="xxxxxxxx.apps.googleusercontent.com" />
      <div style={{ fontSize: 11, color: "#8b8578", marginTop: -6, marginBottom: 10 }}>
        Create one at console.cloud.google.com → APIs & Services → Credentials. Leave blank to hide the Google button on sign-in.
      </div>

      <label style={labelStyle}>Cashfree App ID (public Client ID)</label>
      <input value={form.cashfreeAppId} onChange={set("cashfreeAppId")} style={inputStyle} placeholder="Your Cashfree App ID" />
      <label style={labelStyle}>Cashfree mode</label>
      <select value={form.cashfreeMode} onChange={set("cashfreeMode")} style={inputStyle}>
        <option value="sandbox">Sandbox (testing)</option>
        <option value="production">Production (live payments)</option>
      </select>
      <label style={labelStyle}>Cashfree order-creation endpoint (your backend)</label>
      <input value={form.cashfreeOrderEndpoint} onChange={set("cashfreeOrderEndpoint")} style={inputStyle} placeholder="https://your-backend.example.com/create-cashfree-order" />
      <div style={{ fontSize: 11, color: "#8b8578", marginTop: -6, marginBottom: 10 }}>
        This powers the customer-facing "Pay online" button (Cashfree's name never shows to shoppers). Its secret key
        can't safely live in this frontend, so real payments need a small backend/serverless endpoint that creates the
        order with Cashfree and returns a <code>payment_session_id</code>. Until this is set, "Pay online" will show a
        clear message instead of faking a successful payment.
      </div>

      <div style={{ fontSize: 12, fontWeight: 700, color: "#8b8578", margin: "18px 0 8px" }}>Email (Resend SMTP)</div>
      <label style={labelStyle}>SMTP host</label>
      <input value={form.emailSmtpHost} onChange={set("emailSmtpHost")} style={inputStyle} placeholder="smtp.resend.com" />
      <label style={labelStyle}>SMTP port</label>
      <input value={form.emailSmtpPort} onChange={set("emailSmtpPort")} style={{ ...inputStyle, maxWidth: 140 }} placeholder="465" />
      <label style={labelStyle}>API key</label>
      <PasswordField placeholder="re_xxxxxxxxxxxxxxxxxxxxxxxx" value={form.emailApiKey} onChange={(e) => setForm({ ...form, emailApiKey: e.target.value })} />
      <label style={labelStyle}>From name</label>
      <input value={form.emailFromName} onChange={set("emailFromName")} style={inputStyle} placeholder={form.storeName || "Your Shop"} />
      <label style={labelStyle}>From email address</label>
      <input value={form.emailFromAddress} onChange={set("emailFromAddress")} style={inputStyle} placeholder="orders@yourshop.com" />
      <div style={{ background: "#FFF6E5", border: "1px solid #F4D9A0", color: "#8a5a00", borderRadius: 12, padding: "10px 14px", fontSize: 11, marginBottom: 10, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>
          Sends customers a proper email when their wholesale account is approved, when their order is paid or booked
          ("come pick it up from the store"), and when their order is packed — through Resend's SMTP relay, already
          wired up via this app's own <code>/api/send-email</code> route (see <code>server.js</code>). Get the API key
          from resend.com → API Keys, and a "from" address on a domain you've verified there. Until an API key is set
          here (or as <code>RESEND_API_KEY</code> below), these emails are simply skipped.
          <br /><br />
          <strong>Note:</strong> this store's data is readable by anyone who inspects the site's network requests, so
          the API key typed above isn't fully private. For a fully private key instead, leave this field blank and
          set <code>RESEND_API_KEY</code> (optionally <code>RESEND_SMTP_HOST</code> / <code>RESEND_SMTP_PORT</code>)
          as environment variables on your host (e.g. Render → your service → Environment) — those always take
          priority over what's typed here.
        </div>
      </div>

      <button onClick={save} className="btn" style={{ ...primaryBtn, marginTop: 8 }}>
        {saved ? <CheckCircle2 size={13} style={{ marginRight: 4 }} /> : <Save size={13} style={{ marginRight: 4 }} />}
        {saved ? "Saved!" : "Save changes"}
      </button>
    </div>
  );
}

// Recommended banner size — a 3:1 landscape poster reads well both as a
// full-width homepage strip and cropped down on mobile. Uploads outside
// this aspect ratio still work (nothing is blocked) but get a warning so
// posters don't come out stretched or cropped oddly in the carousel.
const BANNER_RECOMMENDED = { width: 1200, height: 400 };

function AdminBanners({ content, persistCatalog, showToast }) {
  const [banners, setBanners] = useState(content.banners || []);
  const [intervalSeconds, setIntervalSeconds] = useState(content.bannerIntervalSeconds ?? 5);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (nextBanners = banners, nextInterval = intervalSeconds) => {
    await persistCatalog({ content: { ...content, banners: nextBanners, bannerIntervalSeconds: nextInterval } });
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const addBanner = (imageUrl) => {
    const next = [...banners, { id: genId("b"), imageUrl, link: "", title: "" }];
    setBanners(next);
    save(next);
  };
  const removeBanner = (id) => {
    const next = banners.filter((b) => b.id !== id);
    setBanners(next);
    save(next);
  };
  const updateBanner = (id, patch) => setBanners((bs) => bs.map((b) => (b.id === id ? { ...b, ...patch } : b)));

  // Banner/poster images go to a Supabase Storage bucket (see
  // supabase-schema.sql) instead of being embedded as base64 in the content
  // row — posters are typically much larger than a logo, and Storage keeps
  // the database row small and gives each banner its own shareable URL. If
  // Storage isn't set up yet (or the upload fails), this quietly falls back
  // to an inline data-URL so the feature still works.
  const onBannerFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { showToast("Please choose a banner image under 3MB"); return; }

    // Non-blocking size check — warns but still uploads, since some shops
    // may only have an off-ratio photo on hand and that's their call.
    const dims = await new Promise((resolve) => {
      const img = new window.Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => resolve(null);
      img.src = URL.createObjectURL(file);
    });
    if (dims) {
      const ratio = dims.width / dims.height;
      const targetRatio = BANNER_RECOMMENDED.width / BANNER_RECOMMENDED.height;
      if (Math.abs(ratio - targetRatio) > 0.5 || dims.width < 800) {
        showToast(`Heads up — this image is ${dims.width}×${dims.height}px. Recommended size is ${BANNER_RECOMMENDED.width}×${BANNER_RECOMMENDED.height}px for the best fit. Uploading anyway.`);
      }
    }

    if (supabase) {
      setUploading(true);
      try {
        const path = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;
        const { error: upErr } = await supabase.storage.from("banners").upload(path, file, { upsert: true });
        if (upErr) throw upErr;
        const { data } = supabase.storage.from("banners").getPublicUrl(path);
        addBanner(data.publicUrl);
        setUploading(false);
        return;
      } catch (err) {
        console.error("banner upload to Supabase Storage failed", err);
        showToast("Couldn't upload to Supabase Storage (is the 'banners' bucket set up? see supabase-schema.sql) — saved a local copy instead.");
        setUploading(false);
      }
    }
    const reader = new FileReader();
    reader.onload = () => addBanner(reader.result);
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ maxWidth: 560 }}>
      <h2 className="disp" style={{ marginTop: 0 }}>Banners / offers</h2>
      <div style={{ fontSize: 13, color: "#6b6558", marginBottom: 18 }}>
        Poster images shown as a carousel on the homepage — great for "20% off this week" type offers. Upload the poster as-is; no text overlay is added.
      </div>

      <div style={{ background: "#FFF6E5", border: "1px solid #F4D9A0", color: "#8a5a00", borderRadius: 12, padding: "10px 14px", fontSize: 12, marginBottom: 18, display: "flex", gap: 8, alignItems: "flex-start" }}>
        <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
        <div>Recommended banner size: <strong>{BANNER_RECOMMENDED.width} × {BANNER_RECOMMENDED.height}px</strong> (3:1 landscape). Other sizes still upload, just with a heads-up — very tall, narrow, or low-resolution images may look stretched or cropped in the carousel.</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 14 }}>
        {banners.map((b) => (
          <div key={b.id} style={{ display: "flex", gap: 10, border: "1px solid #ECE7DC", borderRadius: 12, padding: 10 }}>
            <img src={b.imageUrl} alt={b.title || "Banner"} style={{ width: 96, height: 64, objectFit: "cover", borderRadius: 8, flexShrink: 0, background: "#F4F1EA" }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <input value={b.title} onChange={(e) => updateBanner(b.id, { title: e.target.value })} onBlur={() => save()} placeholder="Label (optional, for your reference)" style={{ ...inputStyle, marginBottom: 6, fontSize: 12 }} />
              <input value={b.link} onChange={(e) => updateBanner(b.id, { link: e.target.value })} onBlur={() => save()} placeholder="Link when tapped (optional — e.g. a category or product page URL)" style={{ ...inputStyle, marginBottom: 0, fontSize: 12 }} />
            </div>
            <button onClick={() => removeBanner(b.id)} className="btn" style={{ ...iconBtn, width: 32, height: 32, alignSelf: "flex-start", color: "#B3261E" }} title="Remove banner"><Trash2 size={14} /></button>
          </div>
        ))}
        {banners.length === 0 && <div style={{ fontSize: 13, color: "#9a9488" }}>No banners yet — add one below.</div>}
      </div>
      <label className="btn" style={{ ...iconBtn, width: "auto", padding: "8px 14px", fontSize: 12, fontWeight: 600, cursor: uploading ? "default" : "pointer", display: "inline-flex", alignItems: "center", gap: 6, opacity: uploading ? 0.6 : 1, marginBottom: 26 }}>
        <ImageIcon size={13} /> {uploading ? "Uploading…" : "Add banner image"}
        <input type="file" accept="image/*" onChange={onBannerFile} style={{ display: "none" }} disabled={uploading} />
      </label>

      <div style={{ fontSize: 12, fontWeight: 800, color: "#8b8578", textTransform: "uppercase", letterSpacing: 0.4, margin: "0 0 8px" }}>Carousel timing</div>
      <label style={labelStyle}>Seconds between banners</label>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <input type="number" min={2} max={30} value={intervalSeconds} onChange={(e) => setIntervalSeconds(Math.max(2, Number(e.target.value) || 5))} style={{ ...inputStyle, width: 90, marginBottom: 0 }} />
        <button onClick={() => save(banners, intervalSeconds)} className="btn" style={primaryBtn}>
          {saved ? <CheckCircle2 size={13} style={{ marginRight: 4 }} /> : <Save size={13} style={{ marginRight: 4 }} />}
          {saved ? "Saved!" : "Save"}
        </button>
      </div>
      <div style={{ fontSize: 11, color: "#8b8578", marginTop: 6 }}>How long each banner shows before auto-advancing to the next. Minimum 2 seconds.</div>
    </div>
  );
}
const DEFAULT_CONTENT_SHAPE = {
  storeName: "Bhagwati Book Center", logoUrl: "", bannerTitle: "", bannerSubtitle: "", announcement: "", address: "",
  contactPhone: "", contactEmail: "", whatsappNumber: "", instagramUrl: "", facebookUrl: "",
  deliveryMinimum: 999, googleClientId: "", cashfreeAppId: "", cashfreeMode: "sandbox", cashfreeOrderEndpoint: "",
  emailApiEndpoint: "/api/send-email", emailSmtpHost: "smtp.resend.com", emailSmtpPort: "465", emailApiKey: "",
  emailFromAddress: "", emailFromName: "", banners: [], bannerIntervalSeconds: 5,
};
const labelStyle = { fontSize: 12, fontWeight: 700, color: "#6b6558", marginBottom: 4, display: "block" };
