# 🏥 My Pharmacy & POS Backend (Modular Architecture)

A scalable, enterprise-level modular REST API backend built with **Node.js, Express.js, Prisma ORM, and PostgreSQL**.

---

## 📁 Modular Project Structure

The project strictly follows a **Feature-Based / Role-Based Modular Pattern** where each feature is isolated with its own Controller, Route, Service (Database / Business Logic), and Validation layer:

```
backend/
├── .env                     # Production/Dev environment variables
├── .env.example             # Template for environment configuration
├── package.json             # Express, Prisma, JWT, Bcrypt, OpenAI, Nodemailer dependencies
├── postman_collection.json  # Complete Postman / Thunder Client collection for all endpoints
├── README.md                # Documentation & Setup Guide
├── prisma/
│   ├── schema.prisma        # Complete database schema (User, Medicine, Sale, Purchase, etc.)
│   ├── seed.js              # Database seeder (Admin account, Settings, 30+ BD Medicines)
│   └── medicines_bd.json    # Bangladeshi medicine catalog dataset
└── src/
    ├── server.js            # Express server entrypoint (Port 5000)
    ├── config/
    │   ├── db.js            # Prisma client singleton
    │   ├── mailer.js        # Nodemailer SMTP transporter & email templates
    │   └── sslcommerz.js    # SSLCommerz Payment Gateway wrapper
    ├── middlewares/
    │   ├── auth.js          # JWT authentication (Staff, Admin, Customer verification)
    │   └── errorHandler.js  # Global error & 404 handler
    └── modules/
        ├── auth/                        # 🔑 Authentication Module
        │   ├── auth.controller.js       # Request & response handling
        │   ├── auth.route.js            # Express router
        │   ├── auth.service.js          # Business logic & Prisma queries
        │   └── auth.validation.js       # Request payload validations
        ├── otp/                         # 📬 OTP & Password Reset Module
        │   ├── otp.controller.js
        │   ├── otp.route.js
        │   ├── otp.service.js
        │   └── otp.validation.js
        ├── owner/                       # 👑 Business Owner / Admin Modules
        │   ├── owner.routes.js          # Master aggregator for owner routes (/api/owner)
        │   ├── dashboard/               # KPIs, Sales & Profit charts, Daily Ledger
        │   │   ├── dashboard.controller.js
        │   │   ├── dashboard.route.js
        │   │   └── dashboard.service.js
        │   ├── item_management/         # Medicine inventory, low-stock, pricing
        │   │   ├── item.controller.js
        │   │   ├── item.route.js
        │   │   ├── item.service.js
        │   │   └── item.validation.js
        │   ├── sale/                    # POS Counter Billing & stock deductions
        │   │   ├── sale.controller.js
        │   │   ├── sale.route.js
        │   │   ├── sale.service.js
        │   │   └── sale.validation.js
        │   ├── purchase/                # Supplier purchase orders & stock restock
        │   │   ├── purchase.controller.js
        │   │   ├── purchase.route.js
        │   │   ├── purchase.service.js
        │   │   └── purchase.validation.js
        │   ├── customer/                # Customer CRM & Due/Credit collection
        │   │   ├── customer.controller.js
        │   │   ├── customer.route.js
        │   │   ├── customer.service.js
        │   │   └── customer.validation.js
        │   ├── order/                   # Online order approvals & POS synchronization
        │   │   ├── order.controller.js
        │   │   ├── order.route.js
        │   │   └── order.service.js
        │   ├── prescription/            # Prescription order reviews & status update
        │   │   ├── prescription.controller.js
        │   │   ├── prescription.route.js
        │   │   └── prescription.service.js
        │   ├── customer_request/        # Out-of-stock restock demand tracking
        │   │   ├── request.controller.js
        │   │   ├── request.route.js
        │   │   └── request.service.js
        │   └── settings/                # Delivery charge & dynamic discount tiers
        │       ├── settings.controller.js
        │       ├── settings.route.js
        │       └── settings.service.js
        └── user/                        # 👤 Customer & Storefront Modules
            ├── user.routes.js           # Master aggregator for user routes (/api/user)
            ├── item/                    # Public medicine catalog browsing & search
            │   ├── user-item.controller.js
            │   ├── user-item.route.js
            │   └── user-item.service.js
            ├── order/                   # Cart checkout (COD/SSLCommerz), My Orders
            │   ├── user-order.controller.js
            │   ├── user-order.route.js
            │   ├── user-order.service.js
            │   └── user-order.validation.js
            ├── prescription/            # Customer prescription uploads
            │   ├── user-prescription.controller.js
            │   ├── user-prescription.route.js
            │   └── user-prescription.service.js
            ├── request/                 # Wishlist restock requests
            │   ├── user-request.controller.js
            │   ├── user-request.route.js
            │   └── user-request.service.js
            ├── ai_assistant/            # OpenAI GPT-4o OCR transcription & stock lookup
            │   ├── ai-assistant.controller.js
            │   ├── ai-assistant.route.js
            │   └── ai-assistant.service.js
            ├── payment/                 # SSLCommerz IPN, success, fail, cancel callbacks
            │   ├── payment.controller.js
            │   ├── payment.route.js
            │   └── payment.service.js
            └── settings/                # Public storefront delivery fee & discount tiers
                ├── user-settings.controller.js
                ├── user-settings.route.js
                └── user-settings.service.js
```

---

## 📮 Modular API Endpoints Reference

### 1. Auth Module (`/api/auth`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Staff / Admin Login | Public |
| `POST` | `/api/auth/signup` | Staff / Admin Registration | Public |
| `GET` | `/api/auth/profile` | Logged-in profile | Authenticated |
| `PUT` | `/api/auth/profile` | Update profile / password | Authenticated |
| `POST` | `/api/auth/customer/register` | Customer sign up | Public |
| `POST` | `/api/auth/customer/login` | Customer log in | Public |

### 2. OTP & Password Reset Module (`/api/otp`)
| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/otp/forgot-password` | Send 6-digit verification code to email | Public |
| `POST` | `/api/otp/verify-otp` | Verify OTP code & return reset token | Public |
| `POST` | `/api/otp/reset-password` | Reset password using verified token | Public |

### 3. Business Owner / Admin Modules (`/api/owner`)
| Module | Method | Endpoint | Description |
| :--- | :--- | :--- | :--- |
| **Dashboard** | `GET` | `/api/owner/dashboard/summary` | Today sales, profit, stock value, KPIs |
| **Dashboard** | `GET` | `/api/owner/dashboard/charts` | Sales & profit charts (day/month/year) |
| **Dashboard** | `GET` | `/api/owner/dashboard/ledger` | Monthly daily financial ledger |
| **Item** | `GET` | `/api/owner/items` | Full inventory list with search & filters |
| **Item** | `GET` | `/api/owner/items/low-stock` | Low-stock medicines (< 10) |
| **Item** | `POST` | `/api/owner/items` | Add new medicine |
| **Item** | `PUT` | `/api/owner/items/:id` | Update medicine details |
| **Item** | `DELETE`| `/api/owner/items/:id` | Safe delete medicine |
| **POS Sale** | `GET` | `/api/owner/sales` | Sales & billing history |
| **POS Sale** | `POST` | `/api/owner/sales` | Record sale (deducts stock, updates CRM) |
| **Purchase** | `GET` | `/api/owner/purchases` | Supplier purchase invoice list |
| **Purchase** | `POST` | `/api/owner/purchases` | Record purchase (adds stock, updates price)|
| **Customer** | `GET` | `/api/owner/customers` | Customer CRM & credit list |
| **Customer** | `POST` | `/api/owner/customers` | Create new customer |
| **Customer** | `POST` | `/api/owner/customers/:id/pay-due` | Collect customer due payment |
| **Order** | `GET` | `/api/owner/orders` | All online orders (filter by status) |
| **Order** | `GET` | `/api/owner/orders/pending-count`| Pending orders count badge |
| **Order** | `PUT` | `/api/owner/orders/:id/approve` | Approve order (syncs POS sale & stock) |
| **Order** | `PUT` | `/api/owner/orders/:id/reject` | Reject order |
| **Prescription**| `GET` | `/api/owner/prescriptions` | View customer prescriptions |
| **Prescription**| `PUT` | `/api/owner/prescriptions/:id/status`| Update prescription status |
| **Request** | `GET` | `/api/owner/requests` | View restock demand wishlist |
| **Settings** | `GET` | `/api/owner/settings` | Get delivery charges & discount tiers |
| **Settings** | `PUT` | `/api/owner/settings` | Update delivery charge & discount tiers |

### 4. Customer / Storefront Modules (`/api/user`)
| Module | Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- | :--- |
| **Item** | `GET` | `/api/user/items` | Browse medicines, search & categories | Public |
| **Item** | `GET` | `/api/user/items/:id` | Single medicine details | Public |
| **Order** | `POST` | `/api/user/orders` | Checkout cart (COD or SSLCommerz) | Customer |
| **Order** | `GET` | `/api/user/orders/my-orders` | Logged-in customer order history | Customer |
| **Order** | `GET` | `/api/user/orders/stats` | Total orders, total spent, pending | Customer |
| **Prescription**| `POST` | `/api/user/prescriptions` | Upload prescription image | Customer |
| **Prescription**| `GET` | `/api/user/prescriptions/my-prescriptions`| View my prescription orders | Customer |
| **Request** | `POST` | `/api/user/requests` | Request restock for out-of-stock item | Customer |
| **Request** | `DELETE`| `/api/user/requests/:medicineId` | Remove from wishlist | Customer |
| **Request** | `GET` | `/api/user/requests/wishlist` | Get my wishlist item IDs | Customer |
| **AI Assistant**| `POST` | `/api/user/ai-assistant` | AI Prescription OCR & Inventory Search | Optional Auth |
| **AI Assistant**| `GET` | `/api/user/ai-assistant/history`| View AI chat history | Optional Auth |
| **Payment** | `POST` | `/api/user/payment/success` | SSLCommerz success callback | Public |
| **Payment** | `POST` | `/api/user/payment/fail` | SSLCommerz fail callback | Public |
| **Payment** | `POST` | `/api/user/payment/cancel` | SSLCommerz cancel callback | Public |
| **Payment** | `POST` | `/api/user/payment/ipn` | SSLCommerz IPN notification | Public |
| **Settings** | `GET` | `/api/user/settings` | Get delivery fee & discount tiers | Public |

---

## 🚀 How to Run the Backend

```bash
cd d:\Project\my-pharmacy\backend

# 1. Install dependencies
npm install

# 2. Push schema to PostgreSQL database
npm run prisma:push

# 3. Seed database (Admin account, settings, 30+ medicines)
npm run seed

# 4. Start backend in development mode (with hot-reload)
npm run dev
```

Server runs on: **`http://localhost:5000`**
