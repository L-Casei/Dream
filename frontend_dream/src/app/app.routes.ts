import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ChatContainerComponent } from './components/chat-container/chat-container.component';

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
    path: '**',
    redirectTo: ''
  }
];