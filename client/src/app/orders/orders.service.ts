import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { OrderParams } from '../shared/models/orderParams';
import { IPagination } from '../shared/models/pagination';
import { OrderUpdParams } from '../shared/models/orderUpdParams';

@Injectable({
  providedIn: 'root'
})
export class OrdersService {
  baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getOrdersForUser() {
    return this.http.get(this.baseUrl + 'orders');
  }

  getOrderDetailed(id: number) {
    return this.http.get(this.baseUrl + 'orders/' + id);
  }

  getOrdersForApproveReject(orderParams: OrderParams) { 
    let params = new HttpParams();
    params = params.append('pageIndex', orderParams.pageNumber.toString());
    params = params.append('pageSize', orderParams.pageSize.toString());
    
    return this.http.get<IPagination>(this.baseUrl+'orders/for-approve-reject', {observe: 'response', params})
      .pipe(
        map(response => {
          return response.body;
        })
      )
  }

  approveSelectedOrders(orderUpdParams: OrderUpdParams) { 
    return this.http.put<number>(this.baseUrl+'orders/approve', orderUpdParams);
  }

  rejectSelectedOrders(orderUpdParams: OrderUpdParams) { 
    return this.http.put<number>(this.baseUrl+'orders/reject', orderUpdParams);
  }
}
