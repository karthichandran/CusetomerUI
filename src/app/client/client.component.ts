import { Component, OnDestroy, OnInit, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormGroupDirective, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import * as Xlsx from 'xlsx';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { ICustomerVM } from './CustomerDto';
import { PropertyService } from '../property/property.service';
import { ClientService } from './client.service';
import { StatesService } from '../shared/services/states.service';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';

// tslint:disable-next-line:no-duplicate-imports
//import { default as _rollupMoment } from 'moment';
//const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
export const MY_FORMATS = {
  parse: {
    dateInput: 'LL',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  }
};

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  animations: fuseAnimations,
  providers: [
    { provide: DateAdapter,  useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]    },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class ClientComponent implements OnInit, OnDestroy {
  customerform: FormGroup;

  clients: any[] = [];
  sellers: any[] = [];
  states: any[] = [];
  form16Options: any[] = [{ 'id': 1, 'description': 'Yes' }, { 'id': 0, 'description': 'No' }];
  paymentMethods: any[] = [{ 'paymentMethodID': 1, 'paymentMethod': 'Lumpsum' }, { 'paymentMethodID': 2, 'paymentMethod': 'per Transaction' }];
  statusDDl: any[] = [{ 'id': 1, 'description': 'Saved' }, { 'id': 2, 'description': 'Submitted' }, { 'id': 3, 'description': 'Cancelled' }, { 'id': 4, 'description': 'Assigned' }, { 'id': 5, 'description': 'Blocked' }, { 'id': 6, 'description': 'Released' }];
  gstCode: any[] = [{ 'id': 1, 'description': '15%' }];
  tdsCode: any[] = [{ 'id': 1, 'description': '15%' }];
  rowData: any[] = [];
  customerData: any = [];
  customerColumnDef: any[] = [];
  customerListColumnDef: any[] = [];
  declaration = new FormControl();
  isRadioButtonTouched: boolean = true;
  showAddressClearBtn: boolean = false;
  propertyList: any[] = [];
  declarationFileName: string;
  statementFileName: string;
  costFileName: string;
  otherFileName: string;
  progress: number;
  message: string;
  fileModel: any[] = [];
  filesNameList: any[] = [];
  loadingIndicator: boolean = false;
  reorderable: boolean = true;
  isd2way: any = "+91";
  @ViewChildren(FusePerfectScrollbarDirective)
  fuseScrollbarDirectives: QueryList<FusePerfectScrollbarDirective>;

  constructor(private _formBuilder: FormBuilder, private statesService: StatesService, private clientService: ClientService, private toastr: ToastrService) {

  }

  ngOnInit(): void {
    // Reactive Form
    this.customerform = this._formBuilder.group({
      prospectID: [''],
      name: ['', Validators.required],
      addressPremises: [''],
      adressLine1: [''],
      addressLine2: [''],
      city: ['', Validators.required],
      stateId: ['', Validators.required],
      pinCode: ['', Validators.compose([Validators.required, this.pinCodeValidator(), Validators.maxLength(10)])],
      pan: ['', Validators.compose([Validators.required, this.panValidator(), Validators.maxLength(10)])],
      emailID: ['', Validators.email],
      mobileNo: ['', Validators.compose([Validators.required, , Validators.maxLength(15)])],
      dateOfBirth: ['', Validators.required],
      isTracesRegistered: [''],
      traces: ['no'],
      tracesPassword: [''],
      share: [''],
      form16b: ['yes'],
      alternateNumber: [''],
      isd: ['+91']
    });

     
    this.getAllStates();
  }

  clear() {
    this.customerform.reset();
  }


  /**
     * On destroy
     */
  ngOnDestroy(): void {
  }


  showClient(model: any) {
    if (model.isTracesRegistered)
      model.traces = "yes";
    else
      model.traces = "no";

    if (model.allowForm16B)
      model.form16b = "yes";
    else
      model.form16b = "no";

    this.customerform.patchValue(model);
  }
 
  panValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      // if input field is empty return as valid else test
      const ret = (control.value !== '') ? new RegExp('^[A-Za-z]{5}[0-9]{4}[A-Za-z]$').test(control.value) : true;
      return !ret ? { 'invalidNumber': { value: control.value } } : null;
    };
  }

  saveCustomer(): void {

    if (this.customerform.valid) {
      let isNewEntry = true;
      var invalidList = _.filter(this.customerform.controls, function (item) {
        return item.validator != null && item.value == "";
      })
      if (invalidList.length == 0) {
        let currentCustomer = this.customerform.value;

        if (currentCustomer.traces == "yes") {
          if (currentCustomer.tracesPassword == "") {
            this.toastr.error("Please enter the Traces password");
            return;
          }
        }     

      }
      else {
        Object.keys(this.customerform.controls).forEach(field => {
          const control = this.customerform.get(field);
          control.markAsTouched({ onlySelf: true });
        });
        this.toastr.error("Please fill the all manditory fields");
        return;
      }

      var model = this.customerform.value;
      if (model.prospectID == "" || model.prospectID == 0 || model.prospectID == null)
        model.prospectID = 0;
      else
        isNewEntry = false;
      if (model.traces == "yes" || model.isTracesRegistered)
        model.isTracesRegistered = true;
      else
        model.isTracesRegistered = false;

      if (model.form16b == 'yes')
        model.allowform16 = true;
      else
        model.allowform16 = false;;

      model.dateOfBirth = moment(model.dateOfBirth).local().format();

      

     
      this.clientService.saveCustomer(model, isNewEntry).subscribe((res) => {
        this.toastr.success("Customer details saved successfully");
        this.getCustomer(res);
                 
        //this.customerform.reset();        
        //this.showAddressClearBtn = false;
       
      });
    }
  }

  getCustomer(id:any) {
    this.clientService.getCustomerByID(id).subscribe(res => {
      res.pinCode = res.pinCode.trim();
      this.customerform.patchValue(res);
    });
  }


  clearAddress(): void {
    this.showAddressClearBtn = false;
    let client = this.customerform.value;
    this.customerform.reset();
    client.addressPremises = '';
    client.adressLine1 = '';
    client.addressLine2 = '';
    client.city = '';
    client.stateId = '';
    client.pinCode = '';
    this.customerform.patchValue(client);
    Object.keys(this.customerform.controls).forEach(field => {
      const control = this.customerform.get(field);
      control.setErrors(null);
    });

  }

  getAllStates() {
    this.statesService.getStates().subscribe((response) => {
      this.states = response;
    });
  }

  selectedState(eve) {
    if (eve.value == 37) {
      this.customerform.get('pinCode').setValue("999999");
    }
  }


  pinCodeValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      // if input field is empty return as valid else test
      const ret = (control.value !== '') ? new RegExp('^[0-9]*$').test(control.value) : true;
      return !ret ? { 'invalidNumber': { value: control.value } } : null;
    };
  }
}
