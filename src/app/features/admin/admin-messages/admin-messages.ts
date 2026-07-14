import { Component, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { PortfolioDataService } from '../../../core/services/portfolio-data.service';
import { ContactMessage } from '../../../core/models/portfolio.models';

@Component({
  selector: 'app-admin-messages',
  standalone: true,
  imports: [DatePipe],
  templateUrl: './admin-messages.html',
  styleUrl: './admin-messages.scss',
})
export class AdminMessages implements OnInit {
  readonly messages = signal<ContactMessage[]>([]);
  readonly loading = signal(true);

  constructor(private readonly portfolioData: PortfolioDataService) {}

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  private async reload(): Promise<void> {
    this.messages.set(await this.portfolioData.listContactMessages());
    this.loading.set(false);
  }

  async toggleRead(message: ContactMessage): Promise<void> {
    await this.portfolioData.markMessageRead(message.id, !message.is_read);
    await this.reload();
  }

  async remove(id: string): Promise<void> {
    await this.portfolioData.deleteContactMessage(id);
    await this.reload();
  }
}
