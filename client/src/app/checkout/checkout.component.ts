import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AccountService } from '../account/account.service';
import { ShoppingCartService } from '../shopping-cart/shopping-cart.service';
import { Observable } from 'rxjs';
import { IShoppingCartTotals } from '../shared/models/shopping-cart';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {
  shoppingCartTotals$: Observable<IShoppingCartTotals>;
  checkoutForm: FormGroup;

  constructor(private fb: FormBuilder, private accountService: AccountService, private shoppingCartService: ShoppingCartService) { }

  ngOnInit() {
    this.createCheckoutForm();
    this.getAddressFormValues();
    //this.getDeliveryMethodValue();
    this.shoppingCartTotals$ = this.shoppingCartService.shoppingCartTotal$;
  }

  createCheckoutForm() {
    this.checkoutForm = this.fb.group({
      addressForm: this.fb.group({
        firstName: [null, Validators.required],
        lastName: [null, Validators.required],
        street: [null, Validators.required],
        city: [null, Validators.required],
        state: [null, Validators.required],
        zipcode: [null, Validators.required],
      }),
      deliveryForm: this.fb.group({
        deliveryMethod: [null, Validators.required]
      }),
      paymentForm: this.fb.group({
        nameOnCard: [null, Validators.required]
      })
    });
  }

  getAddressFormValues() {
    this.accountService.getUserAddress().subscribe(address => {
      if (address) {
        this.checkoutForm.get('addressForm').patchValue(address);
      }
    }, error => {
      console.log(error);
    });
  }

   getDeliveryMethodValue() {
     const shoppingCart = this.shoppingCartService.getCurrentShoppingCartValue();
     if (shoppingCart.deliveryMethodId !== null) {
       this.checkoutForm.get('deliveryForm').get('deliveryMethod').patchValue(shoppingCart.deliveryMethodId.toString());
     }
   }

}