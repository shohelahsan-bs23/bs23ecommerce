import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IProduct } from 'src/app/shared/models/product';
import { ShoppingCartService } from 'src/app/shopping-cart/shopping-cart.service';
import { BreadcrumbService } from 'xng-breadcrumb';
import { ShopService } from '../shop.service';

@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss']
})
export class ProductDetailsComponent implements OnInit {
  product: IProduct;
  quantity = 1;

  constructor(private ShopService: ShopService, private activatedRoute: ActivatedRoute, 
    private bcService: BreadcrumbService, private shoppingCartService: ShoppingCartService) {
      this.bcService.set('@productDetails', '');
   }

  ngOnInit(): void {
    this.loadProduct();
  }

  addItemToShoppingCart() {
    this.shoppingCartService.addItemToShoppingCart(this.product, this.quantity);
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if(this.quantity > 1) {
      this.quantity--;
    }    
  }

  loadProduct() {
    this.ShopService.getProduct(+this.activatedRoute.snapshot.paramMap.get('id')).subscribe(product => {
      this.product = product;
      this.bcService.set('@productDetails', product.name);
    },
    error => {
      console.log(error);
    });
  }

}
