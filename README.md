
# Sveltekit-Starter Project

Welcome to the Sveltekit-Starter project! This project is a starter template for building applications with Sveltekit. It includes several configurations and components that can be used as a foundation for your own projects.

## Project Structure

- `.env.example`: This file contains environment variables that are used in the project. The `PUBLIC_APP_NAME` variable is set to "Sveltekit-Starter". The `DATABASE_URL`, `ENCRYPTION_KEY`, and `LOG_LEVEL` are currently empty and need to be filled with appropriate values for your project.

- `.prettierrc`: This file contains the configuration for the Prettier code formatter. It uses tabs for indentation, single quotes for strings, and no trailing commas. It also includes plugins for Svelte and Tailwind CSS.

- `security-keys-card.svelte`, `button.svelte`, `form-description.svelte`: These are Svelte components that can be used in the project. `button.svelte` defines a button component with various variants, `form-description.svelte` defines a description component for forms, and `security-keys-card.svelte` seems to define a component for displaying security keys.

- `user.ts`: This file defines a function `createUser` that creates a new user in the database. The user's password is hashed before it's stored in the database.

- `+layout.svelte`, `+page.svelte`: These are Svelte components that define the layout of the application and the content of the home page, respectively. The layout component includes a navigation bar with a link to sign in or sign out. The page component includes a sign in form with links to create an account and recover password.

- `form-schema.ts`, `schema.ts`: These files define the schema for the sign in form using the Zod library. The schema specifies that the email must be a valid email address and the password must be at least 8 characters long.

## Getting Started

To get started with this project, you'll need to install the dependencies and set up the environment variables. You can do this by running the following commands:

```
deno install
cp .env.example .env
```

Then, fill in the appropriate values for the environment variables in the `.env` file.

To start the development server, run:

```
deno task dev
```

The application will be available at `http://localhost:5173`.

## Contributing

Contributions are welcome! If you find a bug or have a suggestion for a new feature, please open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the LICENSE file for details.