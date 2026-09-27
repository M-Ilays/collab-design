import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Message from "../../overlays/Message.jsx";
import ShowError from "../../overlays/ShowError.jsx";
import PrimaryButton from "../../utils/Buttons/PrimaryButton.jsx";
import api from "../../api.js";
import PrimaryInput from "../../utils/Inputs/PrimaryInput.jsx";
import H1 from "../../utils/Headings/H1.jsx";

const VerifyEmail = () => {
    const [searchParams] = useSearchParams();
    const [error, setError] = useState("");
    const [verified, setVerified] = useState(false);
    const [isResent, setIsResent] = useState(false);
    const [resendError, setResendError] = useState("");
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [emailError, setEmailError] = useState("");


    useEffect(() => {
        const errorMessage = searchParams.get("error");
        if (errorMessage) {
            setError(errorMessage);
        } else {
            setVerified(true);
        }
    }, [searchParams]);

    // Email validation using regex
    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    // Resend Verification Link Handler
    const handleResendLink = async () => {
        if (!validateEmail(email)) {
            setEmailError("Please enter a valid email address.");
            return;
        }

        try {
            setLoading(true);
            setEmailError("");
            setResendError("");

            const response = await api.post("/api/auth/resend-verification-link", { email });
            if (response.status === 200) {
                setIsResent(true);
            } else {
                setResendError(response.data.message || "Failed to resend verification link");
            }
        } catch (err) {
            setResendError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-dark-900">
            <div className="bg-white dark:bg-dark-800 p-6 rounded-xl shadow-md w-11/12 sm:w-96">
                {error ? (
                    <div>
                        <H1 Text={"Verification Failed"} />
                        <p className="text-gray-700 dark:text-white my-4">
                            {error}
                        </p>

                        <PrimaryInput
                            placeHolder="Enter your registered email"
                            onChange={(e) => setEmail(e.target.value)}
                            name="email"
                            type="text"
                            error={emailError}
                        />
                        <div className="flex justify-center mt-4">
                            <PrimaryButton
                                action={handleResendLink}
                                text={loading ? "Resending..." : "Resend Verification Link"}
                                disabled={loading}
                            />
                        </div>
                    </div>
                ) : (
                    <div>
                        <H1 Text={"Email Verified"}/>
                        <p className="text-gray-700 dark:text-white my-4">
                            Your email has been successfully verified. You can now continue using the application.
                        </p>
                    </div>
                )}
            </div>

            {/* Overlay: Success Message */}
            {isResent && (
                <Message
                    text={"Verification link has been resent to your email. Please check your inbox."}
                    onClose={() => setIsResent(false)}
                />
            )}

            {/* Overlay: Resend Error */}
            {resendError && (
                <ShowError
                    text={resendError}
                    onClose={() => setResendError("")}
                />
            )}
        </div>
    );
};

export default VerifyEmail;
