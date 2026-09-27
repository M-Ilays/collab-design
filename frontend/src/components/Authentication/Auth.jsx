import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import PropTypes from "prop-types";
import PrimaryInput from "../../utils/Inputs/PrimaryInput.jsx";
import SecondaryButton from "../../utils/Buttons/SecondaryButton.jsx";
import GoogleButton from "../../utils/Buttons/GoogleButton.jsx";
import GitHubButton from "../../utils/Buttons/GitHubButton.jsx";
import astronaut from "../../assets/gifs/astronout.gif";
import rocket from "../../assets/gifs/rocket.gif";
import ShowError from "../../overlays/ShowError.jsx";
import Message from "../../overlays/Message.jsx";
import { useState } from "react";
import api from "../../api.js";
import { BACKEND_URL } from "../../constants/BACKEND.js";

const Auth = ({ stopPropagation }) => {
  const [isLoginForm, setIsLoginForm] = useState(false);
  const [isForgetPassword, setIsForgetPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    rePassword: "",
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(window.location.search);
  const inviteToken = searchParams.get("invite");
  const data = {
    signup: {
      moto: "Create Account",
      subtitle: "Enter your personal details and start your journey with us",
      button: "Sign Up",
      line: "Or sign up with",
      bg: rocket,
    },
    login: {
      moto: "Welcome Back",
      subtitle:
        "To keep connected with us, please login with your personal info",
      button: "Log In",
      line: "Or login with",
      bg: astronaut,
    },
    forgetPassword: {
      moto: "Reset Your Password",
      subtitle: "Please enter your reset Email",
      button: "Reset",
      line: "Or login with",
      bg: astronaut,
    },
  };

  const currentData = isForgetPassword
    ? data.forgetPassword
    : isLoginForm
    ? data.login
    : data.signup;

  const validateInputs = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{6,}$/;

    if (isForgetPassword) {
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter a valid email address";
      }
    } else if (isLoginForm) {
      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter a valid email address";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      }
    } else {
      if (!formData.name) {
        newErrors.name = "Full name is required";
      }

      if (!formData.email) {
        newErrors.email = "Email is required";
      } else if (!emailRegex.test(formData.email)) {
        newErrors.email = "Enter a valid email address";
      }

      if (!formData.password) {
        newErrors.password = "Password is required";
      } else if (
        formData.password.length < 8 ||
        !passwordRegex.test(formData.password)
      ) {
        newErrors.password = (
          <>
            Password must contain at least 8 characters <br />1 uppercase
            letter, 1 lowercase letter, and 1 special character
          </>
        );
      }

      if (!formData.rePassword) {
        newErrors.rePassword = "Re-enter your password";
      } else if (formData.password !== formData.rePassword) {
        newErrors.rePassword = "Passwords do not match";
      }
    }

    return newErrors;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCloseError = (e) => {
    e.stopPropagation();
    setErrors({});
  };

  const handleCloseMessage = () => {
    setMessage("");
  };

  const handleSubmit = async () => {
    const validationErrors = validateInputs();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      if (isForgetPassword) {
        try {
          const response = await api.post(`/api/auth/forgot-password`, {
            email: formData.email,
          });

          response.status === 200
            ? setMessage(
                "A password reset email has been sent to your email address."
              )
            : setErrors({
                general: "Please Try again, something unexpected happened",
              });
        } catch (error) {
          setErrors({
            general:
              error.response?.data?.message || "Error during password reset.",
          });
        }
      } else if (isLoginForm) {
        //Login here
        try {
          const response = await api.post(`/api/auth/login`, formData, {
            validateStatus: (status) => status < 500,
          });
          if (response.status !== 200)
            setErrors({ general: response.data.message });
          else {
            const token = response.data.result.token;
            localStorage.setItem("collabToken", token);
            navigate("/dashboard");
          }
        } catch (error) {
          setErrors({
            general:
              error.response?.data?.message ||
              "Something unexpected happened, Please Try again",
          });
        }
      } else {
        // sign up here
        try {
          const response = await api.post(`/api/auth/sign-up`, {
            ...formData,
            inviteToken: inviteToken || undefined, // Only send if exists
          });

          if (response.status === 200) {
            setMessage(
              inviteToken
                ? "Account created! You've been added to the project. Check your email for verification."
                : "Verification email sent. Please check your inbox."
            );
          } else {
            setErrors({ general: response.data.message });
          }
        } catch (error) {
          setErrors({
            general: error.response?.data?.message || "Error during sign-up.",
          });
        }
      }
    }
  };

  const handleKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      await handleSubmit();
    }
  };
  const handleToggleForm = (toggle) => {
    if (toggle) {
      setIsLoginForm((prev) => !prev);
      setIsForgetPassword(false);
      setFormData({});
      setErrors({});
    }
  };

  const handleGitHub = async () => {
    const url = inviteToken
      ? `${BACKEND_URL}/api/auth/github?invite=${inviteToken}`
      : `${BACKEND_URL}/api/auth/github`;
    window.open(url, "_self");
  };

  const handleGoogle = () => {
    const url = inviteToken
      ? `${BACKEND_URL}/api/auth/google?invite=${inviteToken}`
      : `${BACKEND_URL}/api/auth/google`;
    window.open(url, "_self");
  };

  return (
    <div
      className={
        "flex justify-center p-5 w-fit max-h-[80dvh] overflow-y-auto scrollbar-hidden"
      }
    >
      {/* Left side */}
      <div
        className={
          "hidden sm:flex bg-[#667EEA] p-6 items-center relative rounded-l-2xl w-2/5 overflow-y-auto scrollbar-hidden"
        }
        onClick={stopPropagation}
      >
        <motion.div
          key={isLoginForm ? "login" : "signup"}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 0.2, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 1 }}
          className={
            "w-full h-full bg-cover bg-center absolute inset-0 opacity-20"
          }
          style={{ backgroundImage: `url(${currentData.bg})` }}
        ></motion.div>
        <div className={"text-center text-white relative z-10"}>
          <h1 className="text-4xl font-bold">{currentData.moto}</h1>
          <p className="mt-4">{currentData.subtitle}</p>
        </div>
      </div>

      {/* Right side */}
      <div
        className={
          "flex flex-col bg-[#ECECEC] py-5 sm:px-10 px-5 rounded-r-2xl rounded-l-2xl sm:rounded-l-none overflow-y-auto scrollbar-hidden"
        }
        onClick={stopPropagation}
      >
        {inviteToken && (
          <div className="mb-4 flex items-center justify-center    text-blue-800">
            <p className="w-fit p-2 rounded-lg bg-blue-100">
              You've been invited to join a project! Complete your registration
              to accept.
            </p>
          </div>
        )}
        {!isForgetPassword ? (
          <div className={"flex justify-around text-center"}>
            <div
              className={`${
                isLoginForm ? "border-primary border-b-2" : null
              } text-center justify-center w-full py-2 cursor-pointer`}
              onClick={() => {
                handleToggleForm(!isLoginForm);
              }}
            >
              <h4>Login</h4>
            </div>
            <div
              className={`${
                !isLoginForm ? "border-primary border-b-2" : null
              } text-center justify-center w-full py-2 cursor-pointer`}
              onClick={() => {
                handleToggleForm(isLoginForm);
              }}
            >
              <h4>Sign up</h4>
            </div>
          </div>
        ) : (
          <div
            className={`border-primary border-b-2 text-center justify-center w-full py-2 cursor-pointer`}
          >
            <h4>Reset Password</h4>
          </div>
        )}

        {/* Form section */}
        <motion.div
          key={isLoginForm ? "login" : "signup"}
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          transition={{ duration: 1 }}
          className={"flex flex-col py-5"}
          onKeyDown={handleKeyDown}
        >
          {!isLoginForm && (
            <>
              <h4 className={`font-medium my-2 text-md py-1 text`}>
                Full Name
              </h4>
              <PrimaryInput
                placeHolder={"Enter your name"}
                name="name"
                onChange={handleInputChange}
                error={errors.name}
                isRequired={true}
              />
            </>
          )}
          <h4 className={"font-medium my-2 text-md py-1"}>Email</h4>
          <PrimaryInput
            placeHolder={"Enter your email"}
            name="email"
            onChange={handleInputChange}
            error={errors.email}
          />
          {!isForgetPassword && (
            <>
              <h4 className={"font-medium my-2 text-md py-1"}>Password</h4>
              <PrimaryInput
                placeHolder={"Create a password"}
                name="password"
                type="password"
                onChange={handleInputChange}
                error={errors.password}
              />
            </>
          )}
          {!isLoginForm && (
            <>
              <h4 className={"font-medium my-2 text-md py-1"}>
                Confirm Password
              </h4>
              <PrimaryInput
                placeHolder={"Re-enter your password"}
                name="rePassword"
                type="password"
                onChange={handleInputChange}
                error={errors.rePassword}
              />
            </>
          )}

          <div className={"flex flex-col mt-5 mb-2 w-full"}>
            <SecondaryButton text={currentData.button} action={handleSubmit} />
            {isLoginForm && !isForgetPassword && (
              <div
                className={"flex items-center justify-end pt-2 cursor-pointer"}
                onClick={() => {
                  setIsForgetPassword(true);
                }}
              >
                <p className={"text-sm text-primary hover:text-primary-hover"}>
                  Forget Password?
                </p>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4 w-full">
            <div className="flex-grow border-t border-gray-400"></div>
            <p className="text-primary-subtitle text-sm">{currentData.line}</p>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          <div className="flex justify-center items-center space-x-2 mt-6">
            <GoogleButton action={handleGoogle} />
            <GitHubButton action={handleGitHub} />
          </div>
        </motion.div>
      </div>
      {errors.general && (
        <ShowError text={errors.general} onClose={handleCloseError} />
      )}
      {message && <Message text={message} onClose={handleCloseMessage} />}
    </div>
  );
};
Auth.propTypes = {
  stopPropagation: PropTypes.func.isRequired,
};

export default Auth;
