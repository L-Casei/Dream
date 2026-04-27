import { Component } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  imports: [CommonModule, SlicePipe],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {

}
