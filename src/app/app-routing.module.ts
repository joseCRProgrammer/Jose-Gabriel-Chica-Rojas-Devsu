// Angular imports
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Project imports
import { AdminComponent } from './theme/layouts/admin-layout/admin-layout.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    children: [
    { path: 'dashboard/products/list', loadComponent: () => import('./presentation/pages/dashboard/product-list/product-list.component').then(m => m.ProductListComponent) },
    { path: 'dashboard/products/create', loadComponent: () => import('./presentation/pages/dashboard/product-create/product-create.component').then(m => m.ProductCreateComponent) },
    { path: 'dashboard/products/edit/:id', loadComponent: () => import('./presentation/pages/dashboard/product-edit/product-edit.component').then(m => m.ProductEditComponent) },
    { path: '', pathMatch: 'full', redirectTo: '/dashboard/products/list' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
