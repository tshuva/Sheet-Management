# Excel Sheet Management App with Data Validation and Lookups

This Bun web server provides a REST API for managing Excel sheets with robust data validation and lookup capabilities. It ensures data consistency and facilitates dynamic calculations within your spreadsheets.

**Features:**

- **Data Validation:**
    - Define data types (string, integer, double, boolean) for each column during sheet creation.
    - Enforce data integrity by ensuring cell values conform to the specified type.
    - Prevent inconsistencies that could lead to errors or unexpected behavior.
- **Lookup Functionality:**
    - Reference values from other cells using a special syntax (`lookup('[A-Z]\d+')`).
    - Enable dynamic calculations and cell dependencies within the sheet.
    - Simplify complex formulas and improve spreadsheet maintainability.
- **Circular Reference Detection:**
    - Identify and prevent circular references, where cells directly or indirectly reference themselves.
    - Avoid errors caused by infinite loops within the sheet.

**Technology Stack:**

- Backend: Bun (lightweight, fast JavaScript runtime)
- Dependencies: Elysia (web framework), xlsx-populate (Excel file manipulation)

**Running the Application with Docker:**

The project includes a Dockerfile for simplified deployment. It leverages the official Bun image (`oven/bun:1`). See the full Dockerfile for detailed steps.

**API Endpoints:**

The application provides three REST API endpoints for managing your Excel sheets:

1. **POST /sheet:**
    - Creates a new sheet. Provide a JSON body with an array of columns (name: string, type: string specifying data type).
2. . **PATCH /sheet/:id:**
    - Modifies a cell value in an existing sheet. Provide sheet ID (`id`) in the URL path and a JSON body containing:
        - `value`: The new cell value.
        - **`row` (starting from 2):** The row number of the cell to modify (**note: starts from 2, for the second line**).
        - `column`: The column letter of the cell to modify.
3. **GET /sheet/:id**
    - Retrieves an existing sheet for download. Provide the sheet ID (`id`) in the URL path.

**Additional Notes:**

- Consider expanding Dockerfile comments.
- Uncomment test and build lines if applicable.
- Explore environment variables for configuration.
- Document data validation rules and lookup syntax.

This comprehensive README.md guides you in setting up and using your Excel Sheet Management App!
