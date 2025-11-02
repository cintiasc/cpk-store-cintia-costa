# Cupcake Store E-Commerce Design Guidelines

## Design Approach

**Selected Approach**: Reference-Based (E-commerce Category)
Drawing inspiration from Shopify's clean product presentation, Etsy's warm community feel, and specialty food e-commerce sites that prioritize appetizing product photography.

**Core Principle**: Create an inviting, trustworthy shopping experience that makes cupcakes irresistible while maintaining professional e-commerce functionality across three distinct user roles.

---

## Typography System

**Font Families**:
- Primary (Headings): Playfair Display or Cormorant - elegant serif that conveys premium bakery quality
- Secondary (UI/Body): Inter or DM Sans - clean, highly readable sans-serif for interface elements and descriptions

**Hierarchy**:
- Hero Headlines: text-5xl to text-7xl, font-semibold
- Section Headers: text-3xl to text-4xl, font-semibold
- Product Names: text-xl to text-2xl, font-medium
- Prices: text-2xl to text-3xl, font-bold (prominent display)
- Body Text: text-base, font-normal, leading-relaxed
- Captions/Metadata: text-sm, font-medium
- Buttons: text-base, font-semibold, tracking-wide

---

## Layout & Spacing System

**Tailwind Spacing Primitives**: Consistently use units of 2, 4, 6, 8, 12, 16, 20, 24
- Tight spacing (between related elements): p-2, gap-2
- Standard spacing (components): p-4, p-6, gap-4
- Section padding: py-12, py-16, py-20
- Large gaps (between sections): gap-8, gap-12

**Grid Systems**:
- Product Grid: grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6
- Dashboard Cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6
- Form Layouts: Single column max-w-2xl for focus

**Container Strategy**:
- Max width for content: max-w-7xl mx-auto
- Product detail pages: max-w-6xl
- Forms and checkout: max-w-3xl
- Full-width for hero and featured sections

---

## Component Library

### Navigation (All Roles)
**Main Header** (sticky top-0):
- Logo (left): Text-based or cupcake icon + "Cupcake Store"
- Center navigation (desktop): Product categories, About, Contact
- Right section: Search icon, Cart icon with badge, User avatar/menu
- Mobile: Hamburger menu with slide-out drawer
- Height: h-16 to h-20
- Add subtle shadow on scroll: shadow-md

### Hero Section (Homepage - Clients)
**Layout**: Full viewport section (min-h-screen) with background image
- Large hero image: Professional cupcake photography, slightly darkened overlay
- Content positioning: Centered or left-aligned within max-w-4xl
- Headline: Compelling value proposition (e.g., "Handcrafted Cupcakes, Delivered Fresh")
- Subheadline: Supporting text about quality/uniqueness
- Primary CTA button with blur backdrop (backdrop-blur-md bg-white/90)
- Secondary button or trust indicator below
- Spacing: py-20 to py-32

### Product Cards (Client View)
**Structure**:
- Card container: Rounded corners (rounded-xl), subtle shadow (shadow-sm hover:shadow-lg transition)
- Product image: aspect-square, object-cover, rounded-t-xl
- Badge overlay: "New" or "Popular" positioned top-right with p-2
- Content area: p-4 to p-6
  - Product name: text-lg font-semibold
  - Short description: text-sm, line-clamp-2
  - Rating display: Star icons + average score + review count
  - Price: text-2xl font-bold
  - Add to cart button: Full-width or prominent placement
- Hover effect: Slight scale transform (hover:scale-105)

### Shopping Cart (Drawer/Sidebar)
**Layout**: Fixed right-side panel, w-full max-w-md
- Header: "Your Cart" + close button, p-6
- Items list: Scrollable area, divide-y
- Each item: flex layout
  - Thumbnail: w-20 h-20, rounded
  - Details: flex-1, pl-4
    - Name + price
    - Quantity controls: - button, count, + button (inline-flex gap-2)
  - Remove icon: top-right
- Footer (sticky bottom): 
  - Subtotal display
  - Checkout button (prominent, full-width)
  - Continue shopping link

### Product Detail Page
**Layout**: Two-column on desktop (grid grid-cols-1 lg:grid-cols-2 gap-12)
- Left column: Image gallery
  - Main image: Large display (aspect-square or 3:4)
  - Thumbnail navigation below (grid-cols-4 gap-2)
- Right column: Product information (space-y-6)
  - Breadcrumb navigation
  - Product name (text-3xl)
  - Rating summary with link to reviews
  - Price display (text-4xl)
  - Product description (prose max-w-none)
  - Quantity selector + Add to cart button
  - Additional details (accordion or tabs)
  - Reviews section below (full-width across both columns)

### Checkout Flow
**Multi-step Process** (Step indicator at top):
- Step 1: Cart review
- Step 2: Shipping information (form with validation)
- Step 3: Payment (form fields)
- Step 4: Order confirmation

**Form Design**:
- Single column layout (max-w-2xl)
- Grouped sections with headings (text-xl font-semibold mb-4)
- Input fields: Full-width, p-3, rounded-lg, border
- Labels: text-sm font-medium mb-2
- Order summary sidebar (sticky on desktop)

### Order History (Client)
**Layout**: 
- Page header with filters (status, date range)
- Order cards (space-y-6):
  - Header row: Order number, date, status badge, total
  - Item list: Grid of thumbnails + names
  - Actions: "View Details", "Repeat Order" (prominent), "Leave Review" buttons
  - Expandable details section

### Review System
**Review Form** (Modal or inline):
- Star rating input (large, interactive stars)
- Textarea for comment (min-h-32)
- Submit button

**Review Display**:
- User name + avatar, date, verified purchase badge
- Star rating (visual display)
- Review text (prose)
- Helpful voting buttons (optional)

### Employee Dashboard
**Layout**: Sidebar navigation + main content area
- Sidebar (w-64, fixed left):
  - Section headers: "Products", "Orders"
  - Navigation items with icons
- Main content: p-8
  - Dashboard cards showing metrics (grid-cols-3)
  - Action buttons prominently placed

**Product Management Table**:
- Table with sortable columns (Image, Name, Price, Stock, Actions)
- Row actions: Edit icon, Delete icon
- "Add New Product" button (top-right, prominent)
- Filters/search above table

**Product Form** (Create/Edit):
- Two-column layout on desktop
- Left: Form fields (name, description, price)
- Right: Image upload area (large drop zone)
- Save button (bottom-right, sticky)

**Order Queue**:
- Kanban-style columns: "Pending", "In Preparation", "Ready for Delivery"
- Order cards with drag-and-drop (or status buttons)
- Each card shows: Order number, customer name, items count, time elapsed
- Quick actions on hover

### Administrator Panel
**User Management**:
- Data table with user information (Name, Email, Role, Registration Date, Actions)
- Role dropdown for each user (inline editing)
- Bulk actions toolbar
- "Create User" button

---

## Images

### Required Images:

1. **Hero Image** (Homepage):
   - Description: Overhead shot of assorted colorful cupcakes on rustic wooden table, professional food photography with natural lighting
   - Placement: Full-width background of hero section
   - Treatment: Slight darkening overlay for text readability

2. **Product Images** (Multiple):
   - Description: Individual cupcake glamour shots, square format, white/neutral background
   - Placement: Product cards, product detail pages
   - Treatment: High-resolution, consistent lighting and styling

3. **Category Images**:
   - Description: Lifestyle shots of cupcakes in various settings (birthday party, wedding, corporate event)
   - Placement: Category sections on homepage
   - Treatment: Rounded corners, medium size (aspect-video)

4. **About/Team Section**:
   - Description: Bakery interior, baking process, or team photos
   - Placement: About page or homepage trust section
   - Treatment: Authentic, behind-the-scenes feel

---

## Key UI Patterns

**Buttons**:
- Primary: Rounded (rounded-lg), medium padding (px-6 py-3), font-semibold
- Secondary: Outlined version with border
- Icon buttons: Square (w-10 h-10), centered icon
- Blur backdrop for buttons on images: backdrop-blur-md bg-white/90

**Form Inputs**:
- Consistent height (h-12), rounded (rounded-lg)
- Focus states with ring
- Error states with border treatment and message below
- Labels always visible above input

**Cards**:
- Rounded corners (rounded-xl to rounded-2xl)
- Subtle shadows (shadow-sm, hover:shadow-md)
- Padding: p-6 for content areas
- White/light backgrounds

**Badges**:
- Small, rounded-full, px-3 py-1
- Use for status indicators, tags, counts

**Modals/Dialogs**:
- Centered overlay with backdrop blur
- Max-width constraints (max-w-2xl)
- Padding: p-6 to p-8
- Close button (top-right)

---

## Responsive Behavior

**Breakpoint Strategy**:
- Mobile-first approach
- Key breakpoints: md (768px), lg (1024px), xl (1280px)
- Product grids: 2→3→4 columns
- Navigation: Hamburger→Full menu
- Sidebars: Overlay→Fixed

**Mobile Optimizations**:
- Larger touch targets (min h-12)
- Sticky CTAs for product pages
- Simplified navigation
- Full-width buttons

---

## Distinctive Design Elements

**Cupcake-Themed Touches**:
- Use cupcake icon/illustration as brand element
- Rounded, soft corners throughout (friendly aesthetic)
- Generous whitespace (airy, premium feel)
- Product photography is hero - everything supports showcasing cupcakes

**Trust Indicators**:
- Customer review counts prominently displayed
- "Secure checkout" badges
- Delivery information clearly visible
- LGPD compliance notice in footer

**Personality**:
- Warm, inviting, but professional
- Emphasis on handcrafted quality
- Visual hierarchy guides users to products quickly
- Clean, uncluttered layouts let cupcakes shine