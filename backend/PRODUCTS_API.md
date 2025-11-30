# Products API Documentation

## Overview

The Products API provides complete CRUD (Create, Read, Update, Delete) operations for managing products in your application. It includes advanced features like filtering, pagination, search, and role-based access control.

## Product Model

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | String | Yes | Product name (2-100 characters) |
| description | String | No | Product description (max 1000 characters) |
| price | Number | Yes | Product price (must be >= 0) |
| category | String | Yes | Product category (see categories below) |
| stock | Number | No | Available stock (default: 0, must be >= 0) |
| sku | String | Yes | Unique product SKU (uppercase, 3-50 characters) |
| imageUrl | String | No | Product image URL |
| tags | Array[String] | No | Product tags |
| isActive | Boolean | No | Product active status (default: true) |
| createdBy | ObjectId | Auto | User who created the product |
| updatedBy | ObjectId | Auto | User who last updated the product |
| createdAt | Date | Auto | Creation timestamp |
| updatedAt | Date | Auto | Last update timestamp |

### Categories

- Electronics
- Clothing
- Food
- Books
- Toys
- Sports
- Home
- Beauty
- Other

### Virtual Fields

- **stockStatus**: Automatically calculated based on stock quantity
  - "Out of Stock" (stock = 0)
  - "Low Stock" (stock < 10)
  - "In Stock" (stock >= 10)

## API Endpoints

### 1. Get All Products

```
GET /api/products
```

**Access**: Public (with optional authentication)

**Query Parameters**:
- `page` (number): Page number for pagination (default: 1)
- `limit` (number): Items per page (default: 10)
- `category` (string): Filter by category
- `isActive` (boolean): Filter by active status (admin only)
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `inStock` (boolean): Filter products with stock > 0
- `search` (string): Search in name and description
- `sortBy` (string): Sort field and order (e.g., "price:asc", "createdAt:desc")

**Example Request**:
```bash
curl -X GET "http://localhost:5000/api/products?page=1&limit=10&category=Electronics&minPrice=100&maxPrice=1000&sortBy=price:asc"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "60d5f4843f4e3a1a4c8b4567",
        "name": "Wireless Headphones",
        "description": "High-quality wireless headphones with noise cancellation",
        "price": 299.99,
        "category": "Electronics",
        "stock": 50,
        "sku": "WH-1000XM4",
        "imageUrl": "https://example.com/headphones.jpg",
        "tags": ["audio", "wireless", "bluetooth"],
        "isActive": true,
        "stockStatus": "In Stock",
        "createdBy": {
          "_id": "60d5f4843f4e3a1a4c8b4560",
          "name": "John Doe",
          "email": "john@example.com"
        },
        "createdAt": "2025-11-30T07:00:00.000Z",
        "updatedAt": "2025-11-30T07:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 45,
      "pages": 5
    }
  }
}
```

---

### 2. Get Single Product

```
GET /api/products/:id
```

**Access**: Public (with optional authentication)

**URL Parameters**:
- `id` (string): Product MongoDB ObjectId

**Example Request**:
```bash
curl -X GET "http://localhost:5000/api/products/60d5f4843f4e3a1a4c8b4567"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "product": {
      "_id": "60d5f4843f4e3a1a4c8b4567",
      "name": "Wireless Headphones",
      "description": "High-quality wireless headphones with noise cancellation",
      "price": 299.99,
      "category": "Electronics",
      "stock": 50,
      "sku": "WH-1000XM4",
      "imageUrl": "https://example.com/headphones.jpg",
      "tags": ["audio", "wireless", "bluetooth"],
      "isActive": true,
      "stockStatus": "In Stock",
      "createdBy": {
        "_id": "60d5f4843f4e3a1a4c8b4560",
        "name": "John Doe",
        "email": "john@example.com"
      },
      "createdAt": "2025-11-30T07:00:00.000Z",
      "updatedAt": "2025-11-30T07:00:00.000Z"
    }
  }
}
```

---

### 3. Create Product

```
POST /api/products
```

**Access**: Private (requires authentication)

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body**:
```json
{
  "name": "Wireless Mouse",
  "description": "Ergonomic wireless mouse with long battery life",
  "price": 49.99,
  "category": "Electronics",
  "stock": 100,
  "sku": "WM-2024-001",
  "imageUrl": "https://example.com/mouse.jpg",
  "tags": ["wireless", "computer", "accessories"]
}
```

**Example Request**:
```bash
curl -X POST "http://localhost:5000/api/products" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Wireless Mouse",
    "description": "Ergonomic wireless mouse",
    "price": 49.99,
    "category": "Electronics",
    "stock": 100,
    "sku": "WM-2024-001"
  }'
```

**Example Response**:
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "product": {
      "_id": "60d5f4843f4e3a1a4c8b4568",
      "name": "Wireless Mouse",
      "description": "Ergonomic wireless mouse with long battery life",
      "price": 49.99,
      "category": "Electronics",
      "stock": 100,
      "sku": "WM-2024-001",
      "imageUrl": "https://example.com/mouse.jpg",
      "tags": ["wireless", "computer", "accessories"],
      "isActive": true,
      "stockStatus": "In Stock",
      "createdBy": {
        "_id": "60d5f4843f4e3a1a4c8b4560",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdAt": "2025-11-30T08:00:00.000Z",
      "updatedAt": "2025-11-30T08:00:00.000Z"
    }
  }
}
```

**Validation Rules**:
- `name`: Required, 2-100 characters
- `price`: Required, must be >= 0
- `category`: Required, must be a valid category
- `sku`: Required, 3-50 characters, alphanumeric with hyphens, automatically converted to uppercase
- `stock`: Optional, must be >= 0 (default: 0)
- `description`: Optional, max 1000 characters
- `imageUrl`: Optional, must be valid URL
- `tags`: Optional, array of strings (1-30 characters each)

---

### 4. Update Product

```
PUT /api/products/:id
```

**Access**: Private (requires authentication, only creator or admin can update)

**URL Parameters**:
- `id` (string): Product MongoDB ObjectId

**Headers**:
```
Authorization: Bearer <access_token>
Content-Type: application/json
```

**Request Body** (all fields optional):
```json
{
  "name": "Updated Product Name",
  "description": "Updated description",
  "price": 59.99,
  "category": "Electronics",
  "stock": 75,
  "sku": "WM-2024-002",
  "imageUrl": "https://example.com/new-image.jpg",
  "tags": ["updated", "tags"],
  "isActive": false
}
```

**Example Request**:
```bash
curl -X PUT "http://localhost:5000/api/products/60d5f4843f4e3a1a4c8b4568" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -H "Content-Type: application/json" \
  -d '{
    "price": 59.99,
    "stock": 75
  }'
```

**Example Response**:
```json
{
  "success": true,
  "message": "Product updated successfully",
  "data": {
    "product": {
      "_id": "60d5f4843f4e3a1a4c8b4568",
      "name": "Wireless Mouse",
      "description": "Ergonomic wireless mouse",
      "price": 59.99,
      "category": "Electronics",
      "stock": 75,
      "sku": "WM-2024-001",
      "isActive": true,
      "stockStatus": "In Stock",
      "createdBy": {
        "_id": "60d5f4843f4e3a1a4c8b4560",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "updatedBy": {
        "_id": "60d5f4843f4e3a1a4c8b4560",
        "name": "Jane Smith",
        "email": "jane@example.com"
      },
      "createdAt": "2025-11-30T08:00:00.000Z",
      "updatedAt": "2025-11-30T09:00:00.000Z"
    }
  }
}
```

**Notes**:
- Users can only update their own products
- Admins can update any product
- Only admins can update the `isActive` field
- SKU must remain unique across all products

---

### 5. Delete Product (Soft Delete)

```
DELETE /api/products/:id
```

**Access**: Private (requires authentication, only creator or admin can delete)

**URL Parameters**:
- `id` (string): Product MongoDB ObjectId

**Headers**:
```
Authorization: Bearer <access_token>
```

**Example Request**:
```bash
curl -X DELETE "http://localhost:5000/api/products/60d5f4843f4e3a1a4c8b4568" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Response**:
```json
{
  "success": true,
  "message": "Product deleted successfully",
  "data": {
    "product": {
      "_id": "60d5f4843f4e3a1a4c8b4568",
      "isActive": false,
      "updatedBy": "60d5f4843f4e3a1a4c8b4560"
    }
  }
}
```

**Notes**:
- This performs a soft delete (sets `isActive` to `false`)
- The product remains in the database but is hidden from public views
- Admins can still view inactive products

---

### 6. Permanently Delete Product (Hard Delete)

```
DELETE /api/products/:id/permanent
```

**Access**: Private/Admin only

**URL Parameters**:
- `id` (string): Product MongoDB ObjectId

**Headers**:
```
Authorization: Bearer <access_token>
```

**Example Request**:
```bash
curl -X DELETE "http://localhost:5000/api/products/60d5f4843f4e3a1a4c8b4568/permanent" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Example Response**:
```json
{
  "success": true,
  "message": "Product permanently deleted"
}
```

**Notes**:
- This is a hard delete - the product is completely removed from the database
- Only admins can perform this operation
- This action cannot be undone

---

### 7. Get Product Categories

```
GET /api/products/categories/list
```

**Access**: Public

**Example Request**:
```bash
curl -X GET "http://localhost:5000/api/products/categories/list"
```

**Example Response**:
```json
{
  "success": true,
  "data": {
    "categories": [
      "Electronics",
      "Clothing",
      "Food",
      "Books",
      "Toys",
      "Sports",
      "Home",
      "Beauty",
      "Other"
    ]
  }
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "field": "price",
      "message": "Price must be a positive number"
    }
  ]
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. You can only update your own products."
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Failed to fetch products"
}
```

---

## Usage Examples

### Complete Product Workflow

#### 1. Register/Login to get access token
```bash
# Register
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "SecurePass123"
  }'

# Login
curl -X POST "http://localhost:5000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

#### 2. Create a product
```bash
curl -X POST "http://localhost:5000/api/products" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gaming Laptop",
    "description": "High-performance gaming laptop with RTX 4080",
    "price": 1999.99,
    "category": "Electronics",
    "stock": 10,
    "sku": "LAPTOP-GAMING-001",
    "tags": ["gaming", "laptop", "high-performance"]
  }'
```

#### 3. Search products
```bash
# Search by name
curl -X GET "http://localhost:5000/api/products?search=laptop"

# Filter by category and price range
curl -X GET "http://localhost:5000/api/products?category=Electronics&minPrice=1000&maxPrice=2500"

# Get products in stock only
curl -X GET "http://localhost:5000/api/products?inStock=true"
```

#### 4. Update product stock
```bash
curl -X PUT "http://localhost:5000/api/products/PRODUCT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 5
  }'
```

#### 5. Delete product
```bash
curl -X DELETE "http://localhost:5000/api/products/PRODUCT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

## Authorization & Permissions

| Operation | Public | Authenticated User | Admin |
|-----------|--------|-------------------|-------|
| Get all products | ✅ (active only) | ✅ (active only) | ✅ (all) |
| Get single product | ✅ (active only) | ✅ (active only) | ✅ (all) |
| Create product | ❌ | ✅ | ✅ |
| Update product | ❌ | ✅ (own products) | ✅ (all) |
| Delete product | ❌ | ✅ (own products) | ✅ (all) |
| Permanent delete | ❌ | ❌ | ✅ |
| Update isActive | ❌ | ❌ | ✅ |

---

## Best Practices

1. **Always validate input**: The API includes comprehensive validation, but client-side validation improves UX
2. **Handle errors gracefully**: Check the `success` field in responses
3. **Use pagination**: Don't fetch all products at once; use the pagination parameters
4. **Search efficiently**: Use the search parameter instead of fetching all products and filtering client-side
5. **Secure your tokens**: Store access tokens securely, never expose them in URLs
6. **Use HTTPS**: Always use HTTPS in production
7. **Rate limiting**: Be aware of rate limits (configured in the API)

---

## Testing with Postman/Insomnia

You can import the following endpoints into Postman or Insomnia:

**Base URL**: `http://localhost:5000/api`

**Environment Variables**:
- `BASE_URL`: `http://localhost:5000`
- `ACCESS_TOKEN`: Your JWT access token

**Collection**:
1. Auth - Login
2. Products - Get All
3. Products - Get Single
4. Products - Create
5. Products - Update
6. Products - Delete
7. Products - Permanent Delete (Admin)
8. Products - Get Categories
