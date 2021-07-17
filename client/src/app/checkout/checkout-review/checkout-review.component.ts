import { CdkStepper } from '@angular/cdk/stepper';
import { Component, Input, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Observable } from 'rxjs';
import { IShoppingCart } from 'src/app/shared/models/shopping-cart';
import { ShoppingCartService } from 'src/app/shopping-cart/shopping-cart.service';

@Component({
  selector: 'app-checkout-review',
  templateUrl: './checkout-review.component.html',
  styleUrls: ['./checkout-review.component.scss']
})
export class CheckoutReviewComponent implements OnInit {
  @Input() appStepper: CdkStepper;
  shoppingCart$: Observable<IShoppingCart>;

  constructor(private shoppingCartService: ShoppingCartService, private toastr: ToastrService) { }

  ngOnInit(): void {
    this.shoppingCart$ = this.shoppingCartService.shoppingCart$;
  }

  createPaymentIntent() {
    return this.shoppingCartService.createPaymentIntent().subscribe((response: any) => {
      //this.toastr.success('Payment intent created');
      this.appStepper.next();
    }, error => {
      console.log(error);
    });
  }

}
