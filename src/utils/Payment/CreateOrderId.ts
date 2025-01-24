import axios from "axios";

export async function createOrderId(amount: number, currency: string) {
    try {
        const response = await axios.post("/api/payment/createOrder", {
            amount: amount * 100, // Convert to paise
            currency: "INR",
        });

        console.log("Order Response:", response.data);
        return response.data.orderId;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to create order");
    }
}