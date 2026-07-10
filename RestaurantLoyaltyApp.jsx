import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Search, Gift, Settings, Star, Phone, MessageCircle, Share2,
  Plus, Minus, X, Check, Sparkles, Flame, ChefHat, Sun, Moon, Eye, EyeOff,
  ShoppingBag, Clock, ChevronRight, Lock, Trophy, Loader2, Palette,
  Navigation, Copy, Utensils, Info,
} from 'lucide-react';

/* ============================================================================
   THE SPICE ROUTE — QR Menu + Digital Loyalty demo
   Design tokens : Ink / Parchment / Turmeric / Chili / Cardamom
   Type system   : Instrument Serif (display) · Plus Jakarta Sans (body)
                   IBM Plex Mono (utility: prices, codes, timestamps)
   Signature     : loyalty stamps rendered as hand-stamped ink impressions,
                   each at its own angle, like a customs/spice-trade seal.
   ============================================================================ */

const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

.font-display { font-family: 'Instrument Serif', Georgia, serif; }
.font-body { font-family: 'Plus Jakarta Sans', -apple-system, sans-serif; }
.font-mono { font-family: 'IBM Plex Mono', ui-monospace, monospace; }

.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

@keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
@keyframes scaleIn { from { opacity: 0; transform: scale(0.94); } to { opacity: 1; transform: scale(1); } }
@keyframes slideUp { from { transform: translateY(100%); } to { transform: translateY(0); } }
@keyframes shakeX { 0%, 100% { transform: translateX(0); } 20% { transform: translateX(-7px); } 40% { transform: translateX(7px); } 60% { transform: translateX(-5px); } 80% { transform: translateX(5px); } }
@keyframes stampIn { 0% { transform: scale(0.4) rotate(var(--stamp-rot, -6deg)); opacity: 0; } 55% { transform: scale(1.16) rotate(var(--stamp-rot, -6deg)); opacity: 1; } 100% { transform: scale(1) rotate(var(--stamp-rot, -6deg)); opacity: 1; } }
@keyframes confettiFall { 0% { transform: translateY(-8px) rotate(0deg); opacity: 1; } 100% { transform: translateY(560px) rotate(420deg); opacity: 0; } }
@keyframes glowPulse { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }

.anim-fade-up { animation: fadeInUp 0.55s cubic-bezier(0.16,1,0.3,1) both; }
.anim-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16,1,0.3,1) both; }
.anim-slide-up { animation: slideUp 0.38s cubic-bezier(0.16,1,0.3,1) both; }
.anim-shake { animation: shakeX 0.42s ease; }
.anim-stamp-in { animation: stampIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
.anim-confetti { animation: confettiFall linear forwards; }
.anim-glow { animation: glowPulse 2.4s ease-in-out infinite; }

button:focus-visible, [tabindex]:focus-visible, input:focus-visible, a:focus-visible {
  outline: 2px solid #C6891E; outline-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  .anim-fade-up, .anim-scale-in, .anim-slide-up, .anim-shake, .anim-stamp-in, .anim-confetti, .anim-glow {
    animation-duration: 0.01ms !important; animation-iteration-count: 1 !important;
  }
}
`;

/* ---------------------------- Design tokens ---------------------------- */

function theme(dark) {
  return dark
    ? {
        bg: '#1E1712', card: '#2A2119', cardAlt: '#332920', text: '#F3ECDE',
        textMuted: '#A69A88', border: '#3A2F24', inputBg: '#241C15',
      }
    : {
        bg: '#F3ECDE', card: '#FBF7EF', cardAlt: '#EFE6D3', text: '#241C15',
        textMuted: '#8A7F6E', border: '#E4DAC7', inputBg: '#FFFFFF',
      };
}

const CARDAMOM = '#3F5D42';
const CHILI = '#9C3B2E';

const ACCENTS = [
  { id: 'turmeric', label: 'Turmeric', hex: '#C6891E' },
  { id: 'chili', label: 'Chili', hex: '#9C3B2E' },
  { id: 'cardamom', label: 'Cardamom', hex: '#3F5D42' },
  { id: 'indigo', label: 'Indigo', hex: '#34477A' },
  { id: 'plum', label: 'Plum', hex: '#6B4266' },
];

const STAMP_ROTATIONS = [-6, 4, -3, 7, -5, 3, -4];

/* ------------------------------ Sample data ----------------------------- */

const RESTAURANT_DEFAULTS = {
  name: 'The Spice Route',
  tagline: 'Seven cuisines. One table.',
  phone: '+919876543210',
  whatsapp: '919876543210',
  address: '221 MG Road, Indiranagar, Bengaluru',
  rating: 4.6,
  reviews: 1240,
  deliveryTime: '30-40 min',
  verificationCode: 'SPICE2026',
  visitsRequired: 7,
  discountPercent: 10,
  accent: 'turmeric',
};

const CATEGORIES = [
  { id: 'all', name: 'All' },
  { id: 'starters', name: 'Starters' },
  { id: 'main', name: 'Main Course' },
  { id: 'chinese', name: 'Chinese' },
  { id: 'pizza', name: 'Pizza' },
  { id: 'burger', name: 'Burger' },
  { id: 'southindian', name: 'South Indian' },
  { id: 'drinks', name: 'Drinks' },
  { id: 'desserts', name: 'Desserts' },
];

const CATEGORY_STYLE = {
  starters: { grad: ['#C6891E', '#8B5E14'], emoji: '🌽' },
  main: { grad: ['#9C3B2E', '#6E2A20'], emoji: '🍛' },
  chinese: { grad: ['#3F5D42', '#2B4030'], emoji: '🥡' },
  pizza: { grad: ['#B8452F', '#7E301F'], emoji: '🍕' },
  burger: { grad: ['#B8862B', '#7E5A1B'], emoji: '🍔' },
  southindian: { grad: ['#34477A', '#233156'], emoji: '🥞' },
  drinks: { grad: ['#3A6B72', '#264A50'], emoji: '🥤' },
  desserts: { grad: ['#6B4266', '#492D46'], emoji: '🍮' },
};

let _itemId = 0;
function makeItem(category, name, description, price, opts = {}) {
  _itemId += 1;
  return {
    id: _itemId,
    category,
    name,
    description,
    price,
    offerPrice: opts.offerPrice || null,
    veg: opts.veg !== false,
    bestseller: !!opts.bestseller,
    chefSpecial: !!opts.chefSpecial,
    rating: opts.rating || 4.3,
    emoji: opts.emoji || CATEGORY_STYLE[category].emoji,
  };
}

const MENU_ITEMS = [
  makeItem('starters', 'Crispy Corn Chaat', 'Sweet corn tossed in spiced masala, herbs and crunchy sev', 180, { offerPrice: 149, bestseller: true, rating: 4.4, emoji: '🌽' }),
  makeItem('starters', 'Chicken 65', 'Deep-fried chicken, curry leaf and dry red chilli tempering', 260, { veg: false, chefSpecial: true, rating: 4.6, emoji: '🍗' }),
  makeItem('starters', 'Paneer Tikka', 'Charred cottage cheese marinated in yogurt and spices', 220, { offerPrice: 190, rating: 4.3, emoji: '🧆' }),

  makeItem('main', 'Butter Chicken', 'Tandoori chicken simmered in a rich tomato-butter gravy', 340, { veg: false, bestseller: true, chefSpecial: true, rating: 4.8, emoji: '🍛' }),
  makeItem('main', 'Dal Makhani', 'Slow-cooked black lentils finished with cream and butter', 240, { rating: 4.5, emoji: '🍲' }),
  makeItem('main', 'Kadai Paneer', 'Cottage cheese and peppers in a coarsely ground spice base', 260, { rating: 4.2, emoji: '🍛' }),

  makeItem('chinese', 'Veg Manchurian', 'Fried vegetable dumplings tossed in a tangy soy-garlic sauce', 210, { bestseller: true, rating: 4.3, emoji: '🥘' }),
  makeItem('chinese', 'Chilli Garlic Noodles', 'Wok-tossed noodles with garlic, chilli and spring onion', 220, { rating: 4.2, emoji: '🍜' }),
  makeItem('chinese', 'Chicken Schezwan Rice', 'Fiery Schezwan sauce, wok-fried rice and scallions', 260, { veg: false, chefSpecial: true, rating: 4.5, emoji: '🍚' }),

  makeItem('pizza', 'Margherita', 'San Marzano tomato, fior di latte and fresh basil', 280, { offerPrice: 240, bestseller: true, rating: 4.5, emoji: '🍕' }),
  makeItem('pizza', 'Farmhouse Veggie', 'Bell peppers, onion, mushroom and sweet corn', 320, { rating: 4.3, emoji: '🍕' }),
  makeItem('pizza', 'Peri Peri Chicken', 'Peri peri marinated chicken, onions and mozzarella', 380, { veg: false, chefSpecial: true, rating: 4.6, emoji: '🍕' }),

  makeItem('burger', 'Classic Veg Burger', 'Potato-pea patty, cheddar, and house burger sauce', 150, { rating: 4.1, emoji: '🍔' }),
  makeItem('burger', 'Smoky BBQ Chicken Burger', 'Grilled chicken thigh, smoked BBQ glaze, slaw', 210, { veg: false, offerPrice: 180, bestseller: true, rating: 4.5, emoji: '🍔' }),
  makeItem('burger', 'Crispy Paneer Burger', 'Crumb-fried paneer, chipotle mayo, pickles', 190, { rating: 4.2, emoji: '🍔' }),

  makeItem('southindian', 'Masala Dosa', 'Crisp rice crepe filled with spiced potato masala', 140, { bestseller: true, rating: 4.6, emoji: '🥞' }),
  makeItem('southindian', 'Idli Sambar (4pc)', 'Steamed rice cakes with lentil sambar and chutney', 110, { rating: 4.4, emoji: '🍚' }),
  makeItem('southindian', 'Ghee Podi Uttapam', 'Thick rice pancake, spiced lentil powder and ghee', 160, { chefSpecial: true, rating: 4.3, emoji: '🥞' }),

  makeItem('drinks', 'Fresh Lime Soda', 'Sweet, salted or mixed — made fresh to order', 90, { rating: 4.2, emoji: '🥤' }),
  makeItem('drinks', 'Mango Lassi', 'Churned yogurt, Alphonso mango pulp, a hint of cardamom', 120, { bestseller: true, rating: 4.6, emoji: '🥭' }),
  makeItem('drinks', 'Cold Coffee', 'Blended coffee, milk and vanilla ice cream', 150, { rating: 4.3, emoji: '☕' }),

  makeItem('desserts', 'Gulab Jamun (2pc)', 'Milk dumplings soaked in rose-cardamom syrup', 100, { rating: 4.5, emoji: '🍡' }),
  makeItem('desserts', 'Chocolate Brownie', 'Warm brownie, vanilla ice cream, chocolate sauce', 180, { bestseller: true, rating: 4.6, emoji: '🍫' }),
  makeItem('desserts', 'Rasmalai', 'Soft cheese dumplings in saffron-cardamom milk', 130, { chefSpecial: true, rating: 4.5, emoji: '🍮' }),
];

/* -------------------------------- Helpers -------------------------------- */

function getInitials(name) {
  const words = (name || '').split(' ').filter(w => w && !['the', 'a', 'an', 'of'].includes(w.toLowerCase()));
  const initials = words.slice(0, 2).map(w => w[0]).join('').toUpperCase();
  return initials || (name ? name[0].toUpperCase() : 'R');
}

function formatRupee(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

/* --------------------------- Presentational bits -------------------------- */

function VegBadge({ veg }) {
  const color = veg ? CARDAMOM : CHILI;
  return (
    <span
      className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-white shadow-sm shrink-0"
      style={{ border: `1.5px solid ${color}` }}
      title={veg ? 'Vegetarian' : 'Non-vegetarian'}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: color }} />
    </span>
  );
}

function TagBadge({ icon: IconComp, label, tone }) {
  return (
    <span
      className="inline-flex items-center gap-1 pl-1.5 pr-2 py-0.5 rounded-full font-semibold text-white shadow-sm font-body whitespace-nowrap"
      style={{ backgroundColor: tone, fontSize: '10px' }}
    >
      <IconComp size={10} strokeWidth={2.5} />
      {label}
    </span>
  );
}

function StarRatingTag({ rating, className }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold font-body ${className || ''}`}>
      <Star size={13} strokeWidth={0} className="fill-current" style={{ color: '#C6891E' }} />
      {rating.toFixed(1)}
    </span>
  );
}

function StampCircle({ index, filled, accentHex, dark, justAdded }) {
  const rotation = STAMP_ROTATIONS[index % STAMP_ROTATIONS.length];
  if (!filled) {
    return (
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-mono"
        style={{ border: `1.5px dashed ${dark ? '#4A3D2E' : '#D9CBAE'}`, color: dark ? '#5C4F3E' : '#B7A98C', fontSize: '11px' }}
      >
        {index + 1}
      </div>
    );
  }
  return (
    <div
      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-md ${justAdded ? 'anim-stamp-in' : ''}`}
      style={{
        backgroundColor: accentHex,
        transform: `rotate(${rotation}deg)`,
        '--stamp-rot': `${rotation}deg`,
        backgroundImage: 'radial-gradient(circle at 38% 32%, rgba(255,255,255,0.35), transparent 60%)',
      }}
    >
      <Check size={17} strokeWidth={3} className="text-white" />
    </div>
  );
}

function CategoryChip({ cat, active, onClick, dark, accentHex }) {
  const t = theme(dark);
  return (
    <button
      onClick={onClick}
      className="shrink-0 px-4 py-2 rounded-full text-sm font-semibold font-body transition-all duration-200 active:scale-95"
      style={
        active
          ? { backgroundColor: accentHex, color: '#FFFFFF', boxShadow: '0 4px 14px rgba(0,0,0,0.18)' }
          : { backgroundColor: t.cardAlt, color: t.text, border: `1px solid ${t.border}` }
      }
    >
      {cat.name}
    </button>
  );
}

function IconLinkButton({ icon: IconComp, label, href, onClick }) {
  const inner = (
    <>
      <span
        className="w-11 h-11 rounded-full flex items-center justify-center backdrop-blur-md transition-transform duration-200 group-active:scale-90 group-hover:-translate-y-0.5"
        style={{ backgroundColor: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.3)' }}
      >
        <IconComp size={18} strokeWidth={2} className="text-white" />
      </span>
      <span className="font-medium font-body" style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)' }}>{label}</span>
    </>
  );
  if (onClick) {
    return (
      <button onClick={onClick} className="flex flex-col items-center gap-1.5 group">
        {inner}
      </button>
    );
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-1.5 group">
      {inner}
    </a>
  );
}

function QuantityStepper({ qty, onAdd, onRemove, accentHex }) {
  if (qty === 0) {
    return (
      <button
        onClick={onAdd}
        className="flex items-center gap-1 px-4 py-2 rounded-full text-sm font-bold font-body text-white shadow-sm transition-transform duration-150 active:scale-90"
        style={{ backgroundColor: accentHex }}
      >
        <Plus size={14} strokeWidth={3} />
        Add
      </button>
    );
  }
  return (
    <div className="flex items-center gap-3 px-1.5 py-1.5 rounded-full anim-scale-in" style={{ backgroundColor: accentHex }}>
      <button onClick={onRemove} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}>
        <Minus size={14} strokeWidth={3} className="text-white" />
      </button>
      <span className="text-sm font-bold font-mono text-white w-4 text-center">{qty}</span>
      <button onClick={onAdd} className="w-7 h-7 rounded-full flex items-center justify-center active:scale-90 transition-transform" style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}>
        <Plus size={14} strokeWidth={3} className="text-white" />
      </button>
    </div>
  );
}

function ToastPill({ toast, dark }) {
  if (!toast) return null;
  const ToastIcon = toast.icon;
  return (
    <div className="absolute top-4 left-4 right-4 flex justify-center pointer-events-none" style={{ zIndex: 60 }}>
      <div
        className="anim-fade-up px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 max-w-full font-body text-sm font-semibold"
        style={{ backgroundColor: dark ? '#F3ECDE' : '#241C15', color: dark ? '#241C15' : '#F3ECDE' }}
      >
        {ToastIcon ? <ToastIcon size={16} className="shrink-0" /> : null}
        <span className="truncate">{toast.message}</span>
      </div>
    </div>
  );
}

function SkeletonGrid({ dark }) {
  const t = theme(dark);
  return (
    <div className="px-4 space-y-4 pt-4">
      {[0, 1, 2].map(i => (
        <div key={i} className="rounded-3xl overflow-hidden animate-pulse" style={{ backgroundColor: t.card }}>
          <div className="h-40" style={{ backgroundColor: t.cardAlt }} />
          <div className="p-4 space-y-2">
            <div className="h-4 rounded" style={{ backgroundColor: t.cardAlt, width: '60%' }} />
            <div className="h-3 rounded" style={{ backgroundColor: t.cardAlt, width: '90%' }} />
            <div className="h-3 rounded" style={{ backgroundColor: t.cardAlt, width: '40%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------ Menu item card ----------------------------- */

function MenuItemCard({ item, qty, onAdd, onRemove, dark, accentHex, index }) {
  const t = theme(dark);
  const style = CATEGORY_STYLE[item.category];
  return (
    <div
      className="rounded-3xl overflow-hidden anim-fade-up"
      style={{
        backgroundColor: t.card,
        border: `1px solid ${t.border}`,
        animationDelay: `${Math.min(index, 10) * 45}ms`,
        boxShadow: dark ? '0 8px 24px rgba(0,0,0,0.35)' : '0 8px 24px rgba(36,28,21,0.08)',
      }}
    >
      <div
        className="relative h-44 overflow-hidden group cursor-pointer select-none"
        style={{ backgroundImage: `linear-gradient(135deg, ${style.grad[0]}, ${style.grad[1]})` }}
      >
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full blur-2xl" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <div className="absolute -bottom-8 -left-4 w-24 h-24 rounded-full blur-2xl" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }} />
        <div
          className="absolute inset-0 flex items-center justify-center text-7xl transition-transform duration-500 group-hover:scale-110 group-active:scale-95"
          style={{ filter: 'drop-shadow(0 8px 12px rgba(0,0,0,0.25))' }}
        >
          {item.emoji}
        </div>
        <div className="absolute top-3 left-3">
          <VegBadge veg={item.veg} />
        </div>
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          {item.bestseller && <TagBadge icon={Flame} label="Bestseller" tone="#C6891E" />}
          {item.chefSpecial && <TagBadge icon={ChefHat} label="Chef's Special" tone="#9C3B2E" />}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold font-body leading-snug" style={{ color: t.text, fontSize: '15px' }}>{item.name}</h3>
          <StarRatingTag rating={item.rating} className="shrink-0 mt-0.5" />
        </div>
        <p className="text-sm mt-1 line-clamp-2 font-body" style={{ color: t.textMuted }}>{item.description}</p>

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-baseline gap-2 font-mono">
            <span className="font-bold text-base" style={{ color: t.text }}>{formatRupee(item.offerPrice || item.price)}</span>
            {item.offerPrice && <span className="text-xs line-through" style={{ color: t.textMuted }}>{formatRupee(item.price)}</span>}
          </div>
          <QuantityStepper qty={qty} onAdd={onAdd} onRemove={onRemove} accentHex={accentHex} />
        </div>
      </div>
    </div>
  );
}

/* --------------------------------- Menu screen ------------------------------ */

function MenuScreen({ restaurant, dark, accentHex, cart, onAdd, onRemove, scrollY, isOpenNow, onShare }) {
  const t = theme(dark);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const tm = setTimeout(() => setLoading(false), 700);
    return () => clearTimeout(tm);
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      return MENU_ITEMS.filter(i => i.name.toLowerCase().includes(q) || i.description.toLowerCase().includes(q));
    }
    if (activeCategory === 'all') return MENU_ITEMS;
    return MENU_ITEMS.filter(i => i.category === activeCategory);
  }, [searchQuery, activeCategory]);

  const parallax = Math.min(scrollY * 0.3, 30);

  return (
    <div>
      {/* Hero */}
      <div className="relative h-64 overflow-hidden">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'linear-gradient(135deg, #C6891E 0%, #9C3B2E 100%)', transform: `translateY(${parallax}px) scale(1.35)` }}
        >
          <div className="absolute top-6 left-1/3 w-40 h-40 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
          <div className="absolute bottom-0 right-0 w-48 h-48 rounded-full blur-3xl" style={{ backgroundColor: 'rgba(0,0,0,0.15)' }} />
        </div>

        <div className="relative h-full flex flex-col justify-between p-5 anim-fade-up">
          <div className="flex justify-end">
            <div className="flex gap-2">
              <IconLinkButton icon={Phone} label="Call" href={`tel:${restaurant.phone}`} />
              <IconLinkButton icon={MessageCircle} label="Chat" href={`https://wa.me/${restaurant.whatsapp}`} />
              <IconLinkButton icon={Navigation} label="Directions" href={`https://maps.google.com/?q=${encodeURIComponent(restaurant.address)}`} />
              <IconLinkButton icon={Share2} label="Share" onClick={onShare} />
            </div>
          </div>

          <div className="flex items-end gap-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center font-display text-xl font-bold text-white shrink-0 shadow-lg"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', border: '1.5px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(6px)' }}
            >
              {getInitials(restaurant.name)}
            </div>
            <div className="min-w-0">
              <h1 className="font-display text-2xl text-white leading-none mb-1 truncate">{restaurant.name}</h1>
              <p className="text-sm font-body truncate" style={{ color: 'rgba(255,255,255,0.85)' }}>{restaurant.tagline}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status row */}
      <div className="px-5 -mt-4 relative z-10">
        <div className="rounded-2xl shadow-lg p-3 flex items-center justify-center gap-2.5 anim-fade-up" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
          <div className="flex items-center gap-1.5 text-sm font-semibold font-body" style={{ color: t.text }}>
            <Star size={14} className="fill-current" strokeWidth={0} style={{ color: '#C6891E' }} />
            {restaurant.rating}
            <span className="font-normal" style={{ color: t.textMuted }}>({restaurant.reviews.toLocaleString('en-IN')})</span>
          </div>
          <div className="w-px h-4 shrink-0" style={{ backgroundColor: t.border }} />
          <div className="flex items-center gap-1.5 text-sm font-semibold font-body shrink-0">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isOpenNow ? CARDAMOM : CHILI }} />
            <span style={{ color: isOpenNow ? CARDAMOM : CHILI }}>{isOpenNow ? 'Open now' : 'Closed'}</span>
          </div>
          <div className="w-px h-4 shrink-0" style={{ backgroundColor: t.border }} />
          <div className="flex items-center gap-1.5 text-sm font-body shrink-0" style={{ color: t.textMuted }}>
            <Clock size={14} />
            {restaurant.deliveryTime}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mt-4">
        <div className="flex items-center gap-2 rounded-2xl px-4 py-3" style={{ backgroundColor: t.cardAlt, border: `1px solid ${t.border}` }}>
          <Search size={17} style={{ color: t.textMuted }} />
          <input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search dishes..."
            className="bg-transparent outline-none text-sm font-body flex-1 min-w-0"
            style={{ color: t.text }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} aria-label="Clear search">
              <X size={16} style={{ color: t.textMuted }} />
            </button>
          )}
        </div>
      </div>

      {/* Category chips */}
      {!searchQuery && (
        <div className="mt-4 pl-5 flex gap-2 overflow-x-auto no-scrollbar pb-1 sticky top-0 z-20 py-2" style={{ backgroundColor: t.bg }}>
          {CATEGORIES.map(cat => (
            <CategoryChip key={cat.id} cat={cat} active={activeCategory === cat.id} onClick={() => setActiveCategory(cat.id)} dark={dark} accentHex={accentHex} />
          ))}
          <div className="w-3 shrink-0" />
        </div>
      )}

      {/* Items */}
      {loading ? (
        <SkeletonGrid dark={dark} />
      ) : filteredItems.length === 0 ? (
        <div className="flex flex-col items-center text-center px-8 py-16 anim-fade-up">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ backgroundColor: t.cardAlt }}>
            <Search size={24} style={{ color: t.textMuted }} />
          </div>
          <p className="font-semibold font-body" style={{ color: t.text }}>Nothing matches &quot;{searchQuery}&quot;</p>
          <p className="text-sm font-body mt-1" style={{ color: t.textMuted }}>Try a dish name, or clear the search.</p>
        </div>
      ) : (
        <div key={`${activeCategory}-${searchQuery}`} className="px-5 py-4 space-y-4 pb-6">
          {filteredItems.map((mi, idx) => (
            <MenuItemCard
              key={mi.id}
              item={mi}
              qty={cart[mi.id] || 0}
              onAdd={() => onAdd(mi.id)}
              onRemove={() => onRemove(mi.id)}
              dark={dark}
              accentHex={accentHex}
              index={idx}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------- Rewards screen ---------------------------- */

function RewardsScreen({ restaurant, dark, accentHex, stamps, visitHistory, onOpenVerify, justAddedIndex }) {
  const t = theme(dark);
  const total = restaurant.visitsRequired;
  const progress = Math.min(stamps / total, 1);

  return (
    <div className="px-5 py-5 space-y-5 pb-8">
      <div className="anim-fade-up">
        <h2 className="font-display text-2xl" style={{ color: t.text }}>Your Rewards</h2>
        <p className="text-sm font-body mt-0.5" style={{ color: t.textMuted }}>Visit us, collect stamps, unlock a discount.</p>
      </div>

      <div
        className="rounded-3xl p-5 anim-fade-up relative overflow-hidden"
        style={{ backgroundColor: t.card, border: `1px solid ${t.border}`, boxShadow: dark ? '0 10px 30px rgba(0,0,0,0.35)' : '0 10px 30px rgba(36,28,21,0.1)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-display font-bold text-white text-sm shrink-0" style={{ backgroundColor: accentHex }}>
              {getInitials(restaurant.name)}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold font-body truncate" style={{ color: t.text }}>{restaurant.name}</p>
              <p className="text-xs font-mono" style={{ color: t.textMuted }}>{stamps} of {total} visits</p>
            </div>
          </div>
          <Gift size={22} style={{ color: accentHex }} className="shrink-0" />
        </div>

        <div className="flex flex-wrap gap-2.5 justify-center py-2">
          {Array.from({ length: total }).map((_, i) => (
            <StampCircle key={i} index={i} filled={i < stamps} accentHex={accentHex} dark={dark} justAdded={i === justAddedIndex} />
          ))}
        </div>

        <div className="h-1.5 rounded-full mt-4 overflow-hidden" style={{ backgroundColor: t.cardAlt }}>
          <div className="h-full rounded-full transition-all duration-700 ease-out" style={{ width: `${progress * 100}%`, backgroundColor: accentHex }} />
        </div>

        <p className="text-center text-sm font-body mt-3" style={{ color: t.textMuted }}>
          Collect {total} stamps &rarr; get <span className="font-bold" style={{ color: t.text }}>{restaurant.discountPercent}% off</span> your bill
        </p>

        <button
          onClick={onOpenVerify}
          className="w-full mt-4 py-3 rounded-2xl font-bold font-body text-white flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-md"
          style={{ backgroundColor: accentHex }}
        >
          <Lock size={16} />
          Verify my visit
        </button>
      </div>

      <div className="rounded-3xl p-4 anim-fade-up" style={{ backgroundColor: t.cardAlt, border: `1px solid ${t.border}` }}>
        <p className="text-xs font-bold font-body uppercase tracking-wide mb-3" style={{ color: t.textMuted }}>How it works</p>
        <div className="space-y-3">
          {[
            ['Visit the restaurant', 'Dine in or order at the counter.'],
            ['Ask staff to verify', "They'll enter today's code — you can't add stamps yourself."],
            [`Collect ${total} stamps`, `Unlock ${restaurant.discountPercent}% off automatically.`],
          ].map(([title, desc], i) => (
            <div key={i} className="flex gap-3">
              <div
                className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-mono shrink-0 mt-0.5"
                style={{ backgroundColor: t.card, color: accentHex, border: `1px solid ${t.border}` }}
              >
                {i + 1}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold font-body" style={{ color: t.text }}>{title}</p>
                <p className="text-xs font-body" style={{ color: t.textMuted }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {visitHistory.length > 0 && (
        <div className="anim-fade-up">
          <p className="text-xs font-bold font-body uppercase tracking-wide mb-2 px-1" style={{ color: t.textMuted }}>Recent visits</p>
          <div className="rounded-3xl overflow-hidden" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
            {visitHistory.slice().reverse().map((v, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3" style={{ borderTop: i === 0 ? 'none' : `1px solid ${t.border}` }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: t.cardAlt }}>
                  <Check size={14} style={{ color: CARDAMOM }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold font-body truncate" style={{ color: t.text }}>Visit verified</p>
                  <p className="text-xs font-mono" style={{ color: t.textMuted }}>{v}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* --------------------------------- Admin screen ------------------------------ */

function FieldLabel({ children, dark }) {
  const t = theme(dark);
  return <p className="text-xs font-bold font-body uppercase tracking-wide block mb-1.5" style={{ color: t.textMuted }}>{children}</p>;
}

function TextField({ value, onChange, dark, placeholder, mono, type }) {
  const t = theme(dark);
  return (
    <input
      type={type || 'text'}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full rounded-xl px-3.5 py-2.5 text-sm outline-none ${mono ? 'font-mono' : 'font-body'}`}
      style={{ backgroundColor: t.inputBg, color: t.text, border: `1px solid ${t.border}` }}
    />
  );
}

function SettingsCard({ title, icon: IconComp, dark, accentHex, children }) {
  const t = theme(dark);
  return (
    <div className="rounded-3xl p-4 anim-fade-up" style={{ backgroundColor: t.card, border: `1px solid ${t.border}` }}>
      <div className="flex items-center gap-2 mb-4">
        <IconComp size={16} style={{ color: accentHex }} />
        <p className="text-sm font-bold font-body" style={{ color: t.text }}>{title}</p>
      </div>
      <div className="space-y-3.5">{children}</div>
    </div>
  );
}

function AdminScreen({ restaurant, dark, accentHex, onUpdate, onToggleDark }) {
  const t = theme(dark);
  const [showCode, setShowCode] = useState(false);

  return (
    <div className="px-5 py-5 space-y-4 pb-8">
      <div className="anim-fade-up flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl" style={{ color: t.text }}>Owner Settings</h2>
          <p className="text-sm font-body mt-0.5" style={{ color: t.textMuted }}>Changes apply instantly across the guest app.</p>
        </div>
        <button
          onClick={onToggleDark}
          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-transform active:scale-90"
          style={{ backgroundColor: t.cardAlt, border: `1px solid ${t.border}` }}
          aria-label="Toggle dark mode"
        >
          {dark ? <Sun size={16} style={{ color: t.text }} /> : <Moon size={16} style={{ color: t.text }} />}
        </button>
      </div>

      <SettingsCard title="Restaurant profile" icon={Info} dark={dark} accentHex={accentHex}>
        <div>
          <FieldLabel dark={dark}>Restaurant name</FieldLabel>
          <TextField value={restaurant.name} onChange={v => onUpdate({ name: v })} dark={dark} placeholder="Restaurant name" />
        </div>
        <div>
          <FieldLabel dark={dark}>Phone</FieldLabel>
          <TextField value={restaurant.phone} onChange={v => onUpdate({ phone: v })} dark={dark} placeholder="+91..." mono />
        </div>
        <div>
          <FieldLabel dark={dark}>WhatsApp number</FieldLabel>
          <TextField value={restaurant.whatsapp} onChange={v => onUpdate({ whatsapp: v })} dark={dark} placeholder="91..." mono />
        </div>
        <div>
          <FieldLabel dark={dark}>Address</FieldLabel>
          <TextField value={restaurant.address} onChange={v => onUpdate({ address: v })} dark={dark} placeholder="Street, area, city" />
        </div>
      </SettingsCard>

      <SettingsCard title="Loyalty program" icon={Gift} dark={dark} accentHex={accentHex}>
        <div>
          <FieldLabel dark={dark}>Verification code</FieldLabel>
          <div className="relative">
            <TextField
              type={showCode ? 'text' : 'password'}
              value={restaurant.verificationCode}
              onChange={v => onUpdate({ verificationCode: v.toUpperCase() })}
              dark={dark}
              placeholder="e.g. SPICE2026"
              mono
            />
            <button onClick={() => setShowCode(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2" aria-label="Toggle code visibility">
              {showCode ? <EyeOff size={15} style={{ color: t.textMuted }} /> : <Eye size={15} style={{ color: t.textMuted }} />}
            </button>
          </div>
          <p className="text-xs font-body mt-1.5" style={{ color: t.textMuted }}>Staff enter this after a completed visit. Keep it to yourself.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel dark={dark}>Visits for reward</FieldLabel>
            <TextField type="number" value={restaurant.visitsRequired} onChange={v => onUpdate({ visitsRequired: Math.max(1, Math.min(20, Number(v) || 1)) })} dark={dark} mono />
          </div>
          <div>
            <FieldLabel dark={dark}>Discount %</FieldLabel>
            <TextField type="number" value={restaurant.discountPercent} onChange={v => onUpdate({ discountPercent: Math.max(1, Math.min(100, Number(v) || 1)) })} dark={dark} mono />
          </div>
        </div>
      </SettingsCard>

      <SettingsCard title="Appearance" icon={Palette} dark={dark} accentHex={accentHex}>
        <FieldLabel dark={dark}>Theme color</FieldLabel>
        <div className="flex gap-3">
          {ACCENTS.map(a => (
            <button
              key={a.id}
              onClick={() => onUpdate({ accent: a.id })}
              className="w-9 h-9 rounded-full shrink-0 transition-transform active:scale-90"
              style={{
                backgroundColor: a.hex,
                boxShadow: restaurant.accent === a.id ? `0 0 0 2.5px ${t.card}, 0 0 0 4.5px ${a.hex}` : 'none',
              }}
              aria-label={a.label}
              title={a.label}
            />
          ))}
        </div>
      </SettingsCard>
    </div>
  );
}

/* -------------------------------- Verify modal ------------------------------ */

function VerifyVisitModal({ open, onClose, onVerified, correctCode, dark, accentHex }) {
  const t = theme(dark);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState('idle');
  const [showCode, setShowCode] = useState(false);

  useEffect(() => {
    if (open) {
      setCode('');
      setStatus('idle');
      setShowCode(false);
    }
  }, [open]);

  if (!open) return null;

  const handleVerify = () => {
    if (!code.trim() || status === 'checking') return;
    setStatus('checking');
    setTimeout(() => {
      if (code.trim().toUpperCase() === (correctCode || '').trim().toUpperCase()) {
        setStatus('idle');
        onVerified();
      } else {
        setStatus('error');
        setTimeout(() => setStatus('idle'), 500);
      }
    }, 650);
  };

  return (
    <div className="absolute inset-0 flex items-end sm:items-center justify-center" style={{ zIndex: 70 }}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div className="relative w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6 anim-slide-up" style={{ backgroundColor: t.card }}>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ backgroundColor: t.cardAlt }}
          aria-label="Close"
        >
          <X size={16} style={{ color: t.textMuted }} />
        </button>

        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4" style={{ backgroundColor: `${accentHex}22` }}>
          <Lock size={20} style={{ color: accentHex }} />
        </div>
        <h3 className="font-display text-xl mb-1.5" style={{ color: t.text }}>Verify your visit</h3>
        <p className="text-sm font-body mb-5" style={{ color: t.textMuted }}>
          Hand your phone to a staff member — they&apos;ll enter today&apos;s code to add a stamp.
        </p>

        <div className={status === 'error' ? 'anim-shake' : ''}>
          <div className="relative">
            <input
              type={showCode ? 'text' : 'password'}
              value={code}
              onChange={e => setCode(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleVerify()}
              placeholder="Enter code"
              className="w-full rounded-xl px-4 py-3.5 text-base font-mono tracking-widest outline-none"
              style={{ backgroundColor: t.inputBg, color: t.text, border: `1.5px solid ${status === 'error' ? CHILI : t.border}` }}
              autoFocus
            />
            <button onClick={() => setShowCode(s => !s)} className="absolute right-4 top-1/2 -translate-y-1/2" aria-label="Toggle code visibility">
              {showCode ? <EyeOff size={16} style={{ color: t.textMuted }} /> : <Eye size={16} style={{ color: t.textMuted }} />}
            </button>
          </div>
        </div>
        {status === 'error' && (
          <p className="text-xs font-body mt-2" style={{ color: CHILI }}>That code didn&apos;t match. Ask your server to double check it.</p>
        )}

        <button
          onClick={handleVerify}
          disabled={status === 'checking'}
          className="w-full mt-5 py-3.5 rounded-2xl font-bold font-body text-white flex items-center justify-center gap-2 transition-transform active:scale-95"
          style={{ backgroundColor: accentHex, opacity: status === 'checking' ? 0.75 : 1 }}
        >
          {status === 'checking' ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
          {status === 'checking' ? 'Verifying...' : 'Verify visit'}
        </button>
      </div>
    </div>
  );
}

/* ----------------------------- Reward unlocked modal ------------------------- */

function RewardUnlockedModal({ open, onClaim, restaurant, dark, accentHex }) {
  const t = theme(dark);
  if (!open) return null;
  const voucherCode = `${restaurant.name.replace(/\s+/g, '').slice(0, 5).toUpperCase()}-${restaurant.discountPercent}OFF`;

  return (
    <div className="absolute inset-0 flex items-center justify-center p-6" style={{ zIndex: 80 }}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }} />
      <div className="relative w-full max-w-sm rounded-3xl p-7 text-center anim-scale-in overflow-hidden" style={{ backgroundColor: t.card }}>
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at 50% 0%, ${accentHex}, transparent 70%)` }} />
        <div className="relative">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 anim-glow" style={{ backgroundColor: accentHex }}>
            <Trophy size={28} className="text-white" />
          </div>
          <h3 className="font-display text-2xl mb-1.5" style={{ color: t.text }}>Card complete!</h3>
          <p className="text-sm font-body mb-5" style={{ color: t.textMuted }}>
            You&apos;ve earned <span className="font-bold" style={{ color: t.text }}>{restaurant.discountPercent}% off</span> your next bill. Show this screen at the counter.
          </p>

          <div className="rounded-2xl px-4 py-3 flex items-center justify-between mb-5" style={{ backgroundColor: t.cardAlt, border: `1.5px dashed ${t.border}` }}>
            <span className="font-mono text-sm font-bold tracking-wider" style={{ color: t.text }}>{voucherCode}</span>
            <Copy size={15} style={{ color: t.textMuted }} />
          </div>

          <button
            onClick={onClaim}
            className="w-full py-3.5 rounded-2xl font-bold font-body text-white transition-transform active:scale-95"
            style={{ backgroundColor: accentHex }}
          >
            Start a new card
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- Order sheet ------------------------------ */

function OrderSheet({ open, onClose, cart, dark, accentHex, restaurant }) {
  const t = theme(dark);
  if (!open) return null;

  const lines = Object.entries(cart)
    .map(([id, qty]) => ({ mi: MENU_ITEMS.find(m => m.id === Number(id)), qty }))
    .filter(l => l.mi && l.qty > 0);
  const total = lines.reduce((sum, l) => sum + (l.mi.offerPrice || l.mi.price) * l.qty, 0);

  const message = encodeURIComponent(
    `Hi ${restaurant.name}! I'd like to order:\n` + lines.map(l => `${l.qty} x ${l.mi.name}`).join('\n') + `\n\nTotal: ${formatRupee(total)}`
  );
  const waLink = `https://wa.me/${restaurant.whatsapp}?text=${message}`;

  return (
    <div className="absolute inset-0 flex items-end justify-center" style={{ zIndex: 70 }}>
      <div className="absolute inset-0" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }} onClick={onClose} />
      <div
        className="relative w-full sm:max-w-md rounded-t-3xl p-6 anim-slide-up flex flex-col"
        style={{ backgroundColor: t.card, maxHeight: '75vh' }}
      >
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h3 className="font-display text-xl" style={{ color: t.text }}>Your order</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: t.cardAlt }} aria-label="Close">
            <X size={16} style={{ color: t.textMuted }} />
          </button>
        </div>

        {lines.length === 0 ? (
          <p className="text-sm font-body py-6 text-center" style={{ color: t.textMuted }}>Your order is empty.</p>
        ) : (
          <div className="space-y-3 overflow-y-auto mb-4">
            {lines.map(l => (
              <div key={l.mi.id} className="flex items-center justify-between text-sm font-body gap-3">
                <span className="min-w-0 truncate" style={{ color: t.text }}>{l.qty} &times; {l.mi.name}</span>
                <span className="font-mono font-semibold shrink-0" style={{ color: t.text }}>{formatRupee((l.mi.offerPrice || l.mi.price) * l.qty)}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between mb-5 pt-3 shrink-0" style={{ borderTop: `1px solid ${t.border}` }}>
          <span className="font-bold font-body" style={{ color: t.text }}>Total</span>
          <span className="font-mono font-bold text-lg" style={{ color: t.text }}>{formatRupee(total)}</span>
        </div>

        <a
          href={lines.length ? waLink : undefined}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 rounded-2xl font-bold font-body text-white flex items-center justify-center gap-2 transition-transform active:scale-95 shrink-0"
          style={{ backgroundColor: accentHex, opacity: lines.length ? 1 : 0.5, pointerEvents: lines.length ? 'auto' : 'none' }}
        >
          <MessageCircle size={18} />
          Order via WhatsApp
        </a>
      </div>
    </div>
  );
}

/* ------------------------------------ Confetti -------------------------------- */

function Confetti({ pieces }) {
  if (!pieces || pieces.length === 0) return null;
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 90 }}>
      {pieces.map(p => (
        <div
          key={p.id}
          className="absolute anim-confetti"
          style={{
            left: `${p.left}%`,
            top: '-10px',
            width: p.size,
            height: p.size * 0.4,
            backgroundColor: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

/* ------------------------------------ Bottom nav ------------------------------- */

function BottomNav({ activeTab, setActiveTab, dark, accentHex }) {
  const t = theme(dark);
  const tabs = [
    { id: 'menu', label: 'Menu', icon: Utensils },
    { id: 'rewards', label: 'Rewards', icon: Gift },
    { id: 'admin', label: 'Owner', icon: Settings },
  ];
  return (
    <div className="flex items-stretch shrink-0" style={{ backgroundColor: t.card, borderTop: `1px solid ${t.border}` }}>
      {tabs.map(tabDef => {
        const active = activeTab === tabDef.id;
        const TabIcon = tabDef.icon;
        return (
          <button key={tabDef.id} onClick={() => setActiveTab(tabDef.id)} className="flex-1 flex flex-col items-center gap-1 py-2.5">
            <TabIcon size={20} strokeWidth={active ? 2.4 : 1.8} style={{ color: active ? accentHex : t.textMuted }} />
            <span className="font-semibold font-body" style={{ color: active ? accentHex : t.textMuted, fontSize: '11px' }}>
              {tabDef.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------- App ----------------------------------- */

export default function RestaurantLoyaltyApp() {
  const [restaurant, setRestaurant] = useState(RESTAURANT_DEFAULTS);
  const [dark, setDark] = useState(false);
  const [activeTab, setActiveTab] = useState('menu');
  const [cart, setCart] = useState({});
  const [stamps, setStamps] = useState(5);
  const [visitHistory, setVisitHistory] = useState([
    'Jun 14, 2026 · 7:42 PM',
    'Jun 21, 2026 · 8:10 PM',
    'Jun 29, 2026 · 1:15 PM',
    'Jul 3, 2026 · 8:55 PM',
    'Jul 6, 2026 · 7:20 PM',
  ]);
  const [justAddedIndex, setJustAddedIndex] = useState(-1);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showOrderSheet, setShowOrderSheet] = useState(false);
  const [toast, setToast] = useState(null);
  const [confettiPieces, setConfettiPieces] = useState([]);
  const [scrollY, setScrollY] = useState(0);

  const toastTimeoutRef = useRef(null);
  const confettiTimeoutRef = useRef(null);
  const justAddedTimeoutRef = useRef(null);
  const contentRef = useRef(null);

  const t = theme(dark);
  const accent = ACCENTS.find(a => a.id === restaurant.accent) || ACCENTS[0];
  const accentHex = accent.hex;

  const isOpenNow = (() => {
    const h = new Date().getHours();
    return h >= 11 && h < 23;
  })();

  useEffect(() => {
    if (contentRef.current) contentRef.current.scrollTop = 0;
    setScrollY(0);
  }, [activeTab]);

  useEffect(() => {
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
      if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
      if (justAddedTimeoutRef.current) clearTimeout(justAddedTimeoutRef.current);
    };
  }, []);

  function showToast(message, icon) {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ message, icon });
    toastTimeoutRef.current = setTimeout(() => setToast(null), 2600);
  }

  function triggerConfetti() {
    const colors = ACCENTS.map(a => a.hex);
    const pieces = Array.from({ length: 46 }).map((_, i) => ({
      id: `${Date.now()}-${i}`,
      left: Math.random() * 100,
      size: 6 + Math.random() * 6,
      color: colors[i % colors.length],
      duration: 2 + Math.random() * 1.4,
      delay: Math.random() * 0.4,
    }));
    setConfettiPieces(pieces);
    if (confettiTimeoutRef.current) clearTimeout(confettiTimeoutRef.current);
    confettiTimeoutRef.current = setTimeout(() => setConfettiPieces([]), 3200);
  }

  function updateRestaurant(patch) {
    setRestaurant(r => ({ ...r, ...patch }));
  }

  function handleAdd(id) {
    setCart(c => ({ ...c, [id]: (c[id] || 0) + 1 }));
  }
  function handleRemove(id) {
    setCart(c => {
      const next = { ...c };
      if (!next[id]) return next;
      next[id] -= 1;
      if (next[id] <= 0) delete next[id];
      return next;
    });
  }

  function handleVerified() {
    setShowVerifyModal(false);
    const newCount = Math.min(stamps + 1, restaurant.visitsRequired);
    const addedIdx = newCount - 1;
    setJustAddedIndex(addedIdx);
    setStamps(newCount);

    if (justAddedTimeoutRef.current) clearTimeout(justAddedTimeoutRef.current);
    justAddedTimeoutRef.current = setTimeout(() => {
      setJustAddedIndex(prev => (prev === addedIdx ? -1 : prev));
    }, 1400);

    const now = new Date();
    const stamp = now.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }) + ' · ' + now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit' });
    setVisitHistory(h => [...h, stamp]);

    if (newCount >= restaurant.visitsRequired) {
      setTimeout(() => {
        triggerConfetti();
        setShowRewardModal(true);
      }, 350);
    } else {
      showToast(`Stamp added — ${newCount} of ${restaurant.visitsRequired} visits`, Check);
    }
  }

  function handleClaimReward() {
    setShowRewardModal(false);
    setStamps(0);
    setJustAddedIndex(-1);
    showToast('Reward claimed — new card started', Sparkles);
  }

  function handleShare() {
    const shareText = `Check out ${restaurant.name}'s menu!`;
    if (typeof navigator !== 'undefined' && navigator.share) {
      navigator.share({ title: restaurant.name, text: shareText }).catch(() => {});
    } else if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(shareText)
        .then(() => showToast('Menu link copied!', Copy))
        .catch(() => showToast('Menu link copied!', Copy));
    } else {
      showToast('Menu link copied!', Copy);
    }
  }

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const cartTotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const mi = MENU_ITEMS.find(m => m.id === Number(id));
    return sum + (mi ? (mi.offerPrice || mi.price) * qty : 0);
  }, 0);

  return (
    <div className="min-h-screen w-full flex justify-center font-body" style={{ backgroundColor: dark ? '#12100D' : '#E9E2D0' }}>
      <style>{GLOBAL_STYLES}</style>
      <div className="relative w-full sm:max-w-md flex flex-col h-screen overflow-hidden sm:shadow-2xl" style={{ backgroundColor: t.bg, color: t.text }}>
        <ToastPill toast={toast} dark={dark} />

        <div ref={contentRef} onScroll={e => setScrollY(e.currentTarget.scrollTop)} className="flex-1 overflow-y-auto overscroll-contain">
          <div key={activeTab} className="anim-fade-up">
            {activeTab === 'menu' && (
              <MenuScreen
                restaurant={restaurant}
                dark={dark}
                accentHex={accentHex}
                cart={cart}
                onAdd={handleAdd}
                onRemove={handleRemove}
                scrollY={scrollY}
                isOpenNow={isOpenNow}
                onShare={handleShare}
              />
            )}
            {activeTab === 'rewards' && (
              <RewardsScreen
                restaurant={restaurant}
                dark={dark}
                accentHex={accentHex}
                stamps={stamps}
                visitHistory={visitHistory}
                onOpenVerify={() => setShowVerifyModal(true)}
                justAddedIndex={justAddedIndex}
              />
            )}
            {activeTab === 'admin' && (
              <AdminScreen restaurant={restaurant} dark={dark} accentHex={accentHex} onUpdate={updateRestaurant} onToggleDark={() => setDark(d => !d)} />
            )}
          </div>
        </div>

        {cartCount > 0 && activeTab === 'menu' && (
          <button
            onClick={() => setShowOrderSheet(true)}
            className="mx-4 mb-3 rounded-2xl px-4 py-3 flex items-center justify-between shrink-0 shadow-lg anim-scale-in"
            style={{ backgroundColor: accentHex }}
          >
            <span className="flex items-center gap-2 text-white font-bold font-body text-sm">
              <ShoppingBag size={16} />
              {cartCount} item{cartCount > 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1 text-white font-bold font-mono text-sm">
              {formatRupee(cartTotal)}
              <ChevronRight size={16} />
            </span>
          </button>
        )}

        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} dark={dark} accentHex={accentHex} />

        <VerifyVisitModal
          open={showVerifyModal}
          onClose={() => setShowVerifyModal(false)}
          onVerified={handleVerified}
          correctCode={restaurant.verificationCode}
          dark={dark}
          accentHex={accentHex}
        />
        <RewardUnlockedModal open={showRewardModal} onClaim={handleClaimReward} restaurant={restaurant} dark={dark} accentHex={accentHex} />
        <OrderSheet open={showOrderSheet} onClose={() => setShowOrderSheet(false)} cart={cart} dark={dark} accentHex={accentHex} restaurant={restaurant} />
        <Confetti pieces={confettiPieces} />
      </div>
    </div>
  );
}
