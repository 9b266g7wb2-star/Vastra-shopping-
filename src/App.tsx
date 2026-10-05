import { useEffect, useMemo, useState } from 'react';
import { Link, Route, Routes, useNavigate, useParams } from 'react-router-dom';

const STORE_NAME = import.meta.env.VITE_STORE_NAME || 'Vastra Shopping';
const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '';
const UPI_ID = import.meta.env.VITE_UPI_ID || '';

type Category = 'Sarees' | 'Kurtis' | 'Lehengas' | 'Dupattas';

interface Product {
  id: string;
  name: string;
  hindi: string;
  category: Category;
  price: number;
  mrp: number;
  fabric: string;
  description: string;
  colors: [string, string];
}

interface CartItem {
  id: string;
  qty: number;
}

const PRODUCTS: Product[] = [
  { id: 'banarasi-silk', name: 'Banarasi Silk Saree', hindi: 'बनारसी सिल्क साड़ी', category: 'Sarees', price: 4499, mrp: 6999, fabric: 'Pure silk with zari', description: 'Handwoven Banarasi silk with intricate gold zari buttis and a rich pallu. Comes with an unstitched blouse piece.', colors: ['#7b1e2b', '#c9a227'] },
  { id: 'kanjivaram', name: 'Kanjivaram Saree', hindi: 'कांजीवरम साड़ी', category: 'Sarees', price: 5999, mrp: 8499, fabric: 'Mulberry silk', description: 'Temple-border Kanjivaram in deep teal with a contrasting gold body. Perfect for weddings and festivals.', colors: ['#0e4f4a', '#c9a227'] },
  { id: 'cotton-handloom', name: 'Handloom Cotton Saree', hindi: 'हैंडलूम कॉटन साड़ी', category: 'Sarees', price: 1299, mrp: 1899, fabric: 'Handloom cotton', description: 'Breathable everyday cotton saree with a simple woven border. Soft, light and easy to drape.', colors: ['#e9dcc3', '#7b1e2b'] },
  { id: 'anarkali-kurti', name: 'Anarkali Kurti', hindi: 'अनारकली कुर्ती', category: 'Kurtis', price: 1499, mrp: 2199, fabric: 'Rayon', description: 'Flared floor-length Anarkali with gota-patti detailing at the yoke and hem.', colors: ['#b4475a', '#f3d9a4'] },
  { id: 'chikankari-kurti', name: 'Lucknowi Chikankari Kurti', hindi: 'लखनवी चिकनकारी कुर्ती', category: 'Kurtis', price: 1799, mrp: 2499, fabric: 'Georgette', description: 'Hand-embroidered Lucknowi chikankari on soft georgette, with a matching slip.', colors: ['#f5f0e6', '#9bb7b1'] },
  { id: 'block-print-kurti', name: 'Jaipuri Block Print Kurti', hindi: 'जयपुरी ब्लॉक प्रिंट कुर्ती', category: 'Kurtis', price: 899, mrp: 1299, fabric: 'Cotton', description: 'Hand block-printed Jaipuri cotton kurti in an indigo floral motif. Straight cut, three-quarter sleeves.', colors: ['#24406b', '#f0e6d2'] },
  { id: 'bridal-lehenga', name: 'Bridal Lehenga', hindi: 'दुल्हन लहंगा', category: 'Lehengas', price: 18999, mrp: 25999, fabric: 'Velvet with zardozi', description: 'Heavy zardozi and sequin work on velvet, with a net dupatta and padded blouse.', colors: ['#6e0f1f', '#c9a227'] },
  { id: 'festive-lehenga', name: 'Festive Lehenga Choli', hindi: 'त्योहार लहंगा चोली', category: 'Lehengas', price: 6499, mrp: 8999, fabric: 'Art silk', description: 'Lightweight festive lehenga with mirror work, ideal for sangeet and Navratri.', colors: ['#0e4f4a', '#e3a33b'] },
  { id: 'phulkari-dupatta', name: 'Phulkari Dupatta', hindi: 'फुलकारी दुपट्टा', category: 'Dupattas', price: 999, mrp: 1499, fabric: 'Chiffon', description: 'Vibrant Punjabi phulkari embroidery on chiffon. Adds colour to any plain suit.', colors: ['#d0492f', '#f2c14e'] },
  { id: 'bandhani-dupatta', name: 'Bandhani Dupatta', hindi: 'बांधनी दुपट्टा', category: 'Dupattas', price: 749, mrp: 1099, fabric: 'Cotton silk', description: 'Traditional Gujarati tie-dye bandhani with a tasselled edge.', colors: ['#8a1c4a', '#f7e3b0'] },
];

const CATEGORIES: Array<Category | 'All'> = ['All', 'Sarees', 'Kurtis', 'Lehengas', 'Dupattas'];

const formatINR = (n: number) => '₹' + n.toLocaleString('en-IN');

const findProduct = (id: string) => PRODUCTS.find((p) => p.id === id);

function useCart() {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('vastra_cart') || '[]') as CartItem[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('vastra_cart', JSON.stringify(items));
  }, [items]);

  const add = (id: string) =>
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      return [...prev, { id, qty: 1 }];
    });

  const setQty = (id: string, qty: number) =>
    setItems((prev) => (qty <= 0 ? prev.filter((i) => i.id !== id) : prev.map((i) => (i.id === id ? { ...i, qty } : i))));

  const clear = () => setItems([]);

  const count = items.reduce((sum, i) => sum + i.qty, 0);
  const total = items.reduce((sum, i) => sum + (findProduct(i.id)?.price ?? 0) * i.qty, 0);

  return { items, add, setQty, clear, count, total };
}

type Cart = ReturnType<typeof useCart>;

function Swatch({ product, large = false }: { product: Product; large?: boolean }) {
  const [a, b] = product.colors;
  return (
    <div
      className={`relative w-full overflow-hidden ${large ? 'aspect-[4/5] rounded-lg' : 'aspect-[4/5] rounded-t-lg'}`}
      style={{
        background: `repeating-linear-gradient(135deg, ${a} 0 22px, ${b} 22px 26px, ${a} 26px 48px)`,
      }}
      aria-hidden="true"
    >
      <div className="absolute inset-x-0 bottom-0 h-1/4" style={{ background: `linear-gradient(to top, ${b}, transparent)` }} />
      <span className="absolute left-3 top-3 rounded bg-white/85 px-2 py-0.5 text-xs font-semibold tracking-wide text-maroon">
        {product.category}
      </span>
    </div>
  );
}

function Header({ count }: { count: number }) {
  return (
    <header className="sticky top-0 z-10 border-b border-gold/40 bg-maroon text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-2xl font-bold tracking-wide text-gold">{STORE_NAME}</span>
          <span className="hidden text-sm text-white/80 sm:inline">वस्त्र शॉपिंग</span>
        </Link>
        <Link to="/cart" className="rounded-full border border-gold/60 px-4 py-1.5 text-sm hover:bg-white/10">
          Cart <span className="ml-1 rounded-full bg-gold px-2 py-0.5 text-xs font-bold text-maroon">{count}</span>
        </Link>
      </div>
    </header>
  );
}

function ProductCard({ product, onAdd }: { product: Product; onAdd: () => void }) {
  const off = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  return (
    <div className="flex flex-col rounded-lg border border-stone-200 bg-white shadow-sm transition hover:shadow-md">
      <Link to={`/product/${product.id}`}>
        <Swatch product={product} />
      </Link>
      <div className="flex flex-1 flex-col p-3">
        <Link to={`/product/${product.id}`} className="font-semibold leading-tight hover:text-maroon">
          {product.name}
        </Link>
        <span className="text-sm text-stone-500">{product.hindi}</span>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-lg font-bold text-maroon">{formatINR(product.price)}</span>
          <span className="text-sm text-stone-400 line-through">{formatINR(product.mrp)}</span>
          <span className="text-xs font-semibold text-teal2">{off}% off</span>
        </div>
        <button onClick={onAdd} className="mt-auto rounded bg-teal2 py-2 text-sm font-semibold text-white hover:bg-teal2/90">
          Add to cart
        </button>
      </div>
    </div>
  );
}

function Home({ cart }: { cart: Cart }) {
  const [category, setCategory] = useState<Category | 'All'>('All');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PRODUCTS.filter(
      (p) =>
        (category === 'All' || p.category === category) &&
        (!q || p.name.toLowerCase().includes(q) || p.hindi.includes(q) || p.fabric.toLowerCase().includes(q))
    );
  }, [category, query]);

  return (
    <>
      <section className="bg-gradient-to-br from-maroon to-teal2 text-white">
        <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
          <p className="text-sm uppercase tracking-[0.3em] text-gold">Handpicked Indian ethnic wear</p>
          <h1 className="mt-2 text-4xl font-bold sm:text-5xl">परंपरा का रंग, हर धागे में</h1>
          <p className="mt-3 max-w-xl text-white/85">
            Sarees, kurtis, lehengas and dupattas from India's weaving traditions. Order on WhatsApp and pay securely via UPI.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full border px-4 py-1.5 text-sm ${
                  category === c ? 'border-maroon bg-maroon text-white' : 'border-stone-300 bg-white hover:border-maroon'
                }`}
              >
                {c}
              </button>
            ))}
          </div>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search silk, cotton, saree…"
            className="w-full rounded border border-stone-300 px-3 py-2 text-sm focus:border-maroon focus:outline-none sm:w-64"
          />
        </div>

        {visible.length === 0 ? (
          <p className="py-16 text-center text-stone-500">No products match your search.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} onAdd={() => cart.add(p.id)} />
            ))}
          </div>
        )}
      </main>
    </>
  );
}

function ProductPage({ cart }: { cart: Cart }) {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const product = findProduct(id);

  if (!product) {
    return (
      <main className="mx-auto max-w-6xl px-4 py-16 text-center">
        <p className="text-stone-500">Product not found.</p>
        <Link to="/" className="mt-4 inline-block text-maroon underline">Back to shop</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-2">
      <Swatch product={product} large />
      <div>
        <Link to="/" className="text-sm text-teal2 hover:underline">← Back to shop</Link>
        <h1 className="mt-2 text-3xl font-bold">{product.name}</h1>
        <p className="text-stone-500">{product.hindi}</p>
        <div className="mt-4 flex items-baseline gap-3">
          <span className="text-2xl font-bold text-maroon">{formatINR(product.price)}</span>
          <span className="text-stone-400 line-through">{formatINR(product.mrp)}</span>
        </div>
        <p className="mt-1 text-sm text-stone-500">Inclusive of all taxes</p>
        <p className="mt-6 leading-relaxed">{product.description}</p>
        <dl className="mt-4 text-sm">
          <dt className="inline font-semibold">Fabric: </dt>
          <dd className="inline">{product.fabric}</dd>
        </dl>
        <div className="mt-8 flex gap-3">
          <button onClick={() => cart.add(product.id)} className="flex-1 rounded border border-teal2 py-3 font-semibold text-teal2 hover:bg-teal2/5">
            Add to cart
          </button>
          <button
            onClick={() => {
              cart.add(product.id);
              navigate('/cart');
            }}
            className="flex-1 rounded bg-maroon py-3 font-semibold text-white hover:bg-maroon/90"
          >
            Buy now
          </button>
        </div>
      </div>
    </main>
  );
}

function CartPage({ cart }: { cart: Cart }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const lines = cart.items
    .map((i) => ({ item: i, product: findProduct(i.id) }))
    .filter((l): l is { item: CartItem; product: Product } => Boolean(l.product));

  if (lines.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-stone-500">आपकी कार्ट खाली है</p>
        <Link to="/" className="mt-6 inline-block rounded bg-maroon px-6 py-2 text-white">Start shopping</Link>
      </main>
    );
  }

  const upiLink = UPI_ID
    ? `upi://pay?pa=${encodeURIComponent(UPI_ID)}&pn=${encodeURIComponent(STORE_NAME)}&am=${cart.total}&cu=INR`
    : '';

  const orderMessage = [
    `New order from ${STORE_NAME}`,
    '',
    ...lines.map(({ item, product }) => `• ${product.name} × ${item.qty} = ${formatINR(product.price * item.qty)}`),
    '',
    `Total: ${formatINR(cart.total)}`,
    '',
    `Name: ${name}`,
    `Phone: ${phone}`,
    `Address: ${address}`,
  ].join('\n');

  const whatsappLink = `https://wa.me/${WHATSAPP_NUMBER.replace(/\D/g, '')}?text=${encodeURIComponent(orderMessage)}`;
  const canOrder = name.trim() && phone.trim() && address.trim() && WHATSAPP_NUMBER;

  return (
    <main className="mx-auto grid max-w-5xl gap-8 px-4 py-8 md:grid-cols-[1fr_340px]">
      <section>
        <h1 className="mb-4 text-2xl font-bold">Your cart</h1>
        <ul className="divide-y divide-stone-200 rounded-lg border border-stone-200 bg-white">
          {lines.map(({ item, product }) => (
            <li key={product.id} className="flex items-center gap-4 p-3">
              <div className="w-16 shrink-0">
                <Swatch product={product} />
              </div>
              <div className="flex-1">
                <Link to={`/product/${product.id}`} className="font-semibold hover:text-maroon">{product.name}</Link>
                <p className="text-sm text-stone-500">{formatINR(product.price)}</p>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => cart.setQty(product.id, item.qty - 1)} className="h-8 w-8 rounded border border-stone-300" aria-label="Decrease quantity">−</button>
                <span className="w-6 text-center">{item.qty}</span>
                <button onClick={() => cart.setQty(product.id, item.qty + 1)} className="h-8 w-8 rounded border border-stone-300" aria-label="Increase quantity">+</button>
              </div>
              <span className="w-20 text-right font-semibold">{formatINR(product.price * item.qty)}</span>
            </li>
          ))}
        </ul>
        <button onClick={cart.clear} className="mt-3 text-sm text-stone-500 hover:text-maroon">Clear cart</button>
      </section>

      <aside className="h-fit rounded-lg border border-gold/50 bg-white p-4">
        <h2 className="text-lg font-bold">Checkout</h2>
        <div className="mt-2 flex justify-between border-b border-stone-200 pb-3">
          <span>Total</span>
          <span className="text-xl font-bold text-maroon">{formatINR(cart.total)}</span>
        </div>
        <div className="mt-4 space-y-3 text-sm">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full rounded border border-stone-300 px-3 py-2" />
          <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone number" inputMode="tel" className="w-full rounded border border-stone-300 px-3 py-2" />
          <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Delivery address with PIN code" rows={3} className="w-full rounded border border-stone-300 px-3 py-2" />
        </div>

        {upiLink && (
          <div className="mt-4 rounded bg-stone-50 p-3 text-sm">
            <p>Pay via UPI to <span className="font-semibold">{UPI_ID}</span></p>
            <a href={upiLink} className="mt-2 block rounded bg-teal2 py-2 text-center font-semibold text-white">Pay {formatINR(cart.total)} with UPI</a>
          </div>
        )}

        {canOrder ? (
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="mt-4 block rounded bg-[#25D366] py-3 text-center font-semibold text-white">
            Place order on WhatsApp
          </a>
        ) : (
          <button disabled className="mt-4 w-full cursor-not-allowed rounded bg-stone-300 py-3 font-semibold text-stone-600">
            {WHATSAPP_NUMBER ? 'Fill in your details to order' : 'Ordering is not configured yet'}
          </button>
        )}
      </aside>
    </main>
  );
}

export default function App() {
  const cart = useCart();

  return (
    <div className="flex min-h-screen flex-col">
      <Header count={cart.count} />
      <div className="flex-1">
        <Routes>
          <Route path="/" element={<Home cart={cart} />} />
          <Route path="/product/:id" element={<ProductPage cart={cart} />} />
          <Route path="/cart" element={<CartPage cart={cart} />} />
          <Route path="*" element={<Home cart={cart} />} />
        </Routes>
      </div>
      <footer className="border-t border-stone-200 bg-white py-6 text-center text-sm text-stone-500">
        © {new Date().getFullYear()} {STORE_NAME} · Made with love in India
      </footer>
    </div>
  );
}
