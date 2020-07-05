import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { GridComponent } from '@fuse/components/grid/grid.component';
import { GridClientComponent} from './grid-client/grid-client.component';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

@NgModule({
  declarations: [
    GridComponent,
    GridClientComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    NgxDatatableModule,
    MatSelectModule,
    MatAutocompleteModule
  ],
  exports: [
    GridComponent,
    GridClientComponent
  ]
})
export class GridModule {
}
