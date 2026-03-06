# legacy-connect-network 🔗

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/Skyadav1009/legacy-connect-network/blob/main/LICENSE)

A modern TypeScript React project built with Vite, designed to create scalable and accessible UI components using Radix UI and other popular libraries. It focuses on a seamless development experience with powerful tools like React Query, TailwindCSS, and React Hook Form.

## ✨ Features

- Built with React 18 and TypeScript for type safety and modern standards  
- Utilizes Radix UI components for accessible, customizable UI elements  
- State management and server state handled with TanStack React Query  
- Styling with TailwindCSS and utility libraries like clsx and class-variance-authority  
- Form validation using React Hook Form and Zod  
- Responsive and animated UI with embla-carousel-react and tailwindcss-animate  
- Includes linting and formatting tools for maintainable code  
- Ready-to-use scripts for development, build, linting, and preview  

## 🚀 Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Skyadav1009/legacy-connect-network.git
   cd legacy-connect-network
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
4. Open your browser at `http://localhost:5173` (default Vite port)

## 💻 Usage

- Run `npm run dev` to start the app locally with hot-reloading.  
- Use `npm run build` to create a production build in the `dist` folder.  
- Preview the production build with `npm run preview`.  
- Use `npm run lint` to check for code quality and style issues.  

This project is designed as a UI-focused foundation for building rich web applications. Customize components and extend functionality by modifying source files under `src/`.  

## 🤝 Contributing

Contributions are welcome! Please fork the repository and open a pull request with clear descriptions of your changes. Ensure your code passes linting and includes relevant updates to documentation.  

## 📄 License

This project is licensed under the MIT License. See [LICENSE](https://github.com/Skyadav1009/legacy-connect-network/blob/main/LICENSE) for details.

---

```env
# .env.example - Environment Variables Example

# API Keys
# Replace with your actual API keys. Obtain from the respective service provider's dashboard.

# Example: Google Maps API Key
GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here

# Example: Firebase API Key
FIREBASE_API_KEY=your_firebase_api_key_here

# Database Connection String
# Format depends on your database provider; replace with your connection details.
# Example for PostgreSQL:
DATABASE_URL=postgresql://username:password@host:port/database_name

# Security Notes:
# - Keep all API keys and connection strings secret.
# - Do NOT commit real credentials to public repositories.
# - Use environment variables to safely manage sensitive information.

# Optional variables with defaults
PORT=5173
NODE_ENV=development
```