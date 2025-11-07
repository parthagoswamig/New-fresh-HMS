'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CheckCircle, Heart, Users, TrendingUp, Shield, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <Heart className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                CareStack
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Start Free Trial</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-full mb-6">
              <Zap className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-600">Next-Gen Hospital Management</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              Next-Gen Hospital
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Management in the Cloud
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Complete, serverless SaaS platform for modern hospitals. Manage OPD, IPD, Pharmacy, 
              Laboratory, Billing, and Staff - all in one beautiful interface.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/auth/register">
                <Button size="lg" className="text-lg px-8 py-6">
                  Start Free Trial →
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm text-gray-500 mt-6">No credit card required • 14-day free trial</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-xl text-gray-600">Comprehensive features for complete hospital management</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'OPD & IPD Management',
                description: 'Complete outpatient and inpatient management with smart scheduling',
                icon: Users,
                color: 'blue',
              },
              {
                title: 'Billing & Finance',
                description: 'Automated billing, insurance claims, and comprehensive financial reports',
                icon: TrendingUp,
                color: 'green',
              },
              {
                title: 'Pharmacy System',
                description: 'Inventory management, e-prescriptions, and drug interaction alerts',
                icon: Heart,
                color: 'red',
              },
              {
                title: 'Laboratory Management',
                description: 'Test orders, results tracking, and digital report generation',
                icon: CheckCircle,
                color: 'purple',
              },
              {
                title: 'Staff & HR',
                description: 'Attendance, payroll, scheduling, and performance management',
                icon: Users,
                color: 'indigo',
              },
              {
                title: 'Security & Compliance',
                description: 'HIPAA compliant, role-based access, and complete audit trails',
                icon: Shield,
                color: 'yellow',
              },
            ].map((feature) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100"
                >
                  <div className={`w-12 h-12 bg-${feature.color}-100 rounded-xl flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 text-${feature.color}-600`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your hospital</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Starter',
                price: '$99',
                description: 'Perfect for small clinics',
                features: [
                  'Up to 50 patients/month',
                  'Basic OPD management',
                  'Billing & invoicing',
                  'Email support',
                ],
              },
              {
                name: 'Professional',
                price: '$299',
                description: 'For growing hospitals',
                features: [
                  'Unlimited patients',
                  'OPD + IPD management',
                  'Pharmacy & Lab',
                  'Priority support',
                  'Advanced analytics',
                ],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                description: 'For large hospital chains',
                features: [
                  'Everything in Professional',
                  'Multi-location support',
                  'Custom integrations',
                  'Dedicated account manager',
                  'SLA guarantee',
                ],
              },
            ].map((plan) => (
              <div
                key={plan.name}
                className={`bg-white p-8 rounded-2xl border-2 ${
                  plan.popular ? 'border-blue-600 shadow-xl scale-105' : 'border-gray-200'
                } relative`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-4">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== 'Custom' && <span className="text-gray-600">/month</span>}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start">
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                  Get Started
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Trusted by Healthcare Providers
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Sarah Johnson',
                role: 'Chief Medical Officer',
                hospital: 'City General Hospital',
                content: 'CareStack transformed our operations. Patient satisfaction is up 40% and administrative time is down 60%.',
              },
              {
                name: 'Michael Chen',
                role: 'Hospital Administrator',
                hospital: 'Metro Health Center',
                content: 'The best investment we made. The ROI was visible within the first month. Highly recommended!',
              },
              {
                name: 'Dr. Priya Patel',
                role: 'Director',
                hospital: 'Sunrise Medical',
                content: 'Intuitive, powerful, and reliable. Our staff adapted quickly and now we can\'t imagine working without it.',
              },
            ].map((testimonial) => (
              <div key={testimonial.name} className="bg-white p-8 rounded-2xl shadow-sm">
                <p className="text-gray-600 mb-6 italic leading-relaxed">
                  "{testimonial.content}"
                </p>
                <div>
                  <p className="font-bold text-gray-900">{testimonial.name}</p>
                  <p className="text-sm text-gray-600">{testimonial.role}</p>
                  <p className="text-sm text-blue-600">{testimonial.hospital}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Hospital?
          </h2>
          <p className="text-xl text-gray-600 mb-10">
            Join hundreds of healthcare providers already using CareStack
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="text-lg px-12 py-6">
              Start Your Free Trial →
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="w-6 h-6" />
                <span className="text-xl font-bold">CareStack</span>
              </div>
              <p className="text-gray-400">Next-Gen Hospital Management in the Cloud</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Features</li>
                <li>Pricing</li>
                <li>Security</li>
                <li>Roadmap</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>Careers</li>
                <li>Contact</li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Privacy</li>
                <li>Terms</li>
                <li>HIPAA</li>
                <li>Compliance</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p> 2024 CareStack. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
