import { Component, OnDestroy, EventEmitter, OnInit, Input, Output, OnChanges, ElementRef, Renderer2, ViewChild, ViewEncapsulation } from '@angular/core';
import { DatatableComponent } from "@swimlane/ngx-datatable";
import * as _ from 'lodash';
import * as moment from 'moment';
import {ClientService } from '../../../../app/client/client.service';
@Component({
  selector: 'grid-client',
  templateUrl: './grid-client.component.html',
  styleUrls: ['./grid-client.component.scss'],
  encapsulation: ViewEncapsulation.None

})
export class GridClientComponent implements OnInit, OnChanges {

  paymentMethods: any[] = [{ 'paymentMethodID': 1, 'paymentMethod': 'Lumpsum' }, { 'paymentMethodID': 2, 'paymentMethod': 'per Transaction' }];
  statusDDl: any[] = [{ 'id': 1, 'description': 'Saved' }, { 'id': 2, 'description': 'Submitted' }, { 'id': 3, 'description': 'Cancelled' }, { 'id': 4, 'description': 'Assigned' }, { 'id': 5, 'description': 'Blocked' }, { 'id': 6, 'description': 'Released' }];
  groupData: any[] = [];
  remarks: any[] = [];

  test: any;
  editing: any = {};
  isedit: boolean = true;
  rowData: any[] = [];
  columnDefs: any[] = [];
  loadingIndicator: boolean;
  reorderable: boolean;
  @ViewChild('table', { static: false }) table: DatatableComponent;

  @Input() dataSet: any[];
  @Input() gridColDef: any[];
  @Input() rowSelection: string;
  @Output() selectedRows = new EventEmitter();
  @Output() action = new EventEmitter();

  constructor(private clientService: ClientService) {
    this.loadingIndicator = true;
    this.reorderable = true;
  }
  ngOnInit(): void {
    this.rowData = this.dataSet;
    this.columnDefs = this.gridColDef;
    this.loadingIndicator = false; 
    this.getRemarks();
  }
  
  getRemarks() {
    this.clientService.getRemarks().subscribe((response) => {
      this.remarks = response;
    });
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
    this.rowData[rowIndex][cell] = event.target.value;
    this.rowData = [...this.rowData];
    this.editing[rowIndex + cell] = false;
    console.log('UPDATED!', this.rowData[rowIndex][cell]);
  }

  updateRemark(event: any, cell, rowIndex: any) {
    this.editing[rowIndex + 'remarks'] = false;
    this.rowData[rowIndex][cell] = event.value;
    this.rowData = [...this.rowData];
    this.editing[rowIndex + cell] = false;
  }

  onCheckboxChange(rowIndex, field, val) {
    this.rowData[rowIndex][field] = val.checked;
    this.rowData = [...this.rowData];
  }

  getValue(value, options,id,description) {
    let opt = _.filter(options, function (o) {
      return o[id] == value;
    });
    return opt == "" ? "" : opt[0][description];
  }

  selectAllCheckbox(field, eve) {
    for (let i = 0; i < this.rowData.length; i++) {
      this.rowData[i][field] = eve.checked;
    }
    this.rowData = [...this.rowData];
  }
  showInline(field) {
    var data = {};
    _.forEach(this.editing, function (item, key) {
      data[key] = false;
    });
    this.editing = data;
    this.editing[field] = true;
  }

  toggleExpandRow(row) {
    this.rowData = row;
  }

  save(id: any,row:any) {
    let model = { 'id': id ,'action':'save','row':row};
    this.action.emit(model);
  }



  edit(id: any) {
    let model = { 'id': id, 'action': 'edit' };
    this.action.emit(model);
  }

}
