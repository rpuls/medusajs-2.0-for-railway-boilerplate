export default async function handler(req, res) {
  const medusaRes = await fetch(
    'https://backend-production-4e07.up.railway.app/store/products',
    {
      headers: {
        'x-publishable-api-key': process.env.MEDUSA_PUBLISHABLE_API_KEY
      }
    }
  );
  const { products } = await medusaRes.json();
  res.status(200).json({ products });
}
