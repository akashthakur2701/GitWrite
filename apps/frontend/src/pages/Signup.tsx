import { Auth } from "../components/Auth"
import { Link } from "react-router-dom"

export const Signup = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 px-2">
            <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl flex overflow-hidden flex-col md:flex-row animate-fade-in-up" style={{minHeight: 'auto', height: 'auto'}}>
                {/* Left: Signup Form */}
                <div className="flex-1 p-6 flex flex-col justify-center min-h-0">
                    <div className="flex items-center justify-between mb-6">
                        <Link to="/landing" className="text-gray-400 hover:text-blue-600 text-xl" aria-label="Back to home">
                            ←
                        </Link>
                        <Link to="/signin" className="text-blue-600 font-semibold hover:underline text-sm">Sign in</Link>
                    </div>
                    <div className="mb-4">
                        <div className="flex items-center mb-2">
                            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mr-2">✍️ GitWrite</span>
                        </div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-1">Welcome to GitWrite!</h2>
                        <p className="text-gray-600 mb-4 text-sm">Join a community of creators and start sharing your ideas. We're excited to have you!</p>
                    </div>
                    <div>
                        <Auth type="signup" />
                    </div>
                </div>
                {/* Right: Motivational Image & Text */}
                <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-gray-100 relative min-h-0" style={{minHeight: 'auto'}}>
                    <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80" alt="Motivation" className="absolute inset-0 w-full h-full object-cover object-center" style={{zIndex: 0, opacity: 0.85}} />
                    <div className="relative z-10 p-6 text-white text-left w-full h-full flex flex-col justify-end bg-gradient-to-t from-black/60 via-transparent to-transparent">
                        <h3 className="text-xl font-bold mb-1 drop-shadow-lg">Create. Inspire. Connect.</h3>
                        <p className="text-sm font-medium drop-shadow">Your voice matters. Join GitWrite and start your creative journey today!</p>
                    </div>
                </div>
            </div>
        </div>
    )
}
