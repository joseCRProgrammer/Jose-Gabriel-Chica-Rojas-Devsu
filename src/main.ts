// main.ts
import { enableProdMode, importProvidersFrom } from '@angular/core';
import { environment } from './environments/environment';
import { BrowserModule, bootstrapApplication } from '@angular/platform-browser';
import { AppRoutingModule } from './app/app-routing.module';
import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import { AppComponent } from './app/app.component';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { PRODUCT_REPOSITORY } from './app/application/adapter';
import { ProductApiService } from './app/infrastructure/api/product-api.service';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule, AppRoutingModule, BrowserAnimationsModule),
    provideAnimations(),
    provideHttpClient(withInterceptorsFromDi()),
    { provide: PRODUCT_REPOSITORY, useExisting: ProductApiService }
  ]
}).catch((err) => console.error(err));
