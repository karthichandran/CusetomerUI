/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';

/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Accounting service.
 */
@Injectable({
  providedIn: 'root'
})
export class TaxService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }


  /**
   * @param {string} provisioningEntryId Provisioning entry ID of provisioning entry.
   * @returns {Observable<any>} Provisioning entry.
   */
  getTaxEntry(sellerId: string): Observable<any> {
    return this.http.get(`/tax/${sellerId}`);
  }

  /**
   * @returns {Observable<any>} Loan products data.
   */
  getTaxes(): Observable<any> {
    return this.http.get('/tax');
  }

  getTaxCodes(): Observable<any>{
    return this.http.get('/taxcodes');
}

}
