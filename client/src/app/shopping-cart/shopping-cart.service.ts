import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { IProduct } from '../shared/models/product';
import { IShoppingCart, IShoppingCartItem, IShoppingCartTotals, ShoppingCart } from '../shared/models/shopping-cart';

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {
  baseUrl = environment.apiUrl;
  private shoppingCartSource = new BehaviorSubject<IShoppingCart>(null);  
  shoppingCart$ = this.shoppingCartSource.asObservable();
  private shoppingCartTotalSource = new BehaviorSubject<IShoppingCartTotals>(null);
  shoppingCartTotal$ = this.shoppingCartTotalSource.asObservable();

  constructor(private http: HttpClient) { }

  getShoppingCart(id: string) {
    return this.http.get(this.baseUrl + 'shoppingcart?id=' + id).pipe(
      map((shoppingCart: IShoppingCart) => {
        this.shoppingCartSource.next(shoppingCart);
        this.calculateTotals();
      })
    );
  }

  setShoppingCart(shoppingCart: IShoppingCart) {
    return this.http.post(this.baseUrl + 'shoppingcart', shoppingCart).subscribe((response: IShoppingCart) => {
      this.shoppingCartSource.next(response);
      this.calculateTotals();
    }, error => {
      console.log(error);
    })
  }

  getCurrentShoppingCartValue() {
    return this.shoppingCartSource.value;
  }

  addItemToShoppingCart(item: IProduct, quantity = 1) {
    const itemToAdd: IShoppingCartItem = this.mapProductToShoppingCartItem(item, quantity);
    const shoppingCart = this.getCurrentShoppingCartValue() ?? this.createShoppingCart();
    shoppingCart.items = this.addOrUpdateItem(shoppingCart.items, itemToAdd, quantity);
    this.setShoppingCart(shoppingCart);
  }

  incrementItemQuantity(item: IShoppingCartItem) {
    const shoppingCart = this.getCurrentShoppingCartValue();
    const foundItemindex = shoppingCart.items.findIndex(i => i.id === item.id);
    shoppingCart.items[foundItemindex].quantity ++;
    this.setShoppingCart(shoppingCart);
  }

  decrementItemQuantity(item: IShoppingCartItem) {
    const shoppingCart = this.getCurrentShoppingCartValue();
    const foundItemindex = shoppingCart.items.findIndex(i => i.id === item.id);
    if(shoppingCart.items[foundItemindex].quantity > 1) {
      shoppingCart.items[foundItemindex].quantity --;
      this.setShoppingCart(shoppingCart);
    } else {
      this.removeItemFromShoppingCart(item);
    }    
  }

  removeItemFromShoppingCart(item: IShoppingCartItem) {
    const shoppingCart = this.getCurrentShoppingCartValue();
    if (shoppingCart.items.some(x => x.id === item.id)) {
      shoppingCart.items = shoppingCart.items.filter(i => i.id !== item.id);
      if(shoppingCart.items.length > 0) {
        this.setShoppingCart(shoppingCart);
      } else {
        this.deleteShoppingCart(shoppingCart);
      }
    }
  }

  deleteShoppingCart(shoppingCart: IShoppingCart) {
    return this.http.delete(this.baseUrl + 'shoppingcart?id=' + shoppingCart.id).subscribe(() => {
      this.shoppingCartSource.next(null);
      this.shoppingCartTotalSource.next(null);
      localStorage.removeItem('shoppingcart_id');
    }, error => {
      console.log(error);
    })
  }

  private calculateTotals() {
    const shoppingCart = this.getCurrentShoppingCartValue();
    const shipping = 0;
    const subtotal = shoppingCart.items.reduce((a, b) => (b.price *b.quantity) + a, 0);
    const total = subtotal + shipping;
    this.shoppingCartTotalSource.next({shipping, total, subtotal});
  }

  private addOrUpdateItem(items: IShoppingCartItem[], itemToAdd: IShoppingCartItem, quantity: number): IShoppingCartItem[] {
    const index = items.findIndex(i => i.id === itemToAdd.id);
    if(index === -1) {
      itemToAdd.quantity = quantity;
      items.push(itemToAdd);
    } else {
      items[index].quantity += quantity;
    }
    return items;
  }

  private createShoppingCart(): IShoppingCart {
    const shoppingCart = new ShoppingCart();
    localStorage.setItem('shoppingcart_id', shoppingCart.id);
    return shoppingCart;
  }

  private mapProductToShoppingCartItem(item: IProduct, quantity: number): IShoppingCartItem {
    return {
      id: item.id,
      productName: item.name,
      price: item.price,
      pictureUrl: item.pictureUrl,
      quantity,
      brand: item.productBrand,
      type: item.productType
    };
  }
}