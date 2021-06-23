import { Component, OnInit } from '@angular/core';
import { IOrder } from 'src/app/shared/models/order';
import { OrdersService } from '../orders.service';
import { OrderParams } from 'src/app/shared/models/orderParams';
import { ToastrService } from 'ngx-toastr';
import { OrderUpdParams } from 'src/app/shared/models/orderUpdParams';
import { IPagination } from 'src/app/shared/models/pagination';

@Component({
  selector: 'app-order-approve-reject',
  templateUrl: './order-approve-reject.component.html',
  styleUrls: ['./order-approve-reject.component.scss']
})
export class OrderApproveRejectComponent implements OnInit {
  orders: IOrder[];
  orderIds: number[] = [];
  selectAll = false;
  orderParams = new OrderParams();
  totalCount: number;
  orderUpdParams = new OrderUpdParams();

  constructor(private ordersService: OrdersService, private toastr: ToastrService,) { }

  ngOnInit() {
    this.getOrders();    
  }

  getOrders() {
    this.ordersService.getOrdersForApproveReject(this.orderParams).subscribe(response => {
      this.orders = response.data as IOrder[];
      this.orders.forEach(item => {item['checked'] = false;});
      this.selectAll = false;
      this.orderParams.pageNumber = response.pageIndex;
      this.orderParams.pageSize = response.pageSize;
      this.totalCount = response.count;
    },error => {
      console.log(error);
    });
  }

  approve(item) {
    let items = [];
    items.push(item.id);
    this.submitOrdersApprove();
  }

  reject(item) {
    let items = [];
    items.push(item.id);
    this.submitOrdersReject();
  }

  toogle(type, item) {
    const checkedCount = this.orders.filter((item) => {
      return item['checked'] !== false;
    }).length;
    if(type == 'Y') {
      this.orderIds.push(item.id);
    } else {
      const elemIndex = this.orderIds.indexOf(item.id);
      this.orderIds.splice(elemIndex, 1);
    } 
    this.selectAll = (this.orders.length === checkedCount)
  }

  mastertoogle(type) {
    if(type == 'Y') {
      this.orders.forEach(item => {
        if(item.status === 'Pending') {
          this.orderIds.push(item.id);
        }   
        item['checked'] = true;
      });
    } else {
      this.orders.forEach(item => {
        item['checked'] = false;
        this.orderIds = [];
      });
    }
  }

  onPageChanged(event: any){
    if(this.orderParams.pageNumber !== event){
      this.orderParams.pageNumber = event;
      this.getOrders();
    }    
  }
  
  submitOrdersApprove() {
    if(this.orderIds.length > 0) {
      this.orderUpdParams.orderIds = this.orderIds;
      this.orderUpdParams.orderSpecParams = this.orderParams;
      this.ordersService.approveSelectedOrders(this.orderUpdParams).subscribe(response => {
        this.orderIds = [];
        if(response > 0) {
          this.toastr.success('Orders approved successfully');
          this.getOrders();
        } else {
          this.toastr.error('Orders not approved.');
        }        
      }, error => {
        console.log(error);
      });
    } else {
      this.toastr.warning('Please select Order(s) for approve.');
    }    
  }

  submitOrdersReject() {
    if(this.orderIds.length > 0) {
      this.orderUpdParams.orderIds = this.orderIds;
      this.orderUpdParams.orderSpecParams = this.orderParams;
      this.ordersService.rejectSelectedOrders(this.orderUpdParams).subscribe(response => {
        this.orderIds = [];
        if(response > 0) {
          this.toastr.success('Orders rejected successfully');
          this.getOrders();
        } else {
          this.toastr.error('Orders not rejected.');
        }        
      }, error => {
        console.log(error);
      });
    } else {
      this.toastr.warning('Please select Order(s) for reject.');
    }    
  }

  private orderProcessing (response: IPagination) { 
    this.orders = response.data as IOrder[];
        this.orders.forEach(item => {item['checked'] = false;});
        this.selectAll = false;
        this.orderParams.pageNumber = response.pageIndex;
        this.orderParams.pageSize = response.pageSize;
        this.totalCount = response.count;
  }
}
