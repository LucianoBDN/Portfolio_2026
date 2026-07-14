import { Component, OnInit, signal } from '@angular/core';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import {
  EducationCertificate,
  Experience,
  Hobby,
  Profile,
  Project,
  Technology,
} from '../../../core/models/portfolio.models';
import { Sidebar } from '../../../layout/sidebar/sidebar';
import { Hero } from '../hero/hero';
import { About } from '../about/about';
import { Technologies } from '../technologies/technologies';
import { Projects } from '../projects/projects';
import { Experience as ExperienceSection } from '../experience/experience';
import { Education } from '../education/education';
import { Hobbies } from '../hobbies/hobbies';
import { Contact } from '../contact/contact';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    Sidebar,
    Hero,
    About,
    Technologies,
    Projects,
    ExperienceSection,
    Education,
    Hobbies,
    Contact,
  ],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home implements OnInit {
  readonly loading = signal(true);
  readonly error = signal(false);
  readonly currentYear = new Date().getFullYear();

  profile!: Profile;
  technologies: Technology[] = [];
  projects: Project[] = [];
  experience: Experience[] = [];
  educationCertificates: EducationCertificate[] = [];
  hobbies: Hobby[] = [];

  constructor(private readonly portfolioData: PortfolioDataService) {}

  async ngOnInit(): Promise<void> {
    try {
      const [profile, technologies, projects, experience, educationCertificates, hobbies] =
        await Promise.all([
          this.portfolioData.getProfile(),
          this.portfolioData.listTechnologies(),
          this.portfolioData.listProjects(),
          this.portfolioData.listExperience(),
          this.portfolioData.listEducationCertificates(),
          this.portfolioData.listHobbies(),
        ]);

      this.profile = profile;
      this.technologies = technologies;
      this.projects = projects;
      this.experience = experience;
      this.educationCertificates = educationCertificates;
      this.hobbies = hobbies;
    } catch {
      this.error.set(true);
    } finally {
      this.loading.set(false);
    }
  }
}
