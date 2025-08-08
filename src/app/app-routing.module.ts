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
      {
        path: '',
        redirectTo: '/dashboard/products/list',
        pathMatch: 'full'
      },
      {
        path: 'dashboard/products/create',
        loadComponent: () =>
          import('./presentation/pages/dashboard/product-form/product-form.component')
            .then((c) => c.ProductFormComponent)
      },
      {
        path: 'dashboard/products/update/:id',
        loadComponent: () =>
          import('./presentation/pages/dashboard/product-form/product-form.component')
            .then((c) => c.ProductFormComponent)
      },
      {
        path: 'dashboard/products/list',
        loadComponent: () =>
          import('./presentation/pages/dashboard/product-list/product-list.component')
            .then((c) => c.ProductListComponent)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
