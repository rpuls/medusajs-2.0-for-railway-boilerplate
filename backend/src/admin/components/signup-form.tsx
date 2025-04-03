import { useState } from "react";
import {
  Button,
  Container,
  Heading,
  Input,
  Label,
  Text,
  toast,
} from "@medusajs/ui";

export default function SignUpForm() {
  const [storeName, setStoreName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !storeName ||
      !email ||
      !password
    ) {
      toast.info("Error", {
        description: "Please fill in all fields.",
      });
      return;
    }

    try {
      const response = await fetch(`/create-store`, {
        body: JSON.stringify({ store_name: storeName, email, password }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });
      const data = await response.json();
      if (data?.message === "Ok") {
        toast.success("Success", {
          description: "Store created successfully.",
        });

        // Reset form
        setStoreName("");
        setEmail("");
        setPassword("");
      } else {
        toast.error("Error", {
          description: `${data.message}`,
        });
      }
    } catch (e) {
      console.error("Store crete error", e);
       toast.error("Error", {
         description: "Unexpected error ocured",
       });
    }
  };

  return (
    <Container className="p-8 max-w-md mx-auto">
      <Heading level="h2" className="mb-2">
        New store
      </Heading>
      <Text className="mb-6">
        Enter your store information
      </Text>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="storeName">Store Name</Label>
          <Input
            id="storeName"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="My store"
            // required
          />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@mail.com"
            // required
          />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
            // required
          />
        </div>
        <Button type="submit" variant="primary" className="w-full">
          Submit
        </Button>
      </form>
    </Container>
  );
}
