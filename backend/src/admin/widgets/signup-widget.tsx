import { defineWidgetConfig } from "@medusajs/admin-sdk";
import SignupForm from "../components/signup-form"
import DrawerComponent from "../components/drawer";

const SignupWidget = () => {
  return (
    <div>
      <p className="text-center mt-4">
        No business account?{" "}
        <DrawerComponent title="Sign Up" content={<SignupForm />} />
      </p>
    </div>
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "login.after",
});

export default SignupWidget;
