import { Injectable, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly isAuthenticated = signal(false);
  readonly checkedSession = signal(false);

  constructor(private readonly supabase: SupabaseService) {
    this.supabase.client.auth.onAuthStateChange((_event, session) => {
      this.isAuthenticated.set(!!session);
      this.checkedSession.set(true);
    });
    this.supabase.client.auth.getSession().then(({ data }) => {
      this.isAuthenticated.set(!!data.session);
      this.checkedSession.set(true);
    });
  }

  async signIn(email: string, password: string): Promise<string | null> {
    const { error } = await this.supabase.client.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  }

  async signOut(): Promise<void> {
    await this.supabase.client.auth.signOut();
  }
}
