import { Auth } from "../components/Auth"
import { Quote } from "../components/Quote"
import { Link } from "react-router-dom"

export const Signin = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <Link to="/landing" className="flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                ✍️ GitWrite
                            </span>
                        </Link>
                        <Link 
                            to="/landing" 
                            className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                            ← Back to Home
                        </Link>
                    </div>
                </div>
            </div>

            <div className="flex min-h-[calc(100vh-4rem)]">
                {/* Auth Section */}
                <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
                    <div className="max-w-md w-full">
                        <div className="bg-white rounded-2xl shadow-xl p-8">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                    Welcome back
                                </h2>
                                <p className="text-gray-600">
                                    Sign in to continue your writing journey
                                </p>
                            </div>
                            <Auth type="signin" />
                        </div>
                    </div>
                </div>
                
                {/* Quote Section */}
                <div className="hidden lg:flex lg:flex-1 items-center justify-center bg-gradient-to-br from-blue-600 to-purple-700 p-8">
                    <div className="max-w-lg">
                        <Quote />
                    </div>
                </div>
            </div>
        </div>
    )
}
