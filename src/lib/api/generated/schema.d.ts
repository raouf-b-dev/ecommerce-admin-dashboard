export interface paths {
    "/metrics": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["MetricsController_getMetrics"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/products": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * List products
         * @description Retrieves a paginated list of products with optional filters and sorting.
         */
        get: operations["ProductsController_findAll_v1"];
        put?: never;
        /**
         * Create a new product
         * @description Creates a new product in the catalog. Requires admin privileges.
         */
        post: operations["ProductsController_createProduct_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/products/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get product by ID */
        get: operations["ProductsController_findOne_v1"];
        put?: never;
        post?: never;
        /**
         * Delete product by ID
         * @description Deletes a product from the catalog. Requires admin privileges.
         */
        delete: operations["ProductsController_remove_v1"];
        options?: never;
        head?: never;
        /**
         * Update product by ID
         * @description Updates an existing product. Requires admin privileges.
         */
        patch: operations["ProductsController_update_v1"];
        trace?: never;
    };
    "/v1/orders/checkout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /**
         * Initiate checkout process
         * @description Starts the asynchronous checkout process. Returns a jobId to track progress via the checkout queue.
         */
        post: operations["OrdersController_checkout_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/orders": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /**
         * Get orders list with pagination and filtering
         * @description Retrieve a paginated list of orders with various filters.
         */
        get: operations["OrdersController_findAll_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/orders/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get order by ID */
        get: operations["OrdersController_findOne_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/orders/{id}/confirm": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Confirm a pending order
         * @description Confirms a pending order. COD orders require manual phone call confirmation.
         */
        patch: operations["OrdersController_confirmOrder_v1"];
        trace?: never;
    };
    "/v1/orders/{id}/process": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Process a pending order
         * @description Moves a confirmed order to the processing state.
         */
        patch: operations["OrdersController_processOrder_v1"];
        trace?: never;
    };
    "/v1/orders/{id}/ship": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Mark order as shipped */
        patch: operations["OrdersController_shipOrder_v1"];
        trace?: never;
    };
    "/v1/orders/{id}/deliver": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Mark order as delivered
         * @description Mark order as delivered.
         */
        patch: operations["OrdersController_deliverOrder_v1"];
        trace?: never;
    };
    "/v1/orders/{id}/cancel": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /**
         * Cancel an order
         * @description Cancels an order and triggers compensation logic if needed.
         */
        patch: operations["OrdersController_cancelOrder_v1"];
        trace?: never;
    };
    "/v1/payments": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List payments with filtering */
        get: operations["PaymentsController_listPayments_v1"];
        put?: never;
        /** Create a payment intent/transaction */
        post: operations["PaymentsController_createPayment_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/payments/orders/{orderId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get payment for an order */
        get: operations["PaymentsController_getOrderPayments_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/payments/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get payment by ID */
        get: operations["PaymentsController_getPayment_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/payments/{id}/capture": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Capture an authorized payment */
        post: operations["PaymentsController_capturePayment_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/payments/{id}/refund": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Process a refund for a payment */
        post: operations["PaymentsController_processRefund_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/payments/{id}/verify": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Verify payment status with payment gateway */
        post: operations["PaymentsController_verifyPayment_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/authentication/register": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Register a new user */
        post: operations["AuthenticationController_register_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/authentication/login": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Login user */
        post: operations["AuthenticationController_login_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/authentication/refresh": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Refresh access token */
        post: operations["AuthenticationController_refresh_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/authentication/logout": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Logout current session */
        post: operations["AuthenticationController_logout_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/authentication/logout-all": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Logout all sessions for user */
        post: operations["AuthenticationController_logoutAll_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/authentication/change-password": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Change password for the authenticated user */
        post: operations["AuthenticationController_changePassword_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/authentication/.well-known/jwks.json": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get JWKS (JSON Web Key Set) */
        get: operations["AuthenticationController_getJwks_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List all users with pagination */
        get: operations["UsersController_listUsers_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get user by ID */
        get: operations["UsersController_getUser_v1"];
        put?: never;
        post?: never;
        /** Delete user */
        delete: operations["UsersController_deleteUser_v1"];
        options?: never;
        head?: never;
        /** Update user information */
        patch: operations["UsersController_updateUser_v1"];
        trace?: never;
    };
    "/v1/users/{id}/activate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Activate a user account (Admin) */
        post: operations["UsersController_activate_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/{id}/deactivate": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Deactivate a user account and revoke sessions (Admin) */
        post: operations["UsersController_deactivate_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/{id}/addresses": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Add address to customer */
        post: operations["AddressesController_addAddress_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/users/{id}/addresses/{addressId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Delete customer address */
        delete: operations["AddressesController_deleteAddress_v1"];
        options?: never;
        head?: never;
        /** Update customer address */
        patch: operations["AddressesController_updateAddress_v1"];
        trace?: never;
    };
    "/v1/users/{id}/addresses/{addressId}/set-default": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Set address as default */
        patch: operations["AddressesController_setDefaultAddress_v1"];
        trace?: never;
    };
    "/v1/roles": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RolesController_findAll_v1"];
        put?: never;
        post: operations["RolesController_create_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/roles/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["RolesController_findOne_v1"];
        put?: never;
        post?: never;
        delete: operations["RolesController_delete_v1"];
        options?: never;
        head?: never;
        patch: operations["RolesController_update_v1"];
        trace?: never;
    };
    "/v1/permissions": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["PermissionsController_findAll_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/carts": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Create a new cart for authenticated user */
        post: operations["CartsController_createCart_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/carts/{id}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get cart by ID */
        get: operations["CartsController_getCart_v1"];
        put?: never;
        post?: never;
        /** Clear cart (remove all items) */
        delete: operations["CartsController_clearCart_v1"];
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/carts/{id}/items": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Add item to cart */
        post: operations["CartsController_addItem_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/carts/{id}/items/{itemId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        /** Remove item from cart */
        delete: operations["CartsController_removeItem_v1"];
        options?: never;
        head?: never;
        /** Update cart item quantity */
        patch: operations["CartsController_updateItem_v1"];
        trace?: never;
    };
    "/v1/inventory": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List inventory items */
        get: operations["InventoryController_findAll_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/inventory/products/{productId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get inventory details for a product */
        get: operations["InventoryController_getInventory_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/inventory/products/{productId}/adjust": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Adjust stock quantity (add or subtract) */
        post: operations["InventoryController_adjustStock_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/inventory/reserve": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Reserve stock for an order (temporary hold) */
        post: operations["InventoryController_reserveStock_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/inventory/release/{reservationId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Release reserved stock (if order cancelled) */
        post: operations["InventoryController_releaseStock_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/inventory/check/{productId}": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Check if product is in stock */
        get: operations["InventoryController_checkStock_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/inventory/check/bulk": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        /** Check stock for multiple products */
        post: operations["InventoryController_bulkCheckStock_v1"];
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/inventory/low-stock": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** List products with low stock */
        get: operations["InventoryController_listLowStock_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notifications": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        /** Get user notifications */
        get: operations["NotificationsController_getUserNotifications_v1"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/v1/notifications/{id}/read": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get?: never;
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        /** Mark notification as read */
        patch: operations["NotificationsController_markAsRead_v1"];
        trace?: never;
    };
    "/health": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["HealthController_check"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/liveness": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["HealthController_liveness"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
    "/health/readiness": {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        get: operations["HealthController_readiness"];
        put?: never;
        post?: never;
        delete?: never;
        options?: never;
        head?: never;
        patch?: never;
        trace?: never;
    };
}
export type webhooks = Record<string, never>;
export interface components {
    schemas: {
        CreateProductDto: {
            /**
             * @description Product name
             * @example Laptop
             */
            name: string;
            /** @example laptop */
            slug?: string;
            /** @example High-end gaming laptop */
            description?: string;
            /** @example SKU12345 */
            sku?: string;
            /** @example 1200 */
            price: number;
            /** @example USD */
            currency?: string;
            /** @example https://example.com/laptop.jpg */
            imageUrl?: string;
            /** @example 1 */
            categoryId?: number;
        };
        ProductResponseDto: {
            /** @example 1 */
            id: number;
            /** @example Laptop */
            name: string;
            /** @example laptop */
            slug: string;
            /** @example High-end gaming laptop */
            description?: string;
            /** @example 1200 */
            price: number;
            /** @example USD */
            currency: string;
            /** @example SKU12345 */
            sku?: string;
            /** @example https://example.com/laptop.jpg */
            imageUrl?: Record<string, never> | null;
            /** @example 1 */
            categoryId?: Record<string, never> | null;
            /** @example true */
            isActive: boolean;
            /**
             * Format: date-time
             * @example 2025-08-25T12:34:56.000Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @example 2025-08-25T12:34:56.000Z
             */
            updatedAt: string;
        };
        ProductListItemResponseDto: {
            /** @example 1 */
            id: number;
            /** @example Laptop */
            name: string;
            /** @example laptop */
            slug: string;
            /** @example SKU12345 */
            sku: string;
            /** @example 1200 */
            price: number;
            /** @example USD */
            currency: string;
            /** @example https://example.com/laptop.jpg */
            imageUrl?: Record<string, never> | null;
            /** @example 1 */
            categoryId?: Record<string, never> | null;
            /** @example true */
            isActive: boolean;
            /** @example 2025-08-25T12:34:56.000Z */
            createdAt: string;
        };
        PaginatedProductsResponseDto: {
            items: components["schemas"]["ProductListItemResponseDto"][];
            /** @example 15 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 2 */
            totalPages: number;
        };
        ProductDetailResponseDto: {
            /** @example 1 */
            id: number;
            /** @example Laptop */
            name: string;
            /** @example laptop */
            slug: string;
            /** @example SKU12345 */
            sku: string;
            /** @example 1200 */
            price: number;
            /** @example USD */
            currency: string;
            /** @example https://example.com/laptop.jpg */
            imageUrl?: Record<string, never> | null;
            /** @example 1 */
            categoryId?: Record<string, never> | null;
            /** @example true */
            isActive: boolean;
            /** @example 2025-08-25T12:34:56.000Z */
            createdAt: string;
            /** @example High-end gaming laptop */
            description?: Record<string, never> | null;
            /** @example 2025-08-25T12:34:56.000Z */
            updatedAt: string;
        };
        UpdateProductDto: {
            /**
             * @description Product name
             * @example Laptop
             */
            name?: string;
            /** @example laptop */
            slug?: string;
            /** @example High-end gaming laptop */
            description?: string;
            /** @example SKU12345 */
            sku?: string;
            /** @example 1200 */
            price?: number;
            /** @example USD */
            currency?: string;
            /** @example https://example.com/laptop.jpg */
            imageUrl?: string;
            /** @example 1 */
            categoryId?: number;
        };
        ShippingAddressDto: {
            /**
             * @description First name
             * @example John
             */
            firstName: string;
            /**
             * @description Last name
             * @example Doe
             */
            lastName: string;
            /**
             * @description Street address
             * @example 123 Main Street
             */
            street: string;
            /**
             * @description Street address line 2
             * @example Apt 4B
             */
            street2?: string;
            /**
             * @description City
             * @example New York
             */
            city: string;
            /**
             * @description State or province
             * @example NY
             */
            state: string;
            /**
             * @description Postal code
             * @example 10001
             */
            postalCode: string;
            /**
             * @description Country code (ISO 3166-1 alpha-2)
             * @example US
             */
            country: string;
            /**
             * @description Contact phone number
             * @example +1234567890
             */
            phone?: string;
            /**
             * @description Delivery instructions
             * @example Leave at front door
             */
            deliveryInstructions?: string;
        };
        CheckoutDto: {
            /** @description Cart ID to checkout */
            cartId: number;
            /** @description Shipping address for the order */
            shippingAddress?: components["schemas"]["ShippingAddressDto"];
            /**
             * @description Payment method
             * @enum {string}
             */
            paymentMethod: "STRIPE";
            /** @description Customer notes for the order */
            customerNotes?: string;
            /**
             * @description Idempotency key for preventing duplicate checkouts
             * @example checkout-abc123-xyz789
             */
            idempotencyKey?: string;
        };
        CheckoutResponseDto: {
            /**
             * @description The ID of the order being created
             * @example 123
             */
            orderId: number;
            /**
             * @description The ID of the background checkout job
             * @example job-123
             */
            jobId: string;
            /**
             * @description The initial status of the order
             * @example pending_payment
             * @enum {string}
             */
            status: "pending_payment" | "payment_failed" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
            /**
             * @description Result message
             * @example Checkout process started. Please check order status for payment details.
             */
            message: string;
            /**
             * @description The client secret for payment confirmation (if available immediately)
             * @example pi_1234567890
             */
            clientSecret?: string;
        };
        OrderListItemResponseDto: {
            /**
             * @description Order ID
             * @example 1
             */
            id: number;
            /**
             * @description Human-readable order number
             * @example ORD-2025-0001
             */
            orderNumber: string;
            /**
             * @description Customer user ID
             * @example 3
             */
            userId: number;
            /**
             * @description Customer display name
             * @example Jane Doe
             */
            userName: string;
            /**
             * @description Customer email
             * @example customer@store.local
             */
            userEmail: string;
            /**
             * @description Order status
             * @example confirmed
             * @enum {string}
             */
            status: "pending_payment" | "payment_failed" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
            /**
             * @description Number of line items
             * @example 2
             */
            itemCount: number;
            /**
             * @description Order total amount
             * @example 224.94
             */
            totalAmount: number;
            /**
             * @description Currency code
             * @example USD
             */
            currency: string;
            /**
             * @description Order creation date
             * @example 2025-10-31T12:30:00.000Z
             */
            createdAt: string;
        };
        PaginatedOrdersResponseDto: {
            items: components["schemas"]["OrderListItemResponseDto"][];
            /** @example 4 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 1 */
            totalPages: number;
        };
        OrderItemDetailResponseDto: {
            /**
             * @description Product ID
             * @example 1
             */
            productId: number;
            /**
             * @description Product SKU
             * @example ELEC-ANC-001
             */
            sku: string;
            /**
             * @description Product title
             * @example Wireless Noise-Canceling Headphones
             */
            title: string;
            /**
             * @description Unit price
             * @example 199.99
             */
            unitPrice: number;
            /**
             * @description Quantity ordered
             * @example 1
             */
            quantity: number;
            /**
             * @description Line subtotal
             * @example 199.99
             */
            subtotal: number;
        };
        OrderDetailResponseDto: {
            /**
             * @description Order ID
             * @example 1
             */
            id: number;
            /**
             * @description Human-readable order number
             * @example ORD-2025-0001
             */
            orderNumber: string;
            /**
             * @description Customer user ID
             * @example 3
             */
            userId: number;
            /**
             * @description Customer display name
             * @example Jane Doe
             */
            userName: string;
            /**
             * @description Customer email
             * @example customer@store.local
             */
            userEmail: string;
            /**
             * @description Order status
             * @example confirmed
             * @enum {string}
             */
            status: "pending_payment" | "payment_failed" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
            /**
             * @description Formatted shipping address
             * @example Jane Doe, 123 Tech Boulevard, San Francisco, CA 94105, US
             */
            shippingAddress: string;
            items: components["schemas"]["OrderItemDetailResponseDto"][];
            /**
             * @description Order total amount
             * @example 224.94
             */
            totalAmount: number;
            /**
             * @description Order total price
             * @example 224.94
             */
            totalPrice: number;
            /**
             * @description Currency code
             * @example USD
             */
            currency: string;
            /**
             * @description Order creation date
             * @example 2025-10-31T12:30:00.000Z
             */
            createdAt: string;
            /**
             * @description Last update date
             * @example 2025-10-31T12:35:00.000Z
             */
            updatedAt: string;
        };
        OrderMutationResponseDto: {
            /**
             * @description Order ID
             * @example 1
             */
            id: number;
            /**
             * @description Updated order status
             * @example processing
             * @enum {string}
             */
            status: "pending_payment" | "payment_failed" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
            /**
             * @description Order total price
             * @example 224.94
             */
            totalPrice: number;
            /**
             * @description Currency code
             * @example USD
             */
            currency: string;
            /**
             * @description Last update date
             * @example 2025-10-31T12:35:00.000Z
             */
            updatedAt: string;
        };
        DeliverOrderDto: {
            /** @example Left package at front desk */
            notes?: string;
        };
        PaymentMethodDetailsDto: {
            /**
             * @description Payment token from gateway
             * @example tok_visa1234
             */
            token?: string;
            /**
             * @description Masked card number
             * @example **** **** **** 1234
             */
            cardLast4?: string;
            /**
             * @description Card brand
             * @example Visa
             */
            cardBrand?: string;
            /**
             * @description Digital wallet identifier
             * @example wallet@example.com
             */
            walletId?: string;
        };
        CreatePaymentDto: {
            /**
             * @description Order ID
             * @example 123
             */
            orderId: number;
            /**
             * @description Payment amount
             * @example 299.99
             */
            amount: number;
            /**
             * @description Payment method
             * @example STRIPE
             * @enum {string}
             */
            paymentMethod: "STRIPE";
            /**
             * @description Currency code
             * @example USD
             */
            currency: string;
            /** @description Payment method specific details */
            paymentMethodDetails?: components["schemas"]["PaymentMethodDetailsDto"];
            /**
             * @description User ID
             * @example 123
             */
            userId?: number;
        };
        PaymentResponseDto: {
            /**
             * @description Payment ID
             * @example 123
             */
            id: number;
            /**
             * @description Order ID
             * @example 123
             */
            orderId: number;
            /**
             * @description Payment amount
             * @example 299.99
             */
            amount: number;
            /**
             * @description Currency code
             * @example USD
             */
            currency: string;
            /**
             * @description Payment method
             * @example STRIPE
             * @enum {string}
             */
            paymentMethod: "STRIPE";
            /**
             * @description Payment status
             * @example COMPLETED
             * @enum {string}
             */
            status: "PENDING" | "AUTHORIZED" | "CAPTURED" | "COMPLETED" | "FAILED" | "REFUNDED" | "PARTIALLY_REFUNDED" | "CANCELLED";
            /**
             * @description Transaction ID from payment gateway
             * @example txn_1234567890
             */
            transactionId?: string;
            /**
             * @description Gateway payment intent ID
             * @example pi_1234567890
             */
            gatewayPaymentIntentId?: Record<string, never> | null;
            /**
             * @description User ID
             * @example 123
             */
            userId?: number;
            /**
             * @description Masked payment method info
             * @example **** 1234
             */
            paymentMethodInfo?: string;
            /**
             * @description Refunded amount
             * @example 50
             */
            refundedAmount?: number;
            /**
             * @description Failure reason if payment failed
             * @example Payment gateway error
             */
            failureReason?: string;
            /**
             * Format: date-time
             * @description Payment creation date
             * @example 2025-10-31T10:00:00Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Payment completion date
             * @example 2025-10-31T10:05:00Z
             */
            completedAt?: string;
            /**
             * Format: date-time
             * @description Last update date
             * @example 2025-10-31T12:30:00Z
             */
            updatedAt: string;
        };
        PaymentDetailResponseDto: {
            /**
             * @description Payment ID
             * @example 1
             */
            id: number;
            /**
             * @description Order ID
             * @example 1
             */
            orderId: number;
            /**
             * @description Customer user ID
             * @example 3
             */
            userId: number;
            /**
             * @description Customer display name
             * @example Jane Doe
             */
            userName: string;
            /**
             * @description Customer email
             * @example customer@store.local
             */
            userEmail: string;
            /**
             * @description Payment amount
             * @example 224.94
             */
            amount: number;
            /**
             * @description Currency code
             * @example USD
             */
            currency: string;
            /**
             * @description Payment status
             * @example completed
             */
            status: string;
            /**
             * @description Payment method
             * @example stripe
             */
            paymentMethod: string;
            /**
             * @description Transaction ID
             * @example txn_123
             */
            transactionId: string;
            /**
             * @description Payment creation date
             * @example 2025-10-31T12:30:00.000Z
             */
            createdAt: string;
            /**
             * @description Gateway payment intent ID
             * @example pi_123
             */
            gatewayPaymentIntentId?: string | null;
            /**
             * @description Failure reason if payment failed
             * @example Card declined
             */
            failureReason?: string | null;
            /** @description Gateway metadata */
            metadata?: {
                [key: string]: unknown;
            } | null;
            /**
             * @description Last update date
             * @example 2025-10-31T12:35:00.000Z
             */
            updatedAt: string;
        };
        ProcessRefundDto: {
            /**
             * @description Refund amount
             * @example 99.99
             */
            amount: number;
            /**
             * @description Reason for refund
             * @example User  requested cancellation
             */
            reason?: string;
        };
        RegisterDto: {
            /** @example user@example.com */
            email: string;
            /** @example password123 */
            password: string;
            /** @example John */
            firstName: string;
            /** @example Doe */
            lastName: string;
            /** @example +1234567890 */
            phone?: string;
        };
        LoginDto: {
            /** @example user@example.com */
            email: string;
            /** @example password123 */
            password: string;
        };
        AuthTokensResponseDto: {
            /**
             * @description JWT access token
             * @example eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
             */
            accessToken: string;
            /**
             * @description Refresh token (also set as HttpOnly cookie on login, refresh, and change-password)
             * @example eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...
             */
            refreshToken?: string;
            /**
             * @description When true, the client must complete password rotation before calling domain APIs
             * @example false
             */
            mustChangePassword: boolean;
        };
        RefreshTokenDto: {
            /**
             * @description The refresh token. Optional when sent via HttpOnly cookie.
             * @example eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
             */
            refreshToken?: string;
        };
        ChangePasswordDto: {
            /** @example Admin123! */
            currentPassword: string;
            /** @example NewSecurePass123! */
            newPassword: string;
        };
        AddressResponseDto: {
            /**
             * @description Address ID
             * @example 123
             */
            id: number;
            /**
             * @description Street address line 1
             * @example 123 Main Street
             */
            street: string;
            /**
             * @description Street address line 2
             * @example Apt 4B
             */
            street2?: string;
            /**
             * @description City
             * @example New York
             */
            city: string;
            /**
             * @description State/Province
             * @example NY
             */
            state: string;
            /**
             * @description Postal/ZIP code
             * @example 10001
             */
            postalCode: string;
            /**
             * @description Country code
             * @example US
             */
            country: string;
            /**
             * @description Address type
             * @example HOME
             * @enum {string}
             */
            type: "HOME" | "WORK" | "OTHER" | "BILLING" | "SHIPPING";
            /**
             * @description Whether this is the default address
             * @example true
             */
            isDefault: boolean;
            /**
             * @description Delivery instructions
             * @example Leave at front door
             */
            deliveryInstructions?: string;
            /**
             * Format: date-time
             * @description Address creation date
             * @example 2025-10-31T10:00:00Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Last update date
             * @example 2025-10-31T12:30:00Z
             */
            updatedAt: string;
        };
        UserResponseDto: {
            /**
             * @description User ID
             * @example 123
             */
            id: number;
            /**
             * @description User first name
             * @example John
             */
            firstName: string;
            /**
             * @description User last name
             * @example Doe
             */
            lastName: string;
            /**
             * @description User full name
             * @example John Doe
             */
            fullName: string;
            /**
             * @description User email
             * @example john.doe@example.com
             */
            email: string;
            /**
             * @description User phone number
             * @example +1234567890
             */
            phone?: string;
            /** @description User addresses */
            addresses: components["schemas"]["AddressResponseDto"][];
            /** @description Default address */
            defaultAddress?: components["schemas"]["AddressResponseDto"];
            /**
             * @description Total number of orders
             * @example 5
             */
            totalOrders: number;
            /**
             * @description Total amount spent
             * @example 1499.95
             */
            totalSpent: number;
            /**
             * Format: date-time
             * @description User registration date
             * @example 2025-10-31T10:00:00Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Last update date
             * @example 2025-10-31T12:30:00Z
             */
            updatedAt: string;
        };
        UpdateUserDto: {
            /**
             * @description User first name
             * @example John
             */
            firstName?: string;
            /**
             * @description User last name
             * @example Doe
             */
            lastName?: string;
            /**
             * @description User email
             * @example john.doe@example.com
             */
            email?: string;
            /**
             * @description User phone number
             * @example +1234567890
             */
            phone?: string;
        };
        AddAddressDto: {
            /**
             * @description Street address line 1
             * @example 123 Main Street
             */
            street: string;
            /**
             * @description Street address line 2
             * @example Apt 4B
             */
            street2?: string;
            /**
             * @description City
             * @example New York
             */
            city: string;
            /**
             * @description State/Province
             * @example NY
             */
            state: string;
            /**
             * @description Postal/ZIP code
             * @example 10001
             */
            postalCode: string;
            /**
             * @description Country code (ISO 3166-1 alpha-2)
             * @example US
             */
            country: string;
            /**
             * @description Address type
             * @example HOME
             * @enum {string}
             */
            type?: "HOME" | "WORK" | "OTHER" | "BILLING" | "SHIPPING";
            /**
             * @description Set as default address
             * @example true
             */
            isDefault?: boolean;
            /**
             * @description Delivery instructions
             * @example Leave at front door
             */
            deliveryInstructions?: string;
        };
        UpdateAddressDto: {
            /**
             * @description Street address line 1
             * @example 123 Main Street
             */
            street?: string;
            /**
             * @description Street address line 2
             * @example Apt 4B
             */
            street2?: string;
            /**
             * @description City
             * @example New York
             */
            city?: string;
            /**
             * @description State/Province
             * @example NY
             */
            state?: string;
            /**
             * @description Postal/ZIP code
             * @example 10001
             */
            postalCode?: string;
            /**
             * @description Country code (ISO 3166-1 alpha-2)
             * @example US
             */
            country?: string;
            /**
             * @description Address type
             * @example HOME
             * @enum {string}
             */
            type?: "HOME" | "WORK" | "OTHER" | "BILLING" | "SHIPPING";
            /**
             * @description Delivery instructions
             * @example Leave at front door
             */
            deliveryInstructions?: string;
        };
        CreateRoleDto: {
            /** @example ADMIN */
            code: string;
            /** @example Administrador */
            name: string;
            /**
             * @description List of permissions for the role
             * @example [
             *       "manage_users",
             *       "view_all_inventory",
             *       "view_all_orders",
             *       "view_all_payments",
             *       "view_all_products",
             *       "view_all_users"
             *     ]
             */
            permissions: string[];
        };
        UpdateRoleDto: {
            /** @example Administrador */
            name: string;
            /**
             * @description List of permissions for the role
             * @example [
             *       "manage_users",
             *       "view_all_inventory",
             *       "view_all_orders",
             *       "view_all_payments",
             *       "view_all_products",
             *       "view_all_users"
             *     ]
             */
            permissions: string[];
        };
        CartItemResponseDto: {
            /**
             * @description Cart item ID
             * @example item-123
             */
            id: string;
            /**
             * @description Product ID
             * @example prod-123
             */
            productId: string;
            /**
             * @description Product name
             * @example Wireless Headphones
             */
            productName: string;
            /**
             * @description Product price
             * @example 99.99
             */
            price: number;
            /**
             * @description Quantity
             * @example 2
             */
            quantity: number;
            /**
             * @description Subtotal (price * quantity)
             * @example 199.98
             */
            subtotal: number;
            /**
             * @description Product image URL
             * @example https://example.com/image.jpg
             */
            imageUrl: string;
        };
        CartResponseDto: {
            /**
             * @description Cart ID
             * @example cart-123
             */
            id: string;
            /**
             * @description User ID
             * @example 123
             */
            userId?: string;
            /**
             * @description Session ID
             * @example session-abc-xyz
             */
            sessionId?: string;
            /** @description Cart items */
            items: components["schemas"]["CartItemResponseDto"][];
            /**
             * @description Total number of items
             * @example 3
             */
            itemCount: number;
            /**
             * @description Cart total amount
             * @example 299.97
             */
            totalAmount: number;
            /**
             * Format: date-time
             * @description Cart creation date
             * @example 2025-10-31T10:00:00Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Last update date
             * @example 2025-10-31T12:30:00Z
             */
            updatedAt: string;
        };
        AddCartItemDto: {
            /**
             * @description Product ID
             * @example prod-123
             */
            productId: number;
            /**
             * @description Quantity to add
             * @example 2
             */
            quantity: number;
        };
        UpdateCartItemDto: {
            /**
             * @description New quantity for the item
             * @example 3
             */
            quantity: number;
        };
        InventoryListItemResponseDto: {
            /**
             * @description Inventory record ID
             * @example 1
             */
            id: number;
            /**
             * @description Product ID
             * @example 1
             */
            productId: number;
            /**
             * @description Product SKU
             * @example SKU-HEADPHONES
             */
            sku: string;
            /**
             * @description Product title
             * @example Wireless Headphones
             */
            productTitle: string;
            /**
             * @description Available quantity
             * @example 150
             */
            availableQuantity: number;
            /**
             * @description Reserved quantity
             * @example 10
             */
            reservedQuantity: number;
            /**
             * @description Total quantity (available + reserved)
             * @example 160
             */
            totalQuantity: number;
            /**
             * @description Last update date
             * @example 2025-10-31T12:30:00.000Z
             */
            updatedAt: string;
        };
        PaginatedInventoryResponseDto: {
            items: components["schemas"]["InventoryListItemResponseDto"][];
            /** @example 15 */
            total: number;
            /** @example 1 */
            page: number;
            /** @example 10 */
            limit: number;
            /** @example 2 */
            totalPages: number;
        };
        AdjustStockDto: {
            /**
             * @description Quantity to adjust
             * @example 50
             */
            quantity: number;
            /**
             * @description Type of adjustment
             * @example ADD
             * @enum {string}
             */
            type: "ADD" | "SUBTRACT" | "SET";
            /**
             * @description Reason for stock adjustment
             * @example Received new shipment
             */
            reason?: string;
        };
        InventoryStockResponseDto: {
            /**
             * @description Inventory record ID
             * @example 1
             */
            id: number;
            /**
             * @description Product ID
             * @example 1
             */
            productId: number;
            /**
             * @description Available quantity
             * @example 150
             */
            availableQuantity: number;
            /**
             * @description Reserved quantity
             * @example 10
             */
            reservedQuantity: number;
            /**
             * @description Total quantity (available + reserved)
             * @example 160
             */
            totalQuantity: number;
            /**
             * @description Low stock threshold
             * @example 10
             */
            lowStockThreshold: number;
            /**
             * @description Last restock date
             * @example 2025-10-31T10:00:00.000Z
             */
            lastRestockDate?: Record<string, never> | null;
            /**
             * Format: date-time
             * @description Created at
             * @example 2025-10-31T12:30:00.000Z
             */
            createdAt: string;
            /**
             * Format: date-time
             * @description Last update date
             * @example 2025-10-31T12:30:00.000Z
             */
            updatedAt: string;
        };
        ReserveStockItemDto: {
            /**
             * @description Product ID
             * @example prod-123
             */
            productId: number;
            /**
             * @description Quantity to reserve
             * @example 2
             */
            quantity: number;
        };
        ReserveStockDto: {
            /**
             * @description Order ID for tracking
             * @example 123
             */
            orderId: number;
            /** @description Items to reserve */
            items: components["schemas"]["ReserveStockItemDto"][];
        };
    };
    responses: never;
    parameters: never;
    requestBodies: never;
    headers: never;
    pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
    MetricsController_getMetrics: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProductsController_findAll_v1: {
        parameters: {
            query?: {
                /** @description Page number for pagination */
                page?: number;
                /** @description Number of items per page */
                limit?: number;
                /** @description Filter products by category ID */
                categoryId?: number;
                /** @description Search by name, description, or SKU */
                search?: string;
                /** @description Filter by active status */
                isActive?: boolean;
                /** @description Minimum price (major currency units) */
                minPrice?: number;
                /** @description Maximum price (major currency units) */
                maxPrice?: number;
                sortBy?: "createdAt" | "price" | "name" | "id";
                sortOrder?: "asc" | "desc";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of products retrieved successfully. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedProductsResponseDto"];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden - Admin access required. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProductsController_createProduct_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateProductDto"];
            };
        };
        responses: {
            /** @description Product created successfully. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductResponseDto"];
                };
            };
            /** @description Invalid product data. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden - Admin access required. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProductsController_findOne_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Product found. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductDetailResponseDto"];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden - Admin access required. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Product not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProductsController_remove_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Product deleted successfully. */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden - Admin access required. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Product not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    ProductsController_update_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateProductDto"];
            };
        };
        responses: {
            /** @description Product updated successfully. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["ProductResponseDto"];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden - Admin access required. */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Product not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Conflict — product was modified concurrently. Reload and retry. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    OrdersController_checkout_v1: {
        parameters: {
            query?: never;
            header?: {
                /** @description Legacy alias for Idempotency-Key. */
                "x-idempotency-key"?: string;
                /** @description Preferred client idempotency key (also accepted as x-idempotency-key or body idempotencyKey). */
                "Idempotency-Key"?: string;
            };
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CheckoutDto"];
            };
        };
        responses: {
            /** @description Checkout process initiated successfully. */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CheckoutResponseDto"];
                };
            };
            /** @description Invalid checkout data or cart is empty. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Unauthorized - User must be logged in. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Conflict — a request with this idempotency key is already in progress. Response includes Retry-After: 2. */
            409: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    OrdersController_findAll_v1: {
        parameters: {
            query?: {
                /** @description Page number for pagination */
                page?: number;
                /** @description Number of items per page */
                limit?: number;
                /** @description Filter orders by user ID */
                userId?: number;
                /** @description Filter orders by user email */
                userEmail?: string;
                /** @description Filter orders by user first name */
                firstName?: string;
                /** @description Filter orders by user last name */
                lastName?: string;
                /** @description Filter orders by user first or last name */
                userName?: string;
                /** @description Filter orders by status */
                status?: "pending_payment" | "payment_failed" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
                /** @description Field to sort by */
                sortBy?: "createdAt" | "updatedAt" | "totalPrice";
                /** @description Sort order */
                sortOrder?: "asc" | "desc";
                /** @description Filter orders created after this date (ISO 8601) */
                createdAfter?: string;
                /** @description Filter orders created before this date (ISO 8601) */
                createdBefore?: string;
                /** @description Filter orders with total price greater than */
                minAmount?: number;
                /** @description Filter orders with total price less than */
                maxAmount?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description List of orders retrieved successfully. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedOrdersResponseDto"];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    OrdersController_findOne_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Order found. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrderDetailResponseDto"];
                };
            };
            /** @description Unauthorized. */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Order not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    OrdersController_confirmOrder_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Order confirmed successfully. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrderMutationResponseDto"];
                };
            };
            /** @description Order cannot be confirmed. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Order not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    OrdersController_processOrder_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Order processing started. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrderMutationResponseDto"];
                };
            };
            /** @description Order not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    OrdersController_shipOrder_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Order marked as shipped. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrderMutationResponseDto"];
                };
            };
            /** @description Order not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    OrdersController_deliverOrder_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["DeliverOrderDto"];
            };
        };
        responses: {
            /** @description Order marked as delivered. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrderMutationResponseDto"];
                };
            };
            /** @description Order not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    OrdersController_cancelOrder_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Order cancelled successfully. */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["OrderMutationResponseDto"];
                };
            };
            /** @description Order cannot be cancelled. */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Order not found. */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PaymentsController_listPayments_v1: {
        parameters: {
            query?: {
                /** @description Page number for pagination */
                page?: number;
                /** @description Number of items per page */
                limit?: number;
                /** @description Filter payments by user ID */
                userId?: number;
                /** @description Filter payments by order ID */
                orderId?: number;
                /** @description Filter payments by status */
                status?: string;
                /** @description Filter payments by user email */
                userEmail?: string;
                /** @description Filter payments by user name */
                userName?: string;
                sortBy?: "createdAt" | "amount" | "status" | "id";
                sortOrder?: "asc" | "desc";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PaymentsController_createPayment_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreatePaymentDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentResponseDto"];
                };
            };
        };
    };
    PaymentsController_getOrderPayments_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                orderId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentDetailResponseDto"];
                };
            };
        };
    };
    PaymentsController_getPayment_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PaymentsController_capturePayment_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentResponseDto"];
                };
            };
        };
    };
    PaymentsController_processRefund_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ProcessRefundDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentResponseDto"];
                };
            };
        };
    };
    PaymentsController_verifyPayment_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaymentResponseDto"];
                };
            };
        };
    };
    AuthenticationController_register_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RegisterDto"];
            };
        };
        responses: {
            /** @description User successfully registered */
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Bad Request */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthenticationController_login_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["LoginDto"];
            };
        };
        responses: {
            /** @description User successfully logged in */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthTokensResponseDto"];
                };
            };
            /** @description Unauthorized */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthenticationController_refresh_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshTokenDto"];
            };
        };
        responses: {
            /** @description Token successfully refreshed */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthTokensResponseDto"];
                };
            };
            /** @description Invalid refresh token */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthenticationController_logout_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshTokenDto"];
            };
        };
        responses: {
            /** @description Successfully logged out */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthenticationController_logoutAll_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["RefreshTokenDto"];
            };
        };
        responses: {
            /** @description Successfully logged out all sessions */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthenticationController_changePassword_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ChangePasswordDto"];
            };
        };
        responses: {
            /** @description Password changed; new tokens issued */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AuthTokensResponseDto"];
                };
            };
            /** @description Validation failed or same password */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Current password incorrect */
            401: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AuthenticationController_getJwks_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Returns public keys for JWT verification */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_listUsers_v1: {
        parameters: {
            query?: {
                /** @description Search by name or email */
                search?: string;
                /** @description Filter by email */
                email?: string;
                /** @description Filter by phone */
                phone?: string;
                /** @description Page number */
                page?: number;
                /** @description Items per page */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"][];
                };
            };
        };
    };
    UsersController_getUser_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
        };
    };
    UsersController_deleteUser_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description User deleted */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_updateUser_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateUserDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["UserResponseDto"];
                };
            };
        };
    };
    UsersController_activate_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description User activated successfully */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User is already active */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden - Requires manage_users permission */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    UsersController_deactivate_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description User deactivated successfully */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User is already deactivated */
            400: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description Forbidden - Requires manage_users permission */
            403: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
            /** @description User not found */
            404: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AddressesController_addAddress_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddAddressDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AddressResponseDto"];
                };
            };
        };
    };
    AddressesController_deleteAddress_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
                addressId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Address deleted */
            204: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    AddressesController_updateAddress_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
                addressId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateAddressDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["AddressResponseDto"];
                };
            };
        };
    };
    AddressesController_setDefaultAddress_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
                addressId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RolesController_findAll_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RolesController_create_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["CreateRoleDto"];
            };
        };
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RolesController_findOne_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RolesController_delete_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    RolesController_update_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateRoleDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    PermissionsController_findAll_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CartsController_createCart_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            201: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CartResponseDto"];
                };
            };
        };
    };
    CartsController_getCart_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    CartsController_clearCart_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CartResponseDto"];
                };
            };
        };
    };
    CartsController_addItem_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AddCartItemDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CartResponseDto"];
                };
            };
        };
    };
    CartsController_removeItem_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
                itemId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CartResponseDto"];
                };
            };
        };
    };
    CartsController_updateItem_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: number;
                itemId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["UpdateCartItemDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["CartResponseDto"];
                };
            };
        };
    };
    InventoryController_findAll_v1: {
        parameters: {
            query?: {
                /** @description Page number for pagination */
                page?: number;
                /** @description Number of items per page */
                limit?: number;
                /** @description Filter inventory by product ID */
                productId?: number;
                /** @description Filter inventory by product SKU */
                sku?: string;
                /** @description Filter inventory by product title */
                productTitle?: string;
                /** @description Filter only low stock items */
                lowStockOnly?: boolean;
                sortBy?: "updatedAt" | "availableQuantity" | "totalQuantity" | "productId";
                sortOrder?: "asc" | "desc";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["PaginatedInventoryResponseDto"];
                };
            };
        };
    };
    InventoryController_getInventory_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                productId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InventoryListItemResponseDto"];
                };
            };
        };
    };
    InventoryController_adjustStock_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                productId: number;
            };
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["AdjustStockDto"];
            };
        };
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InventoryStockResponseDto"];
                };
            };
        };
    };
    InventoryController_reserveStock_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": components["schemas"]["ReserveStockDto"];
            };
        };
        responses: {
            /** @description Stock reserved successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    InventoryController_releaseStock_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                reservationId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Stock released successfully */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    InventoryController_checkStock_v1: {
        parameters: {
            query: {
                quantity: number;
            };
            header?: never;
            path: {
                productId: number;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description Stock availability status */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    InventoryController_bulkCheckStock_v1: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody: {
            content: {
                "application/json": string[];
            };
        };
        responses: {
            /** @description Bulk stock availability status */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    InventoryController_listLowStock_v1: {
        parameters: {
            query?: {
                /** @description Threshold for low stock (default: 10) */
                threshold?: number;
                /** @description Page number */
                page?: number;
                /** @description Items per page */
                limit?: number;
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": components["schemas"]["InventoryStockResponseDto"][];
                };
            };
        };
    };
    NotificationsController_getUserNotifications_v1: {
        parameters: {
            query?: {
                page?: number;
                limit?: number;
                status?: "pending" | "sent" | "delivered" | "read" | "failed";
            };
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    NotificationsController_markAsRead_v1: {
        parameters: {
            query?: never;
            header?: never;
            path: {
                id: string;
            };
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content?: never;
            };
        };
    };
    HealthController_check: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The Health Check is successful */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example ok */
                        status?: string;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        info?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /** @example {} */
                        error?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        details?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
            };
            /** @description The Health Check is not successful */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example error */
                        status?: string;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        info?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "redis": {
                         *         "status": "down",
                         *         "message": "Could not connect"
                         *       }
                         *     }
                         */
                        error?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       },
                         *       "redis": {
                         *         "status": "down",
                         *         "message": "Could not connect"
                         *       }
                         *     }
                         */
                        details?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
            };
        };
    };
    HealthController_liveness: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The Health Check is successful */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example ok */
                        status?: string;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        info?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /** @example {} */
                        error?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        details?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
            };
            /** @description The Health Check is not successful */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example error */
                        status?: string;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        info?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "redis": {
                         *         "status": "down",
                         *         "message": "Could not connect"
                         *       }
                         *     }
                         */
                        error?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       },
                         *       "redis": {
                         *         "status": "down",
                         *         "message": "Could not connect"
                         *       }
                         *     }
                         */
                        details?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
            };
        };
    };
    HealthController_readiness: {
        parameters: {
            query?: never;
            header?: never;
            path?: never;
            cookie?: never;
        };
        requestBody?: never;
        responses: {
            /** @description The Health Check is successful */
            200: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example ok */
                        status?: string;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        info?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /** @example {} */
                        error?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        details?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
            };
            /** @description The Health Check is not successful */
            503: {
                headers: {
                    [name: string]: unknown;
                };
                content: {
                    "application/json": {
                        /** @example error */
                        status?: string;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       }
                         *     }
                         */
                        info?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "redis": {
                         *         "status": "down",
                         *         "message": "Could not connect"
                         *       }
                         *     }
                         */
                        error?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        } | null;
                        /**
                         * @example {
                         *       "database": {
                         *         "status": "up"
                         *       },
                         *       "redis": {
                         *         "status": "down",
                         *         "message": "Could not connect"
                         *       }
                         *     }
                         */
                        details?: {
                            [key: string]: {
                                status: string;
                            } & {
                                [key: string]: unknown;
                            };
                        };
                    };
                };
            };
        };
    };
}
