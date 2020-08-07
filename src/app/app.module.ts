import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { RouterModule,Routes } from '@angular/router';

import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslateModule } from '@ngx-translate/core';
import 'hammerjs';

import { FuseModule } from '@fuse/fuse.module';
import { FuseSharedModule } from '@fuse/shared.module';
import { FuseProgressBarModule } from '@fuse/components';

import { fuseConfig } from 'app/fuse-config';

import { LayoutModule } from 'app/layout/layout.module';
import { ClientModule } from 'app/client/client.module';
import { CoreModule } from 'app/core/core.module';
import { ToastrModule} from 'ngx-toastr';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ModalModule } from 'ngx-bootstrap/modal';

import { CustomDateAdapter } from 'app/custom.date.adapter';
import { DateAdapter } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
const appRoutes: Routes = [
  {
    path: '**',
    redirectTo: 'declaration',
  }
];

@NgModule({
  declarations: [
    AppComponent   
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'ng-cli-universal' }),
   
    HttpClientModule,
    FormsModule,
   // ApiAuthorizationModule,
    RouterModule.forRoot(appRoutes, { useHash: true }),
    BrowserAnimationsModule,
    ModalModule.forRoot(),


    TranslateModule.forRoot(),

    // Material moment date module
    MatMomentDateModule,

    // Material
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,

    // Fuse modules
    FuseModule.forRoot(fuseConfig),
    FuseProgressBarModule,
    FuseSharedModule,  
    ToastrModule.forRoot({
      positionClass: 'toast-top-center',easing:'swing'
     
     }),

    // App modules
    LayoutModule,  
    CoreModule,   
    ClientModule,
    MatDialogModule
  ],
  providers: [
    { provide: DateAdapter, useClass: CustomDateAdapter}
   // { provide: HTTP_INTERCEPTORS, useClass: AuthorizeInterceptor, multi: true },
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
