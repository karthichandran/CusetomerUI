import { Component, OnDestroy, OnInit, ViewChildren, QueryList, ElementRef, ViewChild ,ViewEncapsulation} from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormGroupDirective, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import { HttpEventType } from '@angular/common/http';
import { fuseAnimations } from '@fuse/animations';
import { FusePerfectScrollbarDirective } from '@fuse/directives/fuse-perfect-scrollbar/fuse-perfect-scrollbar.directive';
import { ClientService } from './client.service';
import { StatesService } from '../shared/services/states.service';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { MatStepper } from '@angular/material/stepper';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { DateAdapter, MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import * as _moment from 'moment';
import { isUndefined } from 'util';
import * as fileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageCaptureDialogComponent} from 'app/image-capture/image-capture.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ThemePalette } from '@angular/material/core';
// tslint:disable-next-line:no-duplicate-imports
//import { default as _rollupMoment } from 'moment';
//const moment = _rollupMoment || _moment;

// See the Moment.js docs for the meaning of these formats:
// https://momentjs.com/docs/#/displaying/format/
//export const MY_FORMATS = {
//  parse: {
//    dateInput: 'LL',
//  },
//  display: {
//    dateInput: 'DD-MMM-YYYY',
//    monthYearLabel: 'MMM YYYY',
//    dateA11yLabel: 'LL',
//    monthYearA11yLabel: 'MMMM YYYY',
//  }
//};

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
  //providers: [
  //  { provide: DateAdapter,  useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]    },
  //  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  //],
})
export class ClientComponent implements OnInit, OnDestroy {
  coOwnersForms:any[] = [];
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
  isMobile: boolean = false;
  showShareGrid: boolean = false;
  @ViewChildren(FusePerfectScrollbarDirective)
  fuseScrollbarDirectives: QueryList<FusePerfectScrollbarDirective>;
  panDoc: any = {};
  VisibleCoCownerBtn: boolean = false;
  ShowCoOwnerOption: boolean = true;
  ShowMoreCoOwnerOption: boolean = false;
  shareTab: boolean = true;
  currentCustomer: number = 0;
  selectedTab: number = 0;
  showGird: boolean = false;
  tabBackgroundColor: string = "#ff4081";
  @ViewChild('shareGrid') sharegridRef: ElementRef;
  @ViewChild('nameField') nameFieldRef: ElementRef;
  constructor(private _formBuilder: FormBuilder, private statesService: StatesService, private clientService: ClientService, private toastr: ToastrService, private dialog: MatDialog, private deviceService: DeviceDetectorService) {

  }
  customerformObj() {
    return this._formBuilder.group({
      prospectID: [''],
      prospectPropertyID: [''],
      name: ['', Validators.required],
      addressPremises: [''],
      adressLine1: ['', Validators.required],
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
      allowForm16B: [''],
      form16b: ['yes'],
      alternateNumber: [''],
      isd: ['+91'],
      panBlobId: [''],
      label: ['Owner']
    });
  }

  ngOnInit(): void {
    // Reactive Form
    this.customerform = this._formBuilder.group({
      prospectID: [''],
      prospectPropertyID: [''],
      name: ['', Validators.required],
      addressPremises: [''],
      adressLine1: ['', Validators.required],
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
      allowForm16B: [''],
      form16b: ['yes'],
      alternateNumber: [''],
      isd: ['+91'],
      panBlobId: [''],
      label: ['Owner']
    });
    let item = {
      'label': 'Customer',
      ShowCoOwnerOption: true,
      ShowMoreCoOwnerOption: false,
      ShowDeleteBtn: false,
      AddNewCoOwner: '',
      AddMoreCoOwner: '',
      Previous: false,
      Next: false,
      Back: false,
      showAddressClearBtn: false,
      panDoc: {},
      'owner': this.customerformObj()
    };
    this.coOwnersForms.push(item);
    this.propertyForm = this._formBuilder.group({
      declarationDate: [new Date()],
      propertyID: [''],
      unitNo: [''],
      prospectPropertyID:['']
    });
    this.customerColumnDef = [{ 'header': 'Name', 'field': 'name', 'type': 'label' },
    { 'header': 'Share %', 'field': 'share', 'type': 'textbox' }
    ];
    this.customerData = [];
    this.getAllStates();
    this.getAllProperties();
    this.checkDevice();
  }

  checkDevice() {
    const isMobileDev = this.deviceService.isMobile();
    const isTabletDev = this.deviceService.isTablet();
    if (isMobileDev || isTabletDev)
      this.isMobile = true;
    else
      this.isMobile = false;
  }

  clear() {
    this.propertyForm.reset();
    this.coOwnersForms = [];
    this.addTab();
    this.coOwnersForms[this.coOwnersForms.length-1].Back = false;
    this.coOwnersForms[this.coOwnersForms.length - 1].ShowDeleteBtn = false;
  }

  
  ngOnDestroy(): void {
  }
  addTab() {
    let item = {
      'label': 'Customer',
      ShowCoOwnerOption: true,
      ShowMoreCoOwnerOption: false,
      ShowDeleteBtn: false,
      AddNewCoOwner : '',
      AddMoreCoOwner: '',
      Previous: false,
      Next: false,
      Back: true,
      showAddressClearBtn : false,
      panDoc: {},
      'owner': this.customerformObj()
    };
    if (this.coOwnersForms.length >= 1) {
      item.ShowCoOwnerOption = false;
      item.ShowMoreCoOwnerOption = true;
    }
    var existItem = _.clone(this.coOwnersForms[this.coOwnersForms.length - 1].owner);
    item.owner.get("addressPremises").setValue(existItem.value.addressPremises);
    item.owner.get("adressLine1").setValue(existItem.value.adressLine1);
    item.owner.get("addressLine2").setValue(existItem.value.addressLine2);
    item.owner.get("city").setValue(existItem.value.city);
    item.owner.get("stateId").setValue(existItem.value.stateId);
    item.owner.get("pinCode").setValue(existItem.value.pinCode);
    //item.owner.get("isTracesRegistered").setValue(existItem.value.isTracesRegistered);
    //item.owner.get("traces").setValue(existItem.value.traces);
    //item.owner.get("tracesPassword").setValue(existItem.value.tracesPassword);
    item.owner.get("allowForm16B").setValue(existItem.value.allowForm16B);
    item.owner.get("form16b").setValue(existItem.value.form16b);
    item.showAddressClearBtn = true;
    this.coOwnersForms.push(item);   
    this.shareTab = true;
    var newIndex = this.coOwnersForms.length - 1;
    if (this.selectedTab == newIndex) {
      this.selectedTab = 0;
      setTimeout(() => {
        this.selectedTab = newIndex;
      }, 500);
      
    }
    else
      this.selectedTab = newIndex;
  }
  showClient(eve, model: any) {

    this.currentProspectId = model.prospectID;

    if (model.isTracesRegistered)
      model.traces = "yes";
    else
      model.traces = "no";

    if (model.allowForm16B)
      model.form16b = "yes";
    else
      model.form16b = "no";
    model.pinCode = isNaN(model.pinCode) ? "" : model.pinCode.trim();
    this.customerform.patchValue(model);
    //Note : this should be enable after complete
    this.loadPanDocument(model.pan);
  }

  panValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      // if input field is empty return as valid else test
      const ret = (control.value !== '') ? new RegExp('^[A-Za-z]{5}[0-9]{4}[A-Za-z]$').test(control.value) : true;
      return !ret ? { 'invalidNumber': { value: control.value } } : null;
    };
  }
  panUploadClick(uploadBtn: Element) {
    if (this.coOwnersForms[this.currentCustomer].owner.get('pan').value == "") {
      this.toastr.warning("Please Fill the Pan then upload");
    } else
      uploadBtn.dispatchEvent(new MouseEvent('click'));
    //if (isUndefined(this.panDoc.fileName))
    //  uploadBtn.dispatchEvent(new MouseEvent('click'));
    //else
    //  this.toastr.warning("Please delete the current document then Upload");
  }

  openDialogInMobile(browseBtn: Element) {
    let isValid = new RegExp('^[A-Za-z]{5}[0-9]{4}[A-Za-z]$').test(this.coOwnersForms[this.currentCustomer].owner.get('pan').value);
    if (!isValid) {
      this.toastr.warning("Please Fill the Pan then upload");
    } else
      browseBtn.dispatchEvent(new MouseEvent('click'));
  }

  getPropertyAndCustomer(prospectPropertyID:number) {
    this.clientService.getCustomerAndProperty(prospectPropertyID).subscribe(res => {
      this.propertyForm.patchValue(res.prospectPropertyDto);
      this.clients = res.prospectDto;
      this.customerData = [... this.clients];
    });
  }

  saveOneCustomer(showAddress:boolean): void {
    this.clearValidator();
    if (this.customerform.valid && this.propertyForm.valid) {
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

      //Note : Please Enable on complete
      if (!this.isValid(this.customerform.value.panBlobId)) {
        this.toastr.error("Please upload PAN Document");
        return;
      }

      var model = this.customerform.value;
      if (!this.isValid(model.prospectID) || model.prospectID == 0)
        model.prospectID = 0;
      else
        isNewEntry = false;
      if (model.traces == "yes" || model.isTracesRegistered)
        model.isTracesRegistered = true;
      else
        model.isTracesRegistered = false;

      if (model.form16b == 'yes')
        model.allowForm16B = true;
      else
        model.allowForm16B = false;

      model.dateOfBirth = moment(model.dateOfBirth).local().format("YYYY-MM-DD");

      model.prospectPropertyID = 0;
      model.prospectID = this.clients.length+1;
      this.clients.push(_.clone( model));
     // this.customerData = [... this.clients];
      this.clients = [... this.clients];
      if(showAddress)
      this.ShowAddressDetails(model);
        // let property = { 'propertyID': this.propertyForm.value.propertyID, 'unitNo': this.propertyForm.value.unitNo, 'declarationDate': moment(this.propertyForm.value.declarationDate).local().format("YYYY-MM-DD"), 'prospectPropertyID': 0 };
        //let vm: any = {};
        //model.prospectPropertyID = 0;
        //vm.prospectPropertyDto = property;
        //vm.prospectDto = [model];
        //this.clientService.saveCustomer(vm).subscribe((res) => {
        //  // this.getCustomer(res);
        //  this.clear();
        //  this.getPropertyAndCustomer(res);
        //  if (showAddress) {
        //    this.ShowAddressDetails(model);
        //  }
        //  else {
        //    this.toastr.success("Customer is Saved");
        //    this.showAddressClearBtn = false;
        //  }
        //}, (e) => {
        //    this.toastr.error(e.error.error);
        //});

      //if (this.clients.length > 0) {
      //  model.prospectPropertyID = this.propertyForm.value.prospectPropertyID;
      //  this.clientService.saveOneCustomer(model, isNewEntry).subscribe(res => {          
      //    this.clear();
      //    this.getPropertyAndCustomer(model.prospectPropertyID);
      //    if (showAddress) {
      //      this.ShowAddressDetails(model);
      //    }
      //    else {
      //      this.toastr.success("Customer is Saved");
      //      this.showAddressClearBtn = false;
      //    }
      //  }, (e) => {
      //      this.toastr.error(e.error.error);
      //  });
      //}
      //else {
      //  let property = { 'propertyID': this.propertyForm.value.propertyID, 'unitNo': this.propertyForm.value.unitNo, 'declarationDate': moment(this.propertyForm.value.declarationDate).local().format("YYYY-MM-DD"), 'prospectPropertyID': 0 };
      //  let vm: any = {};
      //  model.prospectPropertyID = 0;
      //  vm.prospectPropertyDto = property;
      //  vm.prospectDto = [model];
      //  this.clientService.saveCustomer(vm).subscribe((res) => {
      //    // this.getCustomer(res);
      //    this.clear();
      //    this.getPropertyAndCustomer(res);
      //    if (showAddress) {
      //      this.ShowAddressDetails(model);
      //    }
      //    else {
      //      this.toastr.success("Customer is Saved");
      //      this.showAddressClearBtn = false;
      //    }
      //  }, (e) => {
      //      this.toastr.error(e.error.error);
      //  });
      //}
    }
    else {
      this.toastr.error("Please fill the all manditory fields");
    }
  }

  ShowAddressDetails(model: any) {
    model.prospectID = 0;
    model.name = '';
    model.mobileNo = '';
    model.emailID = '';
    model.pan = '';
    model.dateOfBirth = '';
    model.form16b = 'yes';
    model.tracesPassword = "";
    model.alternateNumber = "";
    model.isd = "+91";
    this.customerform.reset();
    this.customerform.patchValue(model);
    this.showAddressClearBtn = true;
  }

  saveCustomer(): void {
    this.clients = [];
    let share = (100 / this.coOwnersForms.length).toFixed(2);
    _.forEach(this.coOwnersForms, obj => {
      obj.owner.value.share = share;
      this.clients.push(obj.owner.value);
    });
    //this.clearValidator();
    //if (this.customerform.valid && this.propertyForm.valid) {
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

      ////Note : Please Enable on complete
      //if (!this.isValid(this.customerform.value.panBlobId)) {
      //  this.toastr.error("Please upload PAN Document");
      //  return;
      //}

      //var model = this.customerform.value;
      //if (!this.isValid(model.prospectID) || model.prospectID == 0)
      //  model.prospectID = 0;
      //else
      //  isNewEntry = false;

      //if (model.traces == "yes" || model.isTracesRegistered)
      //  model.isTracesRegistered = true;
      //else
      //  model.isTracesRegistered = false;

      //if (model.form16b == 'yes')
      //  model.allowForm16B = true;
      //else
      //  model.allowForm16B = false;

      //model.dateOfBirth = moment(model.dateOfBirth).local().format("YYYY-MM-DD");
    //}
    //else {
    //  this.toastr.error("Please fill the all manditory fields");
    //}

    //var model = this.customerform.value;
    //if (model.prospectID == 0) {
    //  model.prospectID = this.clients.length + 1;
    //  this.clients.push(model);
    //}

    //if (this.clients.length == 1) {
    //  this.clients[0].share = 100;
    //}   
    //this.clients = [...this.clients];

    if (!this.validateSharePercentage()) {
      this.SetupShareGrid();
      return;
    }

    _.forEach(this.clients, obj => {
      if (obj.traces == "yes" || obj.isTracesRegistered)
        obj.isTracesRegistered = true;
      else
        obj.isTracesRegistered = false;

      if (obj.form16b == 'yes')
        obj.allowForm16B = true;
      else
        obj.allowForm16B = false;

      obj.dateOfBirth = moment(obj.dateOfBirth).local().format("YYYY-MM-DD");
      obj.prospectPropertyID = 0;
      obj.prospectID = 0;
    });
   


     let property = { 'propertyID': this.propertyForm.value.propertyID, 'unitNo': this.propertyForm.value.unitNo, 'declarationDate': this.propertyForm.value.declarationDate, 'prospectPropertyID': 0 };
    let vm: any = {};
    vm.prospectPropertyDto = property;
    vm.prospectDto = this.clients;
    this.clientService.saveCustomer(vm).subscribe((res) => {
      this.toastr.success("Thanks for submitting your declaration form. We assure you our best services at all times.");     
      this.clear();
    }, (e) => {
        this.toastr.error(e.error.error);
    });
  }

  SetupShareGrid() {
    this.clients = [];
    let share =( 100 / this.coOwnersForms.length).toFixed(2);
    _.forEach(this.coOwnersForms, obj => {
      obj.owner.value.share = share;
      this.clients.push(obj.owner.value);
    });
    this.clients = [...this.clients];
    this.showGird = true;
   
    setTimeout(() => {
      this.sharegridRef.nativeElement.scrollIntoView();
      let rows = this.sharegridRef.nativeElement.querySelectorAll(".datatable-row-wrapper");
      let rowCells = rows[0].querySelectorAll(".datatable-body-cell-label");
      let cell = rowCells[1].querySelectorAll(".label");
      cell[0].click();
      setTimeout(() => {
        rowCells = rows[0].querySelectorAll(".datatable-body-cell-label");
        let textbox = rowCells[1].querySelectorAll(".grid-textbox");
        textbox[0].focus();
      }, 1000);
    }, 1000);
  }

  isValid(param: any) {
    return (param != "" && param != null && !isUndefined(param))
  }

  ValidateAndCleanCustomer(): boolean {
    let name = this.customerform.get('name').value;
    let pan = this.customerform.get('pan').value;
    let emailID = this.customerform.get('emailID').value;
    let mobileNo = this.customerform.get('mobileNo').value;
    let dateOfBirth = this.customerform.get('dateOfBirth').value;
    if ((!this.isValid(name) && !this.isValid(pan) && !this.isValid(emailID) && !this.isValid(mobileNo) && !this.isValid(dateOfBirth)) ||
      (this.isValid(name) && this.isValid(pan) && this.isValid(emailID) && this.isValid(mobileNo) && this.isValid(dateOfBirth))) {

      if (this.isValid(pan)) {

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
        if (!this.isValid(cusID) || this.clients.length == 0) {
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
      o.dateOfBirth = moment(o.dateOfBirth).local().format("YYYY-MM-DD");
    })

    return true;
  }

  validateSharePercentage(): boolean {
    if (this.clients.length == 1)
      return true;
    //if (this.clients.length != this.customerData.length)
    //  this.refreshShareGrid();

    let share: number = 0;
    let toastr = this.toastr;
    let isShareValid: boolean = true;

    _.forEach(this.clients, function (item) {
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
    if (Math.round(share) != 100 && share > 0) {
      this.toastr.error("Sum of share % must be equal to 100");
      return false;
    }
    return true;
  }

  getCustomer(id: any) {
    this.clientService.getCustomerByID(id).subscribe(res => {
      res.pinCode = res.pinCode.trim();
      this.customerform.patchValue(res);
    });
  }

  addCoClient() {
    this.saveOneCustomer(true);
    this.VisibleCoCownerBtn = false;
    this.ShowCoOwnerOption = false;
    this.ShowMoreCoOwnerOption = true;

  }

  ValidateCustomer(): boolean {
    this.clearValidator();
    var item = this.coOwnersForms[this.coOwnersForms.length - 1].owner;
    item.markAllAsTouched();
    this.propertyForm.markAllAsTouched();
    //var isValid: boolean = false;
    //_.filter(item.controls, function (item) {
    //  if (item.status == "VALID")
    //    isValid = true;
    //  else
    //    isValid = false;
    //});
    if (item.valid && this.propertyForm.valid) {

      var invalidList = _.filter(item.controls, function (item) {
        return item.validator != null && item.value == "";
      })
      if (invalidList.length == 0) {
        let currentCustomer = item.value;

        if (currentCustomer.traces == "yes") {
          if (currentCustomer.tracesPassword == "") {
            this.toastr.error("Please enter the Traces password");
            return false;
          }
        }

      }
      else {
        Object.keys(this.coOwnersForms[this.currentCustomer].owner.controls).forEach(field => {
          const control = this.coOwnersForms[this.currentCustomer].owner.get(field);
          control.markAsTouched({ onlySelf: true });
        });
        this.toastr.error("Please fill the all manditory fields");
        return false;
      }

      //Note : Please Enable on complete
      if (!this.isValid(this.coOwnersForms[this.currentCustomer].owner.value.panBlobId)) {
        this.toastr.error("Please upload PAN Document");
        return false;
      }
      return true;
    }
    else {
      this.toastr.error("Please fill the all manditory fields"); 
      return false;
    }
   
  }

  deleteCustomer() {
    this.coOwnersForms.splice(this.currentCustomer, 1);
    if (this.coOwnersForms.length > 0) {
      this.coOwnersForms[this.coOwnersForms.length - 1].ShowMoreCoOwnerOption = true;
      this.coOwnersForms[this.coOwnersForms.length - 1].AddMoreCoOwner = '';
      this.coOwnersForms[this.coOwnersForms.length - 1].Back = false;
      this.selectedTab = this.currentCustomer == 0 ? 0 : this.currentCustomer - 1;
      this.coOwnersForms[0].Previous = false;
      this.showGird = false;
    }
    else {
      this.addTab();
      this.coOwnersForms[0].Back = false;
      this.coOwnersForms[0].Previous = false;
    }
  }

  UpdateClientList() {
    _.forEach(this.coOwnersForms, obj => {
      obj.ShowCoOwnerOption = false;
      obj.ShowMoreCoOwnerOption = false;
      obj.ShowDeleteBtn = true;
      obj.Next = true;
    });
    this.addTab();
  }
  ShowAddCoOwnerBtn(event: any) {
    var isValid = this.ValidateCustomer();
    if (!isValid) {  
    
      setTimeout(() => {
        this.clearValidator();
        this.coOwnersForms[this.coOwnersForms.length - 1].AddNewCoOwner = '';
        this.coOwnersForms[this.coOwnersForms.length - 1].AddMoreCoOwner = '';
      }, 500);     
      return;
    }

    var item = this.coOwnersForms[this.coOwnersForms.length - 1];
    item.label = item.owner.value.name;
    item.Back = false;
    item.showAddressClearBtn = false;
    if (event.value == "yes") {
      item.ShowCoOwnerOption =false;
      item.ShowMoreCoOwnerOption = false;
      this.UpdateClientList();
      this.shareTab = true;
      this.showGird = false;
     
      setTimeout(() => {
        var elm= document.querySelectorAll("input[formControlName='name']").item(0);
        (elm as HTMLElement)?.focus();
        //var namefield = this.coOwnersForms[this.coOwnersForms.length - 1].owner.get('name');
        //namefield.nativeElement.focus();
       // this.nameFieldRef.nativeElement.focus();
      }, 1000);
     
      //this.nameFieldRef.nativeElement.click();
     
     // this.VisibleCoCownerBtn = true;
    }
    else {
      this.shareTab = false;
      this.selectedTab = this.coOwnersForms.length;
      item.ShowCoOwnerOption = false;
      item.ShowMoreCoOwnerOption = true;
      //this.VisibleCoCownerBtn = false;
      //this.saveOneCustomer(false);
      this.SetupShareGrid();
    }
  }
  back() {
 
    this.ShowCoOwnerOption = true;
    this.ShowMoreCoOwnerOption = false;
    this.VisibleCoCownerBtn = false;
  }

  removeRestriction() {
    this.customerform.removeControl('completed');
  }
  clearValidator() {
    var item = this.coOwnersForms[this.coOwnersForms.length - 1].owner;
    item.get("addressPremises").clearValidators();
    item.get("alternateNumber").clearValidators();
    item.get("adressLine1").clearValidators();
    item.get("addressLine2").clearValidators();
    item.get("isTracesRegistered").clearValidators();
    item.get("tracesPassword").clearValidators();
    item.get("traces").clearValidators();
    item.get("share").clearValidators();
    item.get("isd").clearValidators();
    item.get("prospectID").clearValidators();
    item.get("allowForm16B").clearValidators();
  }

  clearAddress(): void {
    this.coOwnersForms[this.currentCustomer].showAddressClearBtn = false;
    let client = this.coOwnersForms[this.currentCustomer].owner.value;
    this.customerform.reset();
    client.adressLine1 = '';
    client.addressLine2 = '';
    client.city = '';
    client.stateId = '';
    client.pinCode = '';
    this.coOwnersForms[this.currentCustomer].owner.patchValue(client);
    Object.keys(this.coOwnersForms[this.currentCustomer].owner.controls).forEach(field => {
      const control = this.coOwnersForms[this.currentCustomer].owner.get(field);
      control.setErrors(null);
    });

  }
  getAllProperties() {
    this.clientService.getPropertyList().subscribe((response) => {
      this.propertyList = _.filter(response, o => { return o.isActive == null || o.isActive == true; });;
    });
  }

  getAllStates() {
    this.statesService.getStates().subscribe((response) => {
      this.states = response;
    });
  }

  selectedState(eve) {
    if (eve.value == 37) {
      this.coOwnersForms[this.currentCustomer].owner.get('pinCode').setValue("999999");
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
  }
  uploadPan(event) {
    if (event.target.files && event.target.files.length > 0) {
      const files = event.target.files[0];
      let formData = new FormData();
      formData.append(files.name, files);
      this.coOwnersForms[this.currentCustomer].panDoc.fileName = files.name;
      let pan = this.coOwnersForms[this.currentCustomer].owner.get('pan').value;

      //Note : this should be enable on commit

      this.clientService.uploadPan(formData, pan).subscribe((eve) => {
        if (eve.type == HttpEventType.Sent) {
         
        }
        if (eve.type == HttpEventType.Response) {
          this.toastr.success("File Uploaded successfully");
          this.coOwnersForms[this.currentCustomer].owner.get('panBlobId').setValue(eve.body);
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
        this.coOwnersForms[this.currentCustomer].panDoc = response;
      else {
        this.coOwnersForms[this.currentCustomer].panDoc = {};
      }
    });
  }

  refreshShareGrid() {
    this.ValidateAndCleanCustomer();
    this.showShareGrid = true;
    this.customerData = [... this.clients];
  }

  downloadFile(blobId: any, name: string, status: any) {

    this.clientService.downloadFiles(blobId).subscribe((response) => {

      let fileType = name.split('.')[1];
      let blobType = "";

      if (fileType == 'pdf') {
        blobType = 'application/pdf'
      }
      else if (fileType == 'jpg' || fileType == 'jpeg' || fileType == 'png') {
        blobType = 'image/' + fileType;
      }
      else if (fileType == 'xls') {
        blobType = 'application/vnd.ms-excel';
      }
      else if (fileType == 'xlsx') {
        blobType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      }
      else if (fileType == 'docx') {
        blobType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
      }
      else if (fileType == 'ods') {
        blobType = 'application/vnd.oasis.opendocument.spreadsheet';
      }
      else if (fileType == 'xls') {
        blobType = 'application/msword';
      }


      // let blob: any = new Blob([response], { type: blobType });
      let blob: any = new Blob([response], { type: blobType });

      //This will open file in new browser tab

      if (status == 'view') {
        const url = window.URL.createObjectURL(blob);
        window.open(url);
      } else {
        // window.location.href = response.url;
        fileSaver.saveAs(blob, name);
      }
    });
  }

  deleteFile(id: string, type: string) {
    this.clientService.deleteFile(id).subscribe(() => {
      this.toastr.success("FIle is deleted successfully");
      if (type == "pan")
        this.loadPanDocument(this.coOwnersForms[this.currentCustomer].owner.get('pan').value);
     
    });
  }

  StartCamera() {
    const dialogRef = this.dialog.open(ImageCaptureDialogComponent, {
      hasBackdrop: false,
      maxHeight: 650,
      maxWidth: 1000,
      width: "800px"
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res == "")
        return;
      if (res == "not Supported") {
        this.toastr.warning("Camera is not supported");
        return;
      }
        
      if (!isUndefined(res)) {
        let formData = new FormData();
        let pan = this.coOwnersForms[this.currentCustomer].owner.get('pan').value;
        let fileName = pan + ".png";
        var fileOfBlob = new File([res], fileName);
        formData.append(fileName, fileOfBlob);
        this.coOwnersForms[this.currentCustomer].panDoc.fileName = fileName;
        this.clientService.uploadPan(formData, pan).subscribe((eve) => {
          if (eve.type == HttpEventType.Sent) {

          }
          if (eve.type == HttpEventType.Response) {
            this.toastr.success("File Uploaded successfully");
            this.coOwnersForms[this.currentCustomer].owner.get('panBlobId').setValue(eve.body);
          }
        },
          (err) => { },
          () => {
            this.loadPanDocument(pan);
          }
        );
      } else {
        this.toastr.warning("Camera is not supported");
      }
      console.log('The dialog was closed');
    });
  }

  handleError(toastr) {
    toastr.warning('Sorry, camera not available.');
  }
  openDialog(): void {
    let isValid = new RegExp('^[A-Za-z]{5}[0-9]{4}[A-Za-z]$').test(this.coOwnersForms[this.currentCustomer].owner.get('pan').value);
    if (!isValid) {
      this.toastr.warning("Please Fill the Pan number");
      return;
    } 
    var constraints = {
      video: {
        facingMode: "environment"
      }
    };
    this.StartCamera();
    //if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
    //  var self = this;
    //  navigator.mediaDevices.getUserMedia(constraints).then((x) => this.StartCamera()).catch(() => { this.handleError(this.toastr); });
    //}
    //else {
    //  alert('Sorry, Camera not available.');
    //}    
  }

  tabChanged(eve: MatTabChangeEvent) {
    this.currentCustomer = eve.index;
    if (this.currentCustomer == this.coOwnersForms.length - 1) {
      if (this.shareTab) {
        this.coOwnersForms[this.currentCustomer].Next = false;
        this.coOwnersForms[this.currentCustomer].Previous = false;       
      }
      else {
        this.coOwnersForms[this.currentCustomer].Next = true;
        this.coOwnersForms[this.currentCustomer].Previous = true;
        this.coOwnersForms[this.currentCustomer].ShowDeleteBtn = true;
      }
    }
    else {
      if (this.currentCustomer < this.coOwnersForms.length) {
        this.coOwnersForms[this.currentCustomer].Next = true;
        this.coOwnersForms[this.currentCustomer].Previous = true;
        this.coOwnersForms[this.currentCustomer].ShowDeleteBtn = true;
      }    
    }

    if (this.currentCustomer == 0) {
      if (this.shareTab) 
        this.coOwnersForms[this.currentCustomer].Next = false;
        else
        this.coOwnersForms[this.currentCustomer].Next = true;
      if (this.coOwnersForms.length > 1)
        this.coOwnersForms[this.currentCustomer].Next = true;
      else {
        if (this.shareTab)
          this.coOwnersForms[this.currentCustomer].ShowDeleteBtn = false;
        else
          this.coOwnersForms[this.currentCustomer].ShowDeleteBtn = true;
      }
      this.coOwnersForms[this.currentCustomer].Previous = false;
      
    }
  
    //if (eve.index == 1) {
    //  this.clearHeadercustomerInfo();
    //  this.search();
    //  this.propertyDDl = _.clone(this.propertyList);
    //  this.propertyDDl.splice(0, 0, { 'propertyID': '', 'addressPremises': '' });
    //  this.showListGird = true;
    //}
    //else
    //  this.showListGird = false;;
  }
  NavigateToPreviousTab() {
    this.selectedTab = this.currentCustomer - 1; 
  }
  NavigateToNextTab() {
    this.selectedTab = this.currentCustomer + 1;
    if (this.selectedTab == this.coOwnersForms.length) {
     
      if (this.clients.length != this.coOwnersForms.length) {

        this.showGird = false;
        this.SetupShareGrid();
      }
    }
  }
}
