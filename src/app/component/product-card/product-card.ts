import { IMAGE_CONFIG } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-product-card',
  imports: [],
  templateUrl: './product-card.html',
  styleUrl: './product-card.scss'
})
export class ProductCard {
@Input() product: any;
@Input() addToCart: () => void = () => {
  console.log('Add to cart function not provided'); 
}
}
