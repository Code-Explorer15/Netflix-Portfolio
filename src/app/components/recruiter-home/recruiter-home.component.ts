import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ResumeDialogComponent } from '../resume-dialog/resume-dialog.component';

interface Profile {
  name: string;
  title: string;
  technologies: string[];
  resumeUrl: string;
  linkedinUrl: string;
  about: string;
  currentRole: string;
}

interface Experience {
  title: string;
  company: string;
  period: string;
  description: string;
}

interface Project {
  title: string;
  description: string;
  technologies: string[];
  imageUrl: string;
}

interface Skill {
  name: string;
  icon: string;
  category: string;
  description: string;
  usage: string;
  color: string;
}

interface JourneyExperience {
  id: number;
  company: string;
  role: string;
  period: string;
  location: string;
  description: string[];
  technologies: string[];
  stopPosition: number; // 0-100 percentage
  flag: string; // 'in' or 'us'
}

@Component({
  selector: 'app-recruiter-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './recruiter-home.component.html',
  styleUrls: ['./recruiter-home.component.scss']
})
export class RecruiterHomeComponent implements OnInit {
  profile: Profile | null = null;
  experience: Experience[] = [];
  projects: Project[] = [];
  loading = true;
  activeTab = 'home';
  topPicksCards: any[] = [];
  continueWatchingCards: any[] = [];
  visitedTabs: string[] = [];
  visitedCards: any[] = [];
  certificates: any[] = [];
  academicProjects: any[] = [];
  currentCertificateIndex: number = 0;
  currentProjectIndex: number = 0;

  selectedSkill: Skill | null = null;
  skillRows: Skill[][] = [];

  // Web Projects Section
  webProjects: any[] = [];
  currentWebProjectIndex: number = 0;

  // Journey Section
  bicyclePosition = 0;
  experienceModalOpen = false;
  selectedJourneyExperience: JourneyExperience | null = null;

  journeyExperiences: JourneyExperience[] = [
    {
      id: 3,
      company: 'Cognizant',
      role: 'Programmer Analyst',
      period: 'Aug 2019 – Aug 2021',
      location: 'Hyderabad, India',
      description: [
        'Developed RESTful APIs using ASP.NET Core and C#, ensuring high performance and scalability.',
        'Built interactive single-page applications (SPAs) using Angular and NGRX for state management.',
        'Implemented vertically sliced architecture and CQRS patterns to improve code maintainability.',
        'Automated CI/CD pipelines using Jenkins and Azure DevOps, reducing deployment time by 40%.',
        'Optimized database performance using Entity Framework Core and SQL Server.'
      ],
      technologies: ['.NET Core', 'C#', 'Angular', 'SQL Server', 'Azure DevOps'],
      stopPosition: 15,
      flag: 'in'
    },
    {
      id: 2,
      company: 'First American',
      role: 'Senior Software Engineer',
      period: 'Aug 2021 – Feb 2024',
      location: 'Hyderabad, India',
      description: [
        'Engineered large-scale enterprise features for Covenant Guard, serving 50,000+ daily users.',
        'Built robust .NET Core microservices and optimized SQL queries, indexes, and stored procedures.',
        'Developed responsive UIs with Angular 14+, React 18, TypeScript, and RxJS.',
        'Automated deployments with Docker, Kubernetes (AKS), and CI/CD pipelines in Azure DevOps.',
        'Integrated JWT/OAuth2, Azure AD, and RBAC for secure access management.',
        'Created LangChain and n8n-based automation agents to streamline workflows.',
        'Designed RAG pipelines using FAISS/Pinecone vector databases for AI search.'
      ],
      technologies: ['.NET Core', 'Angular', 'React', 'Azure', 'Kubernetes', 'AI/ML'],
      stopPosition: 50,
      flag: 'in'
    },
    {
      id: 1,
      company: 'University of Michigan-Flint',
      role: 'Graduate Research Assistant',
      period: 'Jan 2024 – Present',
      location: 'Flint, Michigan',
      description: [
        'Guided and assisted 1,000 – 1,500 students with programming and problem solving.',
        'Provided training on AI, automation, and full-stack technologies.',
        'Built and optimized academic workflows using n8n automation and LangChain AI agents.',
        'Conducted research with Generative AI, transformers, RAG pipelines, and vector databases.',
        'Developed internal academic dashboards using .NET 8, Angular, MySQL, and Azure.',
        'Advocated for AI safety practices and prompt-injection defense.'
      ],
      technologies: ['AI Agents', 'n8n', 'LangChain', 'RAG', '.NET 8', 'Angular'],
      stopPosition: 85,
      flag: 'us'
    }
  ];

  constructor(private http: HttpClient, private router: Router, private dialog: MatDialog) { }

  ngOnInit() {
    // Security check - ensure user came from profile selection
    const selectedProfile = localStorage.getItem('selectedProfile');
    if (!selectedProfile || selectedProfile !== 'recruiter') {
      this.router.navigate(['/']);
      return;
    }

    // Set portfolio access flag
    localStorage.setItem('portfolioAccess', 'true');

    // Prevent browser back/forward navigation
    this.preventBrowserNavigation();

    this.initializeCards();
    this.initializeCertificatesAndProjects();
    this.initializeSkills();
    this.loadData();
  }

  private preventBrowserNavigation() {
    // Navigation is handled by the app component
    // This method is kept for consistency but doesn't interfere with normal navigation
  }

  setActiveTab(tab: string, cardTitle?: string) {
    this.activeTab = tab;
    this.addToVisitedTabs(tab, cardTitle);
    this.updateContinueWatching();
  }

  isEducationActive(): boolean {
    return this.activeTab === 'education' || this.activeTab === 'certificates' || this.activeTab === 'academic-projects';
  }

  goBackToEducation() {
    this.activeTab = 'education';
  }

  goBackToProjects() {
    this.activeTab = 'projects';
  }

  initializeCards() {
    // Define all available cards
    const allCards = [
      { title: 'Skills', tab: 'skills' },
      { title: 'Experience', tab: 'professional' },
      { title: 'AI Projects', tab: 'projects' },
      { title: 'Web Apps', tab: 'web-applications' },
      { title: 'Education', tab: 'education' },
      { title: 'Projects', tab: 'projects' },
      { title: 'Certificates', tab: 'certificates' },
      { title: 'Academic Projects', tab: 'academic-projects' },
      { title: 'Hire Me', tab: 'hire' }
    ];

    // Shuffle the cards randomly
    this.topPicksCards = this.shuffleArray([...allCards]);
  }

  shuffleArray(array: any[]): any[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  addToVisitedTabs(tab: string, cardTitle?: string) {
    if (tab === 'home') return; // Don't track home tab

    const cardInfo = {
      tab: tab,
      title: cardTitle || this.getDefaultTitle(tab)
    };

    // Remove if already exists to avoid duplicates
    this.visitedCards = this.visitedCards.filter(card =>
      !(card.tab === tab && card.title === cardInfo.title)
    );

    // Add to beginning
    this.visitedCards.unshift(cardInfo);

    // Keep only last 3
    if (this.visitedCards.length > 3) {
      this.visitedCards = this.visitedCards.slice(0, 3);
    }
  }

  getDefaultTitle(tab: string): string {
    const cardTitles: { [key: string]: string } = {
      'professional': 'Experience',
      'skills': 'Skills',
      'education': 'Education',
      'projects': 'Projects',
      'certificates': 'Certificates',
      'academic-projects': 'Academic Projects',
      'hire': 'Hire Me'
    };
    return cardTitles[tab] || tab;
  }

  updateContinueWatching() {
    this.continueWatchingCards = this.visitedCards.map(card => ({
      title: card.title,
      tab: card.tab
    }));
  }

  initializeCertificatesAndProjects() {
    // Initialize certificates data
    this.certificates = [
      {
        id: 1,
        title: 'AWS Certified Cloud Practitioner',
        issuer: 'Amazon Web Services',
        date: '2024',
        image: 'assets/images/certificates/aws-cloud-practitioner.jpg',
        description: 'Foundational cloud computing knowledge and AWS services',
        technologies: ['AWS', 'Cloud Computing', 'Security', 'Architecture'],
        category: 'Cloud Platform'
      },
      {
        id: 2,
        title: 'Microsoft Azure Fundamentals',
        issuer: 'Microsoft',
        date: '2023',
        image: 'assets/images/certificates/azure-fundamentals.jpg',
        description: 'Cloud concepts, Azure services, security, and compliance',
        technologies: ['Azure', 'Cloud Services', 'Security', 'Compliance'],
        category: 'Cloud Platform'
      },
      {
        id: 3,
        title: 'Google Cloud Professional Data Engineer',
        issuer: 'Google Cloud',
        date: '2023',
        image: 'assets/images/certificates/gcp-data-engineer.jpg',
        description: 'Designing and building data processing systems',
        technologies: ['GCP', 'Data Engineering', 'BigQuery', 'Machine Learning'],
        category: 'Data Engineering'
      },
      {
        id: 4,
        title: 'Certified Kubernetes Administrator',
        issuer: 'Cloud Native Computing Foundation',
        date: '2024',
        image: 'assets/images/certificates/cka.jpg',
        description: 'Kubernetes cluster administration and management',
        technologies: ['Kubernetes', 'Docker', 'DevOps', 'Container Orchestration'],
        category: 'DevOps'
      },
      {
        id: 5,
        title: 'Angular Developer Certification',
        issuer: 'Angular.io',
        date: '2023',
        image: 'assets/images/certificates/angular-developer.jpg',
        description: 'Advanced Angular development and best practices',
        technologies: ['Angular', 'TypeScript', 'RxJS', 'Frontend Development'],
        category: 'Frontend Development'
      },
      {
        id: 6,
        title: '.NET Core Professional Certification',
        issuer: 'Microsoft',
        date: '2024',
        image: 'assets/images/certificates/dotnet-core.jpg',
        description: 'Enterprise application development with .NET Core',
        technologies: ['.NET Core', 'C#', 'ASP.NET', 'Enterprise Development'],
        category: 'Backend Development'
      }
    ];

    // Initialize academic projects data
    this.academicProjects = [
      {
        id: 1,
        title: 'Netflix Themed Portfolio',
        description: 'A fully responsive, interactive portfolio website inspired by Netflix UI. Features glassmorphism, infinite scroll animations, and dynamic content rendering.',
        technologies: ['Angular', 'TypeScript', 'SCSS', 'Particles.js'],
        image: 'assets/images/projects/portfolio-netflix.jpg', // Placeholder path
        year: '2024',
        category: 'Web Application'
      },
      {
        id: 2,
        title: 'SmartShop',
        description: 'A modern e-commerce platform with real-time inventory management, secure payments, and personalized recommendations.',
        technologies: ['React', 'Node.js', 'MongoDB', 'Redux', 'Stripe'],
        image: 'assets/images/projects/smartshop.jpg', // Placeholder path
        year: '2024',
        category: 'E-Commerce'
      },
      {
        id: 3,
        title: 'Glamora',
        description: 'A luxury fashion and beauty marketplace featuring virtual try-on, AI-driven style suggestions, and seamless shopping experience.',
        technologies: ['Next.js', 'Tailwind CSS', 'PostgreSQL', 'Three.js'],
        image: 'assets/images/projects/glamora.jpg', // Placeholder path
        year: '2023',
        category: 'Fashion Tech'
      },
      {
        id: 4,
        title: 'AI-Powered Student Assistant',
        description: 'LLM-based academic support system using LangChain and OpenAI',
        technologies: ['Python', 'LangChain', 'OpenAI', 'FastAPI', 'React'],
        image: 'assets/images/projects/ai-student-assistant.jpg',
        year: '2024',
        category: 'AI/ML'
      },
      {
        id: 5,
        title: 'Smart Campus Automation',
        description: 'n8n workflow automation for university processes',
        technologies: ['n8n', 'Node.js', 'MongoDB', 'REST APIs'],
        image: 'assets/images/projects/smart-campus.jpg',
        year: '2024',
        category: 'Automation'
      },
      {
        id: 6,
        title: 'Real-time Collaboration Platform',
        description: 'WebRTC-based collaborative workspace for students',
        technologies: ['WebRTC', 'Socket.io', 'Node.js', 'React'],
        image: 'assets/images/projects/collaboration-platform.jpg',
        year: '2023',
        category: 'Web Development'
      }
    ];

    // Filter Web Projects for its own section
    this.webProjects = this.academicProjects.filter(p =>
      ['Web Application', 'E-Commerce', 'Fashion Tech', 'Web Development'].includes(p.category)
    );
  }

  initializeSkills() {
    const allSkills: Skill[] = [
      // Backend
      { name: 'C#', icon: 'devicon-csharp-plain', category: 'Backend', description: 'Modern, object-oriented language for .NET', usage: 'Used for building robust backend services, microservices, and enterprise logic.', color: '#9B4993' },
      { name: '.NET Core', icon: 'devicon-dotnetcore-plain', category: 'Backend', description: 'Cross-platform framework', usage: 'Foundation for high-performance APIs and microservices architecture.', color: '#512BD4' },
      { name: 'Node.js', icon: 'devicon-nodejs-plain', category: 'Backend', description: 'JavaScript runtime', usage: 'Building scalable network applications and real-time services.', color: '#339933' },
      { name: 'Python', icon: 'devicon-python-plain', category: 'Backend/AI', description: 'Versatile programming language', usage: 'Core language for AI/ML models, scripting, and automation.', color: '#3776AB' },

      // Frontend
      { name: 'Angular', icon: 'devicon-angularjs-plain', category: 'Frontend', description: 'Web application framework', usage: 'Developing complex, enterprise-grade single-page applications.', color: '#DD0031' },
      { name: 'React', icon: 'devicon-react-original', category: 'Frontend', description: 'library for user interfaces', usage: 'Building interactive UIs with component-based architecture.', color: '#61DAFB' },
      { name: 'TypeScript', icon: 'devicon-typescript-plain', category: 'Frontend', description: 'Typed JavaScript', usage: 'Ensuring type safety and better developer tooling across the stack.', color: '#3178C6' },
      { name: 'RxJS', icon: 'devicon-rxjs-plain', category: 'Frontend', description: 'Reactive extensions', usage: 'Handling asynchronous data streams and event-based programs.', color: '#B7178C' },

      // Cloud & DevOps
      { name: 'Azure', icon: 'devicon-azure-plain', category: 'Cloud', description: 'Cloud computing service', usage: 'Hosting applications, databases, and AI services.', color: '#007FFF' },
      { name: 'Docker', icon: 'devicon-docker-plain', category: 'DevOps', description: 'Containerization platform', usage: 'Packaging applications for consistent deployment across environments.', color: '#2496ED' },
      { name: 'Kubernetes', icon: 'devicon-kubernetes-plain', category: 'DevOps', description: 'Container orchestration', usage: 'Managing scaling and deployment of containerized applications.', color: '#326CE5' },
      { name: 'Terraform', icon: 'devicon-terraform-plain', category: 'DevOps', description: 'Infrastructure as Code', usage: 'Provisioning and managing cloud infrastructure declaratively.', color: '#7B42BC' },

      // AI & Data
      { name: 'LangChain', icon: 'Use specific icon if available', category: 'AI', description: 'LLM framework', usage: 'Building applications with Large Language Models.', color: '#1C3C3C' }, // Placeholder icon logic might be needed
      { name: 'TensorFlow', icon: 'devicon-tensorflow-original', category: 'AI', description: 'ML library', usage: 'Developing and training machine learning models.', color: '#FF6F00' },
      { name: 'MongoDB', icon: 'devicon-mongodb-plain', category: 'Database', description: 'NoSQL database', usage: 'Storing unstructured data and flexible schemas.', color: '#47A248' },
      { name: 'SQL Server', icon: 'devicon-microsoftsqlserver-plain', category: 'Database', description: 'Relational database', usage: 'Managing structured enterprise data and complex queries.', color: '#CC2927' },
      { name: 'PostgreSQL', icon: 'devicon-postgresql-plain', category: 'Database', description: 'Open source RDBMS', usage: 'Reliable data storage for complex applications.', color: '#4169E1' },
      { name: 'Redis', icon: 'devicon-redis-plain', category: 'Database', description: 'In-memory store', usage: 'Caching and high-performance data access.', color: '#DC382D' }
    ];

    // Distribute skills into rows for the crazy animation effect
    this.skillRows = [
      allSkills.slice(0, 6),
      allSkills.slice(6, 12),
      allSkills.slice(12, 18)
    ];
  }

  openSkillModal(skill: Skill) {
    this.selectedSkill = skill;
  }

  closeSkillModal() {
    this.selectedSkill = null;
  }

  // Web Project navigation methods
  previousWebProject() {
    if (this.currentWebProjectIndex > 0) {
      this.currentWebProjectIndex--;
    }
  }

  nextWebProject() {
    if (this.currentWebProjectIndex < this.webProjects.length - 1) {
      this.currentWebProjectIndex++;
    }
  }

  goToWebProject(index: number) {
    this.currentWebProjectIndex = index;
  }

  getWebProjectTransform(): string {
    return 'translateX(0px)';
  }

  // Certificate navigation methods
  previousCertificate() {
    if (this.currentCertificateIndex > 0) {
      this.currentCertificateIndex--;
    }
  }

  nextCertificate() {
    if (this.currentCertificateIndex < this.certificates.length - 1) {
      this.currentCertificateIndex++;
    }
  }

  goToCertificate(index: number) {
    this.currentCertificateIndex = index;
  }

  // Project navigation methods
  previousProject() {
    if (this.currentProjectIndex > 0) {
      this.currentProjectIndex--;
    }
  }

  nextProject() {
    if (this.currentProjectIndex < this.academicProjects.length - 1) {
      this.currentProjectIndex++;
    }
  }

  goToProject(index: number) {
    this.currentProjectIndex = index;
  }

  getCertificateTransform(): string {
    return 'translateX(0px)';
  }

  getProjectTransform(): string {
    return 'translateX(0px)';
  }

  // Journey Scroll Handler
  onJourneyScroll(event: Event) {
    const element = event.target as HTMLElement;
    const maxScroll = element.scrollWidth - element.clientWidth;
    if (maxScroll > 0) {
      this.bicyclePosition = (element.scrollLeft / maxScroll) * 100;
    }
  }

  openExperienceModal(exp: any) {
    this.selectedJourneyExperience = exp;
    this.experienceModalOpen = true;
  }

  closeExperienceModal() {
    this.experienceModalOpen = false;
    this.selectedJourneyExperience = null;
  }


  loadData() {
    // Load profile data
    this.http.get<Profile>('http://localhost:5000/api/portfolio/profile').subscribe({
      next: (data) => {
        this.profile = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading profile:', error);
        this.loading = false;
      }
    });

    // Load experience data
    this.http.get<Experience[]>('http://localhost:5000/api/portfolio/experience').subscribe({
      next: (data) => this.experience = data,
      error: (error) => console.error('Error loading experience:', error)
    });

    // Load projects data
    this.http.get<Project[]>('http://localhost:5000/api/portfolio/projects').subscribe({
      next: (data) => this.projects = data,
      error: (error) => console.error('Error loading projects:', error)
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  openLinkedIn() {
    window.open('https://www.linkedin.com/in/bharathkumar-bandi-718864194/', '_blank');
  }

  selectedCollege: string | null = null;
  showContactModal = false;
  showMessageSuccessModal = false;

  messageData = {
    name: '',
    email: '',
    phone: '',
    message: ''
  };

  lastSubmittedName = '';

  showCollegeDetails(college: string) {
    this.selectedCollege = college;
  }

  closeCollegeDetails() {
    this.selectedCollege = null;
  }

  showContactDetails() {
    this.showContactModal = true;
  }

  closeContactModal() {
    this.showContactModal = false;
  }


  closeMessageSuccess() {
    this.showMessageSuccessModal = false;
  }



  openResumeModal() {
    console.log('Opening resume dialog...');
    const resumeUrl = '/assets/resume/Bharath_Resume__.pdf';

    // Disable background scrolling
    document.body.style.overflow = 'hidden';

    const dialogRef = this.dialog.open(ResumeDialogComponent, {
      width: '80vw',
      maxWidth: '1000px',
      height: '80vh',
      maxHeight: '80vh',
      data: { resumeUrl: resumeUrl },
      disableClose: false,
      panelClass: 'resume-dialog-container'
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('Resume dialog closed');
      // Re-enable background scrolling
      document.body.style.overflow = 'auto';
    });
  }





  sendMessage() {
    // Store the submitted name before resetting
    this.lastSubmittedName = this.messageData.name;

    // Close contact modal first
    this.closeContactModal();

    // Reset form
    this.messageData = {
      name: '',
      email: '',
      phone: '',
      message: ''
    };

    // Show message success modal after a small delay
    setTimeout(() => {
      this.showMessageSuccessModal = true;
    }, 100);
  }

  visitUniversity(college: string) {
    if (college === 'umich') {
      window.open('https://www.umflint.edu/', '_blank');
    } else if (college === 'vignan') {
      window.open('https://vignanits.ac.in/', '_blank');
    }
  }

  visitUniversityProgram() {
    window.open('https://www.umflint.edu/graduateprograms/computer-science-information-systems-ms/', '_blank');
  }

  goToProfileSelection() {
    // Clear all session data
    localStorage.removeItem('selectedProfile');
    localStorage.removeItem('portfolioAccess');
    localStorage.removeItem('authToken');

    // Navigate to profile selection
    this.router.navigate(['/']);

    // Replace browser history to prevent back navigation
    window.history.replaceState(null, '', '/');
  }
}
