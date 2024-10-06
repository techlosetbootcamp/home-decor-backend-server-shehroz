# Home Decor Backend Server

A reliable API built with **Node.js**, **Yoga-GraphQL**, **PostgreSQL** and **Prisma** for managing home decor-related data. This project provides a variety of queries and mutations for efficient data handling, making it a powerful backend solution for home decor applications.

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Installation](#installation)
- [Usage](#usage)
  - [Getting Started](#getting-started)
- [Sample Testing Queries and Mutations](#sample-testing-queries-and-mutations)
  - [Authentication & User Management](#authentication-user-management)
  - [Category](#category)
  - [Furniture Management](#furniture-management)
  - [User Wishlist](#user-wishlist)
  - [User Reviews on Items](#user-reviews)
  - [Cart Management](#cart-management)
  - [User Order Management](#user-order-management)
- [Contributing](#contributing)

## Features

- GraphQL API for flexible data queries.
- Support for various mutations to manage home decor data.
- Integrated with Prisma for database management.
- Built with TypeScript for type safety and enhanced development experience.

## Technologies Used

- **Node.js**
- **Yoga-GraphQL**
- **Prisma**
- **Type-GraphQL**
- **TypeScript**
- **Express.js**
- **Neon PostgreSQL**

## Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/shehroz-sheri/home-decor-backend-server.git
   cd home-decor-backend-server

2. Install the dependencies:
   
   ```bash
   npm install
   
4. Set up your environment variables. Create a .env file in the root directory and add your database connection string and other necessary configurations:
   
   ```bash
   DATABASE_URL = your_database_url
   PORT = your_port_here (default 4000)
   EMAIL_USER = your_smtp_user_email_here
   EMAIL_PASS = your_smtp_user_password_here
   JWT_SECRET = your_jwt_secret_here
   
6. Run the following command to generate the typegraphQL types from the prisma schema:
   
   ```bash
   npx prisma generate

## Usage
  ### Getting Started
  To start the server, run:
  
      npm run dev
  
  The server will be available at http://localhost:${PORT}, where PORT is defined in your environment variables (default is 4000).

## Sample Testing Queries and Mutations
To test the GraphQL API, follow these steps:
    - Access the GraphQL API: Open your browser and navigate to http://localhost:${PORT}>/graphql.
    - Using GraphQL Playground: You can use the built-in GraphQL playground to test queries and mutations. Here are some sample queries and mutations you can use:

### Authentication & User Management

  #### Register a new user

    mutation {
      register(userData: {
        name: "John Doe"
        email: "john.doe@example.com"
        password: "securepassword"
        phone: "1234567890" (optional field)
        address: "123 Main St, Anytown, USA" (optional field)
      }) {
        id
        name
        email
        phone
        address
        isVerified
      }
    }

#### Login an existing user

    mutation {
      login(email: "john.doe@example.com", password: "securepassword") {
        token
      }
    }

#### Resend OTP

    mutation {
      resendOtp(email: "john.doe@example.com")
    }

#### Delete a user by email

    mutation {
      deleteUserByEmail(email: "john.doe@example.com") {
        id
        name
        email
      }
    }

#### Verify user with OTP (after receiving OTP via email)

    mutation {
      login(email: "john.doe@example.com", password: "securepassword", otp: "123456") {
        token
      }
    }


#### Update user profile

    mutation {
      updateProfile(email: "john.doe@example.com", userData: {
        name: "John Updated"
        phone: "9876543210"
        address: "456 New St, Anytown, USA"
        password: "newpassword123"
      }) {
        id
        name
        email
        phone
        address
        isVerified
      }
    }


#### Delete a user by email
    mutation {
      deleteUserByEmail(email: "john.doe@example.com") {
        id
        name
        email
      }
    }

#### Request to reset password by sending an OTP to the user's email
    mutation {
      forgotPassword(email: "user@example.com")
    }

This mutation will send an OTP to the specified email. If the email is associated with a user, you will receive a success response:
#### Reset the password using the OTP received
    mutation {
      resetPassword(
        email: "user@example.com",
        otp: "123456",  # Replace with the OTP sent to the email
        newPassword: "newSecurePassword123"
      )
    }


### Category
#### Get all categories
    query {
      categories {
        id
        name
      }
    }

#### Create a new category
    mutation {
      createCategory(name: "Sofa") {
        id
        name
      }
    }

#### Delete a category by name
    mutation {
      deleteCategory(name: "Sofa") {
        id
        name
      }
    }

### Furniture Management
#### Get all furniture items
    query {
      furnitures {
        id
        title
        description
        price
        category {
          id
          name
        }
      }
    }
This query will return a list of all furniture items along with their details.
#### Get a specific furniture item by ID
    query {
      furniture(id: 1) {
        id
        title
        description
        price
        category {
          id
          name
        }
      }
    }

Replace "1" with the actual ID of the furniture item you want to fetch.
#### Create a new furniture item
    mutation {
      createFurniture(
        title: "Sofa",
        description: "A comfortable sofa",
        price: 299.99,
        categoryId: 1
      ) {
        id
        title
        description
        price
        category {
          id
          name
        }
      }
    }
This mutation will create a new furniture item and return the created item.
#### Update an existing furniture item
    mutation {
      updateFurniture(
        id: 1,
        title: "Updated Sofa",
        price: 259.99
      ) {
        id
        title
        description
        price
        category {
          id
          name
        }
      }
    }
This mutation updates the title and price of the furniture item with the specified ID.
#### Delete a furniture item
    mutation {
      deleteFurniture(id: 1) {
        id
        title
      }
    }
This mutation deletes the specified furniture item and returns its ID and title.

### User Wishlist
#### Get all favourite furniture items for a user
    query {
      getUserFavourites(email: "user@example.com") {
        id
        title
        description
        price
        category {
          id
          name
        }
      }
    }
Replace "user@example.com" with the actual email of the user whose favourites you want to fetch.
#### Add a furniture item to the user's favourites
    mutation {
      addToFavourites(
        email: "user@example.com",
        furnitureId: 1
      ) {
        id
        title
        description
        price
        category {
          id
          name
        }
      }
    }
This mutation will add the specified furniture item to the user's favourites and return the added item.

#### Remove a furniture item from the user's favourites
    mutation {
      removeFromFavourites(
        email: "user@example.com",  # Replace with the actual user's email
        furnitureId: 1  # Replace with the actual furniture ID
      )
    }
This mutation will remove the specified furniture item from the user's favourites and return true upon success.

### User Reviews on Items
#### Get all reviews for a specific furniture item
    query {
      getReviewsByFurnitureId(furnitureId: 1) {
        id
        rating
        content
        user {
          id
          email
        }
      }
    }
Replace "1" with the actual ID of the furniture item you want to fetch reviews for.
#### Add a review for a furniture item
    mutation {
      addReview(
        furnitureId: 1,   # Replace with the actual furniture ID
        userId: 1,        # Replace with the actual user ID
        rating: 5,        # Rating should be between 1 and 5
        content: "This furniture is excellent!"  # Review content
      ) {
        id
        rating
        content
        user {
          id
          email
        }
      }
    }
This mutation will add a new review for the specified furniture item and return the added review.
#### Update an existing review
    mutation {
      updateReview(
        reviewId: 1,          # Replace with the actual review ID
        rating: 4,            # Updated rating, optional
        content: "Updated content for the review." # Updated content, optional
      ) {
        id
        rating
        content
        user {
          id
          email
        }
      }
    }
This mutation will update the specified review and return the updated review.
#### Delete a review
    mutation {
      deleteReview(reviewId: 1) {
        id
      }
    }
This mutation will delete the specified review and return the ID of the deleted review.

### Cart Management
#### Get the cart for a specific user
    query {
      getCartByUserId(userId: 1) {
        id
        userId
        items {
          id
          quantity
          furniture {
            id
            name
            price
          }
        }
      }
    }
Replace "1" with the actual user ID to fetch the user's cart details.
#### Add an item to the cart
    mutation {
      addItemToCart(
        userId: 1,           # Replace with the actual user ID
        furnitureId: 1,      # Replace with the actual furniture ID
        quantity: 2          # Quantity of the item to add, defaults to 1
      ) {
        id
        quantity
        furniture {
          id
          name
          price
        }
      }
    }
This mutation will add a new item to the specified user's cart and return the added item details.
#### Update the quantity of an item in the cart
    mutation {
      updateCartItemQuantity(
        cartItemId: 1,      # Replace with the actual cart item ID
        quantity: 3          # New quantity to set
      ) {
        id
        quantity
        furniture {
          id
          name
        }
      }
    }
This mutation will update the quantity of the specified cart item and return the updated item details.
#### Remove an item from the cart
    mutation {
      removeItemFromCart(cartItemId: 1) {
        # This mutation returns a boolean value indicating success
      }
    }
This mutation will remove the specified item from the cart.
#### Clear the cart for a user
    mutation {
      clearCart(userId: 1) {
        # This mutation returns a boolean value indicating success
      }
    }
This mutation will clear all items from the user's cart.

### User Order Management
#### Get all orders for authenticated users
    query {
      orders {
        id
        user {
          id
          name
        }
        totalPrice
        items {
          id
          furnitureId
          quantity
          price
        }
        status
      }
    }
This query retrieves a list of all orders along with user details, total price, items in each order, and their statuses.
#### Create a new order
    mutation {
      createOrder(
        userId: 1,                              # Replace with the actual user ID
        items: [
          { furnitureId: 1, price: 100, quantity: 2 },  # Replace with actual furniture ID, price, and quantity
          { furnitureId: 2, price: 50, quantity: 1 }    # Replace with actual furniture ID, price, and quantity
        ],
        totalPrice: 250                         # Total price of the order
      ) {
        id
        totalPrice
        items {
          id
          furnitureId
          quantity
          price
        }
        status
      }
    }
This mutation will create a new order for the specified user and return the details of the created order.
#### Update the status of an order
    mutation {
      updateOrderStatus(
        orderId: 1,                             # Replace with the actual order ID
        status: "SHIPPED"                       # Replace with the desired status (e.g., "PENDING", "COMPLETED", "CANCELLED", etc.)
      ) {
        id
        status
        user {
          id
          name
        }
        items {
          id
          furnitureId
          quantity
        }
      }
    }
This mutation will update the status of the specified order and return the updated order details.

## Contributing
Contributions are welcome! Please feel free to submit a pull request or open an issue if you have suggestions or improvements.













