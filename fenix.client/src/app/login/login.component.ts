import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ServerResponseErrorsDirective } from '../Directives/server-response-errors.directive';
import { MatError, MatFormFieldModule } from '@angular/material/form-field';
import { APIErrors, ILogInRequest } from '../DTO';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [ ReactiveFormsModule, RouterModule, ServerResponseErrorsDirective, MatError, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule]
})
export class LoginComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  protected destroyRef = inject(DestroyRef);

  private currentIndex: number = 0;
  protected loginForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required])
  });
  public showPassword: boolean = false;
  constructor() {
  }
  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['repo']);
    }
  }

  onSubmit() {
    if (this.loginForm.valid && this.loginForm.touched) {
      console.log('Form Submitted');
      const logInRequest: ILogInRequest = {
        email: this.loginForm.get('email')?.value ?? '',
        password: this.loginForm.get('password')?.value ?? ''
      };
      const subscriber = this.authService.login(logInRequest).subscribe(
        {
          next: (response) => {
            if (response.success) {
              this.router.navigate(['repo']);
            } else {
              for (let error of response.errors!) {
                const errorKey = Object.keys(APIErrors).find(key => key === error.error);
                this.loginForm.setErrors({ ... (this.loginForm.errors), [errorKey!]: error.message });
              }
            }
          },
          error: (error: any) => {
            this.loginForm.setErrors({ ... (this.loginForm.errors || {}), 'serverError': error?.message });
          }
        }
      );
      this.destroyRef.onDestroy(() => { subscriber.unsubscribe(); });
    }
  }
}
