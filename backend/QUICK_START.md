# Quick Start Guide - Products API Testing

## Prerequisites

Make sure your server is running:
```bash
npm run dev
# or
node index.js
```

## Step-by-Step Testing

### 1. Register a User (if you don't have an account)

```bash
curl -X POST "http://localhost:5000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test User\", \"email\": \"test@example.com\", \"password\": \"TestPass123\"}"
```

**Expected Response:**
- Returns user data and `accessToken`
- Copy the `accessToken` for next steps

---

### 2. Create Your First Product

Replace `YOUR_ACCESS_TOKEN` with the token from step 1:

```bash
curl -X POST "http://localhost:5000/api/products" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Wireless Keyboard\", \"description\": \"Premium mechanical keyboard\", \"price\": 129.99, \"category\": \"Electronics\", \"stock\": 50, \"sku\": \"KB-MECH-001\", \"tags\": [\"keyboard\", \"mechanical\", \"wireless\"]}"
```

**Expected Response:**
- `success: true`
- Product details with generated `_id`

---

### 3. Get All Products

```bash
curl -X GET "http://localhost:5000/api/products"
```

**Expected Response:**
- List of products with pagination info

---

### 4. Search Products

```bash
# Search by name
curl -X GET "http://localhost:5000/api/products?search=keyboard"

# Filter by category
curl -X GET "http://localhost:5000/api/products?category=Electronics"

# Filter by price range
curl -X GET "http://localhost:5000/api/products?minPrice=100&maxPrice=200"

# Get in-stock products only
curl -X GET "http://localhost:5000/api/products?inStock=true"

# Combine filters and sort
curl -X GET "http://localhost:5000/api/products?category=Electronics&minPrice=50&sortBy=price:asc"
```

---

### 5. Get Single Product

Replace `PRODUCT_ID` with an actual product ID:

```bash
curl -X GET "http://localhost:5000/api/products/PRODUCT_ID"
```

---

### 6. Update Product

```bash
curl -X PUT "http://localhost:5000/api/products/PRODUCT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"price\": 149.99, \"stock\": 30}"
```

---

### 7. Delete Product (Soft Delete)

```bash
curl -X DELETE "http://localhost:5000/api/products/PRODUCT_ID" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

---

### 8. Get Categories List

```bash
curl -X GET "http://localhost:5000/api/products/categories/list"
```

---

## Testing with Multiple Products

Create multiple products to test filtering and pagination:

```bash
# Product 1: Electronics
curl -X POST "http://localhost:5000/api/products" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Gaming Mouse\", \"description\": \"RGB gaming mouse\", \"price\": 79.99, \"category\": \"Electronics\", \"stock\": 100, \"sku\": \"MOUSE-GAME-001\"}"

# Product 2: Books
curl -X POST "http://localhost:5000/api/products" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"JavaScript Guide\", \"description\": \"Complete JavaScript programming guide\", \"price\": 49.99, \"category\": \"Books\", \"stock\": 25, \"sku\": \"BOOK-JS-001\"}"

# Product 3: Clothing
curl -X POST "http://localhost:5000/api/products" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Cotton T-Shirt\", \"description\": \"Premium cotton t-shirt\", \"price\": 29.99, \"category\": \"Clothing\", \"stock\": 0, \"sku\": \"TSHIRT-001\"}"
```

---

## Common Test Scenarios

### Test Validation Errors

**Missing required fields:**
```bash
curl -X POST "http://localhost:5000/api/products" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test\"}"
```
Expected: Validation error for missing `price`, `category`, and `sku`

**Invalid price:**
```bash
curl -X POST "http://localhost:5000/api/products" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test Product\", \"price\": -10, \"category\": \"Electronics\", \"sku\": \"TEST-001\"}"
```
Expected: Validation error for negative price

**Invalid category:**
```bash
curl -X POST "http://localhost:5000/api/products" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test Product\", \"price\": 99.99, \"category\": \"InvalidCategory\", \"sku\": \"TEST-001\"}"
```
Expected: Validation error for invalid category

**Duplicate SKU:**
1. Create a product with SKU "TEST-SKU-001"
2. Try to create another product with the same SKU
Expected: Error message "Product with this SKU already exists"

---

## Testing Authorization

### Test without authentication:

```bash
# Try to create product without token
curl -X POST "http://localhost:5000/api/products" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test\", \"price\": 99.99, \"category\": \"Books\", \"sku\": \"TEST-001\"}"
```
Expected: 401 Unauthorized error

### Test updating another user's product:

1. Create account A and create a product
2. Create account B and try to update account A's product
Expected: 403 Forbidden error

---

## Testing with Postman/Insomnia

### Import these endpoints:

**Collection Structure:**
```
REST API Testing
├── Auth
│   ├── POST Register
│   ├── POST Login
│   └── GET Me
├── Products
│   ├── GET All Products
│   ├── GET Single Product
│   ├── POST Create Product
│   ├── PUT Update Product
│   ├── DELETE Delete Product
│   ├── DELETE Permanent Delete (Admin)
│   └── GET Categories
```

**Environment Variables:**
- `BASE_URL`: `http://localhost:5000`
- `ACCESS_TOKEN`: (auto-set after login)

---

## Verify Deployment on Vercel

After deploying to Vercel, test with your production URL:

```bash
# Replace YOUR_VERCEL_URL with your actual Vercel deployment URL
curl -X GET "https://YOUR_VERCEL_URL.vercel.app/"
```

Expected: API information with all endpoints including products

---

## Troubleshooting

**Error: "Access denied. No token provided"**
- Make sure you include the Authorization header with Bearer token

**Error: "Product not found"**
- Verify the product ID is correct
- Check if the product is active (inactive products are hidden from non-admin users)

**Error: "Validation failed"**
- Check the error messages for specific field issues
- Ensure all required fields are provided

**Error: "Failed to fetch products"**
- Check MongoDB connection
- Verify the database is running
- Check server logs for detailed error messages

---

## Next Steps

1. ✅ Test all CRUD operations
2. ✅ Test filtering and search
3. ✅ Test pagination
4. ✅ Test validation errors
5. ✅ Test authorization
6. 🚀 Deploy to Vercel
7. 📊 Test production endpoints
8. 🎨 Build a frontend to consume the API

For detailed API documentation, see [PRODUCTS_API.md](./PRODUCTS_API.md)
