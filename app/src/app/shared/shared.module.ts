import { NgModule } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginComponent } from '../pages/login-component/login-component';
import { RegisterComponent } from '../pages/register-component/register-component';
import { SidebarComponent } from './components/sidebar/sidebar';
import { RouterLink, RouterModule } from '@angular/router';
import { CardsComponent } from '../pages/cards.component/cards.component';
import { CatalogComponent } from '../pages/catalogo.component/catalogo.component';
import { HomeComponent } from '../pages/home.component/home.component';
import { UserProfileComponent } from '../pages/user-profile.component/user-profile.component';

const EXPORTS = [CommonModule, ReactiveFormsModule, FormsModule, RouterModule];
const DECLARATIONS = [LoginComponent, RegisterComponent,SidebarComponent, CardsComponent, CatalogComponent,HomeComponent, UserProfileComponent];

@NgModule({
  declarations: [...DECLARATIONS],
  imports: [...EXPORTS],
  exports: [...EXPORTS, ...DECLARATIONS],
  providers: [],
})
export class SharedModule {}
