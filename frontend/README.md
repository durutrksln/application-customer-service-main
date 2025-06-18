# Customer Service Frontend

This is the frontend application for the Customer Service system, built with React and Tailwind CSS.

## Features

- Modern, responsive UI with Tailwind CSS
- User authentication (login/register)
- Customer management
- Dashboard with statistics
- Detailed customer views

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory and add your backend API URL:
```
REACT_APP_API_URL=http://localhost:3000
```

## Development

To start the development server:

```bash
npm start
```

The application will be available at `http://localhost:3000`.

## Building for Production

To create a production build:

```bash
npm run build
```

The build files will be created in the `build` directory.

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── pages/         # Page components
  ├── App.js         # Main application component
  ├── index.js       # Application entry point
  └── index.css      # Global styles and Tailwind imports
```

## Technologies Used

- React
- React Router
- Tailwind CSS
- Axios for API requests 