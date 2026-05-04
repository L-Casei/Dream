import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ChatContainerComponent } from './components/chat-container/chat-container.component';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'chat',
    component: ChatContainerComponent
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];