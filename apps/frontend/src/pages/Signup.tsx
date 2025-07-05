import { Quote } from "../components/Quote"
import { Auth } from "../components/Auth"
import { Link } from "react-router-dom"

export const Signup = () => {
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
                                    Join GitWrite
                                </h2>
                                <p className="text-gray-600">
                                    Start your writing journey today
                                </p>
                            </div>
                            <Auth type="signup" />
                            
                            {/* Benefits */}
                            <div className="mt-8 pt-6 border-t border-gray-200">
                                <p className="text-sm text-gray-600 mb-4 text-center">
                                    What you'll get:
                                </p>
                                <div className="space-y-2">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Rich text editor with markdown support
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Analytics and insights
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                        Engage with the community
                                    </div>
                                </div>
                            </div>
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
