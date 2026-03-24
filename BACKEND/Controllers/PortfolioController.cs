using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PortfolioController : ControllerBase
{
    [HttpGet("profile")]
    public IActionResult GetProfile()
    {
        var profile = new
        {
            Name = "Bharath Kumar Bandi",
            Title = "Full-Stack & AI Engineer",
            Technologies = new[] { ".NET", "Angular", "Azure", "LLMs" },
            ResumeUrl = "/assets/resume/Full_Stack_Developer.pdf",
            LinkedInUrl = "https://www.linkedin.com/in/bharathkumar-bandi-718864194/",
            About = "Hi 👋 I'm Bharath Kumar Bandi, a Full-Stack & AI Engineer passionate about building impactful applications that combine robust software engineering with applied AI solutions 🚀.",
            CurrentRole = "Graduate Student Ambassador at University of Michigan – Flint 🎓"
        };

        return Ok(profile);
    }

    [HttpGet("experience")]
    public IActionResult GetExperience()
    {
        var experience = new[]
        {
            new
            {
                Title = "Graduate Student Ambassador",
                Company = "University of Michigan-Flint",
                Period = "2024–Present",
                Description = "Mentored 1000+ students on AI, programming, and web dev. Built academic dashboards in .NET 8 + MySQL."
            },
            new
            {
                Title = "Full Stack Software Engineer",
                Company = "First American (India)",
                Period = "2021–2024",
                Description = "Contributed to CovenantGuard, a large-scale real estate risk system handling 25M+ documents. Built microservices in .NET, front-end in Angular, deployed with Azure + Kubernetes."
            },
            new
            {
                Title = "Member of Technical Staff (Intern)",
                Company = "First American (India)",
                Period = "2019–2021",
                Description = "Built C# APIs, Angular components, SQL triggers, integrated with Blackboard LMS. Learned Agile + CI/CD."
            }
        };

        return Ok(experience);
    }

    [HttpGet("skills")]
    public IActionResult GetSkills()
    {
        var skills = new
        {
            FullStack = new[] { "C#", ".NET Core", "Angular", "React", "TypeScript", "REST APIs" },
            AI = new[] { "LangChain", "RAG pipelines", "Vector DBs", "AI agents" },
            Cloud = new[] { "Azure", "Kubernetes", "Docker", "Terraform", "GitHub Actions", "Azure DevOps" },
            Databases = new[] { "SQL Server", "PostgreSQL", "Redis" },
            Security = new[] { "OAuth2", "JWT", "OpenTelemetry", "Grafana", "Prometheus" }
        };

        return Ok(skills);
    }

    [HttpGet("projects")]
    public IActionResult GetProjects()
    {
        var projects = new[]
        {
            new
            {
                Title = "CovenantGuard System",
                Description = "Large-scale real estate risk system handling 25M+ documents",
                Technologies = new[] { ".NET", "Angular", "Azure", "Kubernetes" },
                ImageUrl = "/assets/projects/covenant-guard.jpg"
            },
            new
            {
                Title = "Academic Dashboard",
                Description = "Built academic dashboards in .NET 8 + MySQL",
                Technologies = new[] { ".NET 8", "MySQL", "Angular" },
                ImageUrl = "/assets/projects/academic-dashboard.jpg"
            },
            new
            {
                Title = "AI-Powered Portfolio",
                Description = "This Netflix-style portfolio with AI integration",
                Technologies = new[] { "Angular", ".NET 8", "AI/ML" },
                ImageUrl = "/assets/projects/portfolio.jpg"
            }
        };

        return Ok(projects);
    }

    [Authorize]
    [HttpGet("source-files")]
    public IActionResult GetSourceFiles()
    {
        var sourceFiles = new[]
        {
            new
            {
                Name = "app.component.ts",
                Path = "src/app/app.component.ts",
                Type = "typescript",
                Content = "// Main app component\nimport { Component } from '@angular/core';\n\n@Component({\n  selector: 'app-root',\n  templateUrl: './app.component.html',\n  styleUrls: ['./app.component.scss']\n})\nexport class AppComponent {\n  title = 'Bharath Kumar Bandi Portfolio';\n}"
            },
            new
            {
                Name = "profile.service.ts",
                Path = "src/app/services/profile.service.ts",
                Type = "typescript",
                Content = "// Profile service\nimport { Injectable } from '@angular/core';\nimport { HttpClient } from '@angular/common/http';\n\n@Injectable({\n  providedIn: 'root'\n})\nexport class ProfileService {\n  constructor(private http: HttpClient) { }\n\n  getProfile() {\n    return this.http.get('/api/portfolio/profile');\n  }\n}"
            },
            new
            {
                Name = "Program.cs",
                Path = "backend/Program.cs",
                Type = "csharp",
                Content = "// .NET 8 Program.cs\nusing Microsoft.AspNetCore.Authentication.JwtBearer;\n\nvar builder = WebApplication.CreateBuilder(args);\n\nbuilder.Services.AddControllers();\nbuilder.Services.AddEndpointsApiExplorer();\nbuilder.Services.AddSwaggerGen();\n\nvar app = builder.Build();\n\napp.UseHttpsRedirection();\napp.UseAuthorization();\napp.MapControllers();\n\napp.Run();"
            }
        };

        return Ok(sourceFiles);
    }
}
