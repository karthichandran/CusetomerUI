import { Component, OnInit, Inject, ViewEncapsulation, ViewChild, ElementRef,Renderer2,AfterViewInit} from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators, FormGroupDirective, ValidatorFn, AbstractControl, FormControl } from '@angular/forms';
import * as _ from 'lodash';
import { ToastrService } from 'ngx-toastr';
import * as moment from 'moment';
@Component({
  selector: 'image-capture',
  templateUrl: './image-capture.component.html'  
})
export class ImageCaptureDialogComponent implements OnInit {
  //customerBillingForm: FormGroup;
  @ViewChild('videoElm', { static: true }) videoElement: ElementRef;
  @ViewChild('canvas', { static: true }) canvas: ElementRef;
 
  showViduo: boolean=true;
  videoWidth :number= 0;
  videoHeight: number = 0;
  constructor(public dialogRef: MatDialogRef<ImageCaptureDialogComponent>, private _formBuilder: FormBuilder, @Inject(MAT_DIALOG_DATA) data, private toastr: ToastrService, private renderer: Renderer2) {
   
  }

  ngOnInit() {
    this.showViduo = true;
     
  }
  ngAfterContentInit() {
    this.startCamera();  
  }
  startCamera() {
    if (!!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
      navigator.mediaDevices.getUserMedia(this.constraints).then(this.attachVideo.bind(this)).catch(this.handleError);
    } else {
      alert('Sorry, camera not available.');
    }
  }
  handleError(error) {
    console.log('Error: ', error);
  }
  attachVideo(stream) {
    this.renderer.setProperty(this.videoElement.nativeElement, 'srcObject', stream);
    this.renderer.listen(this.videoElement.nativeElement, 'play', (event) => {
      this.videoHeight = this.videoElement.nativeElement.videoHeight;
      this.videoWidth = this.videoElement.nativeElement.videoWidth;
    });
  }
  capture() {
    this.showViduo = false;
    this.renderer.setProperty(this.canvas.nativeElement, 'width', this.videoWidth);
    this.renderer.setProperty(this.canvas.nativeElement, 'height', this.videoHeight);
    this.canvas.nativeElement.getContext('2d').drawImage(this.videoElement.nativeElement, 0, 0);
   // this.canvas.nativeElement.toBlob(this.tconvertBlob);   
  }

  constraints = {
    video: {
      facingMode: "environment"     
    }
  };

  save() {
    var blobBin = atob(this.canvas.nativeElement.toDataURL().split(',')[1]);
    var array = [];
    for (var i = 0; i < blobBin.length; i++) {
      array.push(blobBin.charCodeAt(i));
    }
    var file = new Blob([new Uint8Array(array)], { type: 'image/png' });
    //var formdata = new FormData();
    //formdata.append("myNewFileName", file);

    // Close the flash 
    let mediaStream = this.videoElement.nativeElement.srcObject;
    let tracks = mediaStream.getTracks();
    tracks.forEach(track => track.stop());

    // return the file
    this.dialogRef.close(file);
  }

  camera() {
    this.showViduo = true;
  }

  close() {
    let mediaStream = this.videoElement.nativeElement.srcObject;
    let tracks = mediaStream.getTracks();
    tracks.forEach(track => track.stop());
    this.dialogRef.close();
  }

}


