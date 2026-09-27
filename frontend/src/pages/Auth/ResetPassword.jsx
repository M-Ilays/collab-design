import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import PrimaryInput from '../../utils/Inputs/PrimaryInput.jsx';
import SecondaryButton from '../../utils/Buttons/SecondaryButton.jsx';
import ShowError from '../../overlays/ShowError.jsx';
import Message from '../../overlays/Message.jsx';
import H1 from "../../utils/Headings/H1.jsx";
import api from "../../api.js";

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const location = useLocation();
    const navigate = useNavigate();
    const queryParams = new URLSearchParams(location.search);
    const urlToken = queryParams.get("token");

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%^&*(),.?":{}|<>]).{8,}$/;

    const handlePasswordChange = (e) => setPassword(e.target.value);
    const handleRePasswordChange = (e) => setConfirmPassword(e.target.value);

    const validateInputs = () => {
        const newErrors = {};

        if (!password) {
            newErrors.password = 'Password is required';
        } else if (password.length <= 8) {
            newErrors.password = 'Password must be longer than 8 characters';
        } else if (!passwordRegex.test(password)) {
            newErrors.password = 'Password must contain at least 1 lowercase, 1 uppercase letter, and 1 special character';
        }

        if (!confirmPassword) {
            newErrors.rePassword = 'Re-entering your password is required';
        } else if (password !== confirmPassword) {
            newErrors.rePassword = 'Passwords do not match';
        }

        return newErrors;
    };

    const handleResetPassword = async () => {
        const validationErrors = validateInputs();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            const response = await api.post(`/api/auth/reset-password`, {
                newPassword: password,
                confirmPassword: confirmPassword,
            }, {
                params: { token: urlToken },
            });

            if (response.status === 200) {
                setMessage("Password has been reset successfully.");
            } else {
                setErrors({ general: response?.data?.message || "Error during password reset." });
            }
        } catch (error) {
            setErrors({ general: error.response?.data?.message || "Error during password reset." });
        }
    };

    return (
        <div className="flex flex-col gap-4 items-center justify-center h-[100dvh] px-4">
            <H1 Text={"Reset Your Password"} className="text-center" />

            <div className="w-full max-w-md">
                <PrimaryInput
                    placeHolder="Enter new password"
                    name="password"
                    type="password"
                    value={password}
                    onChange={handlePasswordChange}
                    error={errors.password}
                    className="w-full mb-4"
                />
                <PrimaryInput
                    placeHolder="Re-enter your new password"
                    name="rePassword"
                    type="password"
                    value={confirmPassword}
                    onChange={handleRePasswordChange}
                    error={errors.rePassword}
                    className="w-full mb-4"
                />
                <SecondaryButton
                    text="Reset Password"
                    action={handleResetPassword}
                    className="w-full"
                />
            </div>

            {errors.general && (
                <ShowError text={errors.general} onClose={() => setErrors({})} />
            )}

            {message && (
                <Message text={message} onClose={() => navigate('/')} />
            )}
        </div>
    );
};

export default ResetPassword;
