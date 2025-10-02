import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { 
  Recycle, 
  Users, 
  TrendingUp, 
  Shield,
  ArrowRight,
  CheckCircle,
  Star,
  MapPin,
  User
} from 'lucide-react';

const Home = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  const features = [
    {
      icon: <Recycle className="h-8 w-8" style={{color: '#8dc6ff'}} />,
      title: "Easy Waste Trading",
      description: "List your waste materials and connect with buyers instantly"
    },
    {
      icon: <Users className="h-8 w-8 text-blue-500" />,
      title: "Verified Community",
      description: "Join thousands of verified waste generators and recyclers"
    },
    {
      icon: <TrendingUp className="h-8 w-8 text-purple-500" />,
      title: "Fair Pricing",
      description: "Get the best prices for your waste materials with our pricing system"
    },
    {
      icon: <Shield className="h-8 w-8 text-orange-500" />,
      title: "Secure Transactions",
      description: "Safe and secure payment processing with M-Pesa integration"
    }
  ];

  const wasteTypes = [
    { name: "Plastic", description: "Bottles, containers, packaging", price: "$15-25/kg" },
    { name: "Paper", description: "Newspapers, cardboard, office paper", price: "$8-15/kg" },
    { name: "Metal", description: "Aluminum, steel, copper", price: "$20-50/kg" },
    { name: "Electronic", description: "Old phones, computers, appliances", price: "$30-100/kg" },
  ];

  const testimonials = [
    {
      name: "John Kamau",
      role: "Waste Generator",
      location: "Nairobi",
      comment: "TrashToTreasure helped me turn my factory waste into profit. Excellent platform!",
      rating: 5
    },
    {
      name: "Mary Wanjiku",
      role: "Recycler",
      location: "Mombasa", 
      comment: "I've found consistent suppliers through this platform. Great for my recycling business.",
      rating: 5
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-bg text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Turn Your <span style={{color: '#8dc6ff'}}>Trash</span> Into <span className="text-yellow-300">Treasure</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-3xl mx-auto">
              Kenya's premier platform connecting waste generators with recyclers. 
              Sell your waste, buy materials, and contribute to a cleaner environment.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/create-listing"
                    className="text-white px-8 py-3 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2"
                    style={{backgroundColor: '#8dc6ff'}}
                    onMouseEnter={(e) => e.target.style.backgroundColor = '#22313f'}
                    onMouseLeave={(e) => e.target.style.backgroundColor = '#8dc6ff'}
                  >
                    <span>List Your Waste</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/listings"
                    className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-3 rounded-lg text-lg font-semibold"
                  >
                    Browse Materials
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold flex items-center justify-center space-x-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/listings"
                    className="bg-transparent border-2 border-white hover:bg-white hover:text-gray-900 text-white px-8 py-3 rounded-lg text-lg font-semibold"
                  >
                    Explore Platform
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose TrashToTreasure?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We make waste trading simple, secure, and profitable for everyone
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg hover:shadow-lg transition-shadow">
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Waste Types Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Waste Can You Trade?
            </h2>
            <p className="text-xl text-gray-600">
              We accept various types of recyclable waste materials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wasteTypes.map((type, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {type.name}
                </h3>
                <p className="text-gray-600 mb-3">
                  {type.description}
                </p>
                <div className="text-green-600 font-semibold">
                  {type.price}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              to="/listings"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold inline-flex items-center space-x-2"
            >
              <span>View All Materials</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Simple steps to start trading waste materials
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">1</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up</h3>
              <p className="text-gray-600">
                Create your account and verify your identity to join our community
              </p>
            </div>

            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">2</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">List or Browse</h3>
              <p className="text-gray-600">
                List your waste materials or browse available materials from others
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">3</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Trade & Earn</h3>
              <p className="text-gray-600">
                Connect with buyers/sellers, arrange pickup, and complete secure transactions
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-gray-600">
              Join thousands of satisfied users across Kenya
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white p-8 rounded-lg shadow-md">
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{testimonial.comment}"
                </p>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-gray-600 text-sm">
                      {testimonial.role} • {testimonial.location}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Trading?
          </h2>
          <p className="text-xl mb-8 text-gray-200 max-w-2xl mx-auto">
            Join TrashToTreasure today and turn your waste into profit while helping the environment
          </p>
          {!isAuthenticated && (
            <Link
              to="/register"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-3 rounded-lg text-lg font-semibold inline-flex items-center space-x-2"
            >
              <span>Get Started Now</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;