import { Button } from "@/common/components/ui/button";
import { FieldGroup } from "@/common/components/ui/field";
import {
  CustomField,
  PasswordField,
} from "@/common/components/ui/field-structure";
import { Input } from "@/common/components/ui/input";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  loginFormSchema,
  type LoginValues,
} from "../schemas/auth.schemas";
import { Link } from "react-router-dom";
import { RoutePath } from "@/app/routes/configs/root.config";
import { useLogin } from "../queries/auth.mutations";

export const SignInForm = () => {
  const methods = useForm<LoginValues>({
    resolver: zodResolver(loginFormSchema),
    mode: "onChange",
    reValidateMode: "onChange",
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isValid },
  } = methods;

  const { mutate: loginUser, isPending } = useLogin(setError);

  const onSubmit = (values: LoginValues) => {
    loginUser(values);
  };

  const clearAuthServerErrors = () => {
    if (errors.email?.type === "server") clearErrors("email");
    if (errors.password?.type === "server") clearErrors("password");
  };

  const isDisabled = isPending || isSubmitting;

  return (
    <div>
      <h1 className="typo-h1 text-center lg:text-start leading-14">Sign In</h1>

      <h2 className="mt-1.5 typo-third text-[14px] text-grey text-center lg:text-start">
        Enter your email and password to sign in!
      </h2>

      <FormProvider {...methods}>
        <form className="mt-8" onSubmit={handleSubmit(onSubmit)} noValidate>
          <FieldGroup className="grid gap-8">
            <CustomField
              htmlFor="email"
              label="Email"
              required
              error={errors.email?.message}
            >
              <Input
                id="email"
                aria-invalid={!!errors.email}
                size="md"
                placeholder="mail@simmmple.com"
                autoComplete="email"
                {...register("email", { onChange: clearAuthServerErrors })}
              />
            </CustomField>

            <CustomField
              htmlFor="password"
              label="Password"
              required
              error={errors.password?.message}
            >
              <PasswordField
                name="password"
                id="password"
                placeholder="Min. 8 characters"
                autoComplete="current-password"
                size="md"
                onChange={clearAuthServerErrors}
              />
            </CustomField>

            <Button
              type="submit"
              disabled={isDisabled}
              variant={!isValid ? "lightDisabled" : "default"}
            >
              {isPending ? "Loading..." : "Sign In"}
            </Button>
          </FieldGroup>
        </form>
      </FormProvider>

      <p className="mt-8 typo-third text-[14px] text-ui-black">
        Not registered yet?{" "}
        <Link
          to={RoutePath.SignUp}
          className="typo-link font-bold"
        >
          Create an Account
        </Link>
      </p>
    </div>
  );
};