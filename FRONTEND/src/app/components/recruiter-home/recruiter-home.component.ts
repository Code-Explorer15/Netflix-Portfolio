import { Component, OnInit, OnDestroy, HostListener, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ResumeDialogComponent } from '../resume-dialog/resume-dialog.component';
import { RESUME_PDF_RELATIVE_PATH } from '../../constants/resume.constants';

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
  flag: string; // 'in' or 'us'
}

@Component({
  selector: 'app-recruiter-home',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './recruiter-home.component.html',
  styleUrls: ['./recruiter-home.component.scss']
})
export class RecruiterHomeComponent implements OnInit, OnDestroy {
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

  // Journey Section (vertical roadmap: index 0 = latest role)
  experienceModalOpen = false;
  selectedJourneyExperience: JourneyExperience | null = null;

  @ViewChild('leftSocket') leftSocket?: ElementRef<HTMLElement>;
  @ViewChild('rightSocket') rightSocket?: ElementRef<HTMLElement>;
  leftPupilStyle = 'translate(0px, 0px)';
  rightPupilStyle = 'translate(0px, 0px)';
  private journeyScrollActive = false;
  private journeyScrollTimer: ReturnType<typeof setTimeout> | null = null;
  private pupilRafId = 0;

  robotBubbleMessages = [
    'Thanks for watching my Portfolio',
    'Did you like my profile?',
    'Double click on me to hire me !!',
    'you can also contact me on my LinkedIn profile',
    'or you can send me a message on my email'
  ];
  robotBubbleVisible = false;
  robotBubbleMessageIndex = 0;
  private robotBubbleFirstMouseMove = false;
  private robotBubbleLastRotateAt = 0;
  private readonly robotBubbleRotateIntervalMs = 2200;

  robotExploding = false;

  /** Collapsible nav on tablet/phone (see SCSS breakpoints). */
  mobileNavOpen = false;

  journeyExperiences: JourneyExperience[] = [
    {
      id: 1,
      company: 'University of Michigan-Flint',
      role: 'Application Developer',
      period: 'Jan 2024 – Dec 2025',
      location: 'Flint, Michigan',
      description: [
        'Build and maintain internal academic dashboards with .NET 8, Angular, MySQL, and Azure.',
        'Automate workflows with n8n and LangChain-based AI agents for staff and student-facing tools.',
        'Mentor 1,000+ students on programming, AI, and full-stack development in labs and workshops.',
        'Design and tune RAG pipelines with vector stores (FAISS/Pinecone) for search and Q&A features.',
        'Apply Generative AI, transformers, and prompt engineering in research and teaching support.',
        'Enforce secure practices: JWT/OAuth patterns, prompt-injection awareness, and data handling.',
        'Collaborate with faculty on integrations, reporting, and iterative UX improvements.',
        'Profile and optimize APIs and SQL for reliability under peak academic traffic.',
        'Document architecture, runbooks, and onboarding so teams can extend systems safely.'
      ],
      technologies: ['.NET 8', 'Angular', 'MySQL', 'Azure', 'n8n', 'LangChain', 'RAG', 'AI/ML'],
      flag: 'us'
    },
    {
      id: 2,
      company: 'First American Financial Corporation',
      role: 'Senior Software Engineer',
      period: 'Aug 2022 – Feb 2024',
      location: 'Hyderabad, India',
      description: [
        'Led features for Covenant Guard and related platforms serving 50,000+ daily users.',
        'Owned .NET Core microservices: design, reviews, and production incident response.',
        'Tuned SQL Server schemas, indexes, and stored procedures for latency and throughput.',
        'Shipped Angular 14+ and React 18 UIs with TypeScript, RxJS, and strong accessibility habits.',
        'Ran CI/CD on Azure DevOps with Docker and Kubernetes (AKS) for repeatable releases.',
        'Implemented JWT, OAuth2, Azure AD, and RBAC across services and SPAs.',
        'Built LangChain and n8n automations to cut manual ops and speed up approvals.',
        'Designed RAG and vector search flows with FAISS/Pinecone for internal knowledge tools.',
        'Mentored engineers on architecture, code quality, and production observability.'
      ],
      technologies: ['.NET Core', 'Angular', 'React', 'Azure', 'Kubernetes', 'Docker', 'AI/ML', 'SQL Server'],
      flag: 'in'
    },
    {
      id: 3,
      company: 'First American Financial Corporation',
      role: 'Software Engineer',
      period: 'Aug 2019 – Aug 2022',
      location: 'Hyderabad, India',
      description: [
        'Developed RESTful APIs with ASP.NET Core and C# for client delivery projects.',
        'Built SPAs with Angular and NGRX with predictable state and reusable modules.',
        'Applied vertically sliced features and CQRS-style boundaries for maintainability.',
        'Ran CI/CD with Jenkins and Azure DevOps, cutting deployment time about 40%.',
        'Modeled data with Entity Framework Core and optimized SQL Server access paths.',
        'Partnered with QA on test plans, regression suites, and defect triage.',
        'Supported production releases with smoke checks and rollback readiness.',
        'Participated in code reviews, coding standards, and knowledge-sharing sessions.',
        'Estimated tasks and communicated risks early to keep sprints predictable.'
      ],
      technologies: ['.NET Core', 'C#', 'Angular', 'NGRX', 'SQL Server', 'Azure DevOps', 'Jenkins'],
      flag: 'in'
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
    this.closeMobileNav();
    if (this.activeTab === 'professional' && tab !== 'professional') {
      this.robotBubbleVisible = false;
      this.robotBubbleFirstMouseMove = false;
      this.robotExploding = false;
    }
    this.activeTab = tab;
    this.addToVisitedTabs(tab, cardTitle);
    this.updateContinueWatching();
  }

  toggleMobileNav(): void {
    this.mobileNavOpen = !this.mobileNavOpen;
  }

  closeMobileNav(): void {
    this.mobileNavOpen = false;
  }

  @HostListener('window:resize')
  onWindowResize(): void {
    if (typeof window !== 'undefined' && window.innerWidth > 992) {
      this.mobileNavOpen = false;
    }
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

  openExperienceModal(exp: any) {
    this.selectedJourneyExperience = exp;
    this.experienceModalOpen = true;
  }

  closeExperienceModal() {
    this.experienceModalOpen = false;
    this.selectedJourneyExperience = null;
  }

  @HostListener('document:mousemove', ['$event'])
  onJourneyAvatarMouseMove(event: MouseEvent) {
    if (this.activeTab !== 'professional') return;
    this.updateRobotBubbleOnMouseMove();
    if (this.journeyScrollActive) {
      this.centerJourneyPupils();
      return;
    }
    if (this.pupilRafId) cancelAnimationFrame(this.pupilRafId);
    const cx = event.clientX;
    const cy = event.clientY;
    this.pupilRafId = requestAnimationFrame(() => {
      this.pupilRafId = 0;
      this.updateJourneyPupils(cx, cy);
    });
  }

  onRobotDoubleClickHire() {
    if (this.robotExploding) return;
    this.robotExploding = true;
    window.setTimeout(() => {
      this.setActiveTab('hire', 'Hire Me');
      window.setTimeout(() => {
        this.showContactDetails();
        this.robotExploding = false;
      }, 120);
    }, 880);
  }

  private updateRobotBubbleOnMouseMove() {
    this.robotBubbleVisible = true;
    const now = Date.now();
    if (!this.robotBubbleFirstMouseMove) {
      this.robotBubbleFirstMouseMove = true;
      this.robotBubbleLastRotateAt = now;
      this.robotBubbleMessageIndex = Math.floor(Math.random() * this.robotBubbleMessages.length);
      return;
    }
    if (now - this.robotBubbleLastRotateAt >= this.robotBubbleRotateIntervalMs) {
      this.robotBubbleLastRotateAt = now;
      this.robotBubbleMessageIndex = this.pickRandomRobotBubbleIndex();
    }
  }

  private pickRandomRobotBubbleIndex(): number {
    const len = this.robotBubbleMessages.length;
    if (len <= 1) return 0;
    let idx: number;
    do {
      idx = Math.floor(Math.random() * len);
    } while (idx === this.robotBubbleMessageIndex);
    return idx;
  }

  @HostListener('window:scroll')
  onJourneyWindowScroll() {
    this.pauseJourneyEyeTrackingForScroll();
  }

  @HostListener('document:wheel', ['$event'])
  onJourneyWheel(_event: WheelEvent) {
    if (this.activeTab !== 'professional') return;
    this.pauseJourneyEyeTrackingForScroll();
  }

  private pauseJourneyEyeTrackingForScroll() {
    if (this.activeTab !== 'professional') return;
    this.journeyScrollActive = true;
    this.centerJourneyPupils();
    if (this.journeyScrollTimer) clearTimeout(this.journeyScrollTimer);
    this.journeyScrollTimer = setTimeout(() => {
      this.journeyScrollActive = false;
      this.journeyScrollTimer = null;
    }, 140);
  }

  private centerJourneyPupils() {
    this.leftPupilStyle = 'translate(0px, 0px)';
    this.rightPupilStyle = 'translate(0px, 0px)';
  }

  private updateJourneyPupils(clientX: number, clientY: number) {
    const left = this.leftSocket?.nativeElement;
    const right = this.rightSocket?.nativeElement;
    if (!left || !right) return;
    this.leftPupilStyle = this.computeJourneyPupil(left, clientX, clientY);
    this.rightPupilStyle = this.computeJourneyPupil(right, clientX, clientY);
  }

  private computeJourneyPupil(socket: HTMLElement, cx: number, cy: number): string {
    const r = socket.getBoundingClientRect();
    const centerX = r.left + r.width / 2;
    const centerY = r.top + r.height / 2;
    const dx = cx - centerX;
    const dy = cy - centerY;
    const maxMove = 6;
    const len = Math.hypot(dx, dy);
    if (len < 0.5) return 'translate(0px, 0px)';
    const scale = Math.min(len, maxMove) / len;
    const tx = dx * scale;
    const ty = dy * scale;
    return `translate(${tx.toFixed(2)}px, ${ty.toFixed(2)}px)`;
  }

  ngOnDestroy() {
    if (this.journeyScrollTimer) clearTimeout(this.journeyScrollTimer);
    if (this.pupilRafId) cancelAnimationFrame(this.pupilRafId);
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

  /** Opens Certificates tab from the UM-Flint college modal. */
  viewUmichCertificate(): void {
    this.closeCollegeDetails();
    this.setActiveTab('certificates', 'Certificates');
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
    document.body.style.overflow = 'hidden';

    const dialogRef = this.dialog.open(ResumeDialogComponent, {
      width: '80vw',
      maxWidth: '1000px',
      height: '80vh',
      maxHeight: '80vh',
      data: { resumeUrl: RESUME_PDF_RELATIVE_PATH },
      disableClose: false,
      panelClass: 'resume-dialog-container'
    });

    dialogRef.afterClosed().subscribe(() => {
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
