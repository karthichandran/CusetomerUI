/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { ICustomer ,ICustomerVM} from './CustomerDto';
import { CustomerPropertyDto } from './CustomerPropertyDto';
/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Accounting service.
 */
@Injectable({
  providedIn: 'root'
})
export class ClientService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }


  /**
   * @param {string} provisioningEntryId Provisioning entry ID of provisioning entry.
   * @returns {Observable<any>} Provisioning entry.
   */

  getCustomer(): Observable<any> {
    return this.http.get(`/Customer`);
  }


  getPropertyList(): Observable<any> {
    return this.http.get(`/property/dropdown`);
  }

  getCustomerByID(Id: string): Observable<any> {
    return this.http.get(`/prospect/${Id}`);
  }
 
  saveCustomer(customer: any): Observable<any> {
      return this.http.post('/prospect', { 'prospectVm': customer });
  }
  test(): Observable<any> {
    return this.http.post('/prospect', { 'prospectVm': {'val':0} });
  } 

   uploadFile(formData: FormData,id:string): Observable<any> {    
     return this.http.post('/files/' + id, formData, { reportProgress: true, observe: 'events' });
  }

  getUploadedFiles(Id: string): Observable<any> {
    return this.http.get(`/files/fileslist/${Id}`);
  }

  downloadFiles(Id: string ): Observable<any> {
    return this.http.get(`/files/blobId/${Id}`, { responseType: 'arraybuffer' });
    
  }

  getRemarks(): Observable<any> {
    return this.http.get(`/remarks`);
  }
  getCustomerByPan(Id: string): Observable<any> {
    return this.http.get(`/customer/pan/${Id}`);
  }

  uploadPan(formData: FormData, id: string): Observable<any> {
    return this.http.post('/files/panId/' + id , formData, { reportProgress: true, observe: 'events' });
  }
  getUploadedPan(Id: string): Observable<any> {
    return this.http.get(`/files/fileDetails/panId/${Id}`);
  }
}
