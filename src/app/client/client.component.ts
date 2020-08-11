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
import * as fileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageCaptureDialogComponent} from 'app/image-capture/image-capture.component';
import { DeviceDetectorService } from 'ngx-device-detector';
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
  animations: fuseAnimations
  //providers: [
  //  { provide: DateAdapter,  useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]    },
  //  { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  //],
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
  isMobile: boolean = false;
  showShareGrid: boolean = false;
  @ViewChildren(FusePerfectScrollbarDirective)
  fuseScrollbarDirectives: QueryList<FusePerfectScrollbarDirective>;
  panDoc: any = {};
  @ViewChild('shareGrid') sharegridRef: ElementRef;

  constructor(private _formBuilder: FormBuilder, private statesService: StatesService, private clientService: ClientService, private toastr: ToastrService, private dialog: MatDialog, private deviceService: DeviceDetectorService) {

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
      panBlobId: ['']
    });
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
    this.showAddressClearBtn = false;
    this.panDoc = {};
    this.customerData = [];
    this.customerform.reset();
    this.propertyForm.reset();
    this.clients = [];
    this.customerform.get('traces').setValue('no');
    this.customerform.get('form16b').setValue('yes');
    this.customerform.get('isd').setValue('+91');
    this.propertyForm.get('declarationDate').setValue(new Date());
  }

  clearCustomer() {
    this.customerform.reset();
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
    if (this.customerform.get('pan').value == "") {
      this.toastr.warning("Please Fill the Pan then upload");
    } else
      uploadBtn.dispatchEvent(new MouseEvent('click'));
    //if (isUndefined(this.panDoc.fileName))
    //  uploadBtn.dispatchEvent(new MouseEvent('click'));
    //else
    //  this.toastr.warning("Please delete the current document then Upload");
  }

  openDialogInMobile(browseBtn: Element) {
    let isValid = new RegExp('^[A-Za-z]{5}[0-9]{4}[A-Za-z]$').test(this.customerform.get('pan').value);
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
      if (this.clients.length > 0) {
        model.prospectPropertyID = this.propertyForm.value.prospectPropertyID;
        this.clientService.saveOneCustomer(model, isNewEntry).subscribe(res => {          
          this.clear();
          this.getPropertyAndCustomer(model.prospectPropertyID);
          if (showAddress) {
            this.ShowAddressDetails(model);
          }
          else {
            this.toastr.success("Customer is Saved");
            this.showAddressClearBtn = false;
          }
        });
      }
      else {
        let property = { 'propertyID': this.propertyForm.value.propertyID, 'unitNo': this.propertyForm.value.unitNo, 'declarationDate': moment(this.propertyForm.value.declarationDate).local().format("YYYY-MM-DD"), 'prospectPropertyID': 0 };
        let vm: any = {};
        model.prospectPropertyID = 0;
        vm.prospectPropertyDto = property;
        vm.prospectDto = [model];
        this.clientService.saveCustomer(vm).subscribe((res) => {
          // this.getCustomer(res);
          this.clear();
          this.getPropertyAndCustomer(res);
          if (showAddress) {
            this.ShowAddressDetails(model);
          }
          else {
            this.toastr.success("Customer is Saved");
            this.showAddressClearBtn = false;
          }
        });
      }
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
    //if (!this.ValidateAndCleanCustomer())
    //  return;
    if (this.clients.length == 0) {
      this.toastr.error("Please Add minimum one customer");
      return;
    }

    if (!this.propertyForm.valid) {
      this.toastr.error("Please Fill the Property details");
      return;
    }

    if (!this.validateSharePercentage()) {
      this.sharegridRef.nativeElement.scrollIntoView();
      let rows = this.sharegridRef.nativeElement.querySelectorAll(".datatable-row-wrapper");
      let rowCells = rows[0].querySelectorAll(".datatable-body-cell-label");
      let cell = rowCells[1].querySelectorAll(".label");
      cell[0].click();
      setTimeout(() => {
        rowCells = rows[0].querySelectorAll(".datatable-body-cell-label");
        let textbox = rowCells[1].querySelectorAll(".grid-textbox");
        textbox[0].focus();
      }, 500);
      
      return;
    }


    if (this.clients.length==1) {
      this.clients[0].share = 100;
    }

    let vm: any = {};
    vm.prospectDto = this.clients;
    this.clientService.updateShares(vm).subscribe(res => {
      this.toastr.success("Thank you for sharing the details. Registration Successful");
      this.clear();
    });

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

    //if (this.clients.length > 1) {
    //  _.forEach(this.customerData, o => {
    //    let cusInx = _.findIndex(this.clients, function (item) {
    //      return item.prospectID == o.prospectID;
    //    });
    //    if (cusInx != null) {
    //      this.clients[cusInx].share = parseFloat(o.share);
    //    }
    //  });
    //} else {
    //  this.clients[0].share = 100;
    //}

    //let property = { 'propertyID': this.propertyForm.value.propertyId, 'unitNo': this.propertyForm.value.unitNo, 'declarationDate': this.propertyForm.value.declarationDate, 'prospectPropertyID': 0 };
    //let vm: any = {};
    //vm.prospectPropertyDto = property;
    //vm.prospectDto = this.clients;
    //this.clientService.saveCustomer(vm).subscribe((res) => {
    //  this.toastr.success("Thank you for sharing the details. Registration Successful");
    //  // this.getCustomer(res);
    //  this.clear();
    //});
    // }
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

  getCustomer(id: any) {
    this.clientService.getCustomerByID(id).subscribe(res => {
      res.pinCode = res.pinCode.trim();
      this.customerform.patchValue(res);
    });
  }

  addCoClient() {
    this.saveOneCustomer(true);
  }
  removeRestriction() {
    this.customerform.removeControl('completed');
  }
  clearValidator() {
    this.customerform.get("addressPremises").clearValidators();
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
         
        }
        if (eve.type == HttpEventType.Response) {
          this.toastr.success("File Uploaded successfully");
          this.customerform.get('panBlobId').setValue(eve.body);
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
        this.loadPanDocument(this.customerform.get('pan').value);
     
    });
  }

  
  openDialog(): void {
    let isValid = new RegExp('^[A-Za-z]{5}[0-9]{4}[A-Za-z]$').test(this.customerform.get('pan').value);
    if (!isValid) {
      this.toastr.warning("Please Fill the Pan number");
      return;
    } 

    const dialogRef = this.dialog.open(ImageCaptureDialogComponent, {
      hasBackdrop: false,
      maxHeight: 650,
      maxWidth: 1000,
      width: "800px"  
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (!isUndefined(res)) {
        let formData = new FormData();
        let pan = this.customerform.get('pan').value;
        let fileName = pan + ".png";
        var fileOfBlob = new File([res], fileName);
        formData.append(fileName, fileOfBlob);
        this.panDoc.fileName = fileName;        
        this.clientService.uploadPan(formData, pan).subscribe((eve) => {
          if (eve.type == HttpEventType.Sent) {
           
          }
          if (eve.type == HttpEventType.Response) {
            this.toastr.success("File Uploaded successfully");
            this.customerform.get('panBlobId').setValue(eve.body);
          }
        },
          (err) => { },
          () => {
            this.loadPanDocument(pan);
          }
        );
      }
      console.log('The dialog was closed');
    });
  }

}
