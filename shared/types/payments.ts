export type Product = {
    sku: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
}

export type Order = {
    orderId: string;
    productSku: string;
    productName: string;
    purchaseDate: string;
    status:string;
}