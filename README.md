# Bharath Kumar Bandi - Netflix-Style Portfolio

A modern, Netflix-inspired portfolio website built with Angular (frontend) and .NET 8 (backend). This portfolio showcases Bharath Kumar Bandi's work as a Full-Stack & AI Engineer with an interactive, engaging user experience.

## 🎯 Features

### 🎨 Netflix-Style UI
- Dark theme with Netflix-inspired design
- Responsive layout for all devices
- Smooth animations and transitions
- Professional typography and spacing

### 👤 Dual Profile System
- **Recruiter Profile**: Professional portfolio view with resume, experience, and skills
- **Developer Profile**: Code viewer with source files and technical details

### 📱 Recruiter Home Page
- Hero section with key information
- Netflix-style content rows:
  - Today's Top Picks (About, Experience, Skills, Projects)
  - Continue Watching (Music, Reading, Blogs)
- Detailed sections with smooth scrolling navigation

### 🔐 Developer Section
- Secure login system (username: `developer`, password: `P@ssw0rd`)
- Code viewer with syntax highlighting
- File browser with multiple source files
- VS Code-like interface

## 🛠️ Tech Stack

### Frontend
- **Angular 17** - Modern web framework
- **TypeScript** - Type-safe JavaScript
- **SCSS** - Enhanced CSS with variables and mixins
- **RxJS** - Reactive programming

### Backend
- **.NET 8** - Latest .NET framework
- **ASP.NET Core Web API** - RESTful API
- **JWT Authentication** - Secure token-based auth
- **CORS** - Cross-origin resource sharing

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher)
- .NET 8 SDK
- Angular CLI (v17)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd bharathkumar-bandi-portfolio
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install Angular CLI globally** (if not already installed)
   ```bash
   npm install -g @angular/cli
   ```

4. **Navigate to backend directory**
   ```bash
   cd backend
   ```

5. **Restore .NET dependencies**
   ```bash
   dotnet restore
   ```

### Running the Application

#### Option 1: Run both frontend and backend simultaneously
```bash
# From the root directory
npm run dev
```

#### Option 2: Run separately

**Backend (.NET 8 API)**
```bash
cd backend
dotnet run
```
The API will be available at `https://localhost:5000`

**Frontend (Angular)**
```bash
ng serve
```
The application will be available at `http://localhost:4200`

## 📁 Project Structure

```
bharathkumar-bandi-portfolio/
├── src/                          # Angular frontend
│   ├── app/
│   │   ├── components/          # Angular components
│   │   │   ├── profile-selection/
│   │   │   ├── recruiter-home/
│   │   │   ├── developer-login/
│   │   │   └── code-viewer/
│   │   ├── app.component.*
│   │   └── app.routes.ts
│   ├── styles.scss              # Global styles
│   └── index.html
├── backend/                      # .NET 8 backend
│   ├── Controllers/             # API controllers
│   ├── Program.cs               # Application entry point
│   └── Portfolio.Api.csproj    # Project file
├── package.json
├── angular.json
└── README.md
```

## 🎭 User Experience

### Profile Selection
- Landing page with "Who's Watching?" interface
- Two profile options: Recruiter (blue) and Developer (gray)
- Smooth transitions between profiles

### Recruiter Experience
- Professional hero section with key information
- Netflix-style content rows with clickable tiles
- Detailed sections for About, Experience, Skills, and Projects
- Responsive design for all screen sizes

### Developer Experience
- Secure login with JWT authentication
- Code viewer with syntax highlighting
- File browser with multiple source files
- Professional development environment

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Portfolio Data
- `GET /api/portfolio/profile` - Get profile information
- `GET /api/portfolio/experience` - Get work experience
- `GET /api/portfolio/skills` - Get technical skills
- `GET /api/portfolio/projects` - Get project portfolio
- `GET /api/portfolio/source-files` - Get source code files (authenticated)

## 🎨 Design Features

### Netflix-Inspired Elements
- Dark theme with Netflix color palette
- Card-based layout with hover effects
- Smooth scrolling and transitions
- Professional typography
- Responsive grid system

### Color Scheme
- Primary: Netflix Red (#e50914)
- Background: Dark Gray (#141414)
- Text: White (#ffffff)
- Accent: Light Gray (#666666)

## 📱 Responsive Design

- Mobile-first approach
- Tablet and desktop optimizations
- Touch-friendly interactions
- Adaptive layouts for all screen sizes

## 🔒 Security

- JWT token-based authentication
- Secure API endpoints
- CORS configuration
- Input validation and sanitization

## 🚀 Deployment

### Frontend (Angular)
```bash
ng build --configuration production
```

### Backend (.NET 8)
```bash
dotnet publish -c Release
```

## 📞 Contact

**Bharath Kumar Bandi**
- LinkedIn: [bharathkumar-bandi-718864194](https://www.linkedin.com/in/bharathkumar-bandi-718864194/)
- Resume: [Download PDF](https://your-resume-link.pdf)

## 📄 License

This project is for portfolio purposes. All rights reserved.

---

Built with ❤️ by Bharath Kumar Bandi using Angular and .NET 8
