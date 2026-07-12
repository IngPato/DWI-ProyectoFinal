import { Routes } from '@angular/router';

import { Home } from './pages/public/home/home';
import { Paciente } from './pages/private/paciente/paciente';
import { Medico } from './pages/private/medico/medico';
import { Admin } from './pages/private/admin/admin';

import { pacienteGuard } from './core/guards/paciente-guard-guard';
import { medicoGuard } from './core/guards/medico-guard-guard';
import { adminGuard } from './core/guards/admin-guard-guard-guard';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'paciente',
    component: Paciente,
    canActivate: [pacienteGuard],
  },
  {
    path: 'medico',
    component: Medico,
    canActivate: [medicoGuard],
  },
  {
    path: 'admin',
    component: Admin,
    canActivate: [adminGuard],
  },
  {
    path: '**',
    redirectTo: '',
  },
];