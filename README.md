# FixnRent — Premium Furniture Rentals

> A fully client-side furniture rental platform built with vanilla HTML, CSS, and JavaScript. Browse designer pieces, manage rentals, and track your account — all without a backend.

![FixnRent Hero](https://img.shields.io/badge/Status-Active-brightgreen) ![HTML](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white) ![CSS](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white) ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black) ![No Dependencies](https://img.shields.io/badge/Dependencies-None-blue)

---

## ✨ Features

- **Product Catalog** — 12 designer furniture pieces with SVG illustrations, category filters, search, and sort
- **Rental Flow** — Daily / weekly / monthly pricing tiers with a custom day-range slider and live cost breakdown
- **Auth System** — Client-side register & login with localStorage persistence (no backend required)
- **User Dashboard** — Slide-in panel with active rentals, rental history, and profile editing
- **Notifications** — Bell dropdown with unread badges; auto-alerts for rentals ending within 3 days or expired
- **Wishlist** — Persistent favourite items stored in localStorage
- **Toast System** — Animated toast notifications (success / error / info / warn)
- **Scroll Animations** — IntersectionObserver-powered reveal effects
- **Fully Responsive** — Mobile-first with hamburger nav, collapsing hero, and adaptive grids
- **Zero Dependencies** — No frameworks, no libraries, no build step

---

## 📁 Project Structure

```
FixnRent/
├── index.html              # Main HTML document
├── assets/
│   ├── css/
│   │   └── styles.css      # All styles (variables, layout, components, responsive)
│   └── js/
│       └── main.js         # All application logic
└── README.md
```

---

## 🚀 Getting Started

### Option 1 — Open Directly
Just open `index.html` in any modern browser. No server needed.

```bash
# macOS
open index.html

# Linux
xdg-open index.html

# Windows
start index.html
```

### Option 2 — Local Dev Server (recommended for smooth reload)

```bash
# Using Python
python3 -m http.server 3000

# Using Node.js (npx)
npx serve .

# Using VS Code Live Server extension
# Right-click index.html → "Open with Live Server"
```

Then visit `http://localhost:3000`.

---

## 🎨 Design System

### Color Palette

| Token | Value | Usage |
|---|---|---|
| `--terra` | `#FF8C42` | Primary accent, CTAs, highlights |
| `--terra2` | `#5DADE2` | Secondary accent, success states |
| `--ink2` | `#1F3A5F` | Navy — nav, hero, section backgrounds |
| `--ink3` | `#555f6e` | Muted text, labels |
| `--paper` | `#FFFFFF` | Card backgrounds |
| `--border` | `rgba(31,58,95,.12)` | Subtle borders |

### Typography

| Font | Weight | Use |
|---|---|---|
| **Fraunces** (serif) | 300–500 | Headings, prices, display text |
| **Syne** (sans-serif) | 400–700 | Body text, UI labels, buttons |
| **DM Mono** (monospace) | 300–400 | Order IDs, step numbers |

### Breakpoints

| Breakpoint | Width | Changes |
|---|---|---|
| Desktop | > 1100px | Full layout |
| Tablet | ≤ 960px | Hidden nav links, hamburger, stacked hero |
| Mobile | ≤ 640px | Single-column everything, hidden hero illustration |
| Small | ≤ 420px | Single-column product grid |

---

## 🔧 Technical Notes

### Data Persistence
All data lives in `localStorage` under these keys:

| Key | Content |
|---|---|
| `fixnrent_users` | Array of registered user objects |
| `fixnrent_user` | Currently logged-in user session |
| `fixnrent_rentals_<userId>` | Array of rental records per user |
| `fixnrent_notifs_<userId>` | Notification array per user |
| `fixnrent_wish` | Wishlisted item IDs (global) |

### Security Note
Passwords are stored in plain text in `localStorage` — this is intentional for a **demo/prototype** only. For production, implement a proper backend with hashed passwords and JWT sessions.

### Product Data
All 12 furniture items are defined in the `ITEMS` array at the top of `main.js`. Each item has:

```js
{
  id, name, cat,        // identity
  desc, style, em,      // display metadata
  daily, weekly, monthly, // pricing tiers (₹)
  clr                   // hex color for procedural SVG illustration
}
```

SVG illustrations are generated procedurally by the `miniSVG()` function — no image files needed.

### Key Functions

| Function | File | Purpose |
|---|---|---|
| `renderProducts()` | main.js | Filter + sort + render catalog grid |
| `rentClick(id)` | main.js | Open rent modal for an item |
| `confirmRent()` | main.js | Save rental to localStorage |
| `renderNav()` | main.js | Update navbar (logged-in vs guest) |
| `checkExpirations()` | main.js | Auto-expire rentals, trigger notifications |
| `toast(type, title, msg)` | main.js | Show animated toast notification |
| `miniSVG(item)` | main.js | Generate SVG furniture illustration |

---

## 📦 Deployment

Since this is a fully static site, it can be deployed anywhere:

### GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<user>/fixnrent.git
git push -u origin main
# Enable Pages in repo Settings → Pages → Branch: main / root
```

### Netlify
```bash
# Drag and drop the FixnRent/ folder onto netlify.com/drop
```

### Vercel
```bash
npx vercel
```

---

## 🗺️ Roadmap / Potential Enhancements

- [ ] Backend integration (Node.js / Supabase) with real auth
- [ ] Payment gateway (Razorpay / Stripe)
- [ ] Product detail modal / dedicated product pages
- [ ] Admin dashboard for inventory management
- [ ] Email notifications for rental reminders
- [ ] PWA support (service worker + manifest)
- [ ] Dark mode toggle

---

## 📄 License

MIT — free to use, modify, and distribute.

---

> Built with ♥ using pure HTML, CSS & JavaScript — no frameworks harmed.
