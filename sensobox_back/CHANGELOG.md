# CHANGELOG

## `v1.0.0` | 12/04/2024
  * This major version introduces the backend for the Nest app with three levels of user: Admin, Technician, Client.

  * **Database Setup:**
    - Initial database schema setup for Orders and Users using TypeORM.
    - Database tables created for storing order details, user information, and process statistics.

  * **Admin Features:**
    - Ability to manage (create, view, update, delete) user accounts and order entries directly from the admin dashboard.
    - New admin dashboard introduced to monitor and manage order processes and user activities.
  
  * **Technician Features:**
    - Access control for technicians to create, view, and update orders, focusing on enhancing workflow efficiency.
  
  * **Client Features:**
    - Clients can now track their orders in real-time via a dedicated client interface, which improves transparency and customer satisfaction.

  * **Order Management:**
    - Comprehensive order tracking from initiation through processing to completion, including detailed statistics for processing times and quantities.
    - Implementation of detailed order entities and controllers to handle various stages of the order process.

  * **User Management:**
    - Enhanced user management features, allowing for detailed control over user permissions and data management through a robust set of API endpoints.

  * **Security Enhancements:**
    - Implementation of role-based access control to ensure that users can only access information and functionality appropriate to their role.
  
  * **API Enhancements:**
    - Detailed API documentation provided using NestJS Swagger to ensure all functionalities are clearly understood and accessible.

  * **Performance Improvements:**
    - General performance improvements to enhance the speed and reliability of database interactions and API responses.

  * **Bug Fixes:**
    - Addressed various bugs identified during the initial testing phase to ensure stability and reliability of the application.

## `v2.0.0` | 22/04/2024
  * Changed backend database from MySQL to MongoDB for enhanced performance and scalability in handling large data sets and non-relational data structures.

## `v2.1.0` | 22/04/2024
  * **Database Enhancements:**
    - Added additional fields to the clients table in the database schema to capture more detailed client information.
    - Introduced new order statistics graph on admin dashboard and API endpoints for its data retrieval.
    - Implemented trends on order statistics graph to provide deeper insights into order data over time.
    - Developed functionality for admins to download order details as PDFs directly from the admin dashboard.

  * **Technical Enhancements:**
    - Created database seeders for initializing the database with predefined user and order data.
    - Implemented dimension and weight calculator tools accessible via API for technicians to estimate package requirements.

  * **API Enhancements:**
    - Updated user API to differentiate endpoints and data handling between clients and employees.

## `v2.1.1` | 24/04/2024
  * **Admin Features:**
    - Implemented order scheduling calendar in the admin dashboard to manage and track order timelines efficiently.
  * **Client Features:**
    - Added client-accessible order scheduling calendar via client interface to track their specific order timelines.

## `v2.2.0` | 29/04/2024
  * **Admin Features:**
    - Developed a carbon footprint tracking feature in the admin dashboard to monitor and manage environmental impact of order processing.
  * **Client Features:**
    - Introduced a client-facing viewer for monitoring the carbon footprint associated with their orders.

## `v2.3.0` | 30/04/2024
  * Added data fields for area and weight of cardboard used per order in the order tracking system to help in sustainability tracking.

## `v3.0.0` | 01/05/2024
  * **Major Changes:**
    - Reworked order differentiation logic in the backend to distinguish between client-specific and technician-specific orders.
    - Implemented restrictions on updating username and company name in the user management API to maintain data integrity and consistency.
  * **Enhancements:**
    - Added new API endpoints for managing contacts within the admin, technician, and client roles.
    - Included job title and last modification date fields to order entities and their corresponding API responses.
    - Created a global export URL endpoint for streamlined data access and sharing.
    - Updated processing time units in the order statistics API to align with user feedback and requirements.

## `v3.1.0` | 02/05/2024
  * **Client-Specific Enhancements:**
    - Modified order statistics graph API to exclusively display data relevant to the logged-in client, enhancing data privacy and relevance.

## `v3.1.1` | 15/05/2024
  * **Bug Fixes:**
    - Fixed multiple bugs reported in the previous versions to enhance the overall stability and reliability of the application.

## `v3.2.0` | 15/05/2024
  * **Database Connectivity:**
    - Established a connection to MongoDB Atlas to leverage cloud-based database services, improving performance, scalability, and data security.
