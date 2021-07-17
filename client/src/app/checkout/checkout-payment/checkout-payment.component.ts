import { Component, OnInit, Input, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router, NavigationExtras } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ShoppingCartService } from 'src/app/shopping-cart/shopping-cart.service';
import { IShoppingCart } from 'src/app/shared/models/shopping-cart';
import { IOrder } from 'src/app/shared/models/order';
import { CheckoutService } from '../checkout.service';

declare var Stripe;

@Component({
  selector: 'app-checkout-payment',
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss']
})
export class CheckoutPaymentComponent implements AfterViewInit, OnDestroy {
  @Input() checkoutForm: FormGroup;
  @ViewChild('cardNumber', {static: true}) cardNumberElement: ElementRef;
  @ViewChild('cardExpiry', {static: true}) cardExpiryElement: ElementRef;
  @ViewChild('cardCvc', {static: true}) cardCvcElement: ElementRef;
  stripe: any;
  cardNumber: any;
  cardExpiry: any;
  cardCvc: any;
  cardErrors: any;
  cardHandler = this.onChange.bind(this);
  loading = false;
  cardNumberValid = false;
  cardExpiryValid = false;
  cardCvcValid = false;


  constructor(
    private shoppingCartService: ShoppingCartService,
    private checkoutService: CheckoutService,
    private toastr: ToastrService,
    private router: Router) { }

    ngAfterViewInit() {
      this.stripe = Stripe('pk_test_51J9aQBDsdVD0YvyGrO3LyDbODjOunWYKxbN8ZtPchCR5iDLWXaqiQsk4PHzj5TmV9fui7mfoelfR8Z9OUe2BdhlF00TZTjWSzl');
      const elements = this.stripe.elements();
  
      this.cardNumber = elements.create('cardNumber');
      this.cardNumber.mount(this.cardNumberElement.nativeElement);
      this.cardNumber.addEventListener('change', this.cardHandler);
  
      this.cardExpiry = elements.create('cardExpiry');
      this.cardExpiry.mount(this.cardExpiryElement.nativeElement);
      this.cardExpiry.addEventListener('change', this.cardHandler);
  
      this.cardCvc = elements.create('cardCvc');
      this.cardCvc.mount(this.cardCvcElement.nativeElement);
      this.cardCvc.addEventListener('change', this.cardHandler);
    }
  
    ngOnDestroy() {
      this.cardNumber.destroy();
      this.cardExpiry.destroy();
      this.cardCvc.destroy();
    }
  
    onChange(event) {
      if (event.error) {
        this.cardErrors = event.error.message;
      } else {
        this.cardErrors = null;
      }
      switch (event.elementType) {
        case 'cardNumber':
          this.cardNumberValid = event.complete;
          break;
        case 'cardExpiry':
          this.cardExpiryValid = event.complete;
          break;
        case 'cardCvc':
          this.cardCvcValid = event.complete;
          break;
      }
    }

    async submitOrder() {
      this.loading = true;
      const shoppingCart = this.shoppingCartService.getCurrentShoppingCartValue();
      try {
        const createdOrder = await this.createOrder(shoppingCart);
        const paymentResult = await this.confirmPaymentWithStripe(shoppingCart);

        if (paymentResult.paymentIntent) {
          this.shoppingCartService.deleteShoppingCart(shoppingCart);
          const navigationExtras: NavigationExtras = {state: createdOrder};
          this.router.navigate(['checkout/success'], navigationExtras);
        } else {
          this.toastr.error(paymentResult.error.message);
        }
        this.loading = false;
      }
      catch (error) {
        console.log(error);
        this.loading = false;
      }      
    }
    
    private async confirmPaymentWithStripe(shoppingCart) {
      return this.stripe.confirmCardPayment(shoppingCart.clientSecret, {
        payment_method: {
          card: this.cardNumber,
          billing_details: {
            name: this.checkoutForm.get('paymentForm').get('nameOnCard').value
          }
        }
      });
    }
  
    private async createOrder(shoppingCart: IShoppingCart) {
      const orderToCreate = this.getOrderToCreate(shoppingCart);
      return this.checkoutService.createOrder(orderToCreate).toPromise();
    }

  private getOrderToCreate(shoppingCart: IShoppingCart) {
    return {
      shoppingCartId: shoppingCart.id,
      deliveryMethodId: + this.checkoutForm.get('deliveryForm').get('deliveryMethod').value,
      shipToAddress: this.checkoutForm.get('addressForm').value
    };
  }

}
