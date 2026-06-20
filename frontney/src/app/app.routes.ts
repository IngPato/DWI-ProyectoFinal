import { Routes } from '@angular/router';

import { Home } from './pages/public/home/home';
import { Paciente } from './pages/private/paciente/paciente';
import { Medico } from './pages/private/medico/medico';

import { pacienteGuard } from './core/guards/paciente-guard-guard';
import { medicoGuard } from './core/guards/medico-guard-guard';

export const routes: Routes = [
  {
    path: '',
    component: Home
  },
  {
    path: 'paciente',
    component: Paciente,
    canActivate: [pacienteGuard]
  },
  {
    path: 'medico',
    component: Medico,
    canActivate: [medicoGuard]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
