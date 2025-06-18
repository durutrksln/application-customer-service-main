# Application Customer Service API Documentation

This document provides details about the API endpoints available in the Application Customer Service.

## Root Endpoint

### `GET /`
*   **Description:** A simple root endpoint to check if the API is running.
*   **Response:**
    ```
    Hello, World! This is my Express API with PostgreSQL integration (refactored).
    ```

---

## Authentication Endpoints
All authentication endpoints are mounted under the `/auth` path.

### `POST /auth/register`
*   **Description:** Registers a new user.
*   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword",
      "full_name": "Full Name",
      "role": "customer" // Optional, defaults to 'customer'. Can be 'admin'.
    }
    ```
*   **Response (Success 201):**
    ```json
    {
      "message": "User registered successfully",
      "user": {
        "user_id": 1,
        "email": "user@example.com",
        "full_name": "Full Name",
        "role": "customer",
        "created_at": "..."
      }
    }
    ```

### `POST /auth/login`
*   **Description:** Logs in an existing user.
*   **Request Body:**
    ```json
    {
      "email": "user@example.com",
      "password": "yourpassword"
    }
    ```
*   **Response (Success 200):**
    ```json
    {
      "message": "Login successful",
      "token": "your_jwt_token_here",
      "user": {
        "user_id": 1,
        "email": "user@example.com",
        "full_name": "Full Name",
        "role": "customer",
        // ... other user fields
      }
    }
    ```

### `GET /auth/me`
*   **Description:** Gets the profile of the currently authenticated user.
*   **Authentication:** Requires JWT Token in the `Authorization` header (`Bearer <token>`).
*   **Response (Success 200):**
    ```json
    {
      "user_id": 1,
      "email": "user@example.com",
      "full_name": "Full Name",
      "role": "customer",
      "created_at": "..."
    }
    ```

---

## User Endpoints
All user endpoints are mounted under the `/users` path.

### `GET /users`
*   **Description:** Lists all users.
*   **Authentication:** Requires JWT Token. Admin Role required (`authenticateToken`, `isAdmin` middleware).
*   **Response (Success 200):**
    ```json
    [
      {
        "user_id": 1,
        "email": "user1@example.com",
        "full_name": "User One",
        "role": "customer",
        "created_at": "..."
      },
      {
        "user_id": 2,
        "email": "admin@example.com",
        "full_name": "Admin User",
        "role": "admin",
        "created_at": "..."
      }
    ]
    ```

### `GET /users/:userId`
*   **Description:** Gets a specific user by their ID.
*   **Authentication:** Requires JWT Token (`authenticateToken` middleware).
    *   Admins can access any user.
    *   Regular users can only access their own profile.
*   **Parameters:**
    *   `userId` (integer, required): The ID of the user to retrieve.
*   **Response (Success 200):**
    ```json
    {
      "user_id": 1,
      "email": "user@example.com",
      "full_name": "Full Name",
      "role": "customer",
      "created_at": "..."
    }
    ```

### `PUT /users/:userId`
*   **Description:** Updates a specific user by their ID.
*   **Authentication:** Requires JWT Token (`authenticateToken` middleware).
    *   Admins can update any user, including their role.
    *   Regular users can only update their own `full_name`.
*   **Parameters:**
    *   `userId` (integer, required): The ID of the user to update.
*   **Request Body:**
    ```json
    {
      "full_name": "Updated Full Name", // Optional
      "role": "admin" // Optional, only updatable by an admin
    }
    ```
*   **Response (Success 200):**
    ```json
    {
      "message": "User updated successfully",
      "user": {
        "user_id": 1,
        "email": "user@example.com",
        "full_name": "Updated Full Name",
        "role": "customer", // or "admin" if changed by admin
        "updated_at": "..."
      }
    }
    ```

### `DELETE /users/:userId`
*   **Description:** Deletes a specific user by their ID.
*   **Authentication:** Requires JWT Token. Admin Role required (`authenticateToken`, `isAdmin` middleware).
*   **Parameters:**
    *   `userId` (integer, required): The ID of the user to delete.
*   **Response (Success 204):** No content.

---

## Application Endpoints
All application endpoints are mounted under the `/applications` path.

### `POST /applications`
*   **Description:** Creates a new application.
*   **Authentication:** Requires JWT Token (`authenticateToken` middleware).
*   **Request Body:**
    ```json
    {
      "application_type": "subscription", // e.g., "subscription", "termination", "information_update"
      "applicant_name": "Applicant Name",
      "property_address": "123 Main St, Anytown",
      "installation_number": "INST12345", // Optional
      "dask_policy_number": "DASKPOL987", // Optional
      "is_tenant": false, // boolean
      // ... other fields based on application_type and is_tenant status
      "notes": "Initial application submission." // Optional
    }
    ```
*   **Response (Success 201):**
    ```json
    {
      "application_id": 1,
      "user_id": 12, // ID of the user who submitted
      "application_type": "subscription",
      "applicant_name": "Applicant Name",
      "property_address": "123 Main St, Anytown",
      "status": "pending",
      "submitted_at": "...",
      // ... other fields
    }
    ```

### `GET /applications`
*   **Description:** Lists applications.
    *   Regular users see only their own applications.
    *   Admins see all applications and can use filters.
*   **Authentication:** Requires JWT Token (`authenticateToken` middleware).
*   **Query Parameters (Optional):**
    *   `status` (string): Filter by application status (e.g., `pending`, `approved`, `rejected`).
    *   `application_type` (string): Filter by type.
    *   `user_id` (integer): Admin only, filter by user ID.
*   **Response (Success 200):**
    ```json
    [
      {
        "application_id": 1,
        "user_id": 12,
        "application_type": "subscription",
        "status": "pending",
        // ... other fields
      },
      {
        "application_id": 2,
        "user_id": 15,
        "application_type": "termination",
        "status": "approved",
        // ... other fields
      }
    ]
    ```

### `GET /applications/:applicationId`
*   **Description:** Gets a specific application by its ID.
*   **Authentication:** Requires JWT Token (`authenticateToken` middleware).
    *   Users can only access their own applications.
    *   Admins can access any application.
*   **Parameters:**
    *   `applicationId` (integer, required): The ID of the application.
*   **Response (Success 200):**
    ```json
    {
      "application_id": 1,
      "user_id": 12,
      "application_type": "subscription",
      "applicant_name": "Applicant Name",
      "property_address": "123 Main St, Anytown",
      "status": "pending",
      // ... other fields
    }
    ```

### `PUT /applications/:applicationId`
*   **Description:** Updates a specific application by its ID.
    *   Permissions for updates depend on user role and application status (defined in controller logic).
*   **Authentication:** Requires JWT Token (`authenticateToken` middleware).
*   **Parameters:**
    *   `applicationId` (integer, required): The ID of the application.
*   **Request Body:**
    ```json
    {
      "status": "approved", // Example field an admin might update
      "notes": "Application reviewed and approved by admin." // Example field
      // ... other updatable fields
    }
    ```
*   **Response (Success 200):**
    ```json
    {
      "application_id": 1,
      "user_id": 12,
      "application_type": "subscription",
      "status": "approved",
      "notes": "Application reviewed and approved by admin.",
      "updated_at": "...",
      // ... other fields
    }
    ```

### `DELETE /applications/:applicationId`
*   **Description:** Deletes a specific application by its ID.
    *   Permissions for deletion depend on user role and application status (e.g., admin only, or owner if status is 'pending').
*   **Authentication:** Requires JWT Token (`authenticateToken` middleware).
*   **Parameters:**
    *   `applicationId` (integer, required): The ID of the application.
*   **Response (Success 204):** No content.
```

This formatting uses Markdown headings, bullet points, and code blocks for JSON to make the API documentation clearer and easier to read. I've also added example responses where appropriate.