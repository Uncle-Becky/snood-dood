import { Order, Product, OnPurchaseResult} from "@devvit/payments"
import { UsePayments } from "@devvit/payments/hooks/use-payments.js";

export type PaymentsContext = {
    payments: UsePayments;
    orders: Order[];
    catalog: Product[];
}

