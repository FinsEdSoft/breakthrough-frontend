import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, IonicModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'BreakThrough.Frontend';

  constructor(private readonly themeService: ThemeService) {}

  ngOnInit() {
    // Initialize theme service to apply saved theme
    this.themeService.listenToSystemTheme();
  }
}
