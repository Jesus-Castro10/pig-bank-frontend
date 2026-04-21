import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from '../pages/login-component/login-component';
import { RegisterComponent } from '../pages/register-component/register-component';
import { SidebarComponent } from './components/sidebar/sidebar';
import { RouterLink, RouterModule } from '@angular/router';

const EXPORTS = [CommonModule, ReactiveFormsModule, FormsModule, RouterModule];
const DECLARATIONS = [LoginComponent, RegisterComponent,SidebarComponent];

@NgModule({
  declarations: [...DECLARATIONS],
  imports: [...EXPORTS],
  exports: [...EXPORTS, ...DECLARATIONS],
  providers: [],
})
export class SharedModule {}
