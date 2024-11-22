import { Component } from '@angular/core';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',

})
export class AppComponent  {
  auth = inject(AuthService);
  constructor() {}
    
  title = 'fenix.client';


}
