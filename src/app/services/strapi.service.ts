import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StrapiService {
  private apiUrl = 'http://localhost:1337/api/products?populate=*'; // Product API URL
  private reviewApiUrl = 'http://localhost:1337/api/reviews'; // Review API URL

  constructor(private http: HttpClient) {}

  getProducts(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  addReview(reviewData: any): Observable<any> {
    return this.http.post<any>(this.reviewApiUrl, reviewData);
  }
  getAllReviews(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reviews`); // Adjust endpoint as needed
  }
  getProductByDocumentId(documentId: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${documentId}`);
  }


}
