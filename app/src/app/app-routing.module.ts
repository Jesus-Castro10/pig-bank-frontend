import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './pages/login-component/login-component';
import { RegisterComponent } from './pages/register-component/register-component';
import { AuthGuard } from './core/guards/auth.guard';
import { HomeComponent } from './pages/home.component/home.component';
import { CatalogComponent } from './pages/catalogo.component/catalogo.component';
import { CardsComponent } from './pages/cards.component/cards.component';
import { UserProfileComponent } from './pages/user-profile.component/user-profile.component';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'catalog', component: CatalogComponent },
      { path: 'cards', component: CardsComponent },
      { path: 'profile', component: UserProfileComponent },
      // { path: 'transactions', component: TransactionsComponent },
      { path: '', redirectTo: 'home', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
