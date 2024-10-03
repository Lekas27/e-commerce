import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { StrapiService } from '../services/strapi.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, HttpClientModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  products: any[] = [];
  productId: number | null = null; // To hold the selected product ID
  reviews: any[] = []; // To hold all reviews
  review = { name: '', rating: null }; // Review data structure
  selectedProduct: any = null; // Selektovani proizvod za pop-up
  showPopup: boolean = false;
  showOrderPopup: boolean = false;

  // Order data structure
  order = {
    quantity: 1,
    customer_name: '',
    customer_email: '',
    address: ''
  };

  constructor(private strapiService: StrapiService, private router: Router ,  private http: HttpClient ) {}

  ngOnInit() {
    this.strapiService.getProducts().subscribe({
      next: (response: any) => {
        this.products = response.data
          .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 4);
      },
      error: (error: any) => {
        console.error('Error fetching products', error);
      }
    });

    // Fetch all reviews once when component initializes
    this.strapiService.getAllReviews().subscribe({
      next: (response: any) => {
        this.reviews = response.data; // Store all reviews
      },
      error: (error: any) => {
        console.error('Error fetching reviews', error);
      }
    });
  }

  // Set the product ID for the review
  setProductId(id: number) {
    this.productId = id;
    this.review = { name: '', rating: null }; // Reset review data when opening modal
    console.log(this.productId);
  }

  // Close the modal
  closeModal() {
    this.productId = null; // Close the modal
  }

  // Submit the review
  submitReview() {
    if (this.productId && this.review.name && this.review.rating) {
      const reviewData = {
        data: {
          name: this.review.name,
          rating: this.review.rating,
          product: this.productId // Associate review with product
        }
      };

      this.strapiService.addReview(reviewData).subscribe({
        next: () => {
          console.log('Review submitted successfully');
          // Reset form and close modal
          this.productId = null;
          this.review = { name: '', rating: null };

          // Optionally refresh the reviews list here if necessary
        },
        error: (error: any) => {
          console.error('Error submitting review', error);
        }
      });

    }

  }
  openProductPopup(documentId: string) {
    const url = `http://localhost:1337/api/products/${documentId}/?populate=*`;  // Use documentId in the URL
    this.http.get(url).subscribe({
      next: (response: any) => {
        this.selectedProduct = response.data; // Store the product data
        this.reviews = this.selectedProduct?.reviews || []; // Store the reviews (ensure it is an array)
        this.showPopup = true; // Set the flag to show the popup
      },
      error: (error: any) => {
        console.error('Error fetching product details', error);
      }
    });
  }
  
  

  closePopup() {
    this.showPopup = false; // Zatvori pop-up
  }
   // Open the order popup and set the selected product
   openOrderPopup(product: any) {
    this.selectedProduct = product;
    this.showOrderPopup = true;
  }

  // Close the order popup
  closeOrderPopup() {
    this.showOrderPopup = false;
    this.selectedProduct = null;
  }

  // Submit the order
  submitOrder() {
    const totalPrice = this.order.quantity * this.selectedProduct.price; // Calculate total price

    const orderData = {
      data: {
        product: this.selectedProduct.id, // Product relation
        quantity: this.order.quantity,
        customer_name: this.order.customer_name,
        customer_email: this.order.customer_email,
        address: this.order.address,
        total_price: totalPrice
      }
    };

    // POST request to save the order
    this.http.post('http://localhost:1337/api/orders', orderData).subscribe({
      next: () => {
        console.log('Order submitted successfully');
        this.closeOrderPopup(); // Close the popup after successful order
        // Optionally, you can reset the order form fields here
      },
      error: (error: any) => {
        console.error('Error submitting order', error);
      }
    });
  }
  
}
