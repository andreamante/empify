import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { API_BASE_URL } from '../../core/api';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('shows the backend password rules in registration mode', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const modeToggle = fixture.nativeElement.querySelector('.switch-mode button') as HTMLButtonElement;
    modeToggle.click();
    fixture.detectChanges();

    const password = fixture.nativeElement.querySelector('input[name="password"]') as HTMLInputElement;
    expect(password.minLength).toBe(10);
    expect(password.maxLength).toBe(72);
    expect(fixture.nativeElement.textContent).toContain('da 10 a 72 caratteri');
  });

  it('displays the backend authentication error message', () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();

    const email = fixture.nativeElement.querySelector('input[name="email"]') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('input[name="password"]') as HTMLInputElement;
    email.value = 'listener@example.test';
    email.dispatchEvent(new Event('input'));
    password.value = 'incorrect-password';
    password.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const submit = fixture.nativeElement.querySelector('.submit-button') as HTMLButtonElement;
    submit.click();
    httpTesting.expectOne(`${API_BASE_URL}/auth/login`).flush(
      { message: 'Credenziali non valide.' },
      { status: 401, statusText: 'Unauthorized' },
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.form-error')?.textContent).toContain(
      'Credenziali non valide.',
    );
  });
});
