import { Component, OnDestroy, EventEmitter, OnInit, Input, Output, OnChanges, ElementRef, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import * as _ from 'lodash';
@Component({
  selector: 'grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  encapsulation: ViewEncapsulation.None
 
})
export class GridComponent implements OnInit,OnChanges{
  editing:any = {};
  isedit:boolean = true;
  rowData: any[] = [];
  columnDefs: any[] = [];
  loadingIndicator: boolean;
  reorderable: boolean;
  @ViewChild('table', { static: false }) table: DatatableComponent;

  @Input() dataSet: any[];
  @Input() gridColDef: any[];
  @Input() rowSelection: string;
  @Output() selectedRows = new EventEmitter();

  constructor() {
    this.loadingIndicator = true;
    this.reorderable = true;
  }
  ngOnInit(): void {
    this.rowData = this.dataSet;
    this.columnDefs = this.gridColDef;   
    this.loadingIndicator = false;   
  }
  ngOnChanges(changes: any): void {
    this.rowData = changes.dataSet.currentValue;
    this.rowData = [...this.rowData];
    if (this.table && this.table.recalculate) {
      this.table.recalculate();
      window.dispatchEvent(new Event('resize'));
    }
   // this.table.recalculate();
  }

  onSelect(eve) {
    var tet = eve;
    this.selectedRows.emit(eve);
  }
  updateValue(event, cell, rowIndex) {
    console.log('inline editing rowIndex', rowIndex);
    this.editing[rowIndex + cell] = false;
    //this.rowData[rowIndex][cell] = event.target.value;
    this.rowData[rowIndex][cell] = event.value;
    this.rowData = [...this.rowData];
    console.log('UPDATED!', this.rowData[rowIndex][cell]);
  }

  onCheckboxChange(rowIndex,field, val) {
    this.rowData[rowIndex][field] = val.checked;
    this.rowData = [...this.rowData];
  }

  getValue(value,options) {
   let opt= _.filter(options, function (o) {
      return o.id == value;
   });
    return opt == "" ? "" : opt[0].description;
  }

  selectAllCheckbox(field, eve) {
    for (let i = 0; i < this.rowData.length; i++) {
      this.rowData[i][field] = eve.checked;
    }
    this.rowData = [...this.rowData];    
  }
  showInline(field) {
    var data = {};
     _.forEach(this.editing, function (item,key) {
       data[key] = false;
     });
    this.editing = data;
    this.editing[field] = true;
  }

  toggleExpandRow(row) {
    this.rowData = row;
  }

}
