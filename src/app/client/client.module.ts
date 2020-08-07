import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatRadioModule } from '@angular/material/radio';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { FuseSharedModule } from '@fuse/shared.module';
import { ClientComponent } from 'app/client/client.component';
import { GridModule } from '@fuse/components';
import { MatDialogModule, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageCaptureDialogComponent } from 'app/image-capture/image-capture.component';
import { DeviceDetectorModule } from 'ngx-device-detector';
const routes = [
  {
    path: 'declaration',
    component: ClientComponent
  }
];

@NgModule({
  declarations: [
    ClientComponent,
    ImageCaptureDialogComponent
  ],
  imports: [
    RouterModule.forChild(routes),
    CommonModule,
    MatTabsModule,
    MatButtonModule,
    MatRadioModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    FuseSharedModule,
    GridModule,
    MatDialogModule,
    DeviceDetectorModule
   
  ], providers: []
}
)
export class ClientModule {
}
