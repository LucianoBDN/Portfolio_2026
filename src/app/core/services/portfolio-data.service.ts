import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase.service';
import {
  ContactMessage,
  EducationCertificate,
  Experience,
  Hobby,
  Profile,
  Project,
  Technology,
} from '../models/portfolio.models';

@Injectable({ providedIn: 'root' })
export class PortfolioDataService {
  constructor(private readonly supabase: SupabaseService) {}

  private get db() {
    return this.supabase.client;
  }

  // ---- Profile (singleton) ----
  async getProfile(): Promise<Profile> {
    const { data, error } = await this.db.from('profile').select('*').eq('id', 1).single();
    if (error) throw error;
    return data as Profile;
  }

  async updateProfile(patch: Partial<Profile>): Promise<Profile> {
    const { data, error } = await this.db
      .from('profile')
      .update(patch)
      .eq('id', 1)
      .select()
      .single();
    if (error) throw error;
    return data as Profile;
  }

  // ---- Technologies ----
  async listTechnologies(): Promise<Technology[]> {
    const { data, error } = await this.db
      .from('technologies')
      .select('*')
      .order('category')
      .order('sort_order');
    if (error) throw error;
    return data as Technology[];
  }

  async upsertTechnology(tech: Partial<Technology>): Promise<Technology> {
    const { data, error } = await this.db.from('technologies').upsert(tech).select().single();
    if (error) throw error;
    return data as Technology;
  }

  async deleteTechnology(id: string): Promise<void> {
    const { error } = await this.db.from('technologies').delete().eq('id', id);
    if (error) throw error;
  }

  // ---- Projects ----
  async listProjects(): Promise<Project[]> {
    const { data, error } = await this.db
      .from('projects')
      .select('*')
      .order('sort_order')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Project[];
  }

  async upsertProject(project: Partial<Project>): Promise<Project> {
    const { data, error } = await this.db.from('projects').upsert(project).select().single();
    if (error) throw error;
    return data as Project;
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.db.from('projects').delete().eq('id', id);
    if (error) throw error;
  }

  // ---- Experience ----
  async listExperience(): Promise<Experience[]> {
    const { data, error } = await this.db
      .from('experience')
      .select('*')
      .order('start_date', { ascending: false });
    if (error) throw error;
    return data as Experience[];
  }

  async upsertExperience(experience: Partial<Experience>): Promise<Experience> {
    const { data, error } = await this.db
      .from('experience')
      .upsert(experience)
      .select()
      .single();
    if (error) throw error;
    return data as Experience;
  }

  async deleteExperience(id: string): Promise<void> {
    const { error } = await this.db.from('experience').delete().eq('id', id);
    if (error) throw error;
  }

  // ---- Education & Certificates ----
  async listEducationCertificates(): Promise<EducationCertificate[]> {
    const { data, error } = await this.db
      .from('education_certificates')
      .select('*')
      .order('date', { ascending: false });
    if (error) throw error;
    return data as EducationCertificate[];
  }

  async upsertEducationCertificate(
    entry: Partial<EducationCertificate>,
  ): Promise<EducationCertificate> {
    const { data, error } = await this.db
      .from('education_certificates')
      .upsert(entry)
      .select()
      .single();
    if (error) throw error;
    return data as EducationCertificate;
  }

  async deleteEducationCertificate(id: string): Promise<void> {
    const { error } = await this.db.from('education_certificates').delete().eq('id', id);
    if (error) throw error;
  }

  // ---- Hobbies ----
  async listHobbies(): Promise<Hobby[]> {
    const { data, error } = await this.db.from('hobbies').select('*').order('sort_order');
    if (error) throw error;
    return data as Hobby[];
  }

  async upsertHobby(hobby: Partial<Hobby>): Promise<Hobby> {
    const { data, error } = await this.db.from('hobbies').upsert(hobby).select().single();
    if (error) throw error;
    return data as Hobby;
  }

  async deleteHobby(id: string): Promise<void> {
    const { error } = await this.db.from('hobbies').delete().eq('id', id);
    if (error) throw error;
  }

  // ---- Contact messages ----
  async sendContactMessage(message: Pick<ContactMessage, 'name' | 'email' | 'message'>): Promise<void> {
    const { error } = await this.db.from('contact_messages').insert(message);
    if (error) throw error;
  }

  async listContactMessages(): Promise<ContactMessage[]> {
    const { data, error } = await this.db
      .from('contact_messages')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as ContactMessage[];
  }

  async markMessageRead(id: string, isRead: boolean): Promise<void> {
    const { error } = await this.db.from('contact_messages').update({ is_read: isRead }).eq('id', id);
    if (error) throw error;
  }

  async deleteContactMessage(id: string): Promise<void> {
    const { error } = await this.db.from('contact_messages').delete().eq('id', id);
    if (error) throw error;
  }
}
