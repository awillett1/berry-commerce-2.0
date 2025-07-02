
# Berry Commerce 2.0
*Senior Capstone Project*
--
This custom-built e-commerce site was created for Berry students, alumni, faculty/staff, and the Rome community to be able to sell, advertise,m and preorder products for the annual Spring Market and Mountain Day market.

**[Demonstration Slideshow](https://docs.google.com/presentation/d/1kKlaIHqmWc7cev9t4mpjaVt8T86_c9YCgtm46fdT1j4/edit?usp=sharing)**

### Overview
-  Post and promote products and services
-   Accept pre-orders before live events
-   Manage orders and listings through seller-specific dashboards
-   Allow admins to approve and moderate product postings and business pages

### Development Tools
- Backend, Hosting, Database
	- Firebase (Blaze Plan)
		- Firebase Hosting
		- Firebase Authentication (email/password)
		- Realtime Database 
		- Cloud Firestore
		- Firebase Mail Extension
- Media Handling
	- Currently, Firebase, I plan on moving to Cloudinary
		- Hosts business logos and product images
- Security and Formatting
	- DOMPurify 
	- Marked - allow markdown in product and seller descriptions

### Main Features
#### Account and Roles
-   Email/password registration and login
-   Roles: Customers (Users), Sellers, Admins
-   Access to certain portions of the website depends on their role
#### Product Listings
-   Sellers can:
    -   Create, edit, and delete product listings
    -   Upload product images and business logos
-   Products appear on:
    -   Main shop page
    -   Custom, auto-generated seller/business pages
-   Admin approval is required for all product listings  
#### Seller Experience
-   Business application and onboarding flow
-   Email notifications for approval/rejection of products
-   Editable, customizable storefront pages
-   Markdown-supported product descriptions
-   Update order status for orders
#### Customer Experience
-   Add products to the cart
-   Preorder products before market events
-   Filter/search products by category or keyword
-   Track order status after submission
#### Admin
-   Approve/reject product listings and business pages
-   View full product/seller info
-   Monitor and manage orders
   
----------

### Emails
-   Triggered on product approval/rejection
-   Seller updates and order confirmations
-   Powered by Firebase Mail Extension and Firestore events

### Milestone Overviews
#### Milestone 1: Account System
-   User authentication (account creation, login, and logout)
-   Role-based access: Customers (Users), Sellers, and Admins
-   Account panel with profile management (change email, password, etc.)
-   Permissions to restrict access to seller/admin-only areas
    

#### Milestone 2: Product Management
-   Sellers can create products with full details and images
-   Products automatically appear on:
    -   Main shop page
    -   Individual seller pages
-   Admin approval is required for product visibility
-   Secure image uploads via image hosting API (e.g., Cloudinary)
-   Business profile pages are automatically generated and managed
    

####  Milestone 3: Orders, Notifications & UX Improvements
-   "Add to Cart" functionality and dynamic order tables
-   Input sanitization for security
-   Product editing/deleting for sellers
-   Email notifications for product approval, rejections, and order updates
-   Admin dashboard to manage and review all listings and users
-   Markdown support for product descriptions
-   Preorder and cart features with seller/user updates
    

###  In Progress / To Do
-   Payment API integration -> moving to Venmo, etc.
-   Email system for business approvals
-   Preorder improvements
-   Enhanced admin controls
-   Code clean-up
