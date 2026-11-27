import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly isRegister = signal(false);
  readonly username = signal('');
  readonly email = signal('lorenzo@example.test');
  readonly password = signal('ascolta');
  readonly error = signal('');
  readonly busy = signal(false);

  toggleMode(): void {
    this.isRegister.update((value) => !value);
    this.error.set('');
  }

  submit(): void {
    this.error.set('');
    this.busy.set(true);
    const request = this.isRegister()
      ? this.auth.register(this.username().trim(), this.email().trim(), this.password())
      : this.auth.login(this.email().trim(), this.password());

    request.subscribe({
      next: () => {
        this.busy.set(false);
        void this.router.navigateByUrl('/library');
      },
      error: () => {
        this.busy.set(false);
        this.error.set('Accesso non riuscito. Controlla i dati e riprova.');
      },
    });
  }
}
