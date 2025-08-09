import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};
serve(async (req)=>{
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }
  try {
    const { sponsor_name, sponsor_email } = await req.json();
    if (!sponsor_name || !sponsor_email) {
      throw new Error('Name and email are required');
    }
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16'
    });
    // Create or retrieve customer
    let customer;
    const existingCustomers = await stripe.customers.list({
      email: sponsor_email,
      limit: 1
    });
    if (existingCustomers.data.length > 0) {
      customer = existingCustomers.data[0];
    } else {
      customer = await stripe.customers.create({
        email: sponsor_email,
        name: sponsor_name
      });
    }
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: [
        'card'
      ],
      mode: 'subscription',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: 'Teacher AI Tool Sponsorship',
              description: 'Monthly sponsorship to provide AI tools for educators'
            },
            unit_amount: 2000,
            recurring: {
              interval: 'month'
            }
          },
          quantity: 1
        }
      ],
      success_url: `${req.headers.get('origin')}/sponsorship-success`,
      cancel_url: `${req.headers.get('origin')}/sponsorship-cancel`,
      metadata: {
        sponsor_name,
        sponsor_email
      }
    });
    return new Response(JSON.stringify({
      url: session.url
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 200
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: error.message
    }), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json'
      },
      status: 400
    });
  }
});
