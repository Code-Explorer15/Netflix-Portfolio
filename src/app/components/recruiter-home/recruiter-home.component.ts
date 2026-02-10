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

  constructor(private http: HttpClient, private router: Router, private dialog: MatDialog) {}

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

  initializeCards() {
    // Define all available cards
    const allCards = [
      { title: 'Skills', tab: 'skills' },
      { title: 'Experience', tab: 'professional' },
      { title: 'AI Projects', tab: 'projects' },
      { title: 'Web Apps', tab: 'projects' },
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
        title: 'AI-Powered Student Assistant',
        description: 'LLM-based academic support system using LangChain and OpenAI',
        technologies: ['Python', 'LangChain', 'OpenAI', 'FastAPI', 'React'],
        image: 'assets/images/projects/ai-student-assistant.jpg',
        year: '2024',
        category: 'AI/ML'
      },
      {
        id: 2,
        title: 'Smart Campus Automation',
        description: 'n8n workflow automation for university processes',
        technologies: ['n8n', 'Node.js', 'MongoDB', 'REST APIs'],
        image: 'assets/images/projects/smart-campus.jpg',
        year: '2024',
        category: 'Automation'
      },
      {
        id: 3,
        title: 'Real-time Collaboration Platform',
        description: 'WebRTC-based collaborative workspace for students',
        technologies: ['WebRTC', 'Socket.io', 'Node.js', 'React'],
        image: 'assets/images/projects/collaboration-platform.jpg',
        year: '2023',
        category: 'Web Development'
      },
      {
        id: 4,
        title: 'Blockchain Academic Records',
        description: 'Immutable academic credential verification system',
        technologies: ['Ethereum', 'Solidity', 'Web3.js', 'React'],
        image: 'assets/images/projects/blockchain-records.jpg',
        year: '2023',
        category: 'Blockchain'
      },
      {
        id: 5,
        title: 'IoT Smart Lab Management',
        description: 'Sensor-based laboratory equipment monitoring system',
        technologies: ['Arduino', 'Raspberry Pi', 'MQTT', 'Python'],
        image: 'assets/images/projects/iot-lab.jpg',
        year: '2023',
        category: 'IoT'
      },
      {
        id: 6,
        title: 'Predictive Analytics Dashboard',
        description: 'Student performance prediction using machine learning',
        technologies: ['Python', 'Scikit-learn', 'Pandas', 'D3.js'],
        image: 'assets/images/projects/predictive-analytics.jpg',
        year: '2024',
        category: 'Data Science'
      }
    ];
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
    // For centered carousel, we don't need transform as cards are positioned absolutely
    return 'translateX(0px)';
  }

  getProjectTransform(): string {
    // For centered carousel, we don't need transform as cards are positioned absolutely
    return 'translateX(0px)';
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
