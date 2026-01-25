# CHANGELOG

## `v1.0.0` | 12/04/2024
  * This major version initializes the sensobox APP with 3 levels of user: Admin, technician, client
  * **Admin Features:**
    - New admin dashboard introduced
    - New real-time graphs for order quantities and transaction times.
    - New orders table, enhanced capability for admins to view, create, edit, and delete orders.
    - New users table, improved features for managing user characteristics and permissions.
  
  * **Technician Features:**
    - New orders table, have access to view, create and update orders, improving workflow efficiency.
  
  * **Client Features:**
    - New orders table, clients can now track their orders, enhancing transparency and improving user experience.

  * **Enhancements:**
    - General performance improvements across the platform.
    - User interface improvements for easier navigation and usability.

  * **Bug Fixes:**
    - NA

## `v2.0.0` | 22/04/2024
  * Changed database from MySQL to MongoDB for enhanced performance and scalability.

## `v2.1.0` | 22/04/2024
  * **Admin Features:**
    - Added fields to the clients table to capture more detailed client information.
    - Created new graph for tracking order counts over time.
    - Enhanced order graph with trends to provide deeper insights into order data.
    - Added order PDF download functionality for detailed record-keeping.
  * **Technician Features:**
    - Created seeders for initializing the database with predefined data.
    - Added calculator for estimating dimensions and weight of packages.
  * **Enhancements:**
    - Modified users table to differentiate between clients and employees.

## `v2.1.1` | 24/04/2024
  * **Admin Features:**
    - Added order scheduling calendar to manage and track order timelines.
  * **Client Features:**
    - Integrated order scheduling calendar for clients to track their specific orders.

## `v2.2.0` | 29/04/2024
  * **Admin Features:**
    - Created carbon footprint tracker to monitor environmental impact.
  * **Client Features:**
    - Added viewer for clients to see the carbon footprint associated with their orders.

## `v2.3.0` | 30/04/2024
  * Added fields for area and weight of cardboard used per order to help in sustainability tracking.

## `v3.0.0` | 01/05/2024
  * **Major Changes:**
    - Restructured order distinctions to separately track client-specific and technician-specific orders.
    - Enforced restrictions on updating username and company name to maintain data integrity.
  * **General Features:**
    - Added contact management for admin, technicians, and clients.
    - Added job title field to orders to enhance order management.
    - Added last modification date to orders for better tracking.
    - Created a global export URL for streamlined data access and sharing.
    - Modified time units in processing graphs to align with user preferences.

## `v3.1.0` | 02/05/2024
  * **Client Features:**
    - Modified order graph to exclusively display orders relevant to the logged-in client.

## `v3.2.0` | 15/05/2024
  * **Mobile Responsiveness:**
    - Developed a mobile responsive version of the application to ensure seamless user experience across various devices and screen sizes.

## `v3.2.1` | 15/05/2024
  * **Bug Fixes:**
    - Fixed multiple bugs reported in the previous versions to enhance the overall stability and reliability of the application.