import { Directive, ElementRef, Input, OnDestroy, OnInit, Renderer2 } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';

@Directive({
  selector: '[appServerResponseErrors]',
  standalone: true
})
export class ServerResponseErrorsDirective implements OnInit, OnDestroy {

  @Input('appFormControlErrors') control: AbstractControl | null = null;
  private subscription: Subscription | undefined = undefined;

  constructor(private el: ElementRef, private renderer: Renderer2) {}

  ngOnInit(): void {
    this.subscription = this.control?.statusChanges.subscribe(() => {
      this.updateErrorMessages();
    });
    this.updateErrorMessages();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private updateErrorMessages(): void {
    const errors: ValidationErrors = this.control?.errors || {};
    const errorMessages: string[] = errors ? Object.entries(errors).map((error: any) => {
      if(error[1] === true){
        return error[0];
      }
      return error[1];
    }) : [];

    // Clear previous error messages
    while (this.el.nativeElement.firstChild) {
      this.el.nativeElement.removeChild(this.el.nativeElement.firstChild);
    }

    // Display new error messages
    errorMessages.forEach((message) => {
      const error = this.renderer.createElement('mat-error');
      const text = this.renderer.createText(message);
      this.renderer.setStyle(error, 'color', '#f44336');
      this.renderer.appendChild(error, text);
      this.renderer.appendChild(this.el.nativeElement, error);
    });
  }

}
