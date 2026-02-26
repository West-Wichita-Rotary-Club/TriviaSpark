# Tests Directory

This directory contains test files organized by type.

## HTTP Tests (`http/`)

### `api-tests.http`

Main API endpoint tests. Contains HTTP requests for testing various API endpoints.

### `ef-core-v2-api-tests.http`

Entity Framework Core specific API tests for database operations.

### `efcore-test.http`

Additional Entity Framework Core testing scenarios.

## Usage

### VS Code REST Client

These `.http` files are designed to work with the VS Code REST Client extension:

1. Install the "REST Client" extension in VS Code
2. Open any `.http` file
3. Click "Send Request" above each HTTP request block
4. View responses in VS Code

### Manual Testing

You can also use these files as reference for manual testing with tools like:

- Postman
- Insomnia
- curl
- PowerShell Invoke-RestMethod

## File Structure

```
tests/
├── http/
│   ├── api-tests.http           # Main API tests
│   ├── ef-core-v2-api-tests.http # EF Core specific tests
│   └── efcore-test.http         # Additional EF Core tests
└── README.md                    # This file
```

## Development Workflow

1. Start the development server: `npm run dev`
2. Open HTTP test files in VS Code
3. Run individual requests to test API endpoints
4. Verify responses and debug issues
5. Add new test cases as needed

## Integration

These tests complement the automated test scripts in the `tools/` directory and help with:

- Manual API verification
- Debugging specific endpoints
- Documentation of API usage
- Development workflow validation
