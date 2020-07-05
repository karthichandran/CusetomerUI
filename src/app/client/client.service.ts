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

  getCustomerByID(Id: string): Observable<any> {
    return this.http.get(`/prospect/${Id}`);
  }
 
  saveCustomer(customer: any, isNewEntry: boolean): Observable<any> {
    if (!isNewEntry)
      return this.http.put('/prospect', { 'prospectDto': customer });
    else {
      return this.http.post('/prospect', { 'prospectDto': customer });
    }
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

}
