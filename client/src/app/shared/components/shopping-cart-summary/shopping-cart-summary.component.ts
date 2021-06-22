import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Observable } from 'rxjs';
import { ShoppingCartService } from 'src/app/shopping-cart/shopping-cart.service';
import { IShoppingCart, IShoppingCartItem } from '../../models/shopping-cart';
import { IOrderItem } from '../../models/order';

@Component({
  selector: 'app-shopping-cart-summary',
  templateUrl: './shopping-cart-summary.component.html',
  styleUrls: ['./shopping-cart-summary.component.scss']
})
export class ShoppingCartSummaryComponent implements OnInit {
  @Output() decrement: EventEmitter<IShoppingCartItem> = new EventEmitter<IShoppingCartItem>();
  @Output() increment: EventEmitter<IShoppingCartItem> = new EventEmitter<IShoppingCartItem>();
  @Output() remove: EventEmitter<IShoppingCartItem> = new EventEmitter<IShoppingCartItem>();
  @Input() isShoppingCart = true;
  @Input() items: IShoppingCartItem[] | IOrderItem[] = [];
  @Input() isOrder = false;

  constructor() { }

  ngOnInit(): void {
  }

  decrementItemQuantity(item: IShoppingCartItem){
    this.decrement.emit(item);
  }

  incrementItemQuantity(item: IShoppingCartItem){
    this.increment.emit(item);
  }

  removeShoppingCartItem(item: IShoppingCartItem){
    this.remove.emit(item);
  }
}
