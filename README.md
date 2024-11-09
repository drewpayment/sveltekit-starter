# 🚀 Sveltekit-Starter Project

A modern, feature-rich starter template for building applications with SvelteKit, TailwindCSS, and more!

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Made with SvelteKit](https://img.shields.io/badge/Made%20with-SvelteKit-FF3E00.svg)](https://kit.svelte.dev/)

## ✨ Features

- 🛡️ Built-in authentication system
- 🎨 TailwindCSS for styling
- 🔒 Security-first approach
- 📱 Responsive components
- 🔍 Form validation with Zod
- 🎯 Prettier configuration included
- 🌐 Environment variables management

## 📋 Prerequisites

- [Deno](https://deno.land/) installed on your machine
- Basic knowledge of [SvelteKit](https://kit.svelte.dev/)
- A text editor of your choice

## 🚀 Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/sveltekit-starter.git
cd sveltekit-starter
```

2. Install dependencies:
```bash
deno install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your `.env` file with appropriate values:
```env
PUBLIC_APP_NAME="Sveltekit-Starter"
DATABASE_URL="your-database-url"
ENCRYPTION_KEY="your-encryption-key"
LOG_LEVEL="debug"
```

5. Start the development server:
```bash
deno task dev
```

Visit `http://localhost:5173` to see your app in action! 🎉

## 📁 Project Structure

```
sveltekit-starter/
├── src/
│   ├── components/
│   │   ├── security-keys-card.svelte
│   │   ├── button.svelte
│   │   └── form-description.svelte
│   ├── routes/
│   │   ├── +layout.svelte
│   │   └── +page.svelte
│   └── lib/
│       ├── user.ts
│       ├── form-schema.ts
│       └── schema.ts
├── .env.example
├── .prettierrc
└── README.md
```

## 🔧 Configuration Files

### `.env.example`
Contains template environment variables:
- `PUBLIC_APP_NAME`: Application name
- `DATABASE_URL`: Database connection string
- `ENCRYPTION_KEY`: Key for encryption operations
- `LOG_LEVEL`: Logging level configuration

### `.prettierrc`
Prettier configuration with:
- Tab-based indentation
- Single quotes
- No trailing commas
- Svelte and TailwindCSS plugins

## 🧩 Components

### Core Components
- `button.svelte`: Customizable button component with variants
- `form-description.svelte`: Form description component
- `security-keys-card.svelte`: Security key management component

### Layout Components
- `+layout.svelte`: Main application layout with navigation
- `+page.svelte`: Home page with sign-in functionality

## 🛠️ Development

### Form Validation
The project uses Zod for form validation:
- Email validation
- Password minimum length (8 characters)
- Custom validation schemas

### User Management
The `user.ts` module provides:
- User creation with password hashing
- Secure database storage
- Authentication utilities

## 🤝 Contributing

Contributions are always welcome! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

Please make sure to update tests as appropriate and follow the existing coding style.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [SvelteKit](https://kit.svelte.dev/) for the amazing framework
- [TailwindCSS](https://tailwindcss.com/) for the utility-first CSS
- [Zod](https://github.com/colinhacks/zod) for schema validation

## 📮 Contact

If you have any questions, feel free to reach out:

- Create an issue in this repository
- Drew Payment - [@drewpayment](https://www.threads.net/@drewpayment)

---

Made with ❤️ by Drew Payment