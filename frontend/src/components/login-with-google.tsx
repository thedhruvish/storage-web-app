import { GoogleLogin } from "@react-oauth/google";
import { useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAppearance } from "@/store/appearanceStore";
import { useLoginWithGoogle } from "@/api/auth";

const LoginWithGoogle = () => {
  const navagate = useNavigate();
  const { appearance } = useAppearance();
  const logoinwithGoogle = useLoginWithGoogle();
  useEffect(() => {
    if (logoinwithGoogle.isSuccess) {
      navagate({ to: "/" });
    }
  }, [logoinwithGoogle.isSuccess]);
  // Login with google
  const loginWithGoogleHandler = (credentialResponse: {
    credential?: string;
  }) => {
    if (credentialResponse.credential) {
      logoinwithGoogle.mutate({
        idToken: credentialResponse.credential,
      });
    }
  };
  return (
    <div className='flex justify-center'>
      <GoogleLogin
        onSuccess={loginWithGoogleHandler}
        onError={() => console.log("Login Failed")}
        size='large'
        theme={appearance.theme === "dark" ? "filled_black" : "outline"}
        auto_select={false}
        text='continue_with'
        useOneTap
      />
    </div>
  );
};

export default LoginWithGoogle;
