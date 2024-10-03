import { Component } from '@angular/core';
import { StrapiService } from '../services/strapi.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';  // Import FormsModule
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule,FormsModule, HttpClientModule],
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']

})
export class ShopComponent {
  products: any[] = [];  // Original array of products from Strapi
  filteredProducts: any[] = [];  // Filtered array of products to display
  searchTerm: string = '';  // User's search input
  selectedCategory: string = '';  // Selected category for filtering
  selectedGender: string = '';  // Selected gender for filtering
  productId: number | null = null; // To hold the selected product ID
  review = { name: '', rating: null }; // Review data structure
  selectedProduct: any = null; // Selektovani proizvod za pop-up
  showPopup: boolean = false;
  reviews: any[] = [];
  showOrderPopup: boolean = false;

  // Order data structure
  order = {
    quantity: 1,
    customer_name: '',
    customer_email: '',
    address: ''
  };

  constructor(private strapiService: StrapiService, private http: HttpClient) {}

  ngOnInit() {
    this.strapiService.getProducts().subscribe({
      next: (response: any) => {
        this.products = response.data;  // Set products array
        this.filteredProducts = this.products;  // Initially, filteredProducts equals products
      },
      error: (error: any) => {
        console.error("Error fetching products", error);
      }
    });
  }

  // Filtering function to be called whenever the filter changes
  filterProducts() {
    this.filteredProducts = this.products.filter(product => {
      const matchesSearch = product.title.toLowerCase().includes(this.searchTerm.toLowerCase());
      const matchesCategory = this.selectedCategory ? product.Category === this.selectedCategory : true;
      const matchesGender = this.selectedGender ? product.Gender === this.selectedGender : true;

      // Only apply gender filter if the category is "Clothing and footwear"
      if (this.selectedCategory === 'Clothing and footwear') {
        return matchesSearch && matchesCategory && matchesGender;
      } else {
        return matchesSearch && matchesCategory;
      }
    });
  }
  setProductId(id: number) {
    this.productId = id;
    this.review = { name: '', rating: null }; // Reset review data when opening modal
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
        console.log('Product data fetched:', response); 
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
