import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.scss',
})
export class AdminDashboard implements OnInit {
  readonly unreadMessages = signal(0);
  readonly totalProjects = signal(0);
  readonly totalExperience = signal(0);
  readonly totalEducation = signal(0);
  readonly totalTechnologies = signal(0);

  constructor(private readonly portfolioData: PortfolioDataService) {}

  async ngOnInit(): Promise<void> {
    const [messages, projects, experience, education, technologies] = await Promise.all([
      this.portfolioData.listContactMessages(),
      this.portfolioData.listProjects(),
      this.portfolioData.listExperience(),
      this.portfolioData.listEducationCertificates(),
      this.portfolioData.listTechnologies(),
    ]);
    this.unreadMessages.set(messages.filter((message) => !message.is_read).length);
    this.totalProjects.set(projects.length);
    this.totalExperience.set(experience.length);
    this.totalEducation.set(education.length);
    this.totalTechnologies.set(technologies.length);
  }
}
