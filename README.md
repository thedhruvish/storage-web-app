# Storage Web App

![Version](https://img.shields.io/badge/version-beta-blue)
![License](https://img.shields.io/badge/license-ISC-green)
![Build](https://img.shields.io/badge/build-passing-success)

A modern, full-stack web application for secure file storage, sharing, and management with a Google Drive-like interface.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation / Setup](#installation--setup)
- [Usage](#usage)
- [Screenshots / Demo](#screenshots--demo)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [Roadmap / Future Improvements](#roadmap--future-improvements)
- [Known Issues / Limitations](#known-issues--limitations)
- [License](#license)
- [Acknowledgements / Credits](#acknowledgements--credits)

## Features

- **Secure File Storage**: Upload, store, and manage your files securely in the cloud
- **Intuitive UI**: Modern, responsive interface with dark/light mode support
- **File Organization**: Create folders, move files, and organize your content
- **File Sharing**: Share files and folders with other users with customizable permissions
- **User Authentication**: Secure login with email/password and OAuth options (Google, GitHub)
- **Responsive Design**: Works seamlessly across desktop and mobile devices
- **File Preview**: View files directly in the browser without downloading
- **Search Functionality**: Quickly find files and folders with powerful search
- **Recent & Starred Files**: Easy access to your most important and recently used files
- **Trash Management**: Recover accidentally deleted files from trash

## Tech Stack

### Frontend

- **Framework**: React 19
- **Routing**: TanStack Router
- **State Management**: Zustand, TanStack Query
- **UI Components**: Shadcn UI, Radix UI
- **Styling**: Tailwind CSS
- **Form Handling**: React Hook Form
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Build Tool**: Vite

### Backend

- **Runtime**: Node.js
- **Framework**: Express
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, OAuth (Google, GitHub)
- **File Handling**: Multer
- **Email Service**: Nodemailer
- **Security**: bcrypt for password hashing
- **RBAC**: Role-Based Access Control for user permissions

## Installation / Setup

### Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- MongoDB instance

### Clone the Repository

```bash
git clone https://github.com/thedhruvish/storage-web-app.git
cd storage-web-app
```

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on the provided example:

   ```bash
   cp env.example .env
   ```

4. Configure your environment variables in the `.env` file:

   - Set `MONGO_URL` to your MongoDB connection string
   - Configure OAuth credentials if using social login
   - Set up SMTP details for email functionality

5. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd ../frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file based on the provided example:

   ```bash
   cp env.example .env
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

### Development Mode

- **Backend**: Run `npm run dev` in the backend directory
- **Frontend**: Run `npm run dev` in the frontend directory

### Production Mode

- **Backend**: Run `npm start` in the backend directory
- **Frontend**:
  1. Build the project: `npm run build`
  2. Serve the built files: `npm run serve`

### Common Operations

- **Upload Files**: Click the "Upload" button in the sidebar
- **Create Folders**: Click the "New Folder" button in the sidebar
- **Share Files**: Select a file and use the share option in the context menu
- **Search**: Use the search bar in the header to find files and folders
- **Change View**: Toggle between grid and list views
- **Switch Theme**: Use the theme toggle in the header

## Screenshots / Demo

### 1. Dashboard View with Dark Mode

![Dashboard View](/public/images/img-1.jpg)

### 2. File Upload Interface

![File Upload Interface](/public/images/img-2.jpg)

### 3. Dashboard View with Light Mode

![Light mode dashboard](/public/images/img-3.jpg)

### 4. File Sharing Dialog

![light mode file sharing dialog](/public/images/img-4.jpg)

### 5. List View

![list view](/public/images/img-5.jpg)

## Project Structure

```
├── backend/                # Backend Express application
│   ├── config/            # Configuration files
│   ├── controllers/       # Route controllers
│   ├── middlewares/       # Express middlewares
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   ├── storage/           # File storage directory
│   └── utils/             # Utility functions
│   ├── .env               # Environment variables
│   ├── index.js           # Main Entry Point of application
│
├── frontend/              # React frontend application
│   ├── public/            # Static assets
│   └── src/               # Source code
│       ├── api/           # API client and services
│       ├── components/    # Reusable UI components
│       ├── components/ui  # Shadcn UI components
│       ├── hooks/         # Custom React hooks
│       ├── pages/         # Page components
│       ├── routes/        # Routing configuration
│       ├── store/         # State management
│       └── utils/         # Utility functions
```

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests and linting

   ```bash
   # Backend
   cd backend
   npm run format

   # Frontend
   cd frontend
   npm run lint
   npm run format
   ```

5. Commit your changes (`git commit -m 'Add some amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## Roadmap / Future Improvements

- **Dockerization**: Containerize the application for easier deployment
- **CI/CD Pipeline**: Set up a continuous integration and deployment pipeline
- **Security Enhancements**: Implement more robust security measures
- **End-to-End Encryption**: Enhanced security for sensitive files
- **File Sharing**: Securely share files with other users
- **Version History**: Track and restore previous versions of files
- **Advanced Search**: Full-text search within document contents
- **Integration with Third-Party Services**: Connect with Google Drive(Now support to import data from Google Drive), Dropbox, etc.
- **Enhanced File Preview**: Support for more file types and formats
- **Fast to access using cache**: Cache the data to improve the performance
- **AWS S3 Integration**: Store files in AWS S3 for scalable and secure storage

## Known Issues / Limitations

- Large file uploads (>100MB) may experience timeout issues
- Limited file preview support for specialized file formats
- Performance may degrade with extremely large directories (1000+ files)
- OAuth integration is currently in beta and may have authentication issues
- Mobile experience needs further optimization

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgements / Credits

- [Dhruvish Lathiya](https://dhruvish.in) for the initial project idea and development
- [TanStack](https://tanstack.com/) for React Query and Router
- [Shadcn UI](https://ui.shadcn.com/) for the component library
- [Tailwind CSS](https://tailwindcss.com/) for styling
- [Radix UI](https://www.radix-ui.com/) for accessible UI primitives
- [Lucide Icons](https://lucide.dev/) for the icon set
- [MongoDB](https://www.mongodb.com/) for the database
- [Express](https://expressjs.com/) for the backend framework
- [Vite](https://vitejs.dev/) for the frontend build tool
