import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-6xl font-bold text-gray-900 mb-6">
            HMS SaaS
          </h1>
          <p className="text-2xl text-gray-600 mb-4">
            Hospital Management System
          </p>
          <p className="text-lg text-gray-500 mb-12">
            Multi-tenant, scalable, and secure healthcare management platform
          </p>

          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Link
              href="/auth/login"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg transition duration-200"
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="bg-white hover:bg-gray-50 text-blue-600 font-semibold py-4 px-8 rounded-lg shadow-lg border-2 border-blue-600 transition duration-200"
            >
              Register
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">🏥</div>
              <h3 className="text-xl font-semibold mb-2">Multi-Tenant</h3>
              <p className="text-gray-600">
                Secure tenant isolation with dedicated data management
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">🔐</div>
              <h3 className="text-xl font-semibold mb-2">Role-Based Access</h3>
              <p className="text-gray-600">
                11 different roles with granular permissions
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-blue-600 text-4xl mb-4">📊</div>
              <h3 className="text-xl font-semibold mb-2">Complete Solution</h3>
              <p className="text-gray-600">
                OPD, IPD, Pharmacy, Lab, Billing & more
              </p>
            </div>
          </div>

          <div className="mt-16 bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Core Modules</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-left">
              <div className="text-gray-700">✓ Tenant Management</div>
              <div className="text-gray-700">✓ Patient Management</div>
              <div className="text-gray-700">✓ Staff Management</div>
              <div className="text-gray-700">✓ Appointments</div>
              <div className="text-gray-700">✓ OPD</div>
              <div className="text-gray-700">✓ IPD</div>
              <div className="text-gray-700">✓ Pharmacy</div>
              <div className="text-gray-700">✓ Laboratory</div>
              <div className="text-gray-700">✓ Billing</div>
              <div className="text-gray-700">✓ Insurance</div>
              <div className="text-gray-700">✓ HR & Payroll</div>
              <div className="text-gray-700">✓ Reports</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
