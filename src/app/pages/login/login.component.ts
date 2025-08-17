import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { IonicModule, ToastController } from '@ionic/angular';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import timezonesList from 'timezones-list';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent implements OnInit, OnDestroy {
  isRegistering = false;
  isDarkMode = false;
  loginForm: FormGroup;
  registrationForm: FormGroup;
  isLoading = false;
  private readonly themeSubscription = new Subscription();
  
  // Get timezone list from the timezones-list package
  timezones = timezonesList.map((tz: any) => tz.label);
  
  filteredTimezones = [...this.timezones];
  isTimezonePopoverOpen = false;

  constructor(
    private readonly formBuilder: FormBuilder, 
    private readonly router: Router,
    private readonly authService: AuthService,
    private readonly toastController: ToastController,
    private readonly themeService: ThemeService
  ) {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.registrationForm = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      gender: ['', Validators.required],
      timezone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
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

  passwordMatchValidator(control: AbstractControl) {
    const form = control as FormGroup;
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');
    return password?.value === confirmPassword?.value ? null : { passwordMismatch: true };
  }

  toggleMode() {
    this.isRegistering = !this.isRegistering;
  }

  onSegmentChange(event: any) {
    this.isRegistering = event.detail.value === 'register';
  }

  toggleTheme() {
    this.themeService.toggleTheme();
  }

  filterTimezones(event: any) {
    const query = event.target.value.toLowerCase();
    this.filteredTimezones = this.timezones.filter((timezone: string) => 
      timezone.toLowerCase().includes(query)
    );
  }

  selectTimezone(timezone: string) {
    this.registrationForm.patchValue({ timezone });
    this.isTimezonePopoverOpen = false;
  }

  onLogin() {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          this.authService.saveUser(response.user);
          this.isLoading = false;
          this.showSuccessToast(`Welcome back, ${response.user.name}!`);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Login failed:', err);
          this.isLoading = false;
          const errorMessage = err.error?.message || 'Login failed. Please try again.';
          this.showErrorToast(errorMessage);
        }
      });
    } else {
      this.markFormGroupTouched(this.loginForm);
    }
  }

  onRegister() {
    if (this.registrationForm.valid && !this.isLoading) {
      this.isLoading = true;
      const userData = {
        name: this.registrationForm.value.name,
        email: this.registrationForm.value.email,
        gender: this.registrationForm.value.gender,
        timezone: this.registrationForm.value.timezone,
        password: this.registrationForm.value.password
      };

      this.authService.register(userData).subscribe({
        next: (response) => {
          console.log('Registration successful:', response);
          this.authService.saveUser(response.user);
          this.isLoading = false;
          this.showSuccessToast(`Welcome to BreakThrough, ${response.user.name}!`);
          this.router.navigate(['/home']);
        },
        error: (err) => {
          console.error('Registration failed:', err);
          this.isLoading = false;
          const errorMessage = err.error?.message || 'Registration failed. Please try again.';
          this.showErrorToast(errorMessage);
        }
      });
    } else {
      this.markFormGroupTouched(this.registrationForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 4000,
      position: 'top',
      color: 'danger',
      buttons: [
        {
          text: 'Dismiss',
          role: 'cancel'
        }
      ]
    });
    await toast.present();
  }

  private async showSuccessToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 3000,
      position: 'top',
      color: 'success'
    });
    await toast.present();
  }

  openTermsAndConditions(event: Event) {
    event.preventDefault();
    // For now, we'll open in a new tab. In a real app, you might show a modal
    // or navigate to a dedicated terms page
    window.open('https://example.com/terms', '_blank');
  }

  openPrivacyPolicy(event: Event) {
    event.preventDefault();
    // For now, we'll open in a new tab. In a real app, you might show a modal
    // or navigate to a dedicated privacy page
    window.open('https://example.com/privacy', '_blank');
  }
}
