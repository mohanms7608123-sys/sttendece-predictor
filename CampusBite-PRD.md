# CampusBite — Product Requirements Document (PRD)

**Version:** 1.0
**Date:** September 28, 2026
**Status:** Prototype Complete / Demo-Ready
**Live URLs:**
- Preview: https://id-preview--7ad57319-8529-4f19-8ad1-2d372b0ff0ab.lovable.app
- Published: https://campusbite.lovable.app

---

## 1. Executive Summary

CampusBite is a web-based SaaS platform for **college canteen pre-ordering and queue management**. It solves a real, measurable problem: college students get only a ~30-minute lunch break, and most of it is wasted standing in canteen queues. CampusBite lets students **pre-order food, pay online, and pick up their meal with a token number** — no queue, no cash, no waiting.

The system serves three user roles — **Students**, **Canteen Owners**, and **Admins** — each with a dedicated interface. It is built mobile-first (the majority of users are students on Android phones on campus Wi-Fi or mobile data) and is installable as a PWA, so it behaves like a native app without app-store distribution.

---

## 2. Problem Statement

| Problem | Impact |
|---|---|
| 30-minute lunch breaks, 15+ minutes spent in queue | Students skip meals or eat late |
| Cash-only payments at the counter | Slow transactions, change hassles |
| No visibility into order status | Students crowd the counter asking "is it ready?" |
| Canteen staff overwhelmed during peak hours | Order errors, wrong items, missed orders |
| Fake/prank orders placed by non-students | Wasted food and revenue loss |
| No data on what sells | Canteen cannot plan inventory or staffing |

---

## 3. Goals & Success Metrics

**Goals:**
1. Reduce average pickup wait time from ~15 min to under 2 min.
2. Move 100% of transactions to cashless (UPI/Razorpay).
3. Eliminate fake orders via USN-verified student accounts.
4. Give canteen owners a live order queue with one-tap status updates.
5. Give college management audit trails and analytics.

**Success Metrics:**
- Orders per day, peak-hour throughput
- Average time from "placed" to "collected"
- Payment success rate
- Percentage of orders picked up within slot
- Daily active student users

---

## 4. User Roles & Personas

### 4.1 Student (Primary User)
- Android phone, mobile data or campus Wi-Fi, one-hand usage
- Signs up with email, password, name, **phone number**, and **USN** (University Seat Number — prevents fake orders)
- Browses menu, adds to cart, picks a time slot, pays online, gets a token number + QR code
- Receives SMS + Email + Push notifications when order status changes
- Can download a PDF receipt after payment
- Can rate menu items (1–5 stars)

### 4.2 Canteen Owner (Staff)
- Uses a tablet or phone at the counter
- Sees a **live order queue** (auto-refresh every 10s + real-time subscription)
- Updates order status with one tap: Placed → Accepted → Preparing → Ready → Collected
- Every status change triggers notifications to the student automatically

### 4.3 Admin (College Management / Platform Owner)
- Full dashboard: manage menu items (including photo uploads), time slots, user roles
- Views audit logs (security events, payment attempts) with filtering and search
- Manages system settings

---

## 5. System Architecture

### 5.1 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + TypeScript + Vite 5 |
| Styling | Tailwind CSS v3 + shadcn/ui components |
| Animations | Framer Motion (page transitions) |
| State / Data | TanStack React Query + React Context API |
| Routing | React Router v6 |
| Backend | Lovable Cloud (Supabase): Postgres DB, Auth, Storage, Edge Functions |
| Payments | Razorpay (UPI, cards, netbanking) |
| SMS | Twilio |
| Email | Resend |
| Push | Web Push API (VAPID) |
| PDF Receipts | jsPDF (client-side) |
| Hosting | Lovable (free-tier friendly; portable to Vercel/Netlify) |

### 5.2 Architecture Diagram

```text
┌─────────────────────────────────────────────────────────┐
│                     CLIENT (PWA)                         │
│  React SPA — Discovery / Checkout / Admin layouts        │
│  Service Worker (offline shell + push notifications)     │
└──────────────┬──────────────────────────────────────────┘
               │ HTTPS
┌──────────────▼──────────────────────────────────────────┐
│                  LOVABLE CLOUD                           │
│  ┌────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ Postgres DB │  │ Auth (email) │  │ Storage bucket  │  │
│  │ + RLS       │  │ + roles      │  │ (menu images)   │  │
│  └────────────┘  └──────────────┘  └─────────────────┘  │
│  ┌──────────────────────────────────────────────────┐   │
│  │ Edge Functions (Deno)                             │   │
│  │  create-razorpay-order │ verify-payment           │   │
│  │  send-sms-notification │ send-email-notification  │   │
│  │  send-push-notification                           │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────┬───────────────┬──────────────┬───────────┘
               │               │              │
        ┌──────▼─────┐  ┌──────▼─────┐  ┌─────▼──────┐
        │  Razorpay  │  │   Twilio   │  │   Resend   │
        │  (payments)│  │   (SMS)    │  │  (email)   │
        └────────────┘  └────────────┘  └────────────┘
```

---

## 6. Design System

### 6.1 Brand
- **Primary accent:** Warm orange (CampusBite brand, `#f97316` family)
- **Background:** Clean white / soft grays
- **Success:** Green accents
- **Feel:** Swiggy/Zomato-level mobile experience — clean, high contrast, no clutter, functional over fancy

### 6.2 Context-Based Layouts (Core Architectural Rule)

The app does **NOT** use one global layout. It is split into three context layouts:

| Layout | Used For | Structure |
|---|---|---|
| **DiscoveryLayout** | Food browsing (Menu, Home, Orders, Profile) | Card grids: 1 col mobile → 2 col tablet → 3 col desktop; bottom nav on mobile, top nav on desktop |
| **CheckoutLayout** | Cart, Order Details, payment flow | Focused narrow container (~560px max-width), minimal header with back/close, no discovery navigation |
| **AdminLayout** | Admin & canteen management | Dense tables, sidebar/top navigation, data-first |

### 6.3 Responsive Rules
- **Small mobiles (5–6")**: single column, bottom nav, large touch targets (min 44px), one-hand reachable actions
- **Large mobiles (6–7")**: same as small, more breathing room
- **Tablets (8–11")**: 2-column grids, bottom nav persists
- **Laptops/desktops (13–16+")**: 3-column centered grids, desktop top navigation (DesktopNav), no stretched full-width text blocks
- **No horizontal scrolling on any device. Ever.**

### 6.4 Navigation
- **Mobile:** Bottom navigation bar (Home/Menu, Orders, Cart badge, Profile) — thumb-reachable
- **Desktop (md+):** Top navigation bar with links, cart badge, profile dropdown
- **Transitions:** Framer Motion fade/slide page transitions for native-app feel

---

## 7. Database Schema

### 7.1 Tables

**profiles** — user-facing profile data
- `id` (uuid PK), `user_id` (→ auth.users), `name`, `phone`, `usn`, `created_at`, `updated_at`

**user_roles** — role-based access (separate table per security best practice)
- `id`, `user_id`, `role` (enum: `student` | `canteen_owner` | `admin`)

**menu_items** — canteen menu
- `id`, `name`, `price` (numeric), `image_url`, `prep_time` (minutes), `is_available`, `category`, `created_at`

**time_slots** — pickup windows with capacity
- `id`, `start_time`, `end_time`, `max_orders`, `current_orders`, `is_active`, `slot_date`

**orders** — the core entity
- `id`, `user_id`, `token_number` (daily auto-increment), `time_slot_id`, `total_amount`, `status` (enum), `notes`, `created_at`, `updated_at`
- Status flow: `placed → accepted → preparing → ready → collected` (or `cancelled`)

**order_items** — line items per order
- `id`, `order_id`, `menu_item_id`, `quantity`, `price_at_time` (price frozen at order time)

**payments** — Razorpay payment records
- `id`, `order_id`, `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `amount`, `currency` (INR), `status`

**ratings** — 5-star menu item ratings
- `id`, `user_id`, `menu_item_id`, `rating` (1–5), `created_at`, `updated_at`

**push_subscriptions** — Web Push endpoints
- `id`, `user_id`, `endpoint`, `p256dh`, `auth`

**sms_notifications** — SMS delivery log
- `id`, `order_id`, `phone`, `message`, `status`, `twilio_sid`

**audit_logs** — security & payment event trail
- `id`, `event_type`, `user_id`, `resource_type`, `resource_id`, `action`, `status`, `ip_address`, `user_agent`, `metadata` (jsonb)

**system_settings** — key-value config (daily token counter, reset date)

**rate_limits** — API rate limiting windows
- `id`, `identifier`, `endpoint`, `request_count`, `window_start`

### 7.2 Database Functions
- `get_next_token()` — daily-resetting token number generator (resets to 1 each day)
- `has_role(user_id, role)` — security-definer role check (avoids RLS recursion)
- `get_user_role(user_id)` — role lookup with access control
- `handle_new_user()` — trigger: creates profile + student role on signup, sanitizes name/phone/USN
- `check_rate_limit(identifier, endpoint, max, window)` — sliding-window rate limiter
- `update_updated_at_column()` — timestamp trigger

### 7.3 Row-Level Security (RLS)
Every table has RLS enabled. Key policies:
- Students: view menu/slots (public), CRUD own orders/items/payments/ratings, view own profile/role
- Canteen owners: view all orders/order items/payments, update order status
- Admins: full access to everything including audit logs, settings, roles
- Rate limits table: service role only

---

## 8. Edge Functions (Server Logic)

All 5 functions include: **Zod input validation**, **JWT authentication**, **rate limiting**, **audit logging**, **sanitized error messages** (no info leakage), and **CORS headers**.

| Function | Purpose | Rate Limit |
|---|---|---|
| `create-razorpay-order` | Creates a Razorpay order server-side for a given order + amount | 10/min |
| `verify-payment` | Verifies Razorpay signature (HMAC), marks payment paid | 10/min |
| `send-sms-notification` | Sends order-status SMS via Twilio | 20/min |
| `send-email-notification` | Sends styled HTML order emails via Resend | 20/min |
| `send-push-notification` | Sends Web Push via VAPID to subscribed devices | 30/min |

---

## 9. Core User Flows

### 9.1 Student Signup & Login
```text
Open app → Auth page → Sign Up
  → Enter: name, email, password, phone, USN
  → handle_new_user() trigger creates profile + student role
  → Sign in → redirected to /menu
```
USN collection at signup is the anti-fraud measure: only real students with a valid University Seat Number can order.

### 9.2 Order Placement (The Money Flow)
```text
Browse Menu (DiscoveryLayout, card grid)
  → Tap item → Add to cart (CartContext)
  → Sticky cart bar shows total + item count
  → Cart page (CheckoutLayout, focused 560px)
  → Pick time slot (capacity-checked: current_orders < max_orders)
  → Add notes (optional) → Place Order
  → DB: get_next_token() → insert order + order_items
  → Razorpay checkout opens (UPI/card/netbanking)
  → Payment success → verify-payment edge function (signature check)
  → Confirmation screen: Token Number + QR code
  → PDF receipt downloadable
```

### 9.3 Order Fulfillment (Canteen Side)
```text
Canteen dashboard (live queue, 10s refresh + realtime)
  → New order appears with token number, items, slot
  → Tap: Accept → Preparing → Ready
  → Each tap fires: SMS (Twilio) + Email (Resend) + Push (Web Push)
  → Student arrives, shows token/QR → mark Collected
```

### 9.4 Order Tracking (Student Side)
```text
Orders page → live status per order
  → Order Details page: token number, QR code, status timeline
  → Push notification even if app is closed (service worker)
  → Rate items 1–5 stars after collection
```

### 9.5 Admin Operations
```text
Admin dashboard → stats overview
  → /admin/menu: CRUD menu items + photo upload (storage bucket)
  → /admin/slots: manage time slots & capacity
  → /admin/audit-logs: security events & payment attempts,
    filter by event type/status, free-text search
```

---

## 10. Page Inventory

| Route | Page | Layout | Access |
|---|---|---|---|
| `/` | Index (landing/home) | Discovery | Public (students → /menu) |
| `/auth` | Login / Signup (USN + phone) | Standalone | Public |
| `/menu` | Menu browsing, search, categories, ratings | Discovery | All |
| `/cart` | Cart, slot picker, place order, pay | Checkout | Student |
| `/orders` | Order history + live status | Discovery | Student |
| `/order/:orderId` | Token, QR, timeline, receipt PDF | Checkout | Student (own) |
| `/profile` | Profile, notification toggle, sign out | Discovery | Student |
| `/canteen` | Live order queue, status updates | Admin | Canteen owner |
| `/admin` | Admin dashboard | Admin | Admin |
| `/admin/menu` | Menu CRUD + image upload | Admin | Admin |
| `/admin/slots` | Time slot management | Admin | Admin |
| `/admin/audit-logs` | Security/payment audit viewer | Admin | Admin |

---

## 11. Notification Matrix

| Event | SMS | Email | Push |
|---|---|---|---|
| Order accepted | ✅ | ✅ | ✅ |
| Order preparing | ✅ | ✅ | ✅ |
| Order ready | ✅ | ✅ | ✅ |
| Order cancelled | ✅ | ✅ | ✅ |
| Payment success | — | ✅ (receipt) | — |

Students opt into push notifications from the Orders page; subscriptions are stored per-device in `push_subscriptions`.

---

## 12. Security Implementation

1. **Authentication:** Email/password via Lovable Cloud Auth; JWT validated in every edge function
2. **Authorization:** Roles in separate `user_roles` table; `has_role()` security-definer function; RLS on every table
3. **Anti-fraud:** USN required at signup; phone number collected for SMS
4. **Payment security:** Razorpay signature verification (HMAC-SHA256) server-side; amounts verified against order totals
5. **Rate limiting:** Per-endpoint sliding-window limits (5–50 req/min) via `check_rate_limit()`
6. **Audit logging:** Payment attempts, unauthorized access, and notification events logged with IP + user agent
7. **Input validation:** Zod schemas on all edge function inputs; trigger-level sanitization of profile fields
8. **Error handling:** Sanitized error messages — no internal details leaked to clients
9. **Secrets:** All keys (Razorpay, Twilio, Resend, VAPID) stored as backend secrets, never in client code
10. **Security scanning:** Regular scans; all error-level findings resolved (React 18 XSS CVE assessed as unexploitable — only static routes and DB UUIDs in hrefs)

---

## 13. PWA (Mobile App Without App Store)

- `manifest.json` + app icons (192/512) + apple-touch-icon
- Service worker (`sw.js`): app-shell caching + push event handling
- Installable on Android (Chrome → "Add to Home Screen") — icon, splash, standalone window
- Push notifications work even when the app is closed

**Note on React Native:** the current stack is React + Vite (web). React Native is a different framework and not supported here. The recommended path to "mobile app" is this PWA (zero app-store friction) or Capacitor wrapping for store distribution later.

---

## 14. Hardware & Software Requirements

**Student device:** Any Android 8+ / iOS 14+ smartphone, Chrome 80+, 3G minimum (4G/campus Wi-Fi recommended), ~5 MB app footprint
**Canteen device:** Any tablet/phone/laptop with a modern browser
**Admin device:** Any laptop/desktop browser
**Server side:** Fully managed (Lovable Cloud) — no servers to maintain
**Free-tier friendly:** Portable to Vercel/Netlify hosting

---

## 15. What's Built vs. What's Next

### ✅ Completed (this prototype)
- Full auth with USN + phone collection
- Menu browsing with categories, search, images, ratings
- Cart + time-slot booking with capacity limits
- Razorpay/UPI online payment with server-side verification
- Daily token numbers + QR pickup codes
- Live canteen queue with one-tap status flow
- SMS (Twilio) + Email (Resend) + Push (Web Push) notifications
- PDF receipt generation
- 5-star item ratings
- Admin panel: menu CRUD with photo upload, slots, audit log viewer
- Rate limiting, audit logging, Zod validation, RLS security
- Mobile-first PWA with bottom nav, desktop top nav, page transitions
- Context-based layout system (Discovery / Checkout / Admin)

### 🔜 Recommended Next (Priority Order)
1. **Forgot/reset password flow** (currently missing — critical)
2. Email verification flow
3. Student order cancellation (within a time window)
4. QR pickup verification scan on canteen side
5. Order analytics dashboard (sales, peak hours, popular items)
6. Dietary filters (veg/non-veg/jain), allergen info
7. Promo codes & loyalty program
8. Multi-canteen support (scale to whole campus)
9. Inventory management (auto-mark items unavailable)
10. Predictive prep times + AI recommendations

---

## 16. Demo Script (For Pitching to Canteen Owners / Management)

1. **Student side (phone):** Sign up with USN → browse menu → add 2 items → pick 12:30 slot → pay via UPI → show token #7 + QR
2. **Canteen side (tablet):** Order pops up live → tap Accept → Preparing → Ready
3. **Student side:** Push notification arrives: "Your order is ready!" → show token → collect
4. **Admin side:** Show audit log of the payment, menu photo upload, slot capacity management
5. **Closer:** "Zero queues, zero cash, zero fake orders — and full data for the college."

---

*End of PRD — CampusBite v1.0*
