import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IShoppingCart, IShoppingCartItem, IShoppingCartTotals } from '../shared/models/shopping-cart';
import { ShoppingCartService } from './shopping-cart.service';

@Component({
  selector: 'app-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.scss']
})
export class ShoppingCartComponent implements OnInit {
  shoppingCart$: Observable<IShoppingCart>;
  shoppingCartTotal$: Observable<IShoppingCartTotals>;

  constructor(private shoppingCartService: ShoppingCartService) { }

  ngOnInit(): void {
    this.shoppingCart$ = this.shoppingCartService.shoppingCart$;
    this.shoppingCartTotal$ = this.shoppingCartService.shoppingCartTotal$;
  }

  removeShoppingCartItem(item: IShoppingCartItem) {
    this.shoppingCartService.removeItemFromShoppingCart(item);
  }

  incrementItemQuantity(item: IShoppingCartItem) {
    this.shoppingCartService.incrementItemQuantity(item);
  }

  decrementItemQuantity(item: IShoppingCartItem) {
    this.shoppingCartService.decrementItemQuantity(item);
  }
}
