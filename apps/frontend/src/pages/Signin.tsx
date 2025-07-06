import { Auth } from "../components/Auth"
import { Link } from "react-router-dom"

export const Signin = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-2">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl flex overflow-hidden flex-col md:flex-row animate-fade-in-up" style={{minHeight: 'auto', height: 'auto'}}>
                {/* Left: Login Form */}
                <div className="flex-1 p-6 flex flex-col justify-center min-h-0">
                    <div className="flex items-center justify-between mb-6">
                        <Link to="/landing" className="text-gray-400 hover:text-blue-600 text-xl" aria-label="Back to home">
                            ←
                        </Link>
                        <Link to="/signup" className="text-blue-600 font-semibold hover:underline text-sm">Register</Link>
                    </div>
                    <div className="mb-4">
                        <div className="flex items-center mb-2">
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mr-2">✍️ GitWrite</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome back!</h2>
                        <p className="text-gray-600 mb-4 text-sm">Ready to continue your writing journey? Please sign in to your account.</p>
                    </div>
                    <div>
                        <Auth type="signin" />
                    </div>
                </div>
                {/* Right: Motivational Image & Text */}
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-100 relative min-h-0" style={{minHeight: 'auto'}}>
                    <img src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80" alt="Motivation" className="absolute inset-0 w-full h-full object-cover object-center" style={{zIndex: 0, opacity: 0.85}} />
                    <div className="relative z-10 p-6 text-white text-left w-full h-full flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent">
                        <h3 className="text-xl font-bold mb-1 drop-shadow-lg">Start your journey now</h3>
                        <p className="text-sm font-medium drop-shadow">Every great story starts with a single word. Sign in and keep writing yours.</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
