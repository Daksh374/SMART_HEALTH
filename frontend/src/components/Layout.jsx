import Sidebar from './Sidebar'

const Layout = ({ children }) => (
  <div className="flex min-h-screen bg-gray-50 dark:bg-slate-900">
    <Sidebar />
    <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-8">
        {children}
      </div>
    </main>
  </div>
)

export default Layout
