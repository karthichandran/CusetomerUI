import { Component, OnDestroy, OnInit, ViewChildren, QueryList, ElementRef, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormGroupDirective, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { ClientService } from './client.service';
import { StatesService } from '../shared/services/states.service';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { isUndefined } from 'util';

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
  propertyForm: FormGroup;

  clients: any[] = [];
  states: any[] = [];
  form16Options: any[] = [{ 'id': 1, 'description': 'Yes' }, { 'id': 0, 'description': 'No' }];
  paymentMethods: any[] = [{ 'paymentMethodID': 1, 'paymentMethod': 'Lumpsum' }, { 'paymentMethodID': 2, 'paymentMethod': 'per Transaction' }];
  statusDDl: any[] = [{ 'id': 1, 'description': 'Saved' }, { 'id': 2, 'description': 'Submitted' }, { 'id': 3, 'description': 'Cancelled' }, { 'id': 4, 'description': 'Assigned' }, { 'id': 5, 'description': 'Blocked' }, { 'id': 6, 'description': 'Released' }];
  rowData: any[] = [];
  customerData: any = [];
  customerColumnDef: any[] = [];
  customerListColumnDef: any[] = [];
  isRadioButtonTouched: boolean = true;
  showAddressClearBtn: boolean = false;
  propertyList: any[] = [];
  progress: number;
  message: string;
  fileModel: any[] = [];
  filesNameList: any[] = [];
  loadingIndicator: boolean = false;
  reorderable: boolean = true;
  isd2way: any = "+91";
  currentProspectId: number;

  showShareGrid: boolean = false;
  @ViewChildren(FusePerfectScrollbarDirective)
  fuseScrollbarDirectives: QueryList<FusePerfectScrollbarDirective>;
  panDoc: any = {};
  constructor(private _formBuilder: FormBuilder, private statesService: StatesService, private clientService: ClientService, private toastr: ToastrService) {

  }

  ngOnInit(): void {
    // Reactive Form
    this.customerform = this._formBuilder.group({
      prospectID: [''],
      prospectPropertyID:[''],
      name: ['', Validators.required],
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
      allowForm16B:[''],
      form16b: ['yes'],
      alternateNumber: [''],
      isd: ['+91'],
      panBlobID:['']
    });
    this.propertyForm = this._formBuilder.group({
      declarationDate: [''],
      propertyId: [''],
      unitNo:['']
    });
    this.customerColumnDef = [{ 'header': 'Name', 'field': 'name', 'type': 'label' },
    { 'header': 'Share %', 'field': 'share', 'type': 'textbox' }
    ];
    this.customerData = [];
    this.getAllStates();
    this.getAllProperties();
  }

  clear() {
    this.showAddressClearBtn = false;
    this.panDoc = {};
    this.customerData = [];
    this.customerform.reset();
    this.propertyForm.reset();
    this.clients = [];
    this.customerform.get('traces').setValue('no');
    this.customerform.get('form16b').setValue('yes');
    this.customerform.get('isd').setValue('+91');
  }


  /**
     * On destroy
     */
  ngOnDestroy(): void {
  }


  showClient(eve, model: any) {
    if (this.customerform.value.prospectID > 0) {
      if (this.customerform.value.traces == "yes" || this.customerform.value.isTracesRegistered)
        this.customerform.value.isTracesRegistered = true;
      else
        this.customerform.value.isTracesRegistered = false;

      if (this.customerform.value.form16b == 'yes')
        this.customerform.value.allowForm16B = true;
      else
        this.customerform.value.allowForm16B = false;

      this.clients[this.customerform.value.prospectID - 1] = _.clone(this.customerform.value);     
    }

    this.currentProspectId = model.prospectID;

    if (model.isTracesRegistered)
      model.traces = "yes";
    else
      model.traces = "no";

    if (model.allowForm16B)
      model.form16b = "yes";
    else
      model.form16b = "no";
    model.pinCode = isNaN(model.pinCode) ? model.pinCode.trim() : model.pinCode;
    this.customerform.patchValue(model);
    this.loadPanDocument(model.pan);
    this.removeRestriction();    
  } 
 
  panValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      // if input field is empty return as valid else test
      const ret = (control.value !== '') ? new RegExp('^[A-Za-z]{5}[0-9]{4}[A-Za-z]$').test(control.value) : true;
      return !ret ? { 'invalidNumber': { value: control.value } } : null;
    };
  }
  panUploadClick(uploadBtn: Element) {
    if (this.customerform.get('pan').value == "") {
      this.toastr.warning("Please Fill the Pan then upload");
    } else
      uploadBtn.dispatchEvent(new MouseEvent('click'));
    //if (isUndefined(this.panDoc.fileName))
    //  uploadBtn.dispatchEvent(new MouseEvent('click'));
    //else
    //  this.toastr.warning("Please delete the current document then Upload");
  }

  saveCustomer(): void {
    if (!this.ValidateAndCleanCustomer())
      return;

    if (!this.propertyForm.valid) {
      this.toastr.error("Please Fill the Property details");
      return;
    }

    if (!this.validateSharePercentage())
      return;

    //if (this.customerform.valid) {
    //  let isNewEntry = true;
    //  var invalidList = _.filter(this.customerform.controls, function (item) {
    //    return item.validator != null && item.value == "";
    //  })
    //  if (invalidList.length == 0) {
    //    let currentCustomer = this.customerform.value;

    //    if (currentCustomer.traces == "yes") {
    //      if (currentCustomer.tracesPassword == "") {
    //        this.toastr.error("Please enter the Traces password");
    //        return;
    //      }
    //    }     

    //  }
    //  else {
    //    Object.keys(this.customerform.controls).forEach(field => {
    //      const control = this.customerform.get(field);
    //      control.markAsTouched({ onlySelf: true });
    //    });
    //    this.toastr.error("Please fill the all manditory fields");
    //    return;
    //  }

    //  var model = this.customerform.value;
    //  if (model.prospectID == "" || model.prospectID == 0 || model.prospectID == null)
    //    model.prospectID = 0;
    //  else
    //    isNewEntry = false;
    //  if (model.traces == "yes" || model.isTracesRegistered)
    //    model.isTracesRegistered = true;
    //  else
    //    model.isTracesRegistered = false;

    //  if (model.form16b == 'yes')
    //    model.allowForm16B = true;
    //  else
    //    model.allowForm16B = false;

    //  model.dateOfBirth = moment(model.dateOfBirth).local().format();    
    //  model.prospectPropertyID = 0;
    //  if (model.prospectID == 0 ) {
    //    model.prospectID = model.length + 1;
    //    this.clients.push(_.clone(model));
    //  } else {
    //    this.clients[model.prospectID - 1] = _.clone(model);
    //  }

      if (this.clients.length > 1) {
        _.forEach(this.customerData, o => {
          let cusInx = _.findIndex(this.clients, function (item) {
            return item.prospectID == o.prospectID;
          });
          if (cusInx != null) {
            this.clients[cusInx].share = parseFloat(o.share);
          }
        });
      } else {
        this.clients[0].share = 100;
      }

      let property = { 'propertyID': this.propertyForm.value.propertyId, 'unitNo': this.propertyForm.value.unitNo, 'declarationDate': this.propertyForm.value.declarationDate,'prospectPropertyID':0 };
      let vm:any = {};
      vm.prospectPropertyDto = property;
      vm.prospectDto = this.clients;
      this.clientService.saveCustomer(vm).subscribe((res) => {
        this.toastr.success("Customer details saved successfully");
       // this.getCustomer(res);
        this.clear();
      });
   // }
  }

  ValidateAndCleanCustomer() :boolean{
    let name = this.customerform.get('name').value;
    let pan = this.customerform.get('pan').value;
    let emailID = this.customerform.get('emailID').value;
    let mobileNo = this.customerform.get('mobileNo').value;
    let dateOfBirth = this.customerform.get('dateOfBirth').value;
    if ((name == "" && pan == "" && emailID == "" && mobileNo == "" && dateOfBirth == "") ||
      (name != "" && pan != "" && emailID != "" && mobileNo != "" && dateOfBirth != "")) {

      if (pan != "") {

        if (this.customerform.value.traces == "yes" || this.customerform.value.isTracesRegistered)
          this.customerform.value.isTracesRegistered = true;
        else
          this.customerform.value.isTracesRegistered = false;

        if (this.customerform.value.form16b == 'yes')
          this.customerform.value.allowForm16B = true;
        else
          this.customerform.value.allowForm16B = false;;

        if (this.customerform.value.traces == "yes") {
          if (this.customerform.value.tracesPassword == "") {
            this.toastr.error("Please enter the Traces password");
            return;
          }
        }

        this.customerform.value.prospectPropertyID = 0;
        let cusID = this.customerform.value.prospectID;
        if (cusID == 0 || cusID == null || cusID == "") {
          this.customerform.value.prospectID = this.clients.length + 1;        
          this.clients.push(_.clone(this.customerform.value));
        } else {
          this.clients[cusID - 1] = _.clone(this.customerform.value);
        }
      }
      else {
        if (this.clients.length == 0) {
          this.toastr.error("Please fill the all manditory fields");
          return false;
        }
      }
    }
    else {
      this.toastr.error("Please fill the all manditory fields");
      return false;
    }
    
    _.forEach(this.clients, o => {
      o.prospectPropertyID = 0;
      o.dateOfBirth = moment(o.dateOfBirth).local().format();  
    })
   
    return true;
  }
  
  validateSharePercentage(): boolean {
    if(this.clients.length==1)
      return true;
    if (this.clients.length != this.customerData.length)
      this.refreshShareGrid();

    let share: number = 0;
    let toastr = this.toastr;
    let isShareValid: boolean = true;

    _.forEach(this.customerData, function (item) {
      let val = parseFloat(item.share);
      if (isNaN(val) || val == 0) {
        isShareValid = false;
      }
      share += val;
    });
    if (!isShareValid) {
      toastr.error("Please enter valid share value");
      return false;
    }
    if (share != 100 && share > 0) {
      this.toastr.error("Sum of share % must be equal to 100");
      return false;
    }       
    return true;
  }

  getCustomer(id:any) {
    this.clientService.getCustomerByID(id).subscribe(res => {
      res.pinCode = res.pinCode.trim();
      this.customerform.patchValue(res);
    });
  }

  addCoClient() {
    this.clearValidator();
    var invalidList = _.filter(this.customerform.controls, function (item) {
      return item.validator != null && item.value == "";
    })
    
    if (this.customerform.valid && invalidList.length == 0) {
      this.showAddressClearBtn = true;
      if (this.customerform.value.traces == "yes" || this.customerform.value.isTracesRegistered)
        this.customerform.value.isTracesRegistered = true;
      else
        this.customerform.value.isTracesRegistered = false;

      if (this.customerform.value.form16b == 'yes')
        this.customerform.value.allowForm16B = true;
      else
        this.customerform.value.allowForm16B = false;;

      if (this.customerform.value.traces == "yes") {
        if (this.customerform.value.tracesPassword == "") {
          this.toastr.error("Please enter the Traces password");
          return;
        }
      }
      this.customerform.value.prospectPropertyID = 0;
      let cusID = this.customerform.value.prospectID;
      if (cusID == 0 || cusID == null || cusID == "") {
        this.customerform.value.prospectID = this.clients.length + 1;
        this.clients.push(_.clone(this.customerform.value));
      } else {
        this.clients[cusID - 1] = _.clone(this.customerform.value);
      }


      let client = this.customerform.value;
      client.prospectID = 0;
      client.name = '';
      client.mobileNo = '';
      client.emailID = '';
      client.pan = '';
      client.dateOfBirth = '';
      client.form16b = 'yes';
      client.tracesPassword = "";
      //client.customerAlias = "";
      client.alternateNumber = "";
      client.isd = "+91";
      this.customerform.reset();
      this.customerform.patchValue(client);

      //To Reset control validators
      var formcontrl = this.customerform;
      _.forEach(['name',  'mobileNo', 'emailID', 'pan', 'dateOfBirth'], function (item) {
        let control = formcontrl.get(item);
        control.setErrors(null);
      });

      this.panDoc = {};
    }
    else {
      let client = this.customerform.value;
      this.customerform.reset();
      this.customerform.patchValue(client);
    }   
  }
  removeRestriction() {
    this.customerform.removeControl('completed');
  }
  clearValidator() {
    this.customerform.get("alternateNumber").clearValidators();
    this.customerform.get("adressLine1").clearValidators();
    this.customerform.get("addressLine2").clearValidators();
    this.customerform.get("isTracesRegistered").clearValidators();
    this.customerform.get("tracesPassword").clearValidators();
    this.customerform.get("traces").clearValidators();
    this.customerform.get("share").clearValidators();
    this.customerform.get("isd").clearValidators();
    this.customerform.get("prospectID").clearValidators();
    this.customerform.get("allowForm16B").clearValidators();    
  }

  clearAddress(): void {
    this.showAddressClearBtn = false;
    let client = this.customerform.value;
    this.customerform.reset();
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
  getAllProperties() {
    this.clientService.getPropertyList().subscribe((response) => {
      this.propertyList = response;
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

  loadCustomerByPan(id: string) {
    if (id.length != 10) {
      this.toastr.warning("Customer is not available on this pan number");
      return;
    }
    let existInx = _.findIndex(this.clients, o => {
      return o.pan == id;
    });

    if (existInx > -1) {
      return;
    }

    //this.clientService.getCustomerByPan(id).subscribe((response) => {
    //  if (response != null) {
    //    this.customerform.reset();
    //    this.clients.push(response);
    //    this.showClient('',response);
    //  }
    //});
  }
  uploadPan(event) {
    if (event.target.files && event.target.files.length > 0) {
      const files = event.target.files[0];
      let formData = new FormData();
      formData.append(files.name, files);
      this.panDoc.fileName = files.name;
      let pan = this.customerform.get('pan').value;
      this.clientService.uploadPan(formData, pan).subscribe((eve) => {
        if (eve.type == HttpEventType.Sent) {
          this.toastr.success("File Uploaded successfully");
        }
        if (eve.type == HttpEventType.Response) {
          this.customerform.get('panBlobID').setValue(eve.body);
        }
      },
        (err) => { },
        () => {
          event.target.value = "";
          this.loadPanDocument(pan);
        }
      );
    }
  }

  loadPanDocument(id: string) {
    this.clientService.getUploadedPan(id).subscribe((response) => {
      if (response != null)
        this.panDoc = response;
      else {
        this.panDoc = {};
      }
    });
  }

  refreshShareGrid() {
    this.ValidateAndCleanCustomer();
    this.showShareGrid = true;
    this.customerData =[... this.clients];

  }
}
