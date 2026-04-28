import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ChatContainerComponent } from "./components/chat-container/chat-container.component";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ChatContainerComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'frontend-dream';
}
