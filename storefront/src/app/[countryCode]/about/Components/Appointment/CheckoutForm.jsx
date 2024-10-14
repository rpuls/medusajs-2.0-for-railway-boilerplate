import { PaymentElement } from "@stripe/react-stripe-js";
import { useState } from "react";
import { useStripe, useElements, LinkAuthenticationElement } from "@stripe/react-stripe-js";

export default function CheckoutForm({setPaymentStatus}) {

  const stripe = useStripe();
  const elements = useElements();

  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return;
    }

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}`,
      },
      redirect: 'if_required',
    });

    if (error?.type === "card_error" || error?.type === "validation_error") {
      setMessage(error.message);
    } else {
      setMessage("An unexpected error occured.");
    }
    if(!error) {
  
      
        setPaymentStatus(true);
    }

    setIsProcessing(false);

  };

  return (
    <form className="mt-4 flex flex-col items-center " onSubmit={handleSubmit}>
      <LinkAuthenticationElement  className="w-[15rem] lg:w-full" />
      <PaymentElement id="payment-element" className="mt-2 w-[15rem] lg:w-full"/>
   
      <button disabled={isProcessing || !stripe || !elements} className="mt-4 lg:mt-8 border-[4px] border-green-500  font-bold px-[2rem] py-[.5rem] rounded-[4px] transition ease-in-out duration-300 text-green-700 hover:bg-green-500 hover:text-white">
        <span id="button-text">
          {isProcessing ? "Procesare... " : "Plateste acum"}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div className="mt-1 lg:mt-2  font-semibold text-red-600">{message}</div>}
    </form>
  );
}