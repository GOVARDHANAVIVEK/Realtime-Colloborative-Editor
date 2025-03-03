import React ,{useEffect} from "react";
import getToken  from "./APIContext";
const backendUrl = import.meta.env.VITE_APP_BACKEND_URL
const LandingPage = () => {
    console.log("`${backendUrl}/api/auth/verify-token`",`${backendUrl}/api/auth/verify-token`)
   getToken()
   console.log("backend_url",backendUrl)
  return (
    <div className="min-h-screen w-full bg-black text-white flex flex-col items-center">
      {/* Navigation Bar */}
      <nav className="w-full flex  justify-between items-center px-4 py-2 bg-gray-900 shadow-md text-center">
        <h1 className="text-lg  font-bold text-white text-center w-20 justify-center mt-4">CodeCraftr</h1>
        
        

        <div className="flex space-x-6">
          <a href="/signin" className="text-blue-400 text-lg hover:underline ">
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
            src="main-bg.png"
            alt="Collaboration"
            className="w-full h-auto rounded-lg shadow-lg"
          />
        </div>

        {/* Text Section */}
        <div className="lg:w-1/2 mt-8 lg:mt-0">
          <h2 className="text-4xl text-orange-400 font-bold leading-tight">
            Craft. Collaborate. Compile.
          </h2>
          <p className="mt-6 text-lg text-gray-300">
          Work smarter, not harder! CodeCraftr is your ultimate real-time collaborative coding and document editor.
          Write, edit, and execute code seamlessly with your team—no version conflicts, just smooth workflow.
          </p>
          <p className="mt-4 text-lg text-gray-300">
          Say goodbye to messy merges and hello to synchronized innovation! 🚀
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="w-full px-6 py-12 bg-gray-800 text-center">
      <h2 className="text-3xl text-white font-bold">Why Choose CodeCraftr?</h2>
        <div className="text-start m-auto  w-max">
        
        <ul className="mt-6 space-y-4 text-lg text-gray-300">
          <li>🚀 <strong>Real-time Collaboration:</strong> Code and edit seamlessly with your team.</li>
          <li>🔒 <strong>Secure & Scalable:</strong> End-to-end encryption ensures data protection.</li>
          <li>📝 <strong>Built-in Code Execution:</strong> Write, run, and debug code instantly.</li>
          <li>📂 <strong>Version Control:</strong> Track and manage changes effortlessly.</li>
          <li>⚡ <strong>Intuitive UI:</strong> A clean and developer-friendly interface.</li>
        </ul>
        </div>
        
      </section>


      {/* Call to Action */}
      <section className="w-full px-6 py-12 text-center">
        <h2 className="text-3xl text-orange-400 font-bold">Get Started with CodeCraftr</h2>
        <p className="mt-4 text-lg text-gray-300">
          Join thousands of professionals who streamline their workflow with CodeCraftr.
        </p>
        <div className="mt-6 w-max m-auto">
          <a
            href = {`${backendUrl}/api/auth/google`}
            className="flex items-center bg-white text-black px-6 py-3 rounded-lg shadow-md hover:bg-gray-200 transition"
          >
            <img
              className="w-6 h-6 mr-3"
              src="google.png"
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
