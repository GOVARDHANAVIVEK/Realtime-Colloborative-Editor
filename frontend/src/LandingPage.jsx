import React ,{useEffect} from "react";
import getToken from "./getToken";
const LandingPage = () => {

   getToken()
    
  return (
    <div className="min-h-screen w-screen bg-black text-white flex flex-col items-center">
      {/* Navigation Bar */}
      <nav className="w-full flex justify-between items-center p-6 bg-gray-900 shadow-md">
        <h1 className="text-2xl font-bold text-white">DocsApp</h1>
        <div className="flex space-x-6">
          <a href="/signin" className="text-blue-400 text-lg hover:underline">
            Sign In
          </a>
          <a href="/signup" className="text-blue-400 text-lg hover:underline">
            Sign Up
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="flex flex-col lg:flex-row items-center justify-center px-6 py-12 text-center lg:text-left lg:space-x-12 w-full">
        {/* Image Section */}
        <div className="lg:w-1/2">
          <img
            src="./src/assets/main-bg.png"
            alt="Collaboration"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>

        {/* Text Section */}
        <div className="lg:w-1/2 mt-8 lg:mt-0">
          <h2 className="text-4xl text-orange-400 font-bold leading-tight">
            Collaborate & Manage Documents Effortlessly!
          </h2>
          <p className="mt-6 text-lg text-gray-300">
            Work smarter, not harder! Our collaborative tool lets you create,
            edit, and manage documents seamlessly with your team in real-time.
          </p>
          <p className="mt-4 text-lg text-gray-300">
            Say goodbye to version conflicts and hello to smooth workflow!
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-6 py-12 bg-gray-800 text-center">
        <h2 className="text-3xl text-white font-bold">Why Choose DocsApp?</h2>
        <p className="mt-4 text-lg text-gray-300">
          - Real-time collaboration with your team.
        </p>
        <p className="mt-2 text-lg text-gray-300">
          - Secure and accessible document storage.
        </p>
        <p className="mt-2 text-lg text-gray-300">
          - Version control to track document changes.
        </p>
      </section>

      {/* Call to Action */}
      <section className="w-full px-6 py-12 text-center">
        <h2 className="text-3xl text-orange-400 font-bold">Get Started with DocsApp</h2>
        <p className="mt-4 text-lg text-gray-300">
          Join thousands of professionals who streamline their workflow with DocsApp.
        </p>
        <div className="mt-6 w-max m-auto">
          <a
            href = "http://localhost:3900/api/auth/google"
            className="flex items-center bg-white text-black px-6 py-3 rounded-lg shadow-md hover:bg-gray-200 transition"
          >
            <img
              className="w-6 h-6 mr-3"
              src="./src/assets/google.png"
              alt="Google Logo"
            />
            <span className="text-lg">Sign in with Google</span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
