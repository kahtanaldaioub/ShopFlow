# Shop Flow Website System Analysis

## 1. Executive summary

Shop Flow is a static, multi-page storefront for browsing a product catalog, saving favorites, managing a cart, and recording demo cash-on-delivery orders. Its interface is built with HTML and CSS, while plain JavaScript handles page behavior and browser storage.

The site has no application server or database. Product and exchange-rate information come from external APIs; cart, favorite, theme, and order data stay in the visitor's browser using `localStorage`. The checkout flow demonstrates order entry and stores an order locally, but does not submit it to a seller, payment provider, or delivery service.

## 2. Pages and user-facing features

| Page | Implemented features |
| --- | --- |
| Home (`html/index.html`) | Brand introduction and regional messaging; product and category counts; a small featured selection; products saved as favorites; links into the catalog. |
| Products (`html/products.html`) | Catalog search by product title, category filtering, sorting by default/price/name/rating, and pagination with 12 products per page. |
| Product details (`html/productDetails.html`) | Product image, category, description, USD/SYP prices, rating, quantity selection, add-to-cart action, and favorite toggle. |
| Cart (`html/cart.html`) | Cart item list, quantity editing, item removal, running item total, delivery-fee notice, and a link to checkout. |
| Checkout & orders (`html/checkout.html`) | Delivery contact/address form, cash-on-delivery display, order summary, demo order confirmation, and locally stored previous orders. |

All pages share a header with navigation, a cart item-count indicator, a theme toggle, and a footer that can display exchange-rate status.

## 3. Main user journeys

### Browse and select products

1. The home page or products page requests catalog data.
2. A visitor can search by title, filter by category, sort the results, and move between pages.
3. Selecting a product opens its details page.
4. On the details page, a visitor chooses a positive whole-number quantity, adds the product to the cart, or saves/removes it as a favorite.

### Manage and check out a cart

1. The cart page reads saved cart items, allows quantity updates and removal, and calculates the item subtotal.
2. The checkout page shows the cart summary and asks for name, phone, country, region, city, and street address. Landmark and email are optional.
3. The browser enforces required fields and email format; JavaScript additionally checks that the phone number contains 8–15 digits after removing spaces, parentheses, and hyphens.
4. On confirmation, the page creates an order record in browser storage, clears the cart, and refreshes the summary and order history.

The order is explicitly a demo record: delivery cost is not calculated, availability and the fee are described as being confirmed by phone, and no server or courier is notified.

## 4. Architecture and data flow

### Front end

- Five HTML documents provide separate page entry points.
- `css/style.css` supplies shared layout, components, themes, and responsive rules.
- `js/script.js` contains shared API, formatting, local-storage, theme, cart-count, and product-rendering helpers.
- Page-specific behavior lives in `js/home.js`, `js/products.js`, `js/productDetails.js`, `js/cart.js`, and `js/checkout.js`.
- Each page loads `script.js` before its page-specific JavaScript.

This is a client-side multi-page application rather than a server-rendered or single-page application. No package manifest, build system, or server-side application code is present in the project files reviewed.

### External services

- Product catalog and individual product details: `https://dummyjson.com/products`. The catalog request asks for up to 100 products.
- USD-to-SYP reference rate: `https://open.er-api.com/v6/latest/USD`.

Product results are adapted to the fields used by the UI: ID, title, price, description, category, thumbnail, rating, and a review count derived from the returned reviews array. Prices are displayed in USD with an approximate SYP reference estimate when the rate is available. If the rate request fails, the interface reports that the estimate is unavailable and keeps USD prices visible.

### Browser-persisted state

| Storage key | Purpose |
| --- | --- |
| `shopflow_cart` | Cart product details and quantities. |
| `shopflow_favorites` | Product IDs saved as favorites. |
| `shopflow_orders` | Locally recorded order history, including delivery contact details and purchased items. |
| `shopflow_theme` | Selected `light` or `dark` theme. |

This state is specific to the browser profile and site origin. It is not synchronized across devices or users, and clearing browser data removes it. The orders key contains personal delivery information in local storage.

## 5. Interface, accessibility, and responsive behavior

- The stylesheet defines light and dark color palettes; the chosen theme is persisted.
- Layouts adapt at multiple viewport breakpoints, including 800px, 720px, 520px, 480px, and 600px.
- Product grids become two columns on narrow screens; the checkout layout and form fields collapse to one column at smaller widths.
- Forms use labels, relevant autocomplete attributes, and native required/type validation.
- Buttons, links, and form controls have visible keyboard focus styling. Navigation, product ratings, page controls, and checkout sections include accessible labels or relationships.
- Product and brand artwork is supplied by local SVG assets; catalog product thumbnails are remote.

## 6. Source map

- Shared behavior, API integration, storage, theme, and product-card rendering: `js/script.js`
- Home page: `html/index.html`, `js/home.js`
- Catalog: `html/products.html`, `js/products.js`
- Product details and cart/favorites actions: `html/productDetails.html`, `js/productDetails.js`
- Cart management: `html/cart.html`, `js/cart.js`
- Checkout and order history: `html/checkout.html`, `js/checkout.js`
- Shared visual system and responsive styling: `css/style.css`
- Logo, favicon, and interface icons: `assets/`
