/** Angular Imports */
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpEvent } from '@angular/common/http';
import { IPropertyVM} from '../property/property.model';
//import { PropertyDto } from '../ReProServices-api';


/** rxjs Imports */
import { Observable } from 'rxjs';

/**
 * Accounting service.
 */
@Injectable({
  providedIn: 'root'
})
export class PropertyService {

  /**
   * @param {HttpClient} http Http Client to send requests.
   */
  constructor(private http: HttpClient) { }


  /**
   * @param {string} provisioningEntryId Provisioning entry ID of provisioning entry.
   * @returns {Observable<any>} Provisioning entry.
   */
  getPropertyEntry(propertyId: number): Observable<IPropertyVM> {
    return this.http.get(`/Property/${propertyId}`);
  }

  /**
   * @returns {Observable<any>} Loan products data.
   */
  getProperties(): Observable<any> {
    return this.http.get('/Property');    
  }

  saveProperty(property: IPropertyVM): Observable<any> {

    if (property.propertyDto.propertyID > 0)
      return this.http.put('/Property/' + property.propertyDto.propertyID, { 'propertyVM': property } );
    else {
     // property.propertyDto.lateFeeDay = new Date();
      property.propertyDto.propertyID = 0;
      return this.http.post('/Property', { 'propertyVM': property } );
    }
    //if (property.propertyDto.propertyID > 0)
    //  return this.http.put('/Property/' + property.propertyDto.propertyID, { 'propertyDto': property });
    //else {
    //  property.propertyDto.lateFeeDay = new Date();
    //  property.propertyDto.propertyID = 0;
    //  return this.http.post('/Property', { 'propertyDto': property });
    //}
  }    

}
