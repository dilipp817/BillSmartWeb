// Address shape as returned in restaurant responses.
// Field name in response JSON: `address`
// Field name in request JSON: `store_address`
export interface Address {
  building: string;
  street: string;
  location: string; // City / area
  zip_code: string;
}
