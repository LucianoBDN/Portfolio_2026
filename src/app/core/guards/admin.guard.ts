import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { SupabaseService } from '../services/supabase.service';

export const adminGuard: CanActivateFn = async () => {
  const supabase = inject(SupabaseService);
  const router = inject(Router);
  const auth = inject(AuthService);

  const { data } = await supabase.client.auth.getSession();
  if (data.session) {
    return true;
  }

  auth.isAuthenticated.set(false);
  return router.parseUrl('/admin/login');
};
