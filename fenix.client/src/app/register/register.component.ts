import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { Router, RouterModule } from '@angular/router';
import {  FormControl, FormGroup, ReactiveFormsModule,  Validators } from '@angular/forms';
import { ServerResponseErrorsDirective } from '../Directives/server-response-errors.directive';
import { MatError } from '@angular/material/form-field';
import { APIErrors, ILogInRequest } from '../DTO';
import { confirmPasswordValidator } from '../Directives/password-validator.directive';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { HttpErrorResponse } from '@angular/common/http';


@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  standalone: true,
  imports: [ReactiveFormsModule, RouterModule, ServerResponseErrorsDirective, MatError, MatFormFieldModule, MatInputModule, FormsModule, MatButtonModule, MatIconModule]
})
export class RegisterComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  protected destroyRef = inject(DestroyRef);
  public showPassword: boolean = false;

  protected signupForm = new FormGroup({
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required,
    Validators.minLength(8),
    Validators.pattern(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/
      )]),
    confirmPassword: new FormControl('', [Validators.required])
  },
    { validators: confirmPasswordValidator });

  constructor() {
  }
  ngOnInit(): void {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['repo']);
    }
  }

  onSubmit() {
    if (this.signupForm.valid && this.signupForm.touched) {
      console.log('Form Submitted');
      const logInRequest: ILogInRequest = {
        email: this.signupForm.get('email')?.value ?? '',
        password: this.signupForm.get('password')?.value ?? ''
      };
      const subscriber = this.authService.signup(logInRequest).subscribe(
        {
          next: (response) => {
            if (response.success) {
              this.router.navigate(['repo']);
            } else {
              for (let error of response.errors!) {
                const errorKey = Object.keys(APIErrors).find(key => key === error.error);
                this.signupForm.setErrors({ ... (this.signupForm.errors), [errorKey!]: error.message });
              }
            }
          },
          error: (error: HttpErrorResponse) => {
            let errorMessage = error.message;
            if (error.error.errors.length > 0) {
              error.error.errors.forEach((err: any )=> {
                this.signupForm.setErrors({ ... (this.signupForm.errors || {}), [err.code ]: err?.message });
              })
              return;
            }
            this.signupForm.setErrors({ ... (this.signupForm.errors || {}), 'serverError': error?.message });
          }
        }
      );
      this.destroyRef.onDestroy(() => { subscriber.unsubscribe(); });
    }
  }
}
