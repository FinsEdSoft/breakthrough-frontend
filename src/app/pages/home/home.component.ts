import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { MessageService, Message } from '../../services/message.service';
import { AuthService, User } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  messages: Message[] = [];
  isLoading = true;
  error: string | null = null;
  isDarkMode = false;
  currentUser: User | null = null;
  private readonly themeSubscription = new Subscription();

  constructor(
    private readonly messageService: MessageService,
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly themeService: ThemeService
  ) {}

  ngOnInit() {
    this.loadUser();
    this.loadMessages();
    
    // Subscribe to theme changes
    this.themeSubscription.add(
      this.themeService.isDarkMode$.subscribe(isDark => {
        this.isDarkMode = isDark;
      })
    );
  }

  ngOnDestroy() {
    this.themeSubscription.unsubscribe();
  }

  private loadUser() {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      // Redirect to login if no user is logged in
      this.router.navigate(['/login']);
    }
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  private loadMessages() {
    this.isLoading = true;
    this.error = null;
    
    this.messageService.getMessages(this.currentUser?.id).subscribe({
      next: (messages) => {
        // Sort messages by order
        this.messages = messages;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading messages:', err);
        this.error = 'Failed to load messages. Please try again.';
        this.isLoading = false;
      }
    });
  }

  refreshMessages() {
    this.loadMessages();
  }

  processMessageContent(content: string): string {
    // Process image tags in the format [image:url]
    // Make sure to handle potential XSS by sanitizing the URL
    var processedContent = content.replace(/\[image:(https?:\/\/[^\]]+)\]/g, 
      '<img src="$1" alt="Message image" class="message-image" loading="lazy" />');

    // Process link tags in the format [link:text](url)
    processedContent = processedContent.replace(/\[link:([^\]]+)\]\((https?:\/\/[^\)]+)\)/g, 
      '<a href="$2" class="message-link" target="_blank" rel="noopener noreferrer">$1</a>');

    return processedContent;
  }

  trackByMessageId(index: number, message: Message): string {
    return message.id;
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
