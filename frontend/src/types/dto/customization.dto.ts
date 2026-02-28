export interface CustomizationDTO {
  id: string;
  name: string;
  price: number;
  restaurantId: string;
}

export interface CustomizationCreateRequest {
  name: string;
  price: number;
  restaurantId: string;
}
