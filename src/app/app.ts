import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Footer } from './component/footer/footer';
import { Homepage } from "./component/homepage/homepage";

@Component({
  selector: 'app-root',
    standalone: true,
  imports: [RouterOutlet, Footer],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('store');
}
