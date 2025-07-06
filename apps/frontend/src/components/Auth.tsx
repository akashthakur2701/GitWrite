import { useState } from "react";
import type { ChangeEvent } from "react"
import { Link, useNavigate } from "react-router-dom";
import type { signupInputType } from "@akashthakur2701/zod";
import axios, { AxiosError } from "axios";
import { BACKEND_URL } from "../config";
import type { ApiResponse } from "../hooks";

interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

export const Auth = ({ type }: { type: "signup" | "signin" }) => {
    const navigate = useNavigate();
    const [postInputs, setPostInputs] = useState<signupInputType>({
        name: "",
        email: "",
        password: ""
    });
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [generalError, setGeneralError] = useState<string>("");

    async function sendRequest() {
        try {
            setLoading(true);
            setErrors({});
            setGeneralError("");
            
            const response = await axios.post<ApiResponse<AuthResponse>>(
                `${BACKEND_URL}/api/v1/user/${type === "signup" ? "signup" : "signin"}`,
                postInputs
            );
            
            if (response.data.success && response.data.data) {
                localStorage.setItem("token", response.data.data.token);
                navigate("/dashboard");
            } else {
                setGeneralError(response.data.message || "Authentication failed");
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse<unknown>>;
            if (axiosError.response?.data) {
                const errorData = axiosError.response.data;
                if (errorData.errors) {
                    setErrors(errorData.errors);
                } else {
                    setGeneralError(errorData.message || "An error occurred");
                }
            } else {
                setGeneralError("Network error. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="h-screen flex justify-center flex-col">
            <div className="flex justify-center">
                <div>
                    <div className="px-10">
                        <div className="text-3xl font-extrabold">
                            {type === "signup" ? "Create an account" : "Sign in to your account"}
                        </div>
                        <div className="text-slate-500">
                            {type === "signin"
                                ? "Don't have an account?"
                                : "Already have an account?"}
                            <Link
                                className="pl-2 underline"
                                to={type === "signin" ? "/signup" : "/signin"}
                            >
                                {type === "signin" ? "Sign up" : "Sign in"}
                            </Link>
                        </div>
                    </div>
                    
                    {/* Display general error */}
                    {generalError && (
                        <div className="px-10 pt-4">
                            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                                {generalError}
                            </div>
                        </div>
                    )}
                    
                    <div className="pt-8">
                        {type === "signup" && (
                            <LabelledInput
                                id="name"
                                label="Name"
                                placeholder="John Doe"
                                value={postInputs.name || ""}
                                error={errors.name?.[0]}
                                onChange={(e) =>
                                    setPostInputs({
                                        ...postInputs,
                                        name: e.target.value,
                                    })
                                }
                            />
                        )}
                        <LabelledInput
                            id="email"
                            label="Email"
                            placeholder="john@example.com"
                            value={postInputs.email}
                            error={errors.email?.[0]}
                            onChange={(e) =>
                                setPostInputs({
                                    ...postInputs,
                                    email: e.target.value,
                                })
                            }
                        />
                        <LabelledInput
                            id="password"
                            label="Password"
                            type="password"
                            placeholder={type === "signup" ? "Min 8 chars with uppercase, lowercase, number & special char" : "Your password"}
                            value={postInputs.password}
                            error={errors.password?.[0]}
                            onChange={(e) =>
                                setPostInputs({
                                    ...postInputs,
                                    password: e.target.value,
                                })
                            }
                        />
                        <button
                            onClick={sendRequest}
                            disabled={loading}
                            type="button"
                            className={`mt-8 w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 me-2 mb-2 ${
                                loading
                                    ? "bg-gray-400 cursor-not-allowed"
                                    : "bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-4 focus:ring-gray-300 dark:bg-gray-800 dark:hover:bg-gray-700 dark:focus:ring-gray-700 dark:border-gray-700"
                            }`}
                        >
                            {loading ? (
                                <div className="flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    {type === "signup" ? "Creating account..." : "Signing in..."}
                                </div>
                            ) : (
                                type === "signup" ? "Sign up" : "Sign in"
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface LabelledInputType {
    id: string;
    label: string;
    placeholder: string;
    value: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    type?: string;
    error?: string;
}

function LabelledInput({ id, label, placeholder, value, onChange, type, error }: LabelledInputType) {
    return (
        <div>
            <label
                htmlFor={id}
                className="block mb-2 text-sm text-black font-semibold pt-4"
            >
                {label}
            </label>
            <input
                id={id}
                value={value}
                onChange={onChange}
                type={type || "text"}
                className={`bg-gray-50 border text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 ${
                    error ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={placeholder}
                required
            />
            {error && (
                <p className="mt-1 text-sm text-red-600">{error}</p>
            )}
        </div>
    );
}
