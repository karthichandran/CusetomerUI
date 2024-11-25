import { Component, OnDestroy, OnInit, ViewChildren, QueryList, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
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
import * as fileSaver from 'file-saver';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ImageCaptureDialogComponent } from 'app/image-capture/image-capture.component';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ThemePalette } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { Subject } from 'rxjs';
import { ReplaySubject } from 'rxjs/internal/ReplaySubject';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.scss'],
  animations: fuseAnimations,
  encapsulation: ViewEncapsulation.None
})
export class ClientComponent implements OnInit, OnDestroy {
  coOwnersForms: any[] = [];
  customerform: FormGroup;
  propertyForm: FormGroup;

  clients: any[] = [];
  states: any[] = [];
  form16Options: any[] = [{ 'id': 1, 'description': 'Yes' }, { 'id': 0, 'description': 'No' }];
  paymentMethods: any[] = [{ 'paymentMethodID': 1, 'paymentMethod': 'Lumpsum' }, { 'paymentMethodID': 2, 'paymentMethod': 'per Transaction' }];
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

  //Property Filter
  public propertyFilterCtrl: FormControl = new FormControl();
  @ViewChild('PropertyFilterSelect', { static: true }) PropertyFilterSelect: MatSelect;
  /** Subject that emits when the component has been destroyed. */
  protected _onDestroy = new Subject<void>();
  public filteredProperty: ReplaySubject<any[]> = new ReplaySubject<any[]>();

  constructor(private _formBuilder: FormBuilder, private statesService: StatesService, private clientService: ClientService, private toastr: ToastrService, private dialog: MatDialog, private deviceService: DeviceDetectorService) {

  }
  customerformObj() {
    return this._formBuilder.group({
      prospectID: [''],
      prospectPropertyID: [''],
      name: ['', Validators.required],
      pan: ['', Validators.compose([Validators.required, this.panValidator(), Validators.maxLength(10)])],
      emailID: ['', Validators.email],
      dateOfBirth: ['', Validators.required],
      isTracesRegistered: [''],
      traces: ['no'],
      tracesPassword: [''],
      share: [''],
      panBlobId: [''],
      label: ['Owner'],
      incomeTaxPassword: ['', Validators.compose([Validators.required, this.emptySpaceValidator()])]
    });
  }

  ngOnInit(): void {
    // Reactive Form
    this.customerform = this._formBuilder.group({
      prospectID: [''],
      prospectPropertyID: [''],
      name: ['', Validators.required],
      pan: ['', Validators.compose([Validators.required, this.panValidator(), Validators.maxLength(10)])],
      emailID: ['', Validators.email],
      dateOfBirth: ['', Validators.required],
      isTracesRegistered: [''],
      traces: ['no'],
      tracesPassword: [''],
      share: [''],
      panBlobId: [''],
      label: ['Owner'],
      incomeTaxPassword: ['', Validators.compose([Validators.required, this.emptySpaceValidator()])]
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
      prospectPropertyID: ['']
    });
    this.customerColumnDef = [{ 'header': 'Name', 'field': 'name', 'type': 'label' },
    { 'header': 'Share %', 'field': 'share', 'type': 'textbox' }
    ];
    this.customerData = [];
    this.getAllProperties();
    this.checkDevice();
    this.propertyFilterCtrl.valueChanges.pipe(takeUntil(this._onDestroy))
      .subscribe(() => {
        this.filterProperty();
      });
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
    this.coOwnersForms[this.coOwnersForms.length - 1].Back = false;
    this.coOwnersForms[this.coOwnersForms.length - 1].ShowDeleteBtn = false;
  }

  ngOnDestroy(): void {
    this._onDestroy.next();
    this._onDestroy.complete();
  }
  addTab() {
    this.customerform = this._formBuilder.group({
      prospectID: [''],
      prospectPropertyID: [''],
      name: ['', Validators.required],
      pan: ['', Validators.compose([Validators.required, this.panValidator(), Validators.maxLength(10)])],
      emailID: ['', Validators.email],
      dateOfBirth: ['', Validators.required],
      isTracesRegistered: [''],
      traces: ['no'],
      tracesPassword: [''],
      share: [''],

      panBlobId: [''],
      label: ['Owner'],
      incomeTaxPassword: ['', Validators.compose([Validators.required, this.emptySpaceValidator()])]
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
      Back: true,
      showAddressClearBtn: false,
      panDoc: {},
      'owner': this.customerformObj()
    };
    if (this.coOwnersForms.length >= 1) {
      item.ShowCoOwnerOption = false;
      item.ShowMoreCoOwnerOption = true;
    }

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

  emptySpaceValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {

      return (control.value || '').trim().length === 0 ? { 'Empty': { value: control.value } } : null;
    };
  }

  getPropertyAndCustomer(prospectPropertyID: number) {
    this.clientService.getCustomerAndProperty(prospectPropertyID).subscribe(res => {
      this.propertyForm.patchValue(res.prospectPropertyDto);
      this.clients = res.prospectDto;
      this.customerData = [... this.clients];
    });
  }

  // saveOneCustomer(showAddress: boolean): void {
  //   this.clearValidator();
  //   if (this.customerform.valid && this.propertyForm.valid) {
  //     let isNewEntry = true;
  //     var invalidList = _.filter(this.customerform.controls, function (item) {
  //       return item.validator != null && item.value == "";
  //     })
  //     if (invalidList.length == 0) {
  //       let currentCustomer = this.customerform.value;

  //       if (currentCustomer.traces == "yes") {
  //         if (currentCustomer.tracesPassword == "") {
  //           this.toastr.error("Please enter the Traces password");
  //           return;
  //         }
  //       }

  //     }
  //     else {
  //       Object.keys(this.customerform.controls).forEach(field => {
  //         const control = this.customerform.get(field);
  //         control.markAsTouched({ onlySelf: true });
  //       });
  //       this.toastr.error("Please fill the all manditory fields");
  //       return;
  //     }

  //     //Note : Please Enable on complete
  //     // if (!this.isValid(this.customerform.value.panBlobId)) {
  //     //   this.toastr.error("Please upload PAN Document");
  //     //   return;
  //     // }

  //     var model = this.customerform.value;
  //     if (!this.isValid(model.prospectID) || model.prospectID == 0)
  //       model.prospectID = 0;
  //     else
  //       isNewEntry = false;
  //     if (model.traces == "yes" || model.isTracesRegistered)
  //       model.isTracesRegistered = true;
  //     else
  //       model.isTracesRegistered = false;

  //     model.dateOfBirth = moment(model.dateOfBirth).local().format("YYYY-MM-DD");

  //     model.prospectPropertyID = 0;
  //     model.prospectID = this.clients.length + 1;
  //     this.clients.push(_.clone(model));
  //     // this.customerData = [... this.clients];
  //     this.clients = [... this.clients];
  //     if (showAddress)
  //       this.ShowAddressDetails(model);
  //   }
  //   else {
  //     this.toastr.error("Please fill the all manditory fields");
  //   }
  // }

  ShowAddressDetails(model: any) {
    model.prospectID = 0;
    model.name = '';  
    model.emailID = '';
    model.pan = '';
    model.dateOfBirth = '';  
    model.tracesPassword = "";   
    this.customerform.reset();
    this.customerform.patchValue(model);
    this.showAddressClearBtn = true;
  }

  saveCustomer(): void {

    if (!this.validateSharePercentage()) {
      this.SetupShareGrid();
      return;
    }

    _.forEach(this.clients, obj => {
      if (obj.traces == "yes" || obj.isTracesRegistered)
        obj.isTracesRegistered = true;
      else
        obj.isTracesRegistered = false;


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
      window.location.reload();
    }, (e) => {
      this.toastr.error(e.error.error);
    });
  }

  SetupShareGrid() {
    this.clients = [];
    let share = (100 / this.coOwnersForms.length).toFixed(2);
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
    // return (param != "" && param != null && !isUndefined(param))
    return (param != "" && param != null && param != undefined)
  }

  ValidateAndCleanCustomer(): boolean {
    let name = this.customerform.get('name').value;
    let pan = this.customerform.get('pan').value;
    let emailID = this.customerform.get('emailID').value;   
    let dateOfBirth = this.customerform.get('dateOfBirth').value;
    if ((!this.isValid(name) && !this.isValid(pan) && !this.isValid(emailID) && !this.isValid(dateOfBirth)) ||
      (this.isValid(name) && this.isValid(pan) && this.isValid(emailID) && this.isValid(dateOfBirth))) {

      if (this.isValid(pan)) {

        if (this.customerform.value.traces == "yes" || this.customerform.value.isTracesRegistered)
          this.customerform.value.isTracesRegistered = true;
        else
          this.customerform.value.isTracesRegistered = false;

        // if (this.customerform.value.form16b == 'yes')
        //   this.customerform.value.allowForm16B = true;
        // else
        //   this.customerform.value.allowForm16B = false;;

        if (this.customerform.value.traces == "yes") {
          if (this.customerform.value.tracesPassword == "") {
            this.toastr.error("Please enter the Traces password");
            return;
          }
        }

        if (this.customerform.value.incomeTaxPassword.trim().length === 0) {
          this.toastr.error("Please enter the Income Tax Password");
          return;
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
    if (this.clients.length == 1) {
      this.clients[0].share = 100;
      return true;
    }
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

  // addCoClient() {
  //   this.saveOneCustomer(true);
  //   this.VisibleCoCownerBtn = false;
  //   this.ShowCoOwnerOption = false;
  //   this.ShowMoreCoOwnerOption = true;

  // }

  ValidateCustomer(): boolean {
    this.clearValidator();
    var item = this.coOwnersForms[this.coOwnersForms.length - 1].owner;
    item.markAllAsTouched();
    this.propertyForm.markAllAsTouched();

    if (item.valid && this.propertyForm.valid) {

      var invalidList = _.filter(item.controls, function (ctrl, key) {
        return ctrl.validator != null && ctrl.value == "";
      });
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

      if (item.value.incomeTaxPassword.trim().length === 0) {
        this.toastr.error("Please enter the Income Tax Password");
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
      item.ShowCoOwnerOption = false;
      item.ShowMoreCoOwnerOption = false;
      this.UpdateClientList();
      this.shareTab = true;
      this.showGird = false;

      setTimeout(() => {
        var elm = document.querySelectorAll("input[formControlName='name']").item(0);
        (elm as HTMLElement)?.focus();
      }, 1000);

    }
    else {
      this.shareTab = false;
      this.selectedTab = this.coOwnersForms.length;
      item.ShowCoOwnerOption = false;
      item.ShowMoreCoOwnerOption = true;

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
    item.get("isTracesRegistered").clearValidators();
    item.get("tracesPassword").clearValidators();
    item.get("traces").clearValidators();
    item.get("share").clearValidators();
    item.get("prospectID").clearValidators();
    item.get("incomeTaxPassword").clearValidators();
  }

  clearAddress(): void {
    this.coOwnersForms[this.currentCustomer].showAddressClearBtn = false;
    let client = this.coOwnersForms[this.currentCustomer].owner.value;
    this.customerform.reset();
    this.coOwnersForms[this.currentCustomer].owner.patchValue(client);
    Object.keys(this.coOwnersForms[this.currentCustomer].owner.controls).forEach(field => {
      const control = this.coOwnersForms[this.currentCustomer].owner.get(field);
      control.setErrors(null);
    });

  }
  getAllProperties() {
    this.clientService.getPropertyList().subscribe((response) => {
      this.propertyList = _.filter(response, o => { return o.isActive == null || o.isActive == true; });
      this.filteredProperty.next(this.propertyList.slice());
    });
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

      if (res != undefined) {
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


  }
  NavigateToPreviousTab() {
    this.selectedTab = this.currentCustomer - 1;
  }
  NavigateToNextTab() {
    if (this.coOwnersForms[this.currentCustomer].owner.value.incomeTaxPassword.trim().length === 0) {
      this.toastr.error("Please enter the Income Tax Password");
      return;
    }
    this.selectedTab = this.currentCustomer + 1;
    if (this.selectedTab == this.coOwnersForms.length) {

      if (this.clients.length != this.coOwnersForms.length) {
        this.showGird = false;
        this.SetupShareGrid();
      } else {
        this.updateClientObj();
      }
    }
  }

  updateClientObj(){
    for(var i=0;i<this.clients.length;i++){       
      var obj=this.coOwnersForms[i].owner.value;
      this.clients[i].name=obj.name;
      this.clients[i].pan=obj.pan;
      this.clients[i].emailID=obj.emailID;
      this.clients[i].dateOfBirth=obj.dateOfBirth;
      this.clients[i].isTracesRegistered=obj.isTracesRegistered;
      this.clients[i].tracesPassword=obj.tracesPassword;
      this.clients[i].incomeTaxPassword=obj.incomeTaxPassword;          
    } 
  }

  //property Filter functionality
  protected filterProperty() {
    if (!this.propertyList) {
      return;
    }
    // get the search keyword
    let search = this.propertyFilterCtrl.value;
    if (!search) {
      this.filteredProperty.next(this.propertyList.slice());
      return;
    } else {
      search = search.toLowerCase();
    }
    // filter the banks
    this.filteredProperty.next(this.filterProFun(search));
  }

  filterProFun(search) {
    var list = this.propertyList.filter(prop => prop.addressPremises.toLowerCase().indexOf(search) > -1);
    return list;
  }
}
