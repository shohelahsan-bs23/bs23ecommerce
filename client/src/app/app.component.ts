import { Component, OnInit } from '@angular/core';
import { AccountService } from './account/account.service';
import { ShoppingCartService } from './shopping-cart/shopping-cart.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'bs23-ecommerce';

    constructor(private shoppingCartService: ShoppingCartService, private accountService: AccountService) {}

    ngOnInit(): void {      
      this.loadShoppingCart();
      this.loadCurrentUser();
    }

    loadCurrentUser() {
      const token = localStorage.getItem('token');     
      this.accountService.loadCurrentUser(token).subscribe(() => {
        //console.log('loaded user');
      }, error => {
        console.log(error);
      })      
    }

    loadShoppingCart() {
      const shoppingCartId = localStorage.getItem('shoppingcart_id');
      if(shoppingCartId) {
        this.shoppingCartService.getShoppingCart(shoppingCartId).subscribe(() => {
          console.log('initialized shopping cart');
        }, error => {
          console.log(error);
        })
      }
    }
}
