import { Injectable } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';

@Injectable({
  providedIn: 'root'
})
export class BusyService {
  busuRequestCount = 0;

  constructor(private spinnerService: NgxSpinnerService) { }

  busy() {
    this.busuRequestCount++;
    this.spinnerService.show(undefined, {
      type: 'ball-pulse',
      bdColor: 'rgba(255,255,255,0.7)',
      color: '#333333'
    });
  }

  idle() {
    this.busuRequestCount--;
    if(this.busuRequestCount <= 0) {
      this.busuRequestCount = 0;
      this.spinnerService.hide();
    }
  }
}
