import { Component } from '@angular/core';
import { CommonModule, SlicePipe } from '@angular/common';

@Component({
  selector: 'app-aside',
  imports: [CommonModule, SlicePipe],
  templateUrl: './aside.component.html',
  styleUrl: './aside.component.css',
})
export class AsideComponent {

}
